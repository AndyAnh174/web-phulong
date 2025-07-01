import requests
import pytest
import json
from tests.test_auth import API_URL, ROOT_USERNAME, ROOT_PASSWORD, test_login_root

# Biến lưu trữ token và ID người dùng test
root_token = None
test_user_id = None

# Dữ liệu test
TEST_USER = {
    "username": "test_user_2",
    "password": "test123456",
    "email": "test_user2@phulong.com",
    "role": "admin"
}

UPDATE_USER = {
    "username": "test_user_updated",
    "email": "test_updated@phulong.com"
}

def get_root_token():
    """Lấy token root cho test"""
    global root_token
    
    # Nếu chưa có token, đăng nhập
    if not root_token:
        # Đăng nhập với tài khoản root
        response = requests.post(
            f"{API_URL}/auth/login-json",
            json={
                "username": ROOT_USERNAME,
                "password": ROOT_PASSWORD
            }
        )
        
        assert response.status_code == 200
        root_token = response.json()["access_token"]
    
    return root_token

def test_register_user():
    """Kiểm tra đăng ký người dùng mới"""
    global test_user_id
    
    # Lấy token root
    token = get_root_token()
    
    # Gọi API đăng ký người dùng
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{API_URL}/auth/register",
        headers=headers,
        json=TEST_USER
    )
    
    # Kiểm tra kết quả - nếu tài khoản đã tồn tại thì response code sẽ là 400
    assert response.status_code in [200, 400]
    
    if response.status_code == 200:
        data = response.json()
        assert data["username"] == TEST_USER["username"]
        assert data["email"] == TEST_USER["email"]
        assert data["role"] == TEST_USER["role"]
        test_user_id = data["id"]
    else:
        # Nếu người dùng đã tồn tại, lấy danh sách người dùng để tìm ID
        users_response = requests.get(
            f"{API_URL}/users",
            headers=headers
        )
        assert users_response.status_code == 200
        users = users_response.json()
        
        for user in users:
            if user["username"] == TEST_USER["username"]:
                test_user_id = user["id"]
                break

def test_get_current_user():
    """Kiểm tra lấy thông tin người dùng hiện tại"""
    # Lấy token root
    token = get_root_token()
    
    # Gọi API lấy thông tin người dùng hiện tại
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_URL}/users/me", headers=headers)
    
    # Kiểm tra kết quả
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == ROOT_USERNAME

def test_get_all_users():
    """Kiểm tra lấy danh sách người dùng"""
    # Lấy token root
    token = get_root_token()
    
    # Gọi API lấy danh sách người dùng
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_URL}/users", headers=headers)
    
    # Kiểm tra kết quả
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_get_user_by_id():
    """Kiểm tra lấy chi tiết người dùng theo ID"""
    global test_user_id
    
    # Đảm bảo đã có ID người dùng test
    if not test_user_id:
        test_register_user()
    
    # Lấy token root
    token = get_root_token()
    
    # Gọi API lấy chi tiết người dùng
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_URL}/users/{test_user_id}", headers=headers)
    
    # Kiểm tra kết quả
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_user_id

def test_update_user():
    """Kiểm tra cập nhật người dùng"""
    global test_user_id
    
    # Đảm bảo đã có ID người dùng test
    if not test_user_id:
        test_register_user()
    
    # Lấy token root
    token = get_root_token()
    
    # Gọi API cập nhật người dùng
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.put(
        f"{API_URL}/users/{test_user_id}",
        headers=headers,
        json=UPDATE_USER
    )
    
    # Kiểm tra kết quả
    if response.status_code == 400:
        # Có thể bị lỗi do trùng username hoặc email
        # Thử với dữ liệu khác
        unique_suffix = f"{test_user_id}_{pytest.id}"
        response = requests.put(
            f"{API_URL}/users/{test_user_id}",
            headers=headers,
            json={
                "username": f"unique_user_{unique_suffix}",
                "email": f"unique_{unique_suffix}@phulong.com"
            }
        )
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_user_id

if __name__ == "__main__":
    # Chạy các test theo thứ tự
    test_register_user()
    test_get_current_user()
    test_get_all_users()
    test_get_user_by_id()
    test_update_user()
    
    print("Tất cả test users đã pass!") 