import requests
import pytest
import json
from tests.test_auth import API_URL, ROOT_USERNAME, ROOT_PASSWORD, test_login_root

# Biến lưu trữ token và ID dịch vụ test
admin_token = None
test_service_id = None

# Dữ liệu test
TEST_SERVICE = {
    "name": "In Brochure",
    "description": "Dịch vụ in brochure chất lượng cao, đa dạng kích thước và chất liệu",
    "price": 250000,
    "is_active": True
}

UPDATE_SERVICE = {
    "name": "In Brochure Cao Cấp",
    "price": 300000
}

def get_admin_token():
    """Lấy token admin cho test"""
    global admin_token
    
    # Nếu chưa có token, đăng nhập
    if not admin_token:
        # Đăng nhập với tài khoản admin
        response = requests.post(
            f"{API_URL}/auth/login-json",
            json={
                "username": "test_admin",
                "password": "test123456"
            }
        )
        
        # Nếu đăng nhập thất bại, thử với root
        if response.status_code != 200:
            response = requests.post(
                f"{API_URL}/auth/login-json",
                json={
                    "username": ROOT_USERNAME,
                    "password": ROOT_PASSWORD
                }
            )
        
        assert response.status_code == 200
        admin_token = response.json()["access_token"]
    
    return admin_token

def test_create_service():
    """Kiểm tra tạo dịch vụ mới"""
    global test_service_id
    
    # Lấy token admin
    token = get_admin_token()
    
    # Gọi API tạo dịch vụ
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{API_URL}/services/",
        headers=headers,
        json=TEST_SERVICE
    )
    
    # Kiểm tra kết quả
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == TEST_SERVICE["name"]
    assert data["description"] == TEST_SERVICE["description"]
    assert data["price"] == TEST_SERVICE["price"]
    assert data["is_active"] == TEST_SERVICE["is_active"]
    assert "id" in data
    
    # Lưu ID dịch vụ cho các test sau
    test_service_id = data["id"]

def test_get_all_services():
    """Kiểm tra lấy danh sách dịch vụ"""
    # Gọi API lấy danh sách dịch vụ
    response = requests.get(f"{API_URL}/services/")
    
    # Kiểm tra kết quả
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_get_service_by_id():
    """Kiểm tra lấy chi tiết dịch vụ theo ID"""
    global test_service_id
    
    # Đảm bảo đã có ID dịch vụ test
    if not test_service_id:
        test_create_service()
    
    # Gọi API lấy chi tiết dịch vụ
    response = requests.get(f"{API_URL}/services/{test_service_id}")
    
    # Kiểm tra kết quả
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_service_id
    assert data["name"] == TEST_SERVICE["name"]

def test_update_service():
    """Kiểm tra cập nhật dịch vụ"""
    global test_service_id
    
    # Đảm bảo đã có ID dịch vụ test
    if not test_service_id:
        test_create_service()
    
    # Lấy token admin
    token = get_admin_token()
    
    # Gọi API cập nhật dịch vụ
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.put(
        f"{API_URL}/services/{test_service_id}",
        headers=headers,
        json=UPDATE_SERVICE
    )
    
    # Kiểm tra kết quả
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_service_id
    assert data["name"] == UPDATE_SERVICE["name"]
    assert data["price"] == UPDATE_SERVICE["price"]
    
def test_delete_service():
    """Kiểm tra xóa dịch vụ"""
    global test_service_id
    
    # Đảm bảo đã có ID dịch vụ test
    if not test_service_id:
        test_create_service()
    
    # Lấy token admin
    token = get_admin_token()
    
    # Gọi API xóa dịch vụ
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.delete(
        f"{API_URL}/services/{test_service_id}",
        headers=headers
    )
    
    # Kiểm tra kết quả
    assert response.status_code == 204

if __name__ == "__main__":
    # Chạy các test theo thứ tự
    test_create_service()
    test_get_all_services()
    test_get_service_by_id()
    test_update_service()
    test_delete_service()
    
    print("Tất cả test services đã pass!") 