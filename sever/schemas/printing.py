from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from schemas.schemas import UserOut, ImageOut

# Printing Image Schemas
class PrintingImageBase(BaseModel):
    image_id: int
    order: int = Field(ge=1, le=3, description="Thứ tự ảnh từ 1-3")

class PrintingImageCreate(PrintingImageBase):
    pass

class PrintingImageOut(PrintingImageBase):
    id: int
    printing_id: int
    created_at: datetime
    image: Optional[ImageOut] = None
    
    class Config:
        from_attributes = True

# Printing Schemas
class PrintingBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Tiêu đề bài đăng")
    time: str = Field(..., min_length=1, max_length=100, description="Thời gian in ấn (VD: 1-2 ngày)")
    content: str = Field(..., min_length=1, description="Nội dung bài đăng")
    is_visible: bool = Field(default=True, description="Ẩn/hiện bài đăng")

class PrintingCreate(PrintingBase):
    image_ids: Optional[List[int]] = Field(default=[], description="Danh sách ID ảnh (tối đa 3)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "In ấn name card cao cấp",
                "time": "1-2 ngày",
                "content": "Dịch vụ in ấn name card với chất lượng cao, thiết kế đẹp mắt...",
                "is_visible": True,
                "image_ids": [1, 2, 3]
            }
        }

class PrintingUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    time: Optional[str] = Field(None, min_length=1, max_length=100)
    content: Optional[str] = Field(None, min_length=1)
    is_visible: Optional[bool] = None
    image_ids: Optional[List[int]] = Field(None, description="Danh sách ID ảnh mới (tối đa 3)")

class PrintingOut(PrintingBase):
    id: int
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None
    creator: Optional[UserOut] = None
    images: List[PrintingImageOut] = []
    
    class Config:
        from_attributes = True

# Response Schemas
class PrintingListResponse(BaseModel):
    items: List[PrintingOut]
    total: int
    
class PrintingResponse(BaseModel):
    message: str
    printing: PrintingOut 