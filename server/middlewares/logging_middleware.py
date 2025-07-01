import time
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.orm import Session
from config.database import get_db
from models.models import AdminAccessLog, User, UserRole
from fastapi import Depends, HTTPException, status
from middlewares.auth_middleware import oauth2_scheme
from jose import jwt
from datetime import datetime, timezone, timedelta
from config.settings import settings
from jose import JWTError
import logging

class AdminLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware để ghi lại lịch sử truy cập của admin vào hệ thống.
    Chỉ ghi lại các truy cập của người dùng có role là admin hoặc root.
    """
    
    async def dispatch(self, request: Request, call_next):
        # Thời gian bắt đầu xử lý request
        start_time = time.time()
        
        # Lấy path của request
        path = request.url.path
        
        # Chỉ log các request API cho admin
        if path.startswith("/api/") and ("/admin" in path or "users" in path or "services" in path or "orders" in path or "blogs" in path or "dashboard" in path):
            try:
                # Lấy token từ header
                auth_header = request.headers.get("Authorization", "")
                if auth_header and auth_header.startswith("Bearer "):
                    token = auth_header.replace("Bearer ", "")
                    
                    # Giải mã token
                    try:
                        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
                        username = payload.get("sub")  # username từ token
                        user_role = payload.get("role")
                        
                        # Chỉ ghi log cho admin và root
                        if user_role in ["admin", "root"]:
                            # Xử lý request
                            response = await call_next(request)
                            
                            # Thời gian xử lý
                            process_time = time.time() - start_time
                            
                            # Tạo session database
                            db = next(get_db())
                            
                            # Lấy user_id từ database
                            user = db.query(User).filter(User.username == username).first()
                            if user:
                                # Tính thời gian hết hạn (3 tháng sau)
                                now = datetime.utcnow()
                                expires_at = now + timedelta(days=90)  # Khoảng 3 tháng
                                
                                # Tạo log access
                                access_log = AdminAccessLog(
                                    user_id=user.id,  # Sử dụng ID từ database
                                    endpoint=path,
                                    method=request.method,
                                    status_code=response.status_code,
                                    ip_address=request.client.host,
                                    timestamp=now,
                                    expires_at=expires_at
                                )
                                
                                # Lưu vào database
                                db.add(access_log)
                                db.commit()
                            
                            return response
                    except JWTError:
                        # Token không hợp lệ, không ghi log
                        pass
            except Exception as e:
                # Log lỗi
                logging.error(f"Lỗi khi ghi log admin: {str(e)}")
        
        # Xử lý request bình thường nếu không ghi log
        response = await call_next(request)
        return response 