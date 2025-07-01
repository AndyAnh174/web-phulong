"""
Migration: Thay đổi Services từ image_url sang image_id

Chạy file này để:
1. Thêm column image_id vào bảng services
2. Xóa column image_url (sau khi backup dữ liệu)
3. Tạo foreign key constraint với bảng images
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from config.settings import settings

# Tạo kết nối database
DATABASE_URL = f"postgresql://{settings.DATABASE_USER}:{settings.DATABASE_PASSWORD}@{settings.DATABASE_HOST}:{settings.DATABASE_PORT}/{settings.DATABASE_NAME}"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def run_migration():
    """Chạy migration"""
    db = SessionLocal()
    
    try:
        print("🚀 Bắt đầu migration: Services image_url -> image_id")
        
        # 1. Kiểm tra xem column image_id đã tồn tại chưa
        result = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'services' AND column_name = 'image_id'
        """))
        
        if not result.fetchone():
            print("📝 Thêm column image_id vào bảng services...")
            db.execute(text("ALTER TABLE services ADD COLUMN image_id INTEGER"))
            db.commit()
            print("✅ Đã thêm column image_id")
        else:
            print("ℹ️  Column image_id đã tồn tại")
        
        # 2. Tạo foreign key constraint (nếu chưa có)
        try:
            print("📝 Tạo foreign key constraint với bảng images...")
            db.execute(text("""
                ALTER TABLE services 
                ADD CONSTRAINT fk_services_image_id 
                FOREIGN KEY (image_id) REFERENCES images (id) 
                ON DELETE SET NULL
            """))
            db.commit()
            print("✅ Đã tạo foreign key constraint")
        except Exception as e:
            if "already exists" in str(e).lower():
                print("ℹ️  Foreign key constraint đã tồn tại")
            else:
                print(f"⚠️  Lỗi khi tạo foreign key: {e}")
        
        # 3. Backup dữ liệu image_url trước khi xóa (optional)
        print("📝 Backup dữ liệu image_url...")
        result = db.execute(text("SELECT id, image_url FROM services WHERE image_url IS NOT NULL"))
        services_with_images = result.fetchall()
        
        if services_with_images:
            print(f"📊 Tìm thấy {len(services_with_images)} services có image_url:")
            for service in services_with_images:
                print(f"   - Service ID {service[0]}: {service[1]}")
            
            print("\n⚠️  QUAN TRỌNG: Dữ liệu image_url sẽ bị mất!")
            print("   Vui lòng đảm bảo đã chuyển đổi tất cả image_url thành image_id")
            print("   hoặc sao lưu dữ liệu trước khi tiếp tục.")
            
            confirm = input("\n❓ Bạn có muốn xóa column image_url? (y/N): ")
            if confirm.lower() == 'y':
                print("📝 Xóa column image_url...")
                db.execute(text("ALTER TABLE services DROP COLUMN image_url"))
                db.commit()
                print("✅ Đã xóa column image_url")
            else:
                print("⏸️  Bỏ qua việc xóa column image_url")
        else:
            print("📝 Không có dữ liệu image_url, tiến hành xóa column...")
            # Kiểm tra column image_url có tồn tại không
            result = db.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'services' AND column_name = 'image_url'
            """))
            
            if result.fetchone():
                db.execute(text("ALTER TABLE services DROP COLUMN image_url"))
                db.commit()
                print("✅ Đã xóa column image_url")
            else:
                print("ℹ️  Column image_url không tồn tại")
        
        print("\n🎉 Migration hoàn thành!")
        print("📋 Tóm tắt thay đổi:")
        print("   ✓ Thêm column image_id (INTEGER)")
        print("   ✓ Tạo foreign key với bảng images")
        print("   ✓ Xóa column image_url (nếu được xác nhận)")
        
    except Exception as e:
        print(f"❌ Lỗi migration: {e}")
        db.rollback()
        return False
    finally:
        db.close()
    
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("🔄 MIGRATION: Services Image URL -> Image Upload")
    print("=" * 60)
    
    success = run_migration()
    
    if success:
        print("\n✅ Migration thành công!")
        print("\n📝 Bước tiếp theo:")
        print("   1. Restart server để áp dụng model changes")
        print("   2. Test API endpoints mới:")
        print("      - POST /api/services/ (với multipart/form-data)")
        print("      - PUT /api/services/{id} (với upload ảnh)")
        print("      - POST /api/printing/upload-content-image")
        print("   3. Frontend cần cập nhật để sử dụng multipart/form-data")
    else:
        print("\n❌ Migration thất bại!")
        sys.exit(1) 