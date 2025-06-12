from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from config.database import get_db
from schemas.schemas import ServiceCreate, ServiceOut, ServiceUpdate, ServiceReviewCreate, ServiceReviewOut
from models.models import Service, User, ServiceReview
from middlewares.auth_middleware import get_current_user, get_admin_user

router = APIRouter(prefix="/api/services", tags=["Services"])

@router.get("/", response_model=List[ServiceOut])
async def get_services(
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    featured: Optional[bool] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách dịch vụ
    - is_active: Lọc theo trạng thái kích hoạt
    - featured: Lọc các dịch vụ nổi bật
    - category: Lọc theo danh mục/tag
    - skip: Số lượng bản ghi bỏ qua (phân trang)
    - limit: Số lượng bản ghi tối đa trả về
    """
    query = db.query(Service)
    
    if is_active is not None:
        query = query.filter(Service.is_active == is_active)
    
    # Lọc theo trường featured
    if featured is not None:
        query = query.filter(Service.featured == featured)
    
    # Lọc theo category
    if category is not None:
        query = query.filter(Service.category == category)
    
    services = query.order_by(Service.id).offset(skip).limit(limit).all()
    return services

@router.get("/suggested", response_model=List[ServiceOut])
async def get_suggested_services(current_id: int = Query(...), db: Session = Depends(get_db)):
    # Lấy tối đa 4 dịch vụ khác với current_id, ưu tiên dịch vụ featured và active
    services = db.query(Service).filter(
        Service.id != current_id, 
        Service.is_active == True,
        Service.featured == True
    ).limit(4).all()
    
    # Nếu chưa đủ 4 dịch vụ featured, lấy thêm các dịch vụ active khác
    if len(services) < 4:
        existing_ids = [s.id for s in services]
        extra = db.query(Service).filter(
            Service.id != current_id, 
            Service.is_active == True,
            ~Service.id.in_(existing_ids)
        ).limit(4 - len(services)).all()
        services += extra
        
    # Nếu vẫn chưa đủ 4, lấy bất kỳ dịch vụ nào khác
    if len(services) < 4:
        existing_ids = [s.id for s in services]
        extra = db.query(Service).filter(
            Service.id != current_id, 
            ~Service.id.in_(existing_ids)
        ).limit(4 - len(services)).all()
        services += extra
        
    return services

@router.get("/{service_id}", response_model=ServiceOut)
async def get_service(service_id: int, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()
    
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dịch vụ với ID {service_id} không tồn tại"
        )
    
    return service

@router.post("/", response_model=ServiceOut)
async def create_service(service: ServiceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    new_service = Service(
        name=service.name,
        description=service.description,
        price=service.price,
        image_url=service.image_url,
        category=service.category,
        is_active=service.is_active,
        featured=service.featured
    )
    
    db.add(new_service)
    db.commit()
    db.refresh(new_service)
    
    return new_service

@router.put("/{service_id}", response_model=ServiceOut)
async def update_service(
    service_id: int,
    service: ServiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    db_service = db.query(Service).filter(Service.id == service_id).first()
    
    if not db_service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dịch vụ với ID {service_id} không tồn tại"
        )
    
    # Cập nhật các trường nếu được cung cấp
    if service.name is not None:
        db_service.name = service.name
    if service.description is not None:
        db_service.description = service.description
    if service.price is not None:
        db_service.price = service.price
    if service.image_url is not None:
        db_service.image_url = service.image_url
    if service.category is not None:
        db_service.category = service.category
    if service.is_active is not None:
        db_service.is_active = service.is_active
    if service.featured is not None:
        db_service.featured = service.featured
    
    db.commit()
    db.refresh(db_service)
    
    return db_service

@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(service_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    db_service = db.query(Service).filter(Service.id == service_id).first()
    
    if not db_service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dịch vụ với ID {service_id} không tồn tại"
        )
    
    db.delete(db_service)
    db.commit()
    
    return None

@router.get("/{service_id}/reviews", response_model=List[ServiceReviewOut])
async def get_service_reviews(service_id: int, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Dịch vụ không tồn tại")
    return db.query(ServiceReview).filter(ServiceReview.service_id == service_id).order_by(ServiceReview.created_at.desc()).all()

@router.post("/{service_id}/reviews", response_model=ServiceReviewOut)
async def create_service_review(service_id: int, review: ServiceReviewCreate, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Dịch vụ không tồn tại")
    new_review = ServiceReview(
        service_id=service_id,
        author_name=review.author_name if not review.is_anonymous else None,
        is_anonymous=review.is_anonymous,
        rating=review.rating,
        content=review.content
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return new_review 