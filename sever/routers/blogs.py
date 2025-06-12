from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from config.database import get_db
from schemas.schemas import BlogCreate, BlogOut, BlogUpdate
from models.models import Blog, User
from middlewares.auth_middleware import get_current_user, get_admin_user

router = APIRouter(prefix="/api/blogs", tags=["Blogs"])

@router.get("/", response_model=List[BlogOut])
async def get_blogs(db: Session = Depends(get_db), skip: int = 0, limit: int = 10, is_active: bool = None, category: str = None):
    query = db.query(Blog)
    
    if is_active is not None:
        query = query.filter(Blog.is_active == is_active)
    
    if category is not None:
        query = query.filter(Blog.category == category)
    
    blogs = query.order_by(Blog.created_at.desc()).offset(skip).limit(limit).all()
    return blogs

@router.get("/{blog_id}", response_model=BlogOut)
async def get_blog(blog_id: int, db: Session = Depends(get_db)):
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bài viết với ID {blog_id} không tồn tại"
        )
    
    return blog

@router.post("/", response_model=BlogOut)
async def create_blog(blog: BlogCreate, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    new_blog = Blog(
        title=blog.title,
        content=blog.content,
        image_url=blog.image_url,
        category=blog.category,
        is_active=blog.is_active
    )
    
    db.add(new_blog)
    db.commit()
    db.refresh(new_blog)
    
    return new_blog

@router.put("/{blog_id}", response_model=BlogOut)
async def update_blog(
    blog_id: int,
    blog: BlogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    db_blog = db.query(Blog).filter(Blog.id == blog_id).first()
    
    if not db_blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bài viết với ID {blog_id} không tồn tại"
        )
    
    # Cập nhật các trường nếu được cung cấp
    if blog.title is not None:
        db_blog.title = blog.title
    if blog.content is not None:
        db_blog.content = blog.content
    if blog.image_url is not None:
        db_blog.image_url = blog.image_url
    if blog.category is not None:
        db_blog.category = blog.category
    if blog.is_active is not None:
        db_blog.is_active = blog.is_active
    
    db.commit()
    db.refresh(db_blog)
    
    return db_blog

@router.delete("/{blog_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_blog(blog_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    db_blog = db.query(Blog).filter(Blog.id == blog_id).first()
    
    if not db_blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bài viết với ID {blog_id} không tồn tại"
        )
    
    db.delete(db_blog)
    db.commit()
    
    return None 