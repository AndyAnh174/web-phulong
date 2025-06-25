"""
Script để tạo các table cho Printing API
Chạy script này để thêm bảng printings và printing_images vào database
"""

import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Thêm thư mục gốc vào Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config.database import engine, Base, get_db
from models.models import Printing, PrintingImage, User, Image
from config.settings import settings

def create_printing_tables():
    """Tạo các table cho Printing"""
    try:
        print("🚀 Bắt đầu tạo bảng cho Printing API...")
        
        # Tạo tất cả các table (chỉ tạo table chưa tồn tại)
        Base.metadata.create_all(bind=engine)
        
        print("✅ Đã tạo thành công các bảng:")
        print("   - printings")
        print("   - printing_images")
        
        # Kiểm tra và hiển thị thông tin bảng
        with engine.connect() as connection:
            # Kiểm tra bảng printings
            result = connection.execute(text("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = 'printings'
                ORDER BY ordinal_position;
            """))
            
            print("\n📋 Cấu trúc bảng 'printings':")
            for row in result:
                nullable = "NULL" if row[2] == "YES" else "NOT NULL"
                default = f" DEFAULT {row[3]}" if row[3] else ""
                print(f"   - {row[0]}: {row[1]} {nullable}{default}")
            
            # Kiểm tra bảng printing_images
            result = connection.execute(text("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = 'printing_images'
                ORDER BY ordinal_position;
            """))
            
            print("\n📋 Cấu trúc bảng 'printing_images':")
            for row in result:
                nullable = "NULL" if row[2] == "YES" else "NOT NULL"
                default = f" DEFAULT {row[3]}" if row[3] else ""
                print(f"   - {row[0]}: {row[1]} {nullable}{default}")
        
        print("\n🎉 Hoàn thành! Bạn có thể sử dụng Printing API ngay bây giờ.")
        print("\n📚 Các endpoint có sẵn:")
        print("   - GET    /api/printing           - Lấy danh sách bài đăng")
        print("   - GET    /api/printing/{id}      - Lấy chi tiết bài đăng")
        print("   - POST   /api/printing           - Tạo bài đăng mới (ADMIN)")
        print("   - PUT    /api/printing/{id}      - Cập nhật bài đăng (ADMIN)")
        print("   - DELETE /api/printing/{id}      - Xóa bài đăng (ADMIN)")
        print("   - PATCH  /api/printing/{id}/visibility - Ẩn/hiện bài đăng (ADMIN)")
        
        return True
        
    except Exception as e:
        print(f"❌ Lỗi khi tạo bảng: {str(e)}")
        return False

def create_sample_data():
    """Tạo dữ liệu mẫu (tùy chọn)"""
    try:
        print("\n📝 Tạo dữ liệu mẫu...")
        
        # Lấy database session
        db = next(get_db())
        
        # Kiểm tra xem đã có dữ liệu mẫu chưa
        existing = db.query(Printing).first()
        if existing:
            print("⚠️  Đã có dữ liệu trong bảng printings. Bỏ qua tạo dữ liệu mẫu.")
            return True
        
        # Tìm user admin để gán làm người tạo
        admin_user = db.query(User).filter(User.role.in_(["admin", "root"])).first()
        if not admin_user:
            print("⚠️  Không tìm thấy user admin. Tạo bài đăng mẫu không có người tạo.")
        
        # Tạo bài đăng mẫu
        sample_printings = [
            {
                "title": "In ấn name card cao cấp",
                "time": "1-2 ngày",
                "content": "Dịch vụ in ấn name card với chất lượng cao, sử dụng giấy art paper 300gsm, hoàn thiện bóng cục bộ. Thiết kế chuyên nghiệp, tạo ấn tượng mạnh mẽ cho khách hàng.",
                "is_visible": True
            },
            {
                "title": "In brochure quảng cáo",
                "time": "2-3 ngày", 
                "content": "In brochure quảng cáo với nhiều kích thước và kiểu dáng đa dạng. Sử dụng máy in offset chất lượng cao, màu sắc sống động, bắt mắt.",
                "is_visible": True
            },
            {
                "title": "In catalogue sản phẩm",
                "time": "3-5 ngày",
                "content": "Dịch vụ in catalogue sản phẩm chuyên nghiệp với thiết kế bắt mắt, giấy in chất lượng cao. Hoàn thiện với nhiều tùy chọn như gáy xoắn, đóng gáy keo...",
                "is_visible": False  # Ẩn để test chức năng ẩn/hiện
            }
        ]
        
        for sample in sample_printings:
            printing = Printing(
                title=sample["title"],
                time=sample["time"],
                content=sample["content"],
                is_visible=sample["is_visible"],
                created_by=admin_user.id if admin_user else None
            )
            db.add(printing)
        
        db.commit()
        print("✅ Đã tạo 3 bài đăng mẫu thành công!")
        
        return True
        
    except Exception as e:
        print(f"❌ Lỗi khi tạo dữ liệu mẫu: {str(e)}")
        db.rollback()
        return False
    finally:
        db.close()

def main():
    """Hàm chính"""
    print("=" * 60)
    print("🏗️  SCRIPT TẠO BẢNG CHO PRINTING API")
    print("=" * 60)
    
    # Kiểm tra kết nối database
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ Kết nối database thành công!")
    except Exception as e:
        print(f"❌ Không thể kết nối database: {str(e)}")
        print("💡 Kiểm tra lại cấu hình database trong file .env")
        return
    
    # Tạo bảng
    if not create_printing_tables():
        return
    
    # Hỏi có muốn tạo dữ liệu mẫu không
    while True:
        choice = input("\n❓ Bạn có muốn tạo dữ liệu mẫu không? (y/n): ").lower().strip()
        if choice in ['y', 'yes']:
            create_sample_data()
            break
        elif choice in ['n', 'no']:
            print("ℹ️  Bỏ qua tạo dữ liệu mẫu.")
            break
        else:
            print("❌ Vui lòng nhập 'y' hoặc 'n'")
    
    print("\n" + "=" * 60)
    print("🎊 HOÀN THÀNH THIẾT LẬP PRINTING API!")
    print("=" * 60)
    print("📖 Swagger Documentation: http://localhost:8000/api/docs")
    print("🔗 API Base URL: http://localhost:8000/api/printing")

if __name__ == "__main__":
    main() 