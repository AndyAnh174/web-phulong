from fastapi import APIRouter, Depends, HTTPException, status, Query, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
from datetime import datetime
from PIL import Image as PILImage
from pathlib import Path
from config.database import get_db
from schemas.schemas import ServiceCreate, ServiceOut, ServiceUpdate, ServiceReviewCreate, ServiceReviewOut
from models.models import Service, User, ServiceReview, Image
from middlewares.auth_middleware import get_current_user, get_admin_user
from config.settings import settings

router = APIRouter(prefix="/api/services", tags=["Services"])

# Cấu hình upload ảnh cho services
UPLOAD_DIR = "static/images/uploads"
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp"}

# Tạo thư mục upload nếu chưa tồn tại
os.makedirs(UPLOAD_DIR, exist_ok=True)

def validate_image_file(file: UploadFile) -> bool:
    """Kiểm tra file ảnh hợp lệ"""
    if not file.content_type or file.content_type not in ALLOWED_MIME_TYPES:
        return False
    
    if not file.filename:
        return False
        
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

async def save_uploaded_image(file: UploadFile, user_id: int, db: Session) -> Image:
    """Lưu ảnh upload và tạo record trong database"""
    # Đọc nội dung file
    file_content = await file.read()
    
    # Kiểm tra kích thước file
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
    with open(file_path, "wb") as buffer:
        buffer.write(file_content)
    
    # Lấy thông tin ảnh
    image_info = get_image_info(file_path)
    
    # Tạo URL cho ảnh
    if hasattr(settings, 'BACKEND_URL') and settings.BACKEND_URL:
        backend_url = settings.BACKEND_URL
        if not backend_url.startswith("http"):
            backend_url = f"https://{backend_url}"
        file_url = f"{backend_url}/static/images/uploads/{unique_filename}"
    else:
        file_url = f"/static/images/uploads/{unique_filename}"
    
    # Tạo record trong database
    new_image = Image(
        filename=file.filename,
        file_path=file_path,
        url=file_url,
        alt_text=None,
        file_size=len(file_content),
        mime_type=file.content_type,
        width=image_info["width"],
        height=image_info["height"],
        is_visible=True,
        category="service",
        uploaded_by=user_id
    )
    
    db.add(new_image)
    db.flush()  # Để lấy ID
    
    return new_image

@router.get("/", response_model=List[ServiceOut])
async def get_services(
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    featured: Optional[bool] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách dịch vụ
    - is_active: Lọc theo trạng thái kích hoạt
    - featured: Lọc các dịch vụ nổi bật
    - category: Lọc theo danh mục/tag
    - skip: Số lượng bản ghi bỏ qua (phân trang)
    - limit: Số lượng bản ghi tối đa trả về
    """
    query = db.query(Service)
    
    if is_active is not None:
        query = query.filter(Service.is_active == is_active)
    
    # Lọc theo trường featured
    if featured is not None:
        query = query.filter(Service.featured == featured)
    
    # Lọc theo category
    if category is not None:
        query = query.filter(Service.category == category)
    
    services = query.order_by(Service.id).offset(skip).limit(limit).all()
    return services

@router.get("/suggested", response_model=List[ServiceOut])
async def get_suggested_services(current_id: int = Query(...), db: Session = Depends(get_db)):
    # Lấy tối đa 4 dịch vụ khác với current_id, ưu tiên dịch vụ featured và active
    services = db.query(Service).filter(
        Service.id != current_id, 
        Service.is_active == True,
        Service.featured == True
    ).limit(4).all()
    
    # Nếu chưa đủ 4 dịch vụ featured, lấy thêm các dịch vụ active khác
    if len(services) < 4:
        existing_ids = [s.id for s in services]
        extra = db.query(Service).filter(
            Service.id != current_id, 
            Service.is_active == True,
            ~Service.id.in_(existing_ids)
        ).limit(4 - len(services)).all()
        services += extra
        
    # Nếu vẫn chưa đủ 4, lấy bất kỳ dịch vụ nào khác
    if len(services) < 4:
        existing_ids = [s.id for s in services]
        extra = db.query(Service).filter(
            Service.id != current_id, 
            ~Service.id.in_(existing_ids)
        ).limit(4 - len(services)).all()
        services += extra
        
    return services

@router.get("/{service_id}", response_model=ServiceOut)
async def get_service(service_id: int, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()
    
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dịch vụ với ID {service_id} không tồn tại"
        )
    
    return service

@router.post("/", response_model=ServiceOut)
async def create_service(
    name: str = Form(..., description="Tên dịch vụ"),
    description: str = Form(..., description="Mô tả dịch vụ"),
    price: float = Form(..., description="Giá dịch vụ"),
    category: Optional[str] = Form(None, description="Danh mục dịch vụ"),
    is_active: bool = Form(True, description="Trạng thái kích hoạt"),
    featured: bool = Form(False, description="Dịch vụ nổi bật"),
    image: Optional[UploadFile] = File(None, description="Upload ảnh dịch vụ"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Tạo dịch vụ mới với upload ảnh trực tiếp (Chỉ ADMIN mới có quyền)
    - Sử dụng multipart/form-data để upload ảnh
    """
    try:
        image_id = None
        
        # Xử lý upload ảnh nếu có
        if image and image.filename:
            if not validate_image_file(image):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File {image.filename} không hợp lệ. Chỉ chấp nhận file ảnh (jpg, png, gif, webp, bmp)"
                )
            
            uploaded_image = await save_uploaded_image(image, current_user.id, db)
            image_id = uploaded_image.id
        
        # Tạo service mới
        new_service = Service(
            name=name,
            description=description,
            price=price,
            image_id=image_id,
            category=category,
            is_active=is_active,
            featured=featured
        )
        
        db.add(new_service)
        db.commit()
        db.refresh(new_service)
        
        return new_service
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi tạo dịch vụ: {str(e)}"
        )

@router.put("/{service_id}", response_model=ServiceOut)
async def update_service(
    service_id: int,
    name: Optional[str] = Form(None, description="Tên dịch vụ"),
    description: Optional[str] = Form(None, description="Mô tả dịch vụ"),
    price: Optional[float] = Form(None, description="Giá dịch vụ"),
    category: Optional[str] = Form(None, description="Danh mục dịch vụ"),
    is_active: Optional[bool] = Form(None, description="Trạng thái kích hoạt"),
    featured: Optional[bool] = Form(None, description="Dịch vụ nổi bật"),
    image: Optional[UploadFile] = File(None, description="Upload ảnh mới (sẽ thay thế ảnh cũ)"),
    remove_image: bool = Form(False, description="Xóa ảnh hiện tại"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Cập nhật dịch vụ với upload ảnh trực tiếp (Chỉ ADMIN mới có quyền)
    - Sử dụng multipart/form-data để upload ảnh mới
    - remove_image=true để xóa ảnh hiện tại
    """
    try:
        db_service = db.query(Service).filter(Service.id == service_id).first()
        
        if not db_service:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Dịch vụ với ID {service_id} không tồn tại"
            )
        
        # Xử lý ảnh mới nếu có
        if image and image.filename:
            if not validate_image_file(image):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File {image.filename} không hợp lệ. Chỉ chấp nhận file ảnh (jpg, png, gif, webp, bmp)"
                )
            
            # Xóa ảnh cũ nếu có
            if db_service.image_id:
                old_image = db.query(Image).filter(Image.id == db_service.image_id).first()
                if old_image and os.path.exists(old_image.file_path):
                    os.remove(old_image.file_path)
                    db.delete(old_image)
            
            # Upload ảnh mới
            uploaded_image = await save_uploaded_image(image, current_user.id, db)
            db_service.image_id = uploaded_image.id
        
        # Xóa ảnh nếu được yêu cầu
        elif remove_image and db_service.image_id:
            old_image = db.query(Image).filter(Image.id == db_service.image_id).first()
            if old_image:
                if os.path.exists(old_image.file_path):
                    os.remove(old_image.file_path)
                db.delete(old_image)
                db_service.image_id = None
        
        # Cập nhật các trường khác nếu được cung cấp
        if name is not None:
            db_service.name = name
        if description is not None:
            db_service.description = description
        if price is not None:
            db_service.price = price
        if category is not None:
            db_service.category = category
        if is_active is not None:
            db_service.is_active = is_active
        if featured is not None:
            db_service.featured = featured
        
        db.commit()
        db.refresh(db_service)
        
        return db_service
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi cập nhật dịch vụ: {str(e)}"
        )

@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(service_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    db_service = db.query(Service).filter(Service.id == service_id).first()
    
    if not db_service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dịch vụ với ID {service_id} không tồn tại"
        )
    
    # Xóa ảnh liên quan nếu có
    if db_service.image_id:
        image = db.query(Image).filter(Image.id == db_service.image_id).first()
        if image:
            # Xóa file ảnh từ disk
            if os.path.exists(image.file_path):
                os.remove(image.file_path)
            # Xóa record từ database
            db.delete(image)
    
    db.delete(db_service)
    db.commit()
    
    return None

@router.get("/{service_id}/reviews", response_model=List[ServiceReviewOut])
async def get_service_reviews(service_id: int, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Dịch vụ không tồn tại")
    return db.query(ServiceReview).filter(ServiceReview.service_id == service_id).order_by(ServiceReview.created_at.desc()).all()

@router.post("/{service_id}/reviews", response_model=ServiceReviewOut)
async def create_service_review(service_id: int, review: ServiceReviewCreate, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Dịch vụ không tồn tại")
    new_review = ServiceReview(
        service_id=service_id,
        author_name=review.author_name if not review.is_anonymous else None,
        is_anonymous=review.is_anonymous,
        rating=review.rating,
        content=review.content
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return new_review 