import requests
import pytest
import json
from tests.test_services import get_admin_token
from tests.test_auth import API_URL

# Biến lưu trữ ID blog test
test_blog_id = None

# Dữ liệu test
TEST_BLOG = {
    "title": "Xu hướng in ấn năm 2025",
    "content": "Bài viết về các xu hướng in ấn mới nhất trong năm 2025, bao gồm các công nghệ in 3D, in UV và in thân thiện với môi trường.",
    "is_active": True
}

UPDATE_BLOG = {
    "title": "Xu hướng in ấn hiện đại năm 2025",
    "content": "Cập nhật bài viết về các xu hướng in ấn mới nhất trong năm 2025."
}

def test_create_blog():
    """Kiểm tra tạo blog mới"""
    global test_blog_id
    
    # Lấy token admin
    token = get_admin_token()
    
    # Gọi API tạo blog
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{API_URL}/blogs/",
        headers=headers,
        json=TEST_BLOG
    )
    
    # Kiểm tra kết quả
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == TEST_BLOG["title"]
    assert data["content"] == TEST_BLOG["content"]
    assert data["is_active"] == TEST_BLOG["is_active"]
    assert "id" in data
    
    # Lưu ID blog cho các test sau
    test_blog_id = data["id"]

def test_get_all_blogs():
    """Kiểm tra lấy danh sách blog"""
    # Gọi API lấy danh sách blog
    response = requests.get(f"{API_URL}/blogs/")
    
    # Kiểm tra kết quả
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_get_blog_by_id():
    """Kiểm tra lấy chi tiết blog theo ID"""
    global test_blog_id
    
    # Đảm bảo đã có ID blog test
    if not test_blog_id:
        test_create_blog()
    
    # Gọi API lấy chi tiết blog
    response = requests.get(f"{API_URL}/blogs/{test_blog_id}")
    
    # Kiểm tra kết quả
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_blog_id
    assert data["title"] == TEST_BLOG["title"]

def test_update_blog():
    """Kiểm tra cập nhật blog"""
    global test_blog_id
    
    # Đảm bảo đã có ID blog test
    if not test_blog_id:
        test_create_blog()
    
    # Lấy token admin
    token = get_admin_token()
    
    # Gọi API cập nhật blog
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.put(
        f"{API_URL}/blogs/{test_blog_id}",
        headers=headers,
        json=UPDATE_BLOG
    )
    
    # Kiểm tra kết quả
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_blog_id
    assert data["title"] == UPDATE_BLOG["title"]
    assert data["content"] == UPDATE_BLOG["content"]
    
def test_delete_blog():
    """Kiểm tra xóa blog"""
    global test_blog_id
    
    # Đảm bảo đã có ID blog test
    if not test_blog_id:
        test_create_blog()
    
    # Lấy token admin
    token = get_admin_token()
    
    # Gọi API xóa blog
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.delete(
        f"{API_URL}/blogs/{test_blog_id}",
        headers=headers
    )
    
    # Kiểm tra kết quả
    assert response.status_code == 204

if __name__ == "__main__":
    # Chạy các test theo thứ tự
    test_create_blog()
    test_get_all_blogs()
    test_get_blog_by_id()
    test_update_blog()
    test_delete_blog()
    
    print("Tất cả test blogs đã pass!") 