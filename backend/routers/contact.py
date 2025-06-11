from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from config.database import get_db
from utils.email import send_email
from models.models import Contact
import schemas.contact
from middlewares.auth_middleware import get_admin_user

router = APIRouter()

@router.post("/submit", response_model=schemas.contact.ContactResponse)
async def submit_contact(
    contact: schemas.contact.ContactCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Gửi form liên hệ và lưu vào database
    """
    # Tạo bản ghi liên hệ mới
    db_contact = Contact(
        name=contact.name,
        email=contact.email,
        phone=contact.phone,
        subject=contact.subject,
        message=contact.message,
        created_at=datetime.now()
    )
    
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    
    # Gửi email thông báo trong background
    email_subject = f"Liên hệ mới từ: {contact.name}"
    email_body = f"""
    <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
                .container {{ width: 100%; max-width: 600px; margin: 0 auto; }}
                .header {{ background-color: #f8f9fa; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; }}
                .info-item {{ margin-bottom: 10px; }}
                .message-box {{ background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>Thông tin liên hệ mới</h2>
                </div>
                <div class="content">
                    <div class="info-item"><strong>Họ tên:</strong> {contact.name}</div>
                    <div class="info-item"><strong>Email:</strong> {contact.email}</div>
                    <div class="info-item"><strong>Số điện thoại:</strong> {contact.phone}</div>
                    <div class="info-item"><strong>Tiêu đề:</strong> {contact.subject}</div>
                    <div class="info-item"><strong>Thời gian:</strong> {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}</div>
                    
                    <div class="message-box">
                        <h3>Nội dung tin nhắn:</h3>
                        <p>{contact.message}</p>
                    </div>
                </div>
            </div>
        </body>
    </html>
    """
    
    # Thực hiện gửi email trong background
    admin_email = "admin@phulong.com"  # Thay email người nhận thực tế vào đây
    background_tasks.add_task(
        send_email,
        admin_email,  # to_email
        email_subject,  # subject
        email_body  # html_content
    )
    
    return {
        "id": db_contact.id,
        "message": "Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể.",
        "created_at": db_contact.created_at
    }


@router.get("/list", response_model=List[schemas.contact.Contact])
async def get_contacts(
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_admin_user)
):
    """
    Lấy danh sách các liên hệ (chỉ admin)
    """
    contacts = db.query(Contact).order_by(Contact.created_at.desc()).offset(skip).limit(limit).all()
    return contacts


@router.get("/{contact_id}", response_model=schemas.contact.Contact)
async def get_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_admin_user)
):
    """
    Lấy thông tin chi tiết một liên hệ (chỉ admin)
    """
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy liên hệ"
        )
    return contact


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_admin_user)
):
    """
    Xóa một liên hệ (chỉ admin)
    """
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Không tìm thấy liên hệ"
        )
    
    db.delete(contact)
    db.commit()
    return None 