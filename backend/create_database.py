import psycopg2

def create_database():
    try:
        # Kết nối đến PostgreSQL
        conn = psycopg2.connect(
            dbname="postgres",
            user="postgres",
            password="1742005AA",
            host="localhost",
            port="5432"
        )
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Kiểm tra xem database đã tồn tại chưa
        cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'phulong'")
        exists = cursor.fetchone()
        
        if not exists:
            cursor.execute("CREATE DATABASE phulong")
            print("Database phulong đã được tạo thành công!")
        else:
            print("Database phulong đã tồn tại.")
            
        cursor.close()
        conn.close()
        
        return True
    except Exception as e:
        print(f"Lỗi khi tạo database: {str(e)}")
        return False

if __name__ == "__main__":
    create_database() 