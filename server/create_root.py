from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
from models.models import User, UserRole
from config.database import engine

# Tạo session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

# Mã hóa mật khẩu
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

# Kiểm tra xem người dùng root đã tồn tại chưa
existing_user = db.query(User).filter(User.username == "root").first()

if existing_user:
    print("Tài khoản root đã tồn tại!")
else:
    # Tạo người dùng root
    hashed_password = get_password_hash("inphulong0977007763")
    root_user = User(
        username="root",
        email="root@phulong.com",
        hashed_password=hashed_password,
        role=UserRole.ROOT
    )
    
    # Thêm vào database
    db.add(root_user)
    db.commit()
    print("Đã tạo tài khoản root thành công!")

db.close() 