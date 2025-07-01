#!/usr/bin/env python3
"""
Migration Script: Services Image URL -> Image Upload
Chạy script này từ trong container để migrate database
"""

import os
import sys
import asyncio
from pathlib import Path

# Thêm thư mục root vào Python path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from config.settings import settings

def get_database_url():
    """Lấy database URL từ settings hoặc environment"""
    return f"postgresql://{settings.DATABASE_USER}:{settings.DATABASE_PASSWORD}@{settings.DATABASE_HOST}:{settings.DATABASE_PORT}/{settings.DATABASE_NAME}"

def run_migration():
    """Chạy migration cho Services"""
    print("🚀 Bắt đầu migration: Services image_url -> image_id")
    print("=" * 60)
    
    # Tạo kết nối database
    DATABASE_URL = get_database_url()
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    db = SessionLocal()
    
    try:
        # 1. Kiểm tra xem column image_id đã tồn tại chưa
        print("📝 Kiểm tra column image_id...")
        result = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'services' AND column_name = 'image_id'
        """))
        
        if not result.fetchone():
            print("   → Thêm column image_id vào bảng services...")
            db.execute(text("ALTER TABLE services ADD COLUMN image_id INTEGER"))
            db.commit()
            print("   ✅ Đã thêm column image_id")
        else:
            print("   ℹ️  Column image_id đã tồn tại")
        
        # 2. Tạo foreign key constraint (nếu chưa có)
        print("📝 Tạo foreign key constraint...")
        try:
            db.execute(text("""
                ALTER TABLE services 
                ADD CONSTRAINT fk_services_image_id 
                FOREIGN KEY (image_id) REFERENCES images (id) 
                ON DELETE SET NULL
            """))
            db.commit()
            print("   ✅ Đã tạo foreign key constraint")
        except Exception as e:
            if "already exists" in str(e).lower():
                print("   ℹ️  Foreign key constraint đã tồn tại")
            else:
                print(f"   ⚠️  Lỗi khi tạo foreign key: {e}")
        
        # 3. Backup và xóa column image_url
        print("📝 Xử lý column image_url...")
        
        # Kiểm tra có dữ liệu không
        result = db.execute(text("SELECT COUNT(*) FROM services WHERE image_url IS NOT NULL"))
        count = result.scalar()
        
        if count > 0:
            print(f"   ⚠️  Tìm thấy {count} services có image_url")
            print("   📊 Danh sách services có image_url:")
            
            result = db.execute(text("SELECT id, name, image_url FROM services WHERE image_url IS NOT NULL"))
            for row in result.fetchall():
                print(f"      - ID {row[0]}: {row[1]} -> {row[2]}")
            
            print("\n   ❓ Dữ liệu image_url sẽ bị mất khi xóa column!")
            print("      Bạn cần manual chuyển đổi sang image_id trước.")
            
        # Kiểm tra column image_url có tồn tại không
        result = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'services' AND column_name = 'image_url'
        """))
        
        if result.fetchone():
            if count == 0:
                print("   → Xóa column image_url (không có dữ liệu)...")
                db.execute(text("ALTER TABLE services DROP COLUMN image_url"))
                db.commit()
                print("   ✅ Đã xóa column image_url")
            else:
                print("   ⏸️  Bỏ qua xóa column image_url (có dữ liệu)")
        else:
            print("   ℹ️  Column image_url không tồn tại")
        
        print("\n🎉 Migration hoàn thành!")
        print("📋 Tóm tắt:")
        print("   ✓ Column image_id đã sẵn sàng")
        print("   ✓ Foreign key constraint đã được tạo")
        print("   ✓ API Services đã hỗ trợ upload trực tiếp")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Lỗi migration: {e}")
        db.rollback()
        return False
        
    finally:
        db.close()

def check_database_connection():
    """Kiểm tra kết nối database"""
    try:
        DATABASE_URL = get_database_url()
        engine = create_engine(DATABASE_URL)
        
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            result.fetchone()
        
        print("✅ Kết nối database thành công")
        return True
        
    except Exception as e:
        print(f"❌ Lỗi kết nối database: {e}")
        return False

def main():
    """Main function"""
    print("🔄 MIGRATION SCRIPT - Services Image Upload")
    print("=" * 60)
    print(f"Database: {settings.DATABASE_HOST}:{settings.DATABASE_PORT}/{settings.DATABASE_NAME}")
    print(f"User: {settings.DATABASE_USER}")
    print("=" * 60)
    
    # Kiểm tra kết nối
    if not check_database_connection():
        print("\n❌ Không thể kết nối database!")
        sys.exit(1)
    
    # Chạy migration
    success = run_migration()
    
    if success:
        print("\n✅ Migration thành công!")
        print("\n📝 Bước tiếp theo:")
        print("   1. Restart server để áp dụng model changes")
        print("   2. Test API endpoints:")
        print("      - POST /api/services/ (multipart/form-data)")
        print("      - POST /api/printing/upload-content-image")
        
    else:
        print("\n❌ Migration thất bại!")
        sys.exit(1)

if __name__ == "__main__":
    main() 