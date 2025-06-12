#!/usr/bin/env python3
"""
Script để chạy migration thêm trường featured vào bảng services
"""
import os
import subprocess
import sys
from pathlib import Path

def run_migration():
    """Chạy migration để thêm trường featured"""
    try:
        # Đảm bảo rằng chúng ta đang ở thư mục backend
        backend_dir = Path(__file__).parent
        os.chdir(backend_dir)
        
        print("Đang chạy migration để thêm trường featured vào bảng services...")
        
        # Chạy migration
        result = subprocess.run([
            sys.executable, "-m", "alembic", "upgrade", "head"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Migration đã chạy thành công!")
            print("Trường 'featured' đã được thêm vào bảng services.")
            print("\nOutput:")
            print(result.stdout)
        else:
            print("❌ Migration thất bại!")
            print("Error:", result.stderr)
            return False
            
    except Exception as e:
        print(f"❌ Lỗi khi chạy migration: {e}")
        return False
    
    return True

if __name__ == "__main__":
    run_migration() 