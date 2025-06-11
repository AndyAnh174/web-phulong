import psycopg2
from config.settings import settings

def execute_sql():
    """Thực thi câu lệnh SQL để fix database schema"""
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
        
        # Thêm cột total_price vào bảng orders
        cursor.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_price FLOAT;")
        print("Đã thêm cột total_price vào bảng orders")
        
        # Rename cột fullname thành name trong bảng contacts
        cursor.execute("ALTER TABLE contacts RENAME COLUMN fullname TO name;")
        print("Đã đổi tên cột fullname thành name trong bảng contacts")
        
        # Rename cột is_read thành status và thay đổi kiểu dữ liệu
        cursor.execute("ALTER TABLE contacts RENAME COLUMN is_read TO status_temp;")
        cursor.execute("ALTER TABLE contacts ADD COLUMN status VARCHAR DEFAULT 'new';")
        cursor.execute("UPDATE contacts SET status = CASE WHEN status_temp = true THEN 'read' ELSE 'new' END;")
        cursor.execute("ALTER TABLE contacts DROP COLUMN status_temp;")
        print("Đã thay đổi cột is_read thành status trong bảng contacts")
        
        # Commit thay đổi
        conn.commit()
        
        # Đóng kết nối
        cursor.close()
        conn.close()
        
        print("Đã cập nhật database schema thành công!")
    except Exception as e:
        print(f"Có lỗi xảy ra: {e}")

if __name__ == "__main__":
    execute_sql() 