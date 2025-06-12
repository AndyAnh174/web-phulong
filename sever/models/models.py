from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime, Float, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from config.database import Base

class UserRole(str, enum.Enum):
    ROOT = "root"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default=UserRole.ADMIN)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    login_history = relationship("LoginHistory", back_populates="user")
    access_logs = relationship("AdminAccessLog", back_populates="user")

class LoginHistory(Base):
    __tablename__ = "login_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    login_time = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String)
    user_agent = Column(String)
    
    # Relationship
    user = relationship("User", back_populates="login_history")

class AdminAccessLog(Base):
    __tablename__ = "admin_access_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    endpoint = Column(String)  # API endpoint được truy cập
    method = Column(String)    # HTTP method (GET, POST, etc.)
    status_code = Column(Integer)  # HTTP status code
    ip_address = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, default=lambda: datetime.utcnow().replace(month=datetime.utcnow().month + 3 if datetime.utcnow().month <= 9 else datetime.utcnow().month - 9, year=datetime.utcnow().year if datetime.utcnow().month <= 9 else datetime.utcnow().year + 1))
    
    # Relationship
    user = relationship("User", back_populates="access_logs")

class Service(Base):
    __tablename__ = "services"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    price = Column(Float)
    image_url = Column(String, nullable=True)
    category = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    featured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    orders = relationship("Order", back_populates="service")
    reviews = relationship("ServiceReview", back_populates="service", cascade="all, delete-orphan")

class Blog(Base):
    __tablename__ = "blogs"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text)
    image_url = Column(String, nullable=True)
    category = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String)
    customer_email = Column(String)
    customer_phone = Column(String)
    service_id = Column(Integer, ForeignKey("services.id"))
    quantity = Column(Integer)
    size = Column(String, nullable=True)
    material = Column(String, nullable=True)
    design_file_url = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    total_price = Column(Float, nullable=True)
    status = Column(String, default="pending")  # pending, processing, completed, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    service = relationship("Service", back_populates="orders")

class ServiceReview(Base):
    __tablename__ = "service_reviews"

    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("services.id"))
    author_name = Column(String, nullable=True)
    is_anonymous = Column(Boolean, default=False)
    rating = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    service = relationship("Service", back_populates="reviews") 

class Contact(Base):
    __tablename__ = "contacts"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String, default="new")  # new, read
    created_at = Column(DateTime, default=datetime.utcnow) 

class Image(Base):
    __tablename__ = "images"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)  # Tên file gốc
    file_path = Column(String, nullable=False)  # Đường dẫn file trên server
    url = Column(String, nullable=False)  # URL để truy cập ảnh
    alt_text = Column(String, nullable=True)  # Mô tả ảnh (cho SEO)
    file_size = Column(Integer, nullable=True)  # Kích thước file (bytes)
    mime_type = Column(String, nullable=True)  # Loại file (image/jpeg, image/png, etc.)
    width = Column(Integer, nullable=True)  # Chiều rộng ảnh
    height = Column(Integer, nullable=True)  # Chiều cao ảnh
    is_visible = Column(Boolean, default=True)  # Có hiển thị hay không
    category = Column(String, nullable=True)  # Danh mục ảnh (portfolio, blog, service, etc.)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # Người upload
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    uploader = relationship("User", backref="uploaded_images") 