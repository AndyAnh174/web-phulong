from fastapi import APIRouter, Depends, HTTPException, status, Query, File, UploadFile, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
from datetime import datetime
import shutil
from PIL import Image as PILImage
from pathlib import Path

from config.database import get_db
from schemas.schemas import ImageOut, ImageCreate, ImageUpdate, ImageUploadResponse
from models.models import Image, User
from middlewares.auth_middleware import get_current_user, get_admin_user

router = APIRouter(prefix="/api/images", tags=["Images"])

# Cấu hình thư mục upload
UPLOAD_DIR = "static/images/uploads"
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp"}

# Tạo thư mục upload nếu chưa tồn tại
os.makedirs(UPLOAD_DIR, exist_ok=True)

def validate_image_file(file: UploadFile) -> bool:
    """Kiểm tra file ảnh hợp lệ"""
    # Kiểm tra MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        return False
    
    # Kiểm tra extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        return False
        
    return True

def get_image_info(file_path: str) -> dict:
    """Lấy thông tin ảnh (width, height)"""
    try:
        with PILImage.open(file_path) as img:
            return {
                "width": img.width,
                "height": img.height
            }
    except Exception:
        return {"width": None, "height": None}

@router.post("/upload", response_model=ImageUploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    alt_text: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    is_visible: bool = Form(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Upload ảnh mới
    - Chỉ ADMIN mới có quyền upload
    - File phải là ảnh hợp lệ (jpg, png, gif, webp, bmp)
    - Kích thước tối đa 10MB
    """
    # Kiểm tra file có được chọn không
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vui lòng chọn file để upload"
        )
    
    # Kiểm tra loại file
    if not validate_image_file(file):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File không hợp lệ. Chỉ chấp nhận file ảnh (jpg, png, gif, webp, bmp)"
        )
    
    # Kiểm tra kích thước file
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File quá lớn. Kích thước tối đa là {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # Tạo tên file unique
    file_ext = Path(file.filename).suffix.lower()
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Lưu file
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)
        
        # Lấy thông tin ảnh
        image_info = get_image_info(file_path)
        
        # Tạo URL cho ảnh
        file_url = f"/static/images/uploads/{unique_filename}"
        
        # Lưu thông tin vào database
        new_image = Image(
            filename=file.filename,
            file_path=file_path,
            url=file_url,
            alt_text=alt_text,
            file_size=len(file_content),
            mime_type=file.content_type,
            width=image_info["width"],
            height=image_info["height"],
            is_visible=is_visible,
            category=category,
            uploaded_by=current_user.id
        )
        
        db.add(new_image)
        db.commit()
        db.refresh(new_image)
        
        return ImageUploadResponse(
            message="Upload ảnh thành công",
            image=new_image
        )
        
    except Exception as e:
        # Xóa file nếu có lỗi
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi upload file: {str(e)}"
        )

@router.get("/", response_model=List[ImageOut])
async def get_images(
    skip: int = 0,
    limit: int = 100,
    is_visible: Optional[bool] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách ảnh
    - is_visible: Lọc theo trạng thái hiển thị
    - category: Lọc theo danh mục
    - skip: Số lượng bản ghi bỏ qua (phân trang)
    - limit: Số lượng bản ghi tối đa trả về
    """
    query = db.query(Image)
    
    if is_visible is not None:
        query = query.filter(Image.is_visible == is_visible)
    
    if category is not None:
        query = query.filter(Image.category == category)
    
    images = query.order_by(Image.created_at.desc()).offset(skip).limit(limit).all()
    return images

@router.get("/{image_id}", response_model=ImageOut)
async def get_image(image_id: int, db: Session = Depends(get_db)):
    """Lấy thông tin chi tiết một ảnh"""
    image = db.query(Image).filter(Image.id == image_id).first()
    
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ảnh với ID {image_id} không tồn tại"
        )
    
    return image

@router.put("/{image_id}", response_model=ImageOut)
async def update_image(
    image_id: int,
    image_update: ImageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Cập nhật thông tin ảnh (Chỉ ADMIN mới có quyền)
    - Có thể cập nhật alt_text, is_visible, category
    """
    db_image = db.query(Image).filter(Image.id == image_id).first()
    
    if not db_image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ảnh với ID {image_id} không tồn tại"
        )
    
    # Cập nhật các trường nếu được cung cấp
    if image_update.alt_text is not None:
        db_image.alt_text = image_update.alt_text
    if image_update.is_visible is not None:
        db_image.is_visible = image_update.is_visible
    if image_update.category is not None:
        db_image.category = image_update.category
    
    db.commit()
    db.refresh(db_image)
    
    return db_image

@router.delete("/{image_id}")
async def delete_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Xóa ảnh (Chỉ ADMIN mới có quyền)
    - Xóa cả file vật lý và record trong database
    """
    db_image = db.query(Image).filter(Image.id == image_id).first()
    
    if not db_image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ảnh với ID {image_id} không tồn tại"
        )
    
    # Xóa file vật lý
    try:
        if os.path.exists(db_image.file_path):
            os.remove(db_image.file_path)
    except Exception as e:
        print(f"Lỗi khi xóa file: {e}")
    
    # Xóa record trong database
    db.delete(db_image)
    db.commit()
    
    return {"message": f"Đã xóa ảnh {db_image.filename} thành công"}

@router.get("/categories/list")
async def get_image_categories(db: Session = Depends(get_db)):
    """Lấy danh sách các category của ảnh"""
    categories = db.query(Image.category).filter(Image.category.isnot(None)).distinct().all()
    return [cat[0] for cat in categories if cat[0]]

@router.get("/download/{image_id}")
async def download_image(image_id: int, db: Session = Depends(get_db)):
    """Download ảnh trực tiếp"""
    image = db.query(Image).filter(Image.id == image_id).first()
    
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ảnh với ID {image_id} không tồn tại"
        )
    
    if not os.path.exists(image.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File ảnh không tìm thấy trên server"
        )
    
    return FileResponse(
        path=image.file_path,
        filename=image.filename,
        media_type=image.mime_type
    ) 