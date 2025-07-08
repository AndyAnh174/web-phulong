from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
from datetime import datetime
import shutil
from PIL import Image as PILImage
from pathlib import Path
from config.database import get_db
from schemas.printing import (
    PrintingCreate, PrintingOut, PrintingUpdate, 
    PrintingListResponse, PrintingResponse
)
from models.models import Printing, PrintingImage, User, Image
from middlewares.auth_middleware import get_current_user, get_admin_user
from config.settings import settings
from utils.slug import create_slug, get_model_by_slug
import logging
import re

router = APIRouter(prefix="/api/printing", tags=["Printing"])

# Cấu hình upload ảnh
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
    
    # Reset file pointer cho việc sử dụng sau
    await file.seek(0)
    
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
        alt_text=None,  # Có thể thêm tham số alt_text sau
        file_size=len(file_content),
        mime_type=file.content_type,
        width=image_info["width"],
        height=image_info["height"],
        is_visible=True,
        category="printing",
        uploaded_by=user_id
    )
    
    db.add(new_image)
    db.flush()  # Để lấy ID
    
    return new_image

@router.get("/", response_model=PrintingListResponse)
async def get_printings(
    skip: int = 0,
    limit: int = 100,
    is_visible: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách bài đăng in ấn (Public có thể truy cập)
    - is_visible: Lọc theo trạng thái hiển thị
    - search: Tìm kiếm theo tiêu đề hoặc nội dung
    - skip: Số lượng bản ghi bỏ qua (phân trang)
    - limit: Số lượng bản ghi tối đa trả về
    """
    query = db.query(Printing)
    
    # Lọc theo trạng thái hiển thị
    if is_visible is not None:
        query = query.filter(Printing.is_visible == is_visible)
    
    # Tìm kiếm theo tiêu đề hoặc nội dung
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            Printing.title.ilike(search_term) | 
            Printing.content.ilike(search_term)
        )
    
    # Đếm tổng số bản ghi
    total = query.count()
    
    # Lấy danh sách với phân trang
    printings = query.order_by(Printing.created_at.desc()).offset(skip).limit(limit).all()
    
    # Parse content cho từng bài đăng
    parsed_printings = []
    for printing in printings:
        content_html = parse_content_images(printing.content, db)
        printing_dict = {
            "id": printing.id,
            "title": printing.title,
            "time": printing.time,
            "content": printing.content,
            "content_html": content_html,
            "is_visible": printing.is_visible,
            "created_at": printing.created_at,
            "updated_at": printing.updated_at,
            "created_by": printing.created_by,
            "creator": printing.creator,
            "images": printing.images
        }
        parsed_printings.append(printing_dict)
    
    return PrintingListResponse(items=parsed_printings, total=total)

@router.get("/{slug}", response_model=PrintingOut)
async def get_printing(slug: str, db: Session = Depends(get_db)):
    """
    Lấy chi tiết một bài đăng in ấn theo slug (Public có thể truy cập)
    Ví dụ: /api/printing/bai-dang-in-an-moi
    """
    printing = get_model_by_slug(slug, Printing, db, 'title')
    
    if not printing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bài đăng với slug '{slug}' không tồn tại"
        )
    
    # Parse content để thay thế shortcode ảnh bằng HTML
    content_html = parse_content_images(printing.content, db)
    
    # Tạo dict để trả về với content_html
    printing_dict = {
        "id": printing.id,
        "title": printing.title,
        "time": printing.time,
        "content": printing.content,
        "content_html": content_html,
        "is_visible": printing.is_visible,
        "created_at": printing.created_at,
        "updated_at": printing.updated_at,
        "created_by": printing.created_by,
        "creator": printing.creator,
        "images": printing.images
    }
    
    return printing_dict

@router.post("/", response_model=PrintingResponse)
async def create_printing(
    title: str = Form(..., description="Tiêu đề bài đăng"),
    time: str = Form(..., description="Thời gian in ấn (VD: 1-2 ngày)"),
    content: str = Form(..., description="Nội dung bài đăng"),
    is_visible: bool = Form(True, description="Ẩn/hiện bài đăng"),
    images: List[UploadFile] = File(default=[], description="Upload ảnh (tối đa 3 ảnh)"),
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_admin_user)
):
    """
    Tạo bài đăng in ấn mới với upload ảnh trực tiếp (Chỉ ADMIN mới có quyền)
    - Hỗ trợ upload 1-3 ảnh cùng lúc
    - Sử dụng multipart/form-data
    """
    try:
        # Kiểm tra số lượng ảnh (tối đa 3)
        if len(images) > 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Chỉ được đính kèm tối đa 3 ảnh cho mỗi bài đăng"
            )
        
        # Validate các file ảnh
        for file in images:
            if file.filename:  # Chỉ validate nếu có file
                if not validate_image_file(file):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"File {file.filename} không hợp lệ. Chỉ chấp nhận file ảnh (jpg, png, gif, webp, bmp)"
                    )
        
        # Tạo bài đăng mới
        new_printing = Printing(
            title=title,
            time=time,
            content=content,
            is_visible=is_visible,
            created_by=current_user.id
        )
        
        db.add(new_printing)
        db.flush()  # Để lấy ID của printing mới tạo
        
        # Upload và lưu ảnh
        uploaded_images = []
        for file in images:
            if file.filename:  # Chỉ xử lý nếu có file
                try:
                    # Upload và tạo record ảnh
                    new_image = await save_uploaded_image(file, current_user.id, db)
                    uploaded_images.append(new_image)
                    
                    # Tạo liên kết giữa printing và image
                    printing_image = PrintingImage(
                        printing_id=new_printing.id,
                        image_id=new_image.id,
                        order=len(uploaded_images)
                    )
                    db.add(printing_image)
                    
                except Exception as e:
                    # Nếu có lỗi upload ảnh, xóa các file đã upload
                    for img in uploaded_images:
                        if os.path.exists(img.file_path):
                            os.remove(img.file_path)
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail=f"Lỗi khi upload ảnh {file.filename}: {str(e)}"
                    )
        
        db.commit()
        db.refresh(new_printing)
        
        logging.info(f"Đã tạo bài đăng in ấn mới: {new_printing.title} (ID: {new_printing.id}) với {len(uploaded_images)} ảnh")
        
        return PrintingResponse(
            message=f"Tạo bài đăng thành công với {len(uploaded_images)} ảnh",
            printing=new_printing
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logging.error(f"Lỗi khi tạo bài đăng in ấn: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi tạo bài đăng: {str(e)}"
        )

@router.put("/{slug}", response_model=PrintingResponse)
async def update_printing(
    slug: str,
    title: Optional[str] = Form(None, description="Tiêu đề bài đăng"),
    time: Optional[str] = Form(None, description="Thời gian in ấn"),
    content: Optional[str] = Form(None, description="Nội dung bài đăng"),
    is_visible: Optional[bool] = Form(None, description="Ẩn/hiện bài đăng"),
    images: List[UploadFile] = File(default=[], description="Upload ảnh mới (tối đa 3 ảnh, sẽ thay thế ảnh cũ)"),
    keep_existing_images: bool = Form(False, description="Giữ lại ảnh cũ (nếu True, ảnh mới sẽ được thêm vào)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Cập nhật bài đăng in ấn với upload ảnh trực tiếp (Chỉ ADMIN mới có quyền)
    - Có thể cập nhật thông tin và upload ảnh mới
    - Sử dụng multipart/form-data
    """
    try:
        # Tìm bài đăng
        db_printing = get_model_by_slug(slug, Printing, db, 'title')
        
        if not db_printing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Bài đăng với slug '{slug}' không tồn tại"
            )
        
        # Cập nhật các trường nếu được cung cấp
        if title is not None:
            db_printing.title = title
        if time is not None:
            db_printing.time = time
        if content is not None:
            db_printing.content = content
        if is_visible is not None:
            db_printing.is_visible = is_visible
        
        # Xử lý ảnh nếu có upload mới
        uploaded_images = []
        if images and any(img.filename for img in images):
            # Validate file ảnh
            for file in images:
                if file.filename and not validate_image_file(file):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"File {file.filename} không hợp lệ. Chỉ chấp nhận file ảnh (jpg, png, gif, webp, bmp)"
                    )
            
            # Lấy số ảnh hiện tại nếu giữ lại ảnh cũ
            current_image_count = 0
            if keep_existing_images:
                current_image_count = db.query(PrintingImage).filter(PrintingImage.printing_id == db_printing.id).count()
            
            # Kiểm tra tổng số ảnh (cũ + mới) không quá 3
            new_image_count = len([img for img in images if img.filename])
            total_images = current_image_count + new_image_count
            
            if total_images > 3:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Tổng số ảnh không được quá 3. Hiện tại: {current_image_count}, thêm mới: {new_image_count}"
                )
            
            # Nếu không giữ ảnh cũ, xóa tất cả ảnh cũ
            if not keep_existing_images:
                old_images = db.query(PrintingImage).filter(PrintingImage.printing_id == db_printing.id).all()
                for old_img_relation in old_images:
                    # Xóa file vật lý (tùy chọn, có thể comment nếu muốn giữ file)
                    old_img = db.query(Image).filter(Image.id == old_img_relation.image_id).first()
                    if old_img and os.path.exists(old_img.file_path):
                        try:
                            os.remove(old_img.file_path)
                        except:
                            pass  # Không quan trọng nếu không xóa được file
                
                # Xóa các record
                db.query(PrintingImage).filter(PrintingImage.printing_id == db_printing.id).delete()
            
            # Upload ảnh mới
            for file in images:
                if file.filename:
                    try:
                        new_image = await save_uploaded_image(file, current_user.id, db)
                        uploaded_images.append(new_image)
                        
                        # Tạo liên kết
                        next_order = current_image_count + len(uploaded_images) if keep_existing_images else len(uploaded_images)
                        printing_image = PrintingImage(
                            printing_id=db_printing.id,
                            image_id=new_image.id,
                            order=next_order
                        )
                        db.add(printing_image)
                        
                    except Exception as e:
                        # Cleanup nếu có lỗi
                        for img in uploaded_images:
                            if os.path.exists(img.file_path):
                                os.remove(img.file_path)
                        raise HTTPException(
                            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"Lỗi khi upload ảnh {file.filename}: {str(e)}"
                        )
        
        db.commit()
        db.refresh(db_printing)
        
        image_msg = f" và {len(uploaded_images)} ảnh mới" if uploaded_images else ""
        logging.info(f"Đã cập nhật bài đăng in ấn: {db_printing.title} (ID: {db_printing.id}){image_msg}")
        
        return PrintingResponse(
            message=f"Cập nhật bài đăng thành công{image_msg}",
            printing=db_printing
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logging.error(f"Lỗi khi cập nhật bài đăng in ấn {slug}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi cập nhật bài đăng: {str(e)}"
        )

@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_printing(
    slug: str, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_admin_user)
):
    """Xóa bài đăng in ấn theo slug (Chỉ ADMIN mới có quyền)"""
    db_printing = get_model_by_slug(slug, Printing, db, 'title')
    
    if not db_printing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bài đăng với slug '{slug}' không tồn tại"
        )
    
    try:
        # Xóa bài đăng (cascade sẽ tự động xóa các ảnh liên quan)
        db.delete(db_printing)
        db.commit()
        
        logging.info(f"Đã xóa bài đăng in ấn: {db_printing.title} (ID: {db_printing.id})")
        
    except Exception as e:
        db.rollback()
        logging.error(f"Lỗi khi xóa bài đăng in ấn {slug}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi xóa bài đăng: {str(e)}"
        )

@router.patch("/{slug}/visibility", response_model=PrintingResponse)
async def toggle_printing_visibility(
    slug: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Ẩn/hiện bài đăng in ấn theo slug (Chỉ ADMIN mới có quyền)"""
    db_printing = get_model_by_slug(slug, Printing, db, 'title')
    
    if not db_printing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bài đăng với slug '{slug}' không tồn tại"
        )
    
    try:
        # Đảo ngược trạng thái hiển thị
        db_printing.is_visible = not db_printing.is_visible
        db.commit()
        db.refresh(db_printing)
        
        status_text = "hiển thị" if db_printing.is_visible else "ẩn"
        logging.info(f"Đã {status_text} bài đăng in ấn: {db_printing.title} (ID: {db_printing.id})")
        
        return PrintingResponse(
            message=f"Đã {status_text} bài đăng thành công",
            printing=db_printing
        )
        
    except Exception as e:
        db.rollback()
        logging.error(f"Lỗi khi thay đổi trạng thái hiển thị bài đăng {slug}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi thay đổi trạng thái hiển thị: {str(e)}"
        )

def parse_content_images(content: str, db: Session) -> str:
    """
    Parse content để thay thế shortcode ảnh bằng HTML
    Shortcode format: [image:123] hoặc [image:123|alt_text]
    """
    def replace_image(match):
        image_id_part = match.group(1)
        
        # Tách image_id và alt_text
        if '|' in image_id_part:
            image_id, alt_text = image_id_part.split('|', 1)
        else:
            image_id = image_id_part
            alt_text = ""
        
        try:
            image_id = int(image_id)
            image = db.query(Image).filter(Image.id == image_id).first()
            
            if image:
                alt_attr = f'alt="{alt_text}"' if alt_text else f'alt="{image.alt_text or ""}"'
                return f'<img src="{image.url}" {alt_attr} class="content-image" style="max-width: 100%; height: auto;" />'
            else:
                return f'[Ảnh không tồn tại: {image_id}]'
        except ValueError:
            return match.group(0)  # Trả về shortcode gốc nếu không parse được
    
    # Regex để tìm shortcode [image:123] hoặc [image:123|alt_text]
    pattern = r'\[image:([^\]]+)\]'
    return re.sub(pattern, replace_image, content)

@router.post("/upload-content-image", response_model=dict)
async def upload_content_image(
    file: UploadFile = File(..., description="Upload ảnh cho content"),
    alt_text: Optional[str] = Form(None, description="Mô tả ảnh"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Upload ảnh để chèn vào content (Chỉ ADMIN mới có quyền)
    - Trả về shortcode để chèn vào content
    - Shortcode format: [image:123] hoặc [image:123|alt_text]
    """
    try:
        # Kiểm tra file hợp lệ
        if not validate_image_file(file):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File {file.filename} không hợp lệ. Chỉ chấp nhận file ảnh (jpg, png, gif, webp, bmp)"
            )
        
        # Upload ảnh
        uploaded_image = await save_uploaded_image(file, current_user.id, db)
        
        # Cập nhật alt_text nếu có
        if alt_text:
            uploaded_image.alt_text = alt_text
            db.commit()
        
        # Tạo shortcode
        if alt_text:
            shortcode = f"[image:{uploaded_image.id}|{alt_text}]"
        else:
            shortcode = f"[image:{uploaded_image.id}]"
        
        return {
            "message": "Upload ảnh thành công",
            "image": {
                "id": uploaded_image.id,
                "url": uploaded_image.url,
                "filename": uploaded_image.filename,
                "alt_text": uploaded_image.alt_text
            },
            "shortcode": shortcode,
            "usage": "Sao chép shortcode này và dán vào content tại vị trí muốn hiển thị ảnh"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi upload ảnh: {str(e)}"
        )

@router.post("/paste-image", response_model=dict)
async def paste_image(
    file: UploadFile = File(..., description="Ảnh từ clipboard paste"),
    alt_text: Optional[str] = Form(None, description="Mô tả ảnh (tùy chọn)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Upload ảnh từ clipboard paste (Chỉ ADMIN mới có quyền)
    - Endpoint này được gọi khi user paste ảnh vào content editor
    - Tự động upload và trả về shortcode để chèn vào content
    """
    try:
        # Kiểm tra file hợp lệ
        if not validate_image_file(file):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File {file.filename or 'pasted-image'} không hợp lệ. Chỉ chấp nhận file ảnh (jpg, png, gif, webp, bmp)"
            )
        
        # Tạo filename nếu không có (thường khi paste từ clipboard)
        if not file.filename or file.filename == "blob":
            import time
            timestamp = int(time.time())
            # Xác định extension từ MIME type
            ext_map = {
                "image/jpeg": "jpg",
                "image/png": "png", 
                "image/gif": "gif",
                "image/webp": "webp",
                "image/bmp": "bmp"
            }
            ext = ext_map.get(file.content_type, "jpg")
            file.filename = f"pasted-image-{timestamp}.{ext}"
        
        # Upload ảnh
        uploaded_image = await save_uploaded_image(file, current_user.id, db)
        
        # Cập nhật alt_text nếu có
        if alt_text:
            uploaded_image.alt_text = alt_text
        else:
            # Tạo alt_text mặc định cho ảnh paste
            uploaded_image.alt_text = f"Ảnh paste lúc {datetime.now().strftime('%H:%M %d/%m/%Y')}"
        
        db.commit()
        
        # Tạo shortcode
        if alt_text:
            shortcode = f"[image:{uploaded_image.id}|{alt_text}]"
        else:
            shortcode = f"[image:{uploaded_image.id}|{uploaded_image.alt_text}]"
        
        return {
            "success": True,
            "message": "Upload ảnh paste thành công",
            "image": {
                "id": uploaded_image.id,
                "url": uploaded_image.url,
                "filename": uploaded_image.filename,
                "alt_text": uploaded_image.alt_text,
                "width": uploaded_image.width,
                "height": uploaded_image.height
            },
            "shortcode": shortcode,
            "insertion_type": "paste"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi upload ảnh paste: {str(e)}"
        )

@router.post("/parse-content", response_model=dict)
async def parse_content(
    content_data: dict,
    db: Session = Depends(get_db)
):
    """
    Parse content để chuyển shortcode thành HTML (Public endpoint for preview)
    - Endpoint này được gọi từ JavaScript để preview content
    - Không cần authentication vì chỉ parse, không lưu data
    """
    try:
        content = content_data.get('content', '')
        
        if not content:
            return {
                "content_html": "",
                "images_found": 0
            }
        
        # Parse content với shortcode
        content_html = parse_content_images(content, db)
        
        # Đếm số ảnh được tìm thấy
        import re
        image_matches = re.findall(r'\[image:(\d+)(\|([^\]]*))?\]', content)
        images_found = len(image_matches)
        
        return {
            "content_html": content_html,
            "original_content": content,
            "images_found": images_found,
            "success": True
        }
        
    except Exception as e:
        return {
            "content_html": content_data.get('content', '').replace('\n', '<br>'),
            "original_content": content_data.get('content', ''),
            "images_found": 0,
            "success": False,
            "error": str(e)
        } 