import requests
import json
import os
from pathlib import Path

# Cấu hình
BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api/printing"

def test_create_printing_with_images():
    """Test tạo bài đăng với upload ảnh trực tiếp"""
    
    # Dữ liệu form
    data = {
        'title': 'Test In Ấn Catalogue',
        'time': '2-3 ngày',
        'content': 'Đây là bài test upload ảnh trực tiếp cho dịch vụ in ấn catalogue chất lượng cao.',
        'is_visible': True
    }
    
    # File ảnh test (tạo ảnh test nếu chưa có)
    files = []
    test_images_dir = "test_images"
    os.makedirs(test_images_dir, exist_ok=True)
    
    # Tạo file test đơn giản
    test_file_content = b"Test image content"
    test_files = ['test1.jpg', 'test2.png', 'test3.webp']
    
    for filename in test_files:
        filepath = Path(test_images_dir) / filename
        if not filepath.exists():
            with open(filepath, 'wb') as f:
                f.write(test_file_content)
        
        # Thêm vào files để upload
        files.append(('images', (filename, open(filepath, 'rb'), 'image/jpeg')))
    
    # Headers (cần token admin)
    headers = {
        'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE'  # Thay đổi token
    }
    
    try:
        print("🚀 Đang test tạo bài đăng với upload ảnh...")
        response = requests.post(API_URL, data=data, files=files, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        
        if response.status_code == 200:
            print("✅ Test thành công!")
        else:
            print("❌ Test thất bại!")
            
    except Exception as e:
        print(f"❌ Lỗi: {e}")
    finally:
        # Đóng files
        for _, file_info in files:
            if hasattr(file_info[1], 'close'):
                file_info[1].close()

def test_get_printings():
    """Test lấy danh sách bài đăng"""
    print("\n📋 Test lấy danh sách bài đăng...")
    
    response = requests.get(f"{API_URL}?limit=5")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Lấy được {len(data['items'])} bài đăng")
        print(f"Total: {data['total']}")
        
        if data['items']:
            first_item = data['items'][0]
            print(f"Bài đăng đầu: {first_item['title']}")
            print(f"Số ảnh: {len(first_item['images'])}")
    else:
        print("❌ Không lấy được danh sách")

def test_update_printing_with_images():
    """Test cập nhật bài đăng với ảnh mới"""
    printing_id = 1  # Thay đổi ID theo bài đăng có sẵn
    
    data = {
        'title': 'Updated Title - Test Upload Ảnh Mới',
        'content': 'Nội dung đã được cập nhật với ảnh mới',
        'keep_existing_images': False  # Thay thế ảnh cũ
    }
    
    # File ảnh mới
    test_file = Path("test_images/new_test.jpg")
    if not test_file.exists():
        with open(test_file, 'wb') as f:
            f.write(b"New test image content")
    
    files = [('images', ('new_test.jpg', open(test_file, 'rb'), 'image/jpeg'))]
    
    headers = {
        'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE'  # Thay đổi token
    }
    
    try:
        print(f"\n📝 Test cập nhật bài đăng ID {printing_id}...")
        response = requests.put(f"{API_URL}/{printing_id}", data=data, files=files, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        
        if response.status_code == 200:
            print("✅ Cập nhật thành công!")
        else:
            print("❌ Cập nhật thất bại!")
            
    except Exception as e:
        print(f"❌ Lỗi: {e}")
    finally:
        # Đóng file
        for _, file_info in files:
            if hasattr(file_info[1], 'close'):
                file_info[1].close()

def test_frontend_javascript():
    """Test code JavaScript cho frontend"""
    print("\n📱 JavaScript Code Example:")
    
    js_code = """
// Frontend JavaScript Example
const createPrintingWithImages = async () => {
    const form = new FormData();
    form.append('title', 'Dịch vụ in ấn mới');
    form.append('time', '1-2 ngày');
    form.append('content', 'Mô tả dịch vụ chi tiết...');
    form.append('is_visible', true);
    
    // Lấy file từ input
    const fileInput = document.getElementById('imageFiles');
    for (let i = 0; i < fileInput.files.length && i < 3; i++) {
        form.append('images', fileInput.files[i]);
    }
    
    try {
        const response = await fetch('/api/printing', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
            },
            body: form
        });
        
        const result = await response.json();
        if (response.ok) {
            console.log('✅ Tạo thành công:', result);
            alert('Tạo bài đăng thành công!');
        } else {
            console.error('❌ Lỗi:', result.detail);
            alert(`Lỗi: ${result.detail}`);
        }
    } catch (error) {
        console.error('❌ Network error:', error);
        alert('Lỗi kết nối mạng');
    }
};

// HTML Example
/*
<form id="printingForm">
    <input type="text" id="title" placeholder="Tiêu đề" required>
    <input type="text" id="time" placeholder="Thời gian (VD: 1-2 ngày)" required>
    <textarea id="content" placeholder="Nội dung" required></textarea>
    <input type="file" id="imageFiles" multiple accept="image/*" max="3">
    <button type="button" onclick="createPrintingWithImages()">Tạo bài đăng</button>
</form>
*/
"""
    print(js_code)

if __name__ == "__main__":
    print("🧪 Testing Printing API với Upload Ảnh Trực Tiếp")
    print("=" * 60)
    
    # Lưu ý về token
    print("⚠️  QUAN TRỌNG: Cần thay đổi 'YOUR_ADMIN_TOKEN_HERE' bằng token admin thật")
    print("   Để lấy token, đăng nhập qua /api/auth/login với tài khoản admin")
    print()
    
    # Test các chức năng
    test_get_printings()
    # test_create_printing_with_images()  # Uncomment khi có token
    # test_update_printing_with_images()  # Uncomment khi có token
    test_frontend_javascript()
    
    print("\n🎉 Test completed!")
    print("\n📝 Lưu ý:")
    print("- API giờ sử dụng multipart/form-data thay vì JSON")
    print("- Upload tối đa 3 ảnh, mỗi file tối đa 10MB")
    print("- Hỗ trợ JPG, PNG, GIF, WebP, BMP")
    print("- GET endpoints công khai, POST/PUT/DELETE cần token admin") 