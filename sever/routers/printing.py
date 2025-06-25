from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from config.database import get_db
from schemas.printing import (
    PrintingCreate, PrintingOut, PrintingUpdate, 
    PrintingListResponse, PrintingResponse
)
from models.models import Printing, PrintingImage, User, Image
from middlewares.auth_middleware import get_current_user, get_admin_user
import logging

router = APIRouter(prefix="/api/printing", tags=["Printing"])

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
    
    return PrintingListResponse(items=printings, total=total)

@router.get("/{printing_id}", response_model=PrintingOut)
async def get_printing(printing_id: int, db: Session = Depends(get_db)):
    """Lấy chi tiết một bài đăng in ấn (Public có thể truy cập)"""
    printing = db.query(Printing).filter(Printing.id == printing_id).first()
    
    if not printing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bài đăng với ID {printing_id} không tồn tại"
        )
    
    return printing

@router.post("/", response_model=PrintingResponse)
async def create_printing(
    printing: PrintingCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_admin_user)
):
    """
    Tạo bài đăng in ấn mới (Chỉ ADMIN mới có quyền)
    - Có thể đính kèm 1-3 ảnh
    """
    try:
        # Kiểm tra số lượng ảnh (tối đa 3)
        if len(printing.image_ids) > 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Chỉ được đính kèm tối đa 3 ảnh cho mỗi bài đăng"
            )
        
        # Kiểm tra các ảnh có tồn tại không
        if printing.image_ids:
            existing_images = db.query(Image).filter(Image.id.in_(printing.image_ids)).all()
            existing_image_ids = [img.id for img in existing_images]
            
            missing_images = [img_id for img_id in printing.image_ids if img_id not in existing_image_ids]
            if missing_images:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Không tìm thấy ảnh với ID: {missing_images}"
                )
        
        # Tạo bài đăng mới
        new_printing = Printing(
            title=printing.title,
            time=printing.time,
            content=printing.content,
            is_visible=printing.is_visible,
            created_by=current_user.id
        )
        
        db.add(new_printing)
        db.flush()  # Để lấy ID của printing mới tạo
        
        # Thêm ảnh vào bài đăng
        for index, image_id in enumerate(printing.image_ids, 1):
            printing_image = PrintingImage(
                printing_id=new_printing.id,
                image_id=image_id,
                order=index
            )
            db.add(printing_image)
        
        db.commit()
        db.refresh(new_printing)
        
        logging.info(f"Đã tạo bài đăng in ấn mới: {new_printing.title} (ID: {new_printing.id})")
        
        return PrintingResponse(
            message="Tạo bài đăng thành công",
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

@router.put("/{printing_id}", response_model=PrintingResponse)
async def update_printing(
    printing_id: int,
    printing_update: PrintingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Cập nhật bài đăng in ấn (Chỉ ADMIN mới có quyền)
    - Có thể cập nhật thông tin và ảnh đính kèm
    """
    try:
        # Tìm bài đăng
        db_printing = db.query(Printing).filter(Printing.id == printing_id).first()
        
        if not db_printing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Bài đăng với ID {printing_id} không tồn tại"
            )
        
        # Cập nhật các trường nếu được cung cấp
        if printing_update.title is not None:
            db_printing.title = printing_update.title
        if printing_update.time is not None:
            db_printing.time = printing_update.time
        if printing_update.content is not None:
            db_printing.content = printing_update.content
        if printing_update.is_visible is not None:
            db_printing.is_visible = printing_update.is_visible
        
        # Cập nhật ảnh nếu được cung cấp
        if printing_update.image_ids is not None:
            # Kiểm tra số lượng ảnh (tối đa 3)
            if len(printing_update.image_ids) > 3:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Chỉ được đính kèm tối đa 3 ảnh cho mỗi bài đăng"
                )
            
            # Kiểm tra các ảnh có tồn tại không
            if printing_update.image_ids:
                existing_images = db.query(Image).filter(Image.id.in_(printing_update.image_ids)).all()
                existing_image_ids = [img.id for img in existing_images]
                
                missing_images = [img_id for img_id in printing_update.image_ids if img_id not in existing_image_ids]
                if missing_images:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Không tìm thấy ảnh với ID: {missing_images}"
                    )
            
            # Xóa tất cả ảnh cũ
            db.query(PrintingImage).filter(PrintingImage.printing_id == printing_id).delete()
            
            # Thêm ảnh mới
            for index, image_id in enumerate(printing_update.image_ids, 1):
                printing_image = PrintingImage(
                    printing_id=printing_id,
                    image_id=image_id,
                    order=index
                )
                db.add(printing_image)
        
        db.commit()
        db.refresh(db_printing)
        
        logging.info(f"Đã cập nhật bài đăng in ấn: {db_printing.title} (ID: {db_printing.id})")
        
        return PrintingResponse(
            message="Cập nhật bài đăng thành công",
            printing=db_printing
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logging.error(f"Lỗi khi cập nhật bài đăng in ấn {printing_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi cập nhật bài đăng: {str(e)}"
        )

@router.delete("/{printing_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_printing(
    printing_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_admin_user)
):
    """Xóa bài đăng in ấn (Chỉ ADMIN mới có quyền)"""
    db_printing = db.query(Printing).filter(Printing.id == printing_id).first()
    
    if not db_printing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bài đăng với ID {printing_id} không tồn tại"
        )
    
    try:
        # Xóa bài đăng (cascade sẽ tự động xóa các ảnh liên quan)
        db.delete(db_printing)
        db.commit()
        
        logging.info(f"Đã xóa bài đăng in ấn: {db_printing.title} (ID: {db_printing.id})")
        
    except Exception as e:
        db.rollback()
        logging.error(f"Lỗi khi xóa bài đăng in ấn {printing_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi xóa bài đăng: {str(e)}"
        )

@router.patch("/{printing_id}/visibility", response_model=PrintingResponse)
async def toggle_printing_visibility(
    printing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Ẩn/hiện bài đăng in ấn (Chỉ ADMIN mới có quyền)"""
    db_printing = db.query(Printing).filter(Printing.id == printing_id).first()
    
    if not db_printing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bài đăng với ID {printing_id} không tồn tại"
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
        logging.error(f"Lỗi khi thay đổi trạng thái hiển thị bài đăng {printing_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi thay đổi trạng thái hiển thị: {str(e)}"
        ) 