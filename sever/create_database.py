from config.database import engine
from models.models import Base

def create_database():
    try:
        # Tạo tất cả các bảng
        Base.metadata.create_all(bind=engine)
        print("Tất cả các bảng đã được tạo thành công!")
        return True
    except Exception as e:
        print(f"Lỗi khi tạo bảng: {str(e)}")
        return False

if __name__ == "__main__":
    create_database() 