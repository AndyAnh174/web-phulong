from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from config.database import get_db
from schemas.schemas import UserOut, UserUpdate, UserCreate, AdminAccessLogOut
from models.models import User, AdminAccessLog
from middlewares.auth_middleware import get_current_user, get_root_user
from passlib.context import CryptContext
from datetime import datetime, timedelta
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

router = APIRouter(prefix="/api/users", tags=["Users"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

@router.post("/", response_model=UserOut)
async def create_user(user: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(get_root_user)):
    # Kiểm tra xem người dùng đã tồn tại chưa
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username đã tồn tại"
        )
    
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email đã tồn tại"
        )
    
    # Tạo người dùng mới
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/me", response_model=UserOut)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/", response_model=List[UserOut])
async def get_users(db: Session = Depends(get_db), current_user: User = Depends(get_root_user), skip: int = 0, limit: int = 100):
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_root_user)):
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Người dùng với ID {user_id} không tồn tại"
        )
    
    return user

@router.get("/access-logs/admin", response_model=List[AdminAccessLogOut])
async def get_admin_access_logs(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_root_user),
    user_id: Optional[int] = None,
    role: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = 0, 
    limit: int = 100
):
    """
    Lấy lịch sử truy cập của admin.
    Chỉ ROOT có quyền truy cập.
    Có thể lọc theo user_id, role, khoảng thời gian.
    Mặc định chỉ hiển thị log của admin (không hiển thị log của root).
    """
    # Sử dụng joinedload để tải thông tin user cùng lúc
    query = db.query(AdminAccessLog).options(joinedload(AdminAccessLog.user))
    
    # Lọc theo user_id nếu được cung cấp
    if user_id:
        query = query.filter(AdminAccessLog.user_id == user_id)
    
    # Lọc theo role
    if role:
        query = query.join(AdminAccessLog.user).filter(User.role == role)
    else:
        # Mặc định chỉ hiển thị log của admin, không hiển thị log của root
        query = query.join(AdminAccessLog.user).filter(User.role == "admin")
    
    # Lọc theo khoảng thời gian nếu được cung cấp
    if start_date:
        query = query.filter(AdminAccessLog.timestamp >= start_date)
    
    if end_date:
        query = query.filter(AdminAccessLog.timestamp <= end_date)
    
    # Sắp xếp theo thời gian giảm dần
    query = query.order_by(AdminAccessLog.timestamp.desc())
    
    # Đếm tổng số bản ghi thỏa mãn điều kiện lọc
    total_count = query.count()
    
    # Phân trang
    access_logs = query.offset(skip).limit(limit).all()
    
    # Trả về response với header X-Total-Count
    content = jsonable_encoder(access_logs)
    response = JSONResponse(content=content)
    response.headers["X-Total-Count"] = str(total_count)
    
    return response

@router.put("/{user_id}", response_model=UserOut)
async def update_user(
    user_id: int,
    user: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_root_user)
):
    db_user = db.query(User).filter(User.id == user_id).first()
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Người dùng với ID {user_id} không tồn tại"
        )
    
    # Cập nhật các trường nếu được cung cấp
    if user.username is not None:
        # Kiểm tra username đã tồn tại chưa
        existing_user = db.query(User).filter(User.username == user.username).first()
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username đã tồn tại"
            )
        db_user.username = user.username
    
    if user.email is not None:
        # Kiểm tra email đã tồn tại chưa
        existing_user = db.query(User).filter(User.email == user.email).first()
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email đã tồn tại"
            )
        db_user.email = user.email
    
    if user.role is not None:
        db_user.role = user.role
    
    if user.is_active is not None:
        db_user.is_active = user.is_active
        
    # Kiểm tra xem có cập nhật mật khẩu không
    if hasattr(user, 'password') and user.password:
        db_user.hashed_password = get_password_hash(user.password)
    
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.delete("/{user_id}", response_model=UserOut)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_root_user)
):
    db_user = db.query(User).filter(User.id == user_id).first()
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Người dùng với ID {user_id} không tồn tại"
        )
    
    # Xóa user
    db.delete(db_user)
    db.commit()
    
    return db_user

@router.delete("/by-username/{username}", response_model=UserOut)
async def delete_user_by_username(
    username: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_root_user)
):
    db_user = db.query(User).filter(User.username == username).first()
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Người dùng với username {username} không tồn tại"
        )
    
    # Xóa user
    db.delete(db_user)
    db.commit()
    
    return db_user

@router.delete("/access-logs/cleanup", status_code=status.HTTP_204_NO_CONTENT)
async def cleanup_expired_access_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_root_user)
):
    """
    Xóa các bản ghi log đã quá hạn (sau 3 tháng).
    Chỉ ROOT có quyền thực hiện thao tác này.
    """
    # Lấy thời gian hiện tại
    now = datetime.utcnow()
    
    # Tìm các bản ghi đã hết hạn
    expired_logs = db.query(AdminAccessLog).filter(AdminAccessLog.expires_at < now).all()
    
    # Xóa các bản ghi đã hết hạn
    for log in expired_logs:
        db.delete(log)
    
    # Lưu thay đổi
    db.commit()
    
    return None