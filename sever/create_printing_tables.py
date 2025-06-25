"""
Script để tạo các table cho Printing API với Upload Ảnh Trực Tiếp
Chạy script này để:
- Tạo bảng printings và printing_images 
- Tạo thư mục upload ảnh
- Tạo dữ liệu mẫu (tùy chọn)
"""

import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from pathlib import Path

# Thêm thư mục gốc vào Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config.database import engine, Base, get_db
from models.models import Printing, PrintingImage, User, Image
from config.settings import settings

def setup_upload_directories():
    """Tạo thư mục upload ảnh"""
    try:
        print("📁 Thiết lập thư mục upload ảnh...")
        
        # Tạo thư mục static và uploads
        upload_dirs = [
            "static",
            "static/images", 
            "static/images/uploads"
        ]
        
        for dir_path in upload_dirs:
            Path(dir_path).mkdir(parents=True, exist_ok=True)
            print(f"   ✅ {dir_path}/")
        
        # Tạo file .gitkeep để giữ thư mục trống trong git
        gitkeep_file = Path("static/images/uploads/.gitkeep")
        if not gitkeep_file.exists():
            gitkeep_file.touch()
            print("   ✅ .gitkeep file created")
        
        print("✅ Thư mục upload đã sẵn sàng!")
        return True
        
    except Exception as e:
        print(f"❌ Lỗi khi tạo thư mục upload: {str(e)}")
        return False

def check_dependencies():
    """Kiểm tra các dependencies cần thiết"""
    try:
        print("🔍 Kiểm tra dependencies...")
        
        required_packages = [
            ("PIL", "Pillow - xử lý ảnh"),
            ("fastapi", "FastAPI framework"),
            ("python-multipart", "Upload file support")
        ]
        
        missing_packages = []
        
        for package, description in required_packages:
            try:
                if package == "PIL":
                    from PIL import Image as PILImage
                elif package == "fastapi":
                    import fastapi
                elif package == "python-multipart":
                    import multipart
                    
                print(f"   ✅ {package} - {description}")
            except ImportError:
                missing_packages.append((package, description))
                print(f"   ❌ {package} - {description} (MISSING)")
        
        if missing_packages:
            print("\n⚠️  Thiếu dependencies. Cài đặt bằng lệnh:")
            for package, _ in missing_packages:
                if package == "PIL":
                    print(f"   pip install Pillow")
                else:
                    print(f"   pip install {package}")
            return False
        
        print("✅ Tất cả dependencies đều có sẵn!")
        return True
        
    except Exception as e:
        print(f"❌ Lỗi khi kiểm tra dependencies: {str(e)}")
        return False

def create_printing_tables():
    """Tạo các table cho Printing"""
    try:
        print("🚀 Bắt đầu tạo bảng cho Printing API...")
        
        # Tạo tất cả các table (chỉ tạo table chưa tồn tại)
        Base.metadata.create_all(bind=engine)
        
        print("✅ Đã tạo thành công các bảng:")
        print("   - printings (bài đăng in ấn)")
        print("   - printing_images (ảnh đính kèm)")
        print("   - images (thông tin ảnh)")
        print("   - users (người dùng)")
        print("   - và các bảng khác nếu chưa có...")
        
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
        print("\n📚 Các endpoint có sẵn (WITH UPLOAD ẢNH TRỰC TIẾP):")
        print("   - GET    /api/printing           - Lấy danh sách bài đăng (PUBLIC)")
        print("   - GET    /api/printing/{id}      - Lấy chi tiết bài đăng (PUBLIC)")
        print("   - POST   /api/printing           - Tạo bài đăng + upload ảnh (ADMIN)")
        print("   - PUT    /api/printing/{id}      - Cập nhật bài đăng + ảnh (ADMIN)")
        print("   - DELETE /api/printing/{id}      - Xóa bài đăng (ADMIN)")
        print("   - PATCH  /api/printing/{id}/visibility - Ẩn/hiện bài đăng (ADMIN)")
        print("\n🌟 TÍNH NĂNG MỚI:")
        print("   ✨ Upload ảnh trực tiếp khi tạo/cập nhật bài đăng")
        print("   ✨ Hỗ trợ multipart/form-data")
        print("   ✨ Tối đa 3 ảnh/bài đăng, 10MB/ảnh")
        print("   ✨ Auto resize và optimize ảnh")
        
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

def interactive_menu():
    """Menu tương tác cho người dùng"""
    print("\n🎛️  MENU THIẾT LẬP")
    print("=" * 40)
    print("1. ✅ Chỉ tạo bảng database")
    print("2. 📁 Chỉ thiết lập thư mục upload")
    print("3. 📝 Chỉ tạo dữ liệu mẫu") 
    print("4. 🚀 Thiết lập hoàn chỉnh (recommended)")
    print("5. ❌ Thoát")
    print("=" * 40)
    
    while True:
        try:
            choice = input("👉 Chọn tùy chọn (1-5): ").strip()
            
            if choice == "1":
                return ["tables"]
            elif choice == "2":
                return ["directories"]
            elif choice == "3":
                return ["sample_data"]
            elif choice == "4":
                return ["dependencies", "directories", "tables", "sample_data"]
            elif choice == "5":
                print("👋 Tạm biệt!")
                return []
            else:
                print("❌ Vui lòng chọn từ 1-5")
                
        except KeyboardInterrupt:
            print("\n👋 Thoát bằng Ctrl+C")
            return []

def main():
    """Hàm chính"""
    print("=" * 70)
    print("🏗️  SCRIPT TẠO PRINTING API VỚI UPLOAD ẢNH TRỰC TIẾP")
    print("=" * 70)
    
    # Kiểm tra kết nối database
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ Kết nối database thành công!")
    except Exception as e:
        print(f"❌ Không thể kết nối database: {str(e)}")
        print("💡 Kiểm tra lại cấu hình database trong file .env")
        return
    
    # Menu tương tác
    selected_tasks = interactive_menu()
    
    if not selected_tasks:
        return
    
    print(f"\n🚀 Bắt đầu thực hiện {len(selected_tasks)} task(s)...")
    
    # Thực hiện các task được chọn
    success_count = 0
    
    for task in selected_tasks:
        if task == "dependencies":
            if check_dependencies():
                success_count += 1
            else:
                print("⚠️  Một số dependencies thiếu, nhưng vẫn tiếp tục...")
                
        elif task == "directories":
            if setup_upload_directories():
                success_count += 1
                
        elif task == "tables":
            if create_printing_tables():
                success_count += 1
                
        elif task == "sample_data":
            print("\n📝 Tạo dữ liệu mẫu...")
            if create_sample_data():
                success_count += 1
    
    # Tổng kết
    print("\n" + "=" * 70)
    if success_count == len(selected_tasks):
        print("🎊 HOÀN THÀNH THIẾT LẬP PRINTING API!")
        print("✅ Tất cả task đều thành công!")
    else:
        print(f"⚠️  HOÀN THÀNH VỚI {success_count}/{len(selected_tasks)} TASK THÀNH CÔNG")
        
    print("=" * 70)
    print("📖 Swagger Documentation: http://localhost:8000/api/docs")
    print("🔗 API Base URL: http://localhost:8000/api/printing")
    print("📂 Upload Directory: ./static/images/uploads/")
    print("\n💡 Lưu ý: Để test upload ảnh, chạy: python test_printing_upload.py")

if __name__ == "__main__":
    main() 