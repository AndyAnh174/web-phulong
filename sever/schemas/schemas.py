from pydantic import BaseModel, EmailStr, Field, create_model
from typing import Optional, List, Generic, TypeVar, Dict, Any
from datetime import datetime
from enum import Enum

# User Schemas
class UserRole(str, Enum):
    ROOT = "root"
    ADMIN = "admin"

class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: UserRole = UserRole.ADMIN

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None
    
class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class TokenData(BaseModel):
    username: str
    role: UserRole

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# Login History Schemas
class LoginHistoryBase(BaseModel):
    user_id: int
    ip_address: str
    user_agent: str

class LoginHistoryCreate(LoginHistoryBase):
    pass

class LoginHistoryOut(LoginHistoryBase):
    id: int
    login_time: datetime
    
    class Config:
        from_attributes = True

# Admin Access Log Schemas
class AdminAccessLogBase(BaseModel):
    user_id: int
    endpoint: str
    method: str
    status_code: int
    ip_address: str
    timestamp: datetime

class AdminAccessLogOut(AdminAccessLogBase):
    id: int
    user: Optional[UserOut] = None
    
    class Config:
        from_attributes = True

# Service Schemas
class ServiceBase(BaseModel):
    name: str
    description: str
    price: float
    image_url: Optional[str] = None
    category: Optional[str] = None
    is_active: bool = True
    featured: bool = False

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None
    featured: Optional[bool] = None

class ServiceOut(ServiceBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Blog Schemas
class BlogBase(BaseModel):
    title: str
    content: str
    image_url: Optional[str] = None
    category: Optional[str] = None
    is_active: bool = True

class BlogCreate(BlogBase):
    pass

class BlogUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None

class BlogOut(BlogBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Generic Pagination Model
class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    
    class Config:
        from_attributes = True

# Order Schemas
class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class OrderBase(BaseModel):
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    service_id: int
    quantity: int
    size: Optional[str] = None
    material: Optional[str] = None
    notes: Optional[str] = None

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    status: OrderStatus

class OrderOut(OrderBase):
    id: int
    design_file_url: Optional[str] = None
    total_price: Optional[float] = None
    status: OrderStatus
    created_at: datetime
    updated_at: datetime
    service: Optional[ServiceOut] = None
    
    class Config:
        from_attributes = True

# Service Review Schemas
class ServiceReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    content: str
    author_name: Optional[str] = None
    is_anonymous: bool = False

class ServiceReviewCreate(ServiceReviewBase):
    pass

class ServiceReviewOut(ServiceReviewBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Contact Schemas
class ContactBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    subject: str
    message: str

class ContactCreate(ContactBase):
    pass

class ContactUpdate(BaseModel):
    status: Optional[str] = None

class ContactOut(ContactBase):
    id: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Image Schemas
class ImageBase(BaseModel):
    filename: str
    alt_text: Optional[str] = None
    is_visible: bool = True
    category: Optional[str] = None

class ImageCreate(BaseModel):
    alt_text: Optional[str] = None
    is_visible: bool = True
    category: Optional[str] = None

class ImageUpdate(BaseModel):
    alt_text: Optional[str] = None
    is_visible: Optional[bool] = None
    category: Optional[str] = None

class ImageOut(BaseModel):
    id: int
    filename: str
    file_path: str
    url: str
    alt_text: Optional[str] = None
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    is_visible: bool
    category: Optional[str] = None
    uploaded_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    uploader: Optional[UserOut] = None
    
    class Config:
        from_attributes = True

class ImageUploadResponse(BaseModel):
    message: str
    image: ImageOut 