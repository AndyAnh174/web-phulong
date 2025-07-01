import psycopg2
from config.settings import settings

def execute_sql():
    """Thực thi câu lệnh SQL để thêm cột category vào bảng services"""
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
        
        # Thực thi câu lệnh SQL
        cursor.execute("ALTER TABLE services ADD COLUMN IF NOT EXISTS category VARCHAR;")
        
        # Commit thay đổi
        conn.commit()
        
        # Đóng kết nối
        cursor.close()
        conn.close()
        
        print("Đã thêm cột category vào bảng services thành công!")
    except Exception as e:
        print(f"Có lỗi xảy ra: {e}")

if __name__ == "__main__":
    execute_sql() 