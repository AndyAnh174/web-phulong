#!/usr/bin/env python3
"""
Script để thêm trường featured vào bảng services bằng SQL trực tiếp
"""
import os
import sys
from pathlib import Path
from sqlalchemy import create_engine, text
from config.database import SQLALCHEMY_DATABASE_URL

def add_featured_column():
    """Thêm trường featured vào bảng services"""
    try:
        # Tạo engine để kết nối database
        engine = create_engine(SQLALCHEMY_DATABASE_URL)
        
        print("Đang kết nối database...")
        
        # Đọc file SQL
        sql_file = Path(__file__).parent / "add_featured_column.sql"
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_commands = f.read()
        
        print("Đang thêm trường featured vào bảng services...")
        
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
            result = connection.execute(text("SELECT 'Đã thêm thành công trường featured vào bảng services' as message"))
            message = result.fetchone()
            print(f"✅ {message[0]}")
        
        print("✅ Hoàn thành! Trường 'featured' đã được thêm vào bảng services.")
        
        # Kiểm tra bằng cách query cấu trúc bảng
        with engine.connect() as connection:
            result = connection.execute(text("SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'featured'"))
            column_info = result.fetchone()
            if column_info:
                print(f"Thông tin cột featured: {dict(column_info._mapping)}")
            else:
                print("❌ Không tìm thấy cột featured trong bảng services")
                
    except Exception as e:
        print(f"❌ Lỗi khi thêm trường featured: {e}")
        return False
    
    return True

if __name__ == "__main__":
    add_featured_column() 