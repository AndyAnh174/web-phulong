import psycopg2
from config.settings import settings

def execute_seo_migration():
    """Thực thi migration để thêm SEO fields vào bảng blogs"""
    try:
        # Kết nối tới database
        conn = psycopg2.connect(
            dbname=settings.DATABASE_NAME,
            user=settings.DATABASE_USER,
            password=settings.DATABASE_PASSWORD,
            host=settings.DATABASE_HOST,
            port=settings.DATABASE_PORT
        )
        
        # Tạo cursor
        cursor = conn.cursor()
        
        print("🚀 Đang thêm SEO fields vào bảng blogs...")
        
        # Thực thi các câu lệnh SQL
        sql_commands = [
            "ALTER TABLE blogs ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255);",
            "ALTER TABLE blogs ADD COLUMN IF NOT EXISTS meta_description TEXT;", 
            "ALTER TABLE blogs ADD COLUMN IF NOT EXISTS meta_keywords VARCHAR(500);",
            "CREATE INDEX IF NOT EXISTS idx_blogs_meta_title ON blogs(meta_title);",
            "CREATE INDEX IF NOT EXISTS idx_blogs_meta_keywords ON blogs(meta_keywords);"
        ]
        
        for command in sql_commands:
            cursor.execute(command)
            print(f"✅ Executed: {command}")
        
        # Commit thay đổi
        conn.commit()
        
        # Thêm comments
        comment_commands = [
            "COMMENT ON COLUMN blogs.meta_title IS 'Tiêu đề SEO (meta title) - tối đa 255 ký tự';",
            "COMMENT ON COLUMN blogs.meta_description IS 'Mô tả SEO (meta description) - tối đa 160 ký tự khuyến nghị';",
            "COMMENT ON COLUMN blogs.meta_keywords IS 'Từ khóa SEO - phân cách bằng dấu phẩy';"
        ]
        
        for command in comment_commands:
            cursor.execute(command)
            print(f"📝 Added comment: {command}")
            
        conn.commit()
        
        # Đóng kết nối
        cursor.close()
        conn.close()
        
        print("🎉 Migration hoàn thành! Đã thêm thành công các trường SEO:")
        print("   - meta_title (VARCHAR 255)")
        print("   - meta_description (TEXT)")
        print("   - meta_keywords (VARCHAR 500)")
        print("   - Đã tạo index cho meta_title và meta_keywords")
        
    except Exception as e:
        print(f"❌ Có lỗi xảy ra khi thực thi migration: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = execute_seo_migration()
    if success:
        print("\n✨ Blog SEO migration đã hoàn thành!")
    else:
        print("\n💥 Migration thất bại. Vui lòng kiểm tra lại.") 