import requests
import pytest
import json
import os

# Cấu hình API endpoint
API_URL = "http://localhost:8000/api"
ROOT_USERNAME = "root"
ROOT_PASSWORD = "inphulong0977007763"
TEST_ADMIN = {
    "username": "test_admin",
    "password": "test123456",
    "email": "test_admin@phulong.com",
    "role": "admin"
}

# Biến lưu trữ token
root_token = None

def test_login_root():
    """Kiểm tra đăng nhập với tài khoản root"""
    global root_token
    
    # Gọi API đăng nhập
    response = requests.post(
        f"{API_URL}/auth/login-json",
        json={
            "username": ROOT_USERNAME,
            "password": ROOT_PASSWORD
        }
    )
    
    # Kiểm tra kết quả
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    
    # Lưu token cho các test sau
    root_token = data["access_token"]
    
def test_register_admin():
    """Kiểm tra đăng ký tài khoản admin mới"""
    global root_token
    
    # Đảm bảo đã có token root
    if not root_token:
        test_login_root()
    
    # Gọi API đăng ký
    headers = {"Authorization": f"Bearer {root_token}"}
    response = requests.post(
        f"{API_URL}/auth/register",
        headers=headers,
        json=TEST_ADMIN
    )
    
    # Kiểm tra kết quả - nếu tài khoản đã tồn tại thì response code sẽ là 400
    assert response.status_code in [200, 400]
    
    if response.status_code == 200:
        data = response.json()
        assert data["username"] == TEST_ADMIN["username"]
        assert data["email"] == TEST_ADMIN["email"]
        assert data["role"] == TEST_ADMIN["role"]
    
def test_login_admin():
    """Kiểm tra đăng nhập với tài khoản admin"""
    # Gọi API đăng nhập
    response = requests.post(
        f"{API_URL}/auth/login-json",
        json={
            "username": TEST_ADMIN["username"],
            "password": TEST_ADMIN["password"]
        }
    )
    
    # Kiểm tra kết quả
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_history():
    """Kiểm tra xem lịch sử đăng nhập"""
    global root_token
    
    # Đảm bảo đã có token root
    if not root_token:
        test_login_root()
    
    # Gọi API xem lịch sử đăng nhập
    headers = {"Authorization": f"Bearer {root_token}"}
    response = requests.get(
        f"{API_URL}/auth/login-history",
        headers=headers
    )
    
    # Kiểm tra kết quả
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

if __name__ == "__main__":
    # Chạy các test theo thứ tự
    test_login_root()
    test_register_admin()
    test_login_admin()
    test_login_history()
    
    print("Tất cả test auth đã pass!") 