from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from config.database import get_db
from models.models import User, Order, Service
from middlewares.auth_middleware import get_admin_user, get_current_user
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary")
async def get_dashboard_summary(current_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """
    Trả về thông tin tổng quan cho dashboard
    """
    # Số đơn hàng mới (trong 7 ngày)
    seven_days_ago = datetime.now() - timedelta(days=7)
    new_orders_count = db.query(Order).filter(Order.created_at >= seven_days_ago).count()
    
    # Số lượng dịch vụ
    services_count = db.query(Service).count()
    
    # Số lượng khách hàng (ước tính qua email)
    customers_count = db.query(Order.customer_email).distinct().count()
    
    # Ước tính doanh thu (chưa có trường giá trong order nên tạm tính giá trung bình)
    avg_service_price = 500000  # Giá trung bình ước tính
    revenue = db.query(Order).filter(Order.status.in_(["completed"])).count() * avg_service_price
    
    return {
        "new_orders": new_orders_count,
        "services": services_count,
        "customers": customers_count,
        "revenue": revenue
    }

@router.get("/revenue-by-date")
async def get_revenue_by_date(current_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """
    Trả về dữ liệu doanh thu theo ngày cho biểu đồ
    """
    # Tính doanh thu 7 ngày gần nhất
    labels = []
    values = []
    
    # Giá trung bình ước tính
    avg_service_price = 500000
    
    # Lấy 7 ngày gần nhất
    for i in range(7, 0, -1):
        date = datetime.now() - timedelta(days=i)
        next_date = datetime.now() - timedelta(days=i-1)
        
        # Format ngày
        date_label = date.strftime("%d/%m")
        labels.append(date_label)
        
        # Đếm đơn hàng hoàn thành trong ngày
        completed_orders = db.query(Order).filter(
            Order.status == "completed",
            Order.created_at >= date,
            Order.created_at < next_date
        ).count()
        
        # Tính doanh thu (đơn vị: triệu VNĐ)
        revenue = completed_orders * avg_service_price / 1000000
        values.append(revenue)
    
    return {
        "labels": labels,
        "values": values
    }

@router.get("/orders-by-service")
async def get_orders_by_service(current_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """
    Trả về dữ liệu số đơn hàng theo dịch vụ cho biểu đồ
    """
    # Lấy 5 dịch vụ có nhiều đơn hàng nhất
    services = db.query(Service).limit(5).all()
    
    labels = []
    values = []
    
    for service in services:
        labels.append(service.name)
        orders_count = db.query(Order).filter(Order.service_id == service.id).count()
        values.append(orders_count)
    
    return {
        "labels": labels,
        "values": values
    } 