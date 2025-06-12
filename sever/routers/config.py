from fastapi import APIRouter, Depends
from typing import Dict, Any
from sqlalchemy.orm import Session
from config.database import get_db
from middlewares.auth_middleware import get_current_user
from models.models import User
from config.settings import settings

router = APIRouter()

@router.get("/env")
def get_public_env():
    """
    Trả về các biến môi trường công khai cho frontend
    """
    return {
        "API_URL": f"http://{settings.FRONTEND_HOST}/api" if hasattr(settings, 'FRONTEND_HOST') else "/api",
        "SITE_NAME": "Phú Long In Ấn",
        "SITE_DESCRIPTION": "Dịch vụ in ấn chất lượng cao",
        "CONTACT_EMAIL": settings.ADMIN_EMAIL,
        "CONTACT_PHONE": "0123456789",
        "CONTACT_ADDRESS": "123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh",
        "ITEMS_PER_PAGE": 10,
        "ENABLE_ANALYTICS": False
    }

@router.get("/admin-env", dependencies=[Depends(get_current_user)])
def get_admin_env():
    """
    Trả về các biến môi trường dành cho admin
    Yêu cầu xác thực JWT
    """
    public_env = get_public_env()
    
    # Thêm các thiết lập chỉ dành cho admin
    admin_env = {
        "ADMIN_DASHBOARD_TITLE": "Bảng điều khiển quản trị",
        "LOG_RETENTION_DAYS": 90,
        "MAX_UPLOAD_SIZE_MB": 10
    }
    
    return {**public_env, **admin_env} 