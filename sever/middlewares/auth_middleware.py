from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from config.database import get_db
from utils.jwt import verify_token
from models.models import User, UserRole
from typing import Optional

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    token_data = verify_token(token)
    user = db.query(User).filter(User.username == token_data.username).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is inactive"
        )
    
    return user

def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN and current_user.role != UserRole.ROOT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized. Admin role required."
        )
    return current_user

def get_root_user(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ROOT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized. Root role required."
        )
    return current_user 