from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class ContactBase(BaseModel):
    """Base schema cho thông tin liên hệ"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=8, max_length=15)
    subject: str = Field(..., min_length=3, max_length=200)
    message: str = Field(..., min_length=10)


class ContactCreate(ContactBase):
    """Schema cho việc tạo liên hệ mới"""
    pass


class ContactResponse(BaseModel):
    """Schema cho phản hồi khi tạo liên hệ thành công"""
    id: int
    message: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class Contact(ContactBase):
    """Schema đầy đủ cho Contact model"""
    id: int
    created_at: datetime
    status: str = "new"
    
    class Config:
        from_attributes = True 