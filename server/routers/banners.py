from fastapi import APIRouter, Depends, HTTPException, status, Query, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
from datetime import datetime
import shutil
from PIL import Image as PILImage
from pathlib import Path

from config.database import get_db
from schemas.schemas import BannerOut, BannerCreate, BannerUpdate, ImageUploadResponse
from models.models import Banner, Image, User
from middlewares.auth_middleware import get_current_user, get_admin_user
from config.settings import settings

router = APIRouter(prefix="/api/banners", tags=["Banners"])

# Cấu hình upload ảnh banner
UPLOAD_DIR = "static/images/banners"
MAX_FILE_SIZE = 15 * 1024 * 1024  # 15MB cho banner
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

@router.post("/upload-with-banner", response_model=BannerOut)
async def upload_image_and_create_banner(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    url: Optional[str] = Form(None),
    is_active: bool = Form(True),
    order: int = Form(1),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Upload ảnh và tạo banner mới cùng lúc
    - Chỉ ADMIN mới có quyền tạo banner
    - File phải là ảnh hợp lệ (jpg, png, gif, webp, bmp)
    - Kích thước tối đa 15MB cho banner
    """
    # Kiểm tra file có được chọn không
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vui lòng chọn file ảnh để upload"
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
    unique_filename = f"banner_{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Lưu file
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)
        
        # Lấy thông tin ảnh
        image_info = get_image_info(file_path)
        
        # Tạo URL cho ảnh
        if hasattr(settings, 'BACKEND_URL') and settings.BACKEND_URL:
            backend_url = settings.BACKEND_URL
            if not backend_url.startswith("http"):
                backend_url = f"https://{backend_url}"
            file_url = f"{backend_url}/static/images/banners/{unique_filename}"
        else:
            file_url = f"https://demoapi.andyanh.id.vn/static/images/banners/{unique_filename}"
        
        # Lưu ảnh vào database
        new_image = Image(
            filename=file.filename,
            file_path=file_path,
            url=file_url,
            alt_text=f"Banner: {title}",
            file_size=len(file_content),
            mime_type=file.content_type,
            width=image_info["width"],
            height=image_info["height"],
            is_visible=True,
            category="banner",
            uploaded_by=current_user.id
        )
        
        db.add(new_image)
        db.commit()
        db.refresh(new_image)
        
        # Tạo banner với ảnh vừa upload
        new_banner = Banner(
            title=title,
            description=description,
            image_id=new_image.id,
            url=url,
            is_active=is_active,
            order=order,
            created_by=current_user.id
        )
        
        db.add(new_banner)
        db.commit()
        db.refresh(new_banner)
        
        return new_banner
        
    except Exception as e:
        # Xóa file nếu có lỗi
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi upload và tạo banner: {str(e)}"
        )

@router.post("/", response_model=BannerOut)
async def create_banner(
    banner: BannerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Tạo banner mới với ảnh đã có sẵn
    - Chỉ ADMIN mới có quyền tạo banner
    - image_id phải tồn tại trong bảng images
    """
    # Kiểm tra ảnh có tồn tại không
    image = db.query(Image).filter(Image.id == banner.image_id).first()
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ảnh với ID {banner.image_id} không tồn tại"
        )
    
    new_banner = Banner(
        **banner.dict(),
        created_by=current_user.id
    )
    
    db.add(new_banner)
    db.commit()
    db.refresh(new_banner)
    
    return new_banner

@router.get("/", response_model=List[BannerOut])
async def get_banners(
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách banner
    - is_active: Lọc theo trạng thái hiển thị
    - Sắp xếp theo order ASC, created_at DESC
    """
    query = db.query(Banner)
    
    if is_active is not None:
        query = query.filter(Banner.is_active == is_active)
    
    banners = query.order_by(Banner.order.asc(), Banner.created_at.desc()).offset(skip).limit(limit).all()
    return banners

@router.get("/active", response_model=List[BannerOut])
async def get_active_banners(db: Session = Depends(get_db)):
    """
    Lấy danh sách banner đang hoạt động (cho frontend)
    - Chỉ lấy banner is_active = True
    - Sắp xếp theo order ASC
    """
    banners = db.query(Banner).filter(Banner.is_active == True).order_by(Banner.order.asc()).all()
    return banners

@router.get("/{banner_id}", response_model=BannerOut)
async def get_banner(banner_id: int, db: Session = Depends(get_db)):
    """Lấy thông tin chi tiết một banner"""
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    
    if not banner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Banner với ID {banner_id} không tồn tại"
        )
    
    return banner

@router.put("/{banner_id}", response_model=BannerOut)
async def update_banner(
    banner_id: int,
    banner_update: BannerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Cập nhật thông tin banner (Chỉ ADMIN mới có quyền)
    - Có thể cập nhật tất cả các trường
    - Nếu thay đổi image_id, kiểm tra ảnh có tồn tại không
    """
    db_banner = db.query(Banner).filter(Banner.id == banner_id).first()
    
    if not db_banner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Banner với ID {banner_id} không tồn tại"
        )
    
    # Kiểm tra ảnh nếu có thay đổi image_id
    if banner_update.image_id is not None:
        image = db.query(Image).filter(Image.id == banner_update.image_id).first()
        if not image:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ảnh với ID {banner_update.image_id} không tồn tại"
            )
    
    # Cập nhật các trường
    for field, value in banner_update.dict(exclude_unset=True).items():
        setattr(db_banner, field, value)
    
    db_banner.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_banner)
    
    return db_banner

@router.patch("/{banner_id}/toggle", response_model=BannerOut)
async def toggle_banner_status(
    banner_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Chuyển đổi trạng thái ẩn/hiện banner (Chỉ ADMIN mới có quyền)
    - Nếu đang active thì chuyển thành inactive và ngược lại
    """
    db_banner = db.query(Banner).filter(Banner.id == banner_id).first()
    
    if not db_banner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Banner với ID {banner_id} không tồn tại"
        )
    
    db_banner.is_active = not db_banner.is_active
    db_banner.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_banner)
    
    return db_banner

@router.delete("/{banner_id}")
async def delete_banner(
    banner_id: int,
    delete_image: bool = Query(False, description="Có xóa ảnh liên quan không"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Xóa banner (Chỉ ADMIN mới có quyền)
    - delete_image=true: Xóa cả ảnh liên quan
    - delete_image=false: Chỉ xóa banner, giữ lại ảnh
    """
    db_banner = db.query(Banner).filter(Banner.id == banner_id).first()
    
    if not db_banner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Banner với ID {banner_id} không tồn tại"
        )
    
    # Lấy thông tin ảnh nếu cần xóa
    banner_image = None
    if delete_image:
        banner_image = db.query(Image).filter(Image.id == db_banner.image_id).first()
    
    # Xóa banner
    db.delete(db_banner)
    
    # Xóa ảnh nếu được yêu cầu
    if delete_image and banner_image:
        # Xóa file vật lý
        if os.path.exists(banner_image.file_path):
            try:
                os.remove(banner_image.file_path)
            except Exception as e:
                print(f"Không thể xóa file: {e}")
        
        # Xóa record trong database
        db.delete(banner_image)
    
    db.commit()
    
    return {
        "message": f"Xóa banner thành công",
        "deleted_image": delete_image
    } 