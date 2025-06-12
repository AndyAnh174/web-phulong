#!/usr/bin/env python3
"""
Script để tạo bảng images và các index
"""
import os
import sys
from pathlib import Path
from sqlalchemy import create_engine, text
import urllib.parse

def create_images_table():
    """Tạo bảng images và các index"""
    try:
        # Đọc thông tin database từ .env
        from dotenv import load_dotenv
        load_dotenv()
        
        # Tạo DATABASE_URL từ các biến môi trường
        DATABASE_USER = os.getenv("DATABASE_USER", "admin")
        DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD", "1742005AA")
        DATABASE_HOST = os.getenv("DATABASE_HOST", "localhost")
        DATABASE_PORT = os.getenv("DATABASE_PORT", "5432")
        DATABASE_NAME = os.getenv("DATABASE_NAME", "phulong")
        
        # URL encode password để xử lý ký tự đặc biệt
        encoded_password = urllib.parse.quote_plus(DATABASE_PASSWORD)
        DATABASE_URL = f"postgresql://{DATABASE_USER}:{encoded_password}@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME}"
        
        # Tạo engine để kết nối database
        engine = create_engine(DATABASE_URL)
        
        print("Đang kết nối database...")
        
        # Đọc file SQL
        sql_file = Path(__file__).parent / "create_images_table.sql"
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_commands = f.read()
        
        print("Đang tạo bảng images...")
        
        # Thực thi các lệnh SQL
        with engine.connect() as connection:
            # Chia nhỏ các lệnh SQL và thực thi từng lệnh
            commands = [cmd.strip() for cmd in sql_commands.split(';') if cmd.strip() and not cmd.strip().startswith('--')]
            
            for cmd in commands:
                if cmd and not cmd.startswith('SELECT'):
                    connection.execute(text(cmd))
                    
            # Commit changes
            connection.commit()
            
            # Thực hiện lệnh SELECT cuối cùng để kiểm tra
            result = connection.execute(text("SELECT 'Đã tạo thành công bảng images và các index' as message"))
            message = result.fetchone()
            print(f"✅ {message[0]}")
        
        print("✅ Hoàn thành! Bảng 'images' đã được tạo thành công.")
        
        # Kiểm tra bằng cách query cấu trúc bảng
        with engine.connect() as connection:
            result = connection.execute(text("SELECT COUNT(*) as column_count FROM information_schema.columns WHERE table_name = 'images'"))
            column_count = result.fetchone()[0]
            print(f"Bảng images có {column_count} cột")
                
    except Exception as e:
        print(f"❌ Lỗi khi tạo bảng images: {e}")
        return False
    
    return True

if __name__ == "__main__":
    create_images_table() 