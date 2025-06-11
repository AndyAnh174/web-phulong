from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import pandas as pd
import os
import shutil
from datetime import datetime, date
from config.database import get_db
from schemas.schemas import OrderCreate, OrderOut, OrderUpdate, PaginatedResponse
from models.models import Order, Service, User
from middlewares.auth_middleware import get_current_user, get_admin_user
from utils.email import send_order_confirmation
from config.settings import settings
import logging
from sqlalchemy import and_, or_

router = APIRouter(prefix="/api/orders", tags=["Orders"])

# Đảm bảo thư mục upload tồn tại
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=OrderOut)
async def create_order(
    customer_name: str = Form(...),
    customer_email: str = Form(...),
    customer_phone: str = Form(...),
    service_id: int = Form(...),
    quantity: int = Form(...),
    size: Optional[str] = Form(None),
    material: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    design_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    # Thiết lập logging
    logging.info(f"Nhận yêu cầu tạo đơn hàng mới từ khách hàng: {customer_name}, Email: {customer_email}")
    
    try:
        # Kiểm tra service có tồn tại không
        service = db.query(Service).filter(Service.id == service_id).first()
        if not service:
            error_msg = f"Dịch vụ với ID {service_id} không tồn tại"
            logging.error(error_msg)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error_msg
            )
        
        logging.info(f"Đã tìm thấy dịch vụ: {service.name} (ID: {service.id})")
        
        # Lưu file thiết kế nếu có
        design_file_url = None
        if design_file:
            # Tạo tên file duy nhất
            filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{design_file.filename}"
            file_path = os.path.join(settings.UPLOAD_DIR, filename)
            
            logging.info(f"Lưu file thiết kế: {filename}")
            
            # Lưu file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(design_file.file, buffer)
            
            design_file_url = f"/static/uploads/{filename}"
            logging.info(f"Đã lưu file thiết kế thành công: {design_file_url}")
        
        # Tạo đơn hàng mới
        new_order = Order(
            customer_name=customer_name,
            customer_email=customer_email,
            customer_phone=customer_phone,
            service_id=service_id,
            quantity=quantity,
            size=size,
            material=material,
            notes=notes,
            design_file_url=design_file_url
        )
        
        logging.info(f"Lưu đơn hàng mới vào database")
        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        logging.info(f"Đã tạo đơn hàng mới thành công, ID: {new_order.id}")
        
        # Gửi email xác nhận đơn hàng
        logging.info(f"Bắt đầu gửi email xác nhận đơn hàng #{new_order.id}")
        try:
            email_sent = send_order_confirmation(new_order, service)
            if not email_sent:
                logging.warning(f"Không thể gửi email xác nhận cho đơn hàng #{new_order.id}")
            else:
                logging.info(f"Đã gửi email xác nhận đơn hàng #{new_order.id} thành công")
        except Exception as e:
            logging.error(f"Lỗi khi gửi email xác nhận đơn hàng #{new_order.id}: {str(e)}")
        
        return new_order
    except HTTPException:
        # Re-raise HTTP exceptions để FastAPI xử lý
        raise
    except Exception as e:
        # Xử lý các exception khác
        error_msg = f"Lỗi khi tạo đơn hàng: {str(e)}"
        logging.error(error_msg)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_msg
        )

@router.get("/")
async def get_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
    skip: int = 0,
    limit: int = 100,
    customer_name: Optional[str] = None,
    service_id: Optional[int] = None,
    status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    # Xây dựng query
    query = db.query(Order).join(Service, Order.service_id == Service.id, isouter=True)
    
    # Áp dụng các bộ lọc
    if customer_name:
        query = query.filter(Order.customer_name.ilike(f"%{customer_name}%"))
    
    if service_id:
        query = query.filter(Order.service_id == service_id)
    
    if status:
        query = query.filter(Order.status == status)
    
    if start_date:
        query = query.filter(Order.created_at >= start_date)
    
    if end_date:
        # Thêm 1 ngày cho end_date để bao gồm cả đơn hàng trong ngày cuối
        query = query.filter(Order.created_at <= datetime.combine(end_date, datetime.max.time()))
    
    # Thực hiện query
    total = query.count()
    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    
    # Xử lý các đơn hàng không có service hoặc service đã bị xóa
    valid_orders = []
    for order in orders:
        if order.service_id is not None and order.service is not None:
            valid_orders.append(order)
    
    # Trả về dữ liệu với pagination
    return {
        "items": valid_orders,
        "total": total
    }

@router.get("/{order_id}", response_model=OrderOut)
async def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    # Lấy đơn hàng và kiểm tra service
    order = db.query(Order).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Đơn hàng với ID {order_id} không tồn tại"
        )
    
    # Kiểm tra service có tồn tại không
    if order.service_id is None or order.service is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Đơn hàng với ID {order_id} không có dịch vụ hợp lệ"
        )
    
    return order

@router.put("/{order_id}", response_model=OrderOut)
async def update_order_status(
    order_id: int,
    order: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    db_order = db.query(Order).filter(Order.id == order_id).first()
    
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Đơn hàng với ID {order_id} không tồn tại"
        )
    
    # Cập nhật trạng thái
    db_order.status = order.status
    
    db.commit()
    db.refresh(db_order)
    
    return db_order

@router.get("/export/csv")
async def export_orders_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
    customer_name: Optional[str] = None,
    service_id: Optional[int] = None,
    status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    token: Optional[str] = Query(None, description="Token cho phép tải file mà không cần xác thực header")
):
    # Xây dựng query
    query = db.query(Order).join(Service, Order.service_id == Service.id, isouter=True)
    
    # Áp dụng các bộ lọc
    if customer_name:
        query = query.filter(Order.customer_name.ilike(f"%{customer_name}%"))
    
    if service_id:
        query = query.filter(Order.service_id == service_id)
    
    if status:
        query = query.filter(Order.status == status)
    
    if start_date:
        query = query.filter(Order.created_at >= start_date)
    
    if end_date:
        # Thêm 1 ngày cho end_date để bao gồm cả đơn hàng trong ngày cuối
        query = query.filter(Order.created_at <= datetime.combine(end_date, datetime.max.time()))
    
    # Thực hiện query
    orders = query.order_by(Order.created_at.desc()).all()
    
    # Tạo DataFrame từ đơn hàng
    data = []
    for order in orders:
        service = db.query(Service).filter(Service.id == order.service_id).first()
        service_name = service.name if service else "Unknown"
        
        data.append({
            "ID": order.id,
            "Tên khách hàng": order.customer_name,
            "Email": order.customer_email,
            "Số điện thoại": order.customer_phone,
            "Dịch vụ": service_name,
            "Số lượng": order.quantity,
            "Kích thước": order.size,
            "Chất liệu": order.material,
            "Ghi chú": order.notes,
            "Trạng thái": order.status,
            "Ngày tạo": order.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })
    
    # Tạo DataFrame và xuất ra file CSV
    df = pd.DataFrame(data)
    
    # Tạo tên file duy nhất
    filename = f"orders_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    # Lưu file
    df.to_csv(file_path, index=False, encoding='utf-8-sig')
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type='text/csv'
    ) 