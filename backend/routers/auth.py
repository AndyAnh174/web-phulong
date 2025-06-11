from fastapi import APIRouter, Depends, HTTPException, status, Request, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from config.database import get_db
from utils.jwt import create_access_token
from passlib.context import CryptContext
from schemas.schemas import UserLogin, Token, UserCreate, UserOut
from models.models import User, LoginHistory, UserRole
from middlewares.auth_middleware import get_root_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

@router.post("/register", response_model=UserOut)
async def register(user: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(get_root_user)):
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

# Endpoint đăng nhập với OAuth2PasswordRequestForm cho Swagger UI
@router.post("/login", response_model=Token)
async def login_for_access_token(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # Kiểm tra thông tin đăng nhập
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Thông tin đăng nhập không chính xác",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Thông tin đăng nhập không chính xác",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Tạo JWT token
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role},
        expires_delta=access_token_expires
    )
    
    # Lưu lịch sử đăng nhập
    client_host = request.client.host
    user_agent = request.headers.get("user-agent", "")
    
    login_history = LoginHistory(
        user_id=user.id,
        ip_address=client_host,
        user_agent=user_agent
    )
    
    db.add(login_history)
    db.commit()
    
    return {"access_token": access_token, "token_type": "bearer"}

# Thêm endpoint mới để hỗ trợ đăng nhập bằng JSON
@router.post("/login-json", response_model=Token)
async def login_json(request: Request, user_credentials: UserLogin, db: Session = Depends(get_db)):
    # Kiểm tra thông tin đăng nhập
    user = db.query(User).filter(User.username == user_credentials.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Thông tin đăng nhập không chính xác"
        )
    
    if not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Thông tin đăng nhập không chính xác"
        )
    
    # Tạo JWT token
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role},
        expires_delta=access_token_expires
    )
    
    # Lưu lịch sử đăng nhập
    client_host = request.client.host
    user_agent = request.headers.get("user-agent", "")
    
    login_history = LoginHistory(
        user_id=user.id,
        ip_address=client_host,
        user_agent=user_agent
    )
    
    db.add(login_history)
    db.commit()
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/login-history")
async def get_login_history(db: Session = Depends(get_db), current_user: User = Depends(get_root_user)):
    login_history = db.query(LoginHistory).order_by(LoginHistory.login_time.desc()).all()
    return login_history 