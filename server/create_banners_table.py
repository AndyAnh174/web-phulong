#!/usr/bin/env python3
"""
Script để tạo bảng banners trong database
Chạy: python create_banners_table.py
"""
import psycopg2
from config.settings import settings

def create_banners_table():
    """Tạo bảng banners và các index liên quan"""
    
    # Tạo connection string
    connection_string = f"postgresql://{settings.DATABASE_USER}:{settings.DATABASE_PASSWORD}@{settings.DATABASE_HOST}:{settings.DATABASE_PORT}/{settings.DATABASE_NAME}"
    
    # SQL để tạo bảng
    sql_commands = [
        """
        -- Tạo bảng banners để quản lý banner của website
        CREATE TABLE IF NOT EXISTS banners (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            image_id INTEGER NOT NULL REFERENCES images(id),
            url VARCHAR(500),
            is_active BOOLEAN DEFAULT TRUE,
            "order" INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_by INTEGER REFERENCES users(id)
        );
        """,
        
        """
        -- Tạo index cho các trường thường được query
        CREATE INDEX IF NOT EXISTS idx_banners_is_active ON banners(is_active);
        """,
        
        """
        CREATE INDEX IF NOT EXISTS idx_banners_order ON banners("order");
        """,
        
        """
        CREATE INDEX IF NOT EXISTS idx_banners_created_at ON banners(created_at);
        """,
        
        """
        -- Thêm comment cho bảng
        COMMENT ON TABLE banners IS 'Bảng quản lý banner của website';
        """,
        
        """
        COMMENT ON COLUMN banners.title IS 'Tiêu đề banner';
        """,
        
        """
        COMMENT ON COLUMN banners.description IS 'Mô tả banner';
        """,
        
        """
        COMMENT ON COLUMN banners.image_id IS 'ID ảnh banner (tham chiếu từ bảng images)';
        """,
        
        """
        COMMENT ON COLUMN banners.url IS 'Link chuyển hướng khi click banner';
        """,
        
        """
        COMMENT ON COLUMN banners.is_active IS 'Trạng thái hiển thị banner (true: hiện, false: ẩn)';
        """,
        
        """
        COMMENT ON COLUMN banners."order" IS 'Thứ tự hiển thị banner (số nhỏ hiện trước)';
        """,
        
        """
        COMMENT ON COLUMN banners.created_by IS 'ID người tạo banner';
        """
    ]
    
    try:
        # Kết nối database
        print("Đang kết nối database...")
        conn = psycopg2.connect(connection_string)
        cursor = conn.cursor()
        
        # Thực thi các câu lệnh SQL
        print("Đang tạo bảng banners...")
        for i, sql in enumerate(sql_commands, 1):
            print(f"Thực thi câu lệnh {i}/{len(sql_commands)}...")
            cursor.execute(sql)
        
        # Commit changes
        conn.commit()
        print("✅ Tạo bảng banners thành công!")
        
        # Kiểm tra bảng đã được tạo
        cursor.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'banners';")
        table_exists = cursor.fetchone()[0]
        
        if table_exists:
            print("✅ Xác nhận: Bảng banners đã tồn tại trong database")
            
            # Hiển thị cấu trúc bảng
            cursor.execute("""
                SELECT column_name, data_type, is_nullable, column_default 
                FROM information_schema.columns 
                WHERE table_name = 'banners' 
                ORDER BY ordinal_position;
            """)
            
            columns = cursor.fetchall()
            print("\n📋 Cấu trúc bảng banners:")
            print("+-" + "-" * 20 + "+-" + "-" * 20 + "+-" + "-" * 10 + "+-" + "-" * 30 + "+")
            print(f"| {'Column':<20} | {'Type':<20} | {'Nullable':<10} | {'Default':<30} |")
            print("+-" + "-" * 20 + "+-" + "-" * 20 + "+-" + "-" * 10 + "+-" + "-" * 30 + "+")
            
            for column in columns:
                col_name, data_type, is_nullable, default_val = column
                default_display = str(default_val)[:28] if default_val else ""
                print(f"| {col_name:<20} | {data_type:<20} | {is_nullable:<10} | {default_display:<30} |")
            
            print("+-" + "-" * 20 + "+-" + "-" * 20 + "+-" + "-" * 10 + "+-" + "-" * 30 + "+")
        else:
            print("❌ Có lỗi: Bảng banners chưa được tạo")
        
    except psycopg2.Error as e:
        print(f"❌ Lỗi database: {e}")
        if conn:
            conn.rollback()
        return False
        
    except Exception as e:
        print(f"❌ Lỗi không xác định: {e}")
        return False
        
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
        print("🔌 Đã đóng kết nối database")
    
    return True

if __name__ == "__main__":
    print("🚀 Bắt đầu tạo bảng banners...")
    print("=" * 50)
    
    success = create_banners_table()
    
    print("=" * 50)
    if success:
        print("🎉 Hoàn thành! Bạn có thể sử dụng API banners ngay bây giờ.")
    else:
        print("💥 Có lỗi xảy ra. Vui lòng kiểm tra lại.") 