# 📝 Printing API Documentation

API quản lý bài đăng in ấn cho hệ thống Phú Long.

## 🚀 Cài đặt

### 1. Chạy script tạo bảng

```bash
python create_printing_tables.py
```

### 2. Hoặc chạy SQL thủ công

```bash
psql -U postgres -d phulong -f create_printing_tables.sql
```

## 📚 Endpoints

### 🔍 Lấy danh sách bài đăng

```
GET /api/printing
```

**Query Parameters:**
- `skip` (int): Số bản ghi bỏ qua (default: 0)
- `limit` (int): Số bản ghi tối đa (default: 100)
- `is_visible` (bool): Lọc theo trạng thái hiển thị
- `search` (string): Tìm kiếm theo tiêu đề hoặc nội dung

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "title": "In ấn name card cao cấp",
      "time": "1-2 ngày",
      "content": "Dịch vụ in ấn name card...",
      "is_visible": true,
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z",
      "created_by": 1,
      "creator": {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com"
      },
      "images": [
        {
          "id": 1,
          "printing_id": 1,
          "image_id": 1,
          "order": 1,
          "image": {
            "id": 1,
            "filename": "namecard.jpg",
            "url": "https://example.com/images/namecard.jpg"
          }
        }
      ]
    }
  ],
  "total": 1
}
```

### 📖 Lấy chi tiết bài đăng

```
GET /api/printing/{printing_id}
```

### ✏️ Tạo bài đăng mới (ADMIN)

```
POST /api/printing
```

**Request Body:**
```json
{
  "title": "In ấn name card cao cấp",
  "time": "1-2 ngày", 
  "content": "Dịch vụ in ấn name card với chất lượng cao...",
  "is_visible": true,
  "image_ids": [1, 2, 3]
}
```

**Response:**
```json
{
  "message": "Tạo bài đăng thành công",
  "printing": {
    "id": 1,
    "title": "In ấn name card cao cấp",
    // ... chi tiết bài đăng
  }
}
```

### 🔄 Cập nhật bài đăng (ADMIN)

```
PUT /api/printing/{printing_id}
```

**Request Body:**
```json
{
  "title": "Tiêu đề mới",
  "time": "2-3 ngày",
  "content": "Nội dung cập nhật...",
  "is_visible": false,
  "image_ids": [4, 5]
}
```

### 🗑️ Xóa bài đăng (ADMIN)

```
DELETE /api/printing/{printing_id}
```

**Response:** 204 No Content

### 👁️ Ẩn/hiện bài đăng (ADMIN)

```
PATCH /api/printing/{printing_id}/visibility
```

**Response:**
```json
{
  "message": "Đã ẩn bài đăng thành công",
  "printing": {
    "id": 1,
    "is_visible": false,
    // ... chi tiết bài đăng
  }
}
```

## 🔐 Phân quyền

- **Public:** Có thể xem danh sách và chi tiết bài đăng
- **ADMIN/ROOT:** Có thể tạo, sửa, xóa, ẩn/hiện bài đăng

## 🖼️ Quản lý ảnh

### Upload ảnh trước

1. Upload ảnh qua endpoint `/api/images/upload`
2. Lấy `image_id` từ response
3. Sử dụng `image_id` khi tạo/cập nhật bài đăng

### Giới hạn ảnh

- Tối đa **3 ảnh** cho mỗi bài đăng
- Thứ tự ảnh từ 1-3 (tự động sắp xếp)
- Ảnh có thể được sử dụng bởi nhiều bài đăng

## 📊 Database Schema

### Bảng `printings`

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | SERIAL | Primary key |
| title | VARCHAR(255) | Tiêu đề bài đăng |
| time | VARCHAR(100) | Thời gian in ấn |
| content | TEXT | Nội dung bài đăng |
| is_visible | BOOLEAN | Trạng thái hiển thị |
| created_at | TIMESTAMP | Thời gian tạo |
| updated_at | TIMESTAMP | Thời gian cập nhật |
| created_by | INTEGER | ID người tạo |

### Bảng `printing_images`

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | SERIAL | Primary key |
| printing_id | INTEGER | ID bài đăng |
| image_id | INTEGER | ID ảnh |
| order | INTEGER | Thứ tự ảnh (1-3) |
| created_at | TIMESTAMP | Thời gian tạo |

## 🔍 Ví dụ sử dụng

### 1. Tạo bài đăng với ảnh

```python
# 1. Upload ảnh trước
import requests

# Upload ảnh
files = {'file': open('namecard.jpg', 'rb')}
response = requests.post(
    'http://localhost:8000/api/images/upload',
    files=files,
    headers={'Authorization': 'Bearer YOUR_TOKEN'}
)
image_id = response.json()['image']['id']

# 2. Tạo bài đăng
data = {
    "title": "In ấn name card cao cấp",
    "time": "1-2 ngày",
    "content": "Dịch vụ in ấn chất lượng cao...",
    "is_visible": True,
    "image_ids": [image_id]
}

response = requests.post(
    'http://localhost:8000/api/printing',
    json=data,
    headers={'Authorization': 'Bearer YOUR_TOKEN'}
)
```

### 2. Lấy danh sách bài đăng hiển thị

```python
# Lấy tất cả bài đăng đang hiển thị (public có thể truy cập)
response = requests.get(
    'http://localhost:8000/api/printing?is_visible=true'
)
printings = response.json()
```

### 3. Tìm kiếm bài đăng

```python
# Tìm kiếm theo từ khóa (public có thể truy cập)
response = requests.get(
    'http://localhost:8000/api/printing?search=name card'
)
results = response.json()
```

## ⚠️ Lưu ý

1. **Authentication:** Cần token JWT cho các thao tác ADMIN
2. **Validation:** Tất cả field bắt buộc phải có giá trị
3. **Image Management:** Ảnh không bị xóa khi xóa bài đăng
4. **Performance:** Sử dụng pagination cho danh sách lớn

## 🐛 Troubleshooting

### Lỗi 404 "Không tìm thấy ảnh"

```json
{
  "detail": "Không tìm thấy ảnh với ID: [1, 2]"
}
```

**Giải pháp:** Kiểm tra ID ảnh có tồn tại không bằng `/api/images/{id}`

### Lỗi 400 "Chỉ được đính kèm tối đa 3 ảnh"

**Giải pháp:** Giảm số lượng ảnh xuống 3 hoặc ít hơn

### Lỗi 403 "Not authorized"

**Giải pháp:** Đảm bảo user có quyền ADMIN và token hợp lệ

## 📞 Hỗ trợ

Nếu có vấn đề, vui lòng tạo issue hoặc liên hệ team phát triển. 