from fastapi import APIRouter, Depends
from typing import Dict, Any
from sqlalchemy.orm import Session
from config.database import get_db
from middlewares.auth_middleware import get_current_user
from models.models import User
from config.settings import settings

router = APIRouter()

@router.get("/env")
async def get_public_env():
    """Lấy các biến môi trường công khai cho frontend"""
    # Đảm bảo luôn trả về HTTPS URL
    backend_url = settings.BACKEND_URL if settings.BACKEND_URL else "https://demoapi.andyanh.id.vn"
    
    # Nếu không có protocol, thêm https://
    if backend_url and not backend_url.startswith("http"):
        backend_url = f"https://{backend_url}"
    
    # Đảm bảo là HTTPS
    if backend_url.startswith("http://"):
        backend_url = backend_url.replace("http://", "https://")
    
    return {
        "API_URL": f"{backend_url}/api",
        "SITE_NAME": "IN ẤN PHÚ LONG",
        "SITE_DESCRIPTION": "Dịch vụ in ấn chất lượng cao",
        "CONTACT_EMAIL": "inphulong@gmail.com",
        "CONTACT_PHONE": "0977007763",
        "CONTACT_ADDRESS": "Số 2 Lê Văn Chí, Phường Thủ Đức, Thành Phố Thủ Đức",
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