# 🎯 Banner API Documentation

## 📖 Tổng quan

API quản lý banner của website Phú Long với đầy đủ tính năng CRUD, upload ảnh và quản lý trạng thái hiển thị.

## 🔐 Authentication

Tất cả các API (trừ GET `/api/banners/active`) đều yêu cầu **JWT Token** với quyền **ADMIN**.

```javascript
// Header yêu cầu
Authorization: Bearer <your_jwt_token>
```

## 📋 Endpoints

### 1. 🆕 Upload ảnh và tạo banner mới

**`POST /api/banners/upload-with-banner`** ⭐ **Recommended**

Upload ảnh và tạo banner cùng lúc (một bước).

#### Request (Form Data)

```javascript
// FormData object
const formData = new FormData();
formData.append('file', fileInput.files[0]); // File ảnh (jpg, png, gif, webp, bmp)
formData.append('title', 'Tiêu đề banner');
formData.append('description', 'Mô tả banner'); // Optional
formData.append('url', 'https://example.com'); // Optional - Link khi click banner
formData.append('is_active', 'true'); // Optional - Default: true
formData.append('order', '1'); // Optional - Thứ tự hiển thị

// Fetch example
const response = await fetch('/api/banners/upload-with-banner', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + token
    },
    body: formData
});
```

#### Response

```json
{
    "id": 1,
    "title": "Tiêu đề banner",
    "description": "Mô tả banner",
    "image_id": 15,
    "url": "https://example.com",
    "is_active": true,
    "order": 1,
    "created_at": "2024-01-01T10:00:00",
    "updated_at": "2024-01-01T10:00:00",
    "created_by": 1,
    "image": {
        "id": 15,
        "filename": "banner.jpg",
        "url": "https://demoapi.andyanh.id.vn/static/images/banners/banner_uuid.jpg",
        "alt_text": "Banner: Tiêu đề banner",
        "width": 1920,
        "height": 600,
        "file_size": 245760,
        "mime_type": "image/jpeg"
    }
}
```

---

### 2. 📄 Tạo banner với ảnh có sẵn

**`POST /api/banners/`**

Tạo banner mới sử dụng ảnh đã upload trước đó.

#### Request Body

```json
{
    "title": "Tiêu đề banner",
    "description": "Mô tả banner",
    "image_id": 10,
    "url": "https://example.com",
    "is_active": true,
    "order": 2
}
```

#### Response

```json
{
    "id": 2,
    "title": "Tiêu đề banner",
    "description": "Mô tả banner",
    "image_id": 10,
    "url": "https://example.com",
    "is_active": true,
    "order": 2,
    "created_at": "2024-01-01T10:00:00",
    "updated_at": "2024-01-01T10:00:00",
    "created_by": 1
}
```

---

### 3. 📋 Lấy danh sách banner (Admin)

**`GET /api/banners/`**

Lấy tất cả banner với phân trang và filter.

#### Query Parameters

- `skip`: Số bản ghi bỏ qua (default: 0)
- `limit`: Số bản ghi tối đa (default: 100)
- `is_active`: Filter theo trạng thái (true/false)

#### Examples

```javascript
// Lấy tất cả banner
fetch('/api/banners/')

// Lấy banner đang hoạt động
fetch('/api/banners/?is_active=true')

// Phân trang
fetch('/api/banners/?skip=0&limit=10')
```

#### Response

```json
[
    {
        "id": 1,
        "title": "Banner 1",
        "description": "Mô tả banner 1",
        "image_id": 15,
        "url": "https://example.com",
        "is_active": true,
        "order": 1,
        "created_at": "2024-01-01T10:00:00",
        "updated_at": "2024-01-01T10:00:00",
        "created_by": 1,
        "image": { ... },
        "creator": { ... }
    }
]
```

---

### 4. 🌐 Lấy banner hoạt động (Public)

**`GET /api/banners/active`** 🔓 **No Auth Required**

Dành cho frontend hiển thị banner cho người dùng.

#### Response

```json
[
    {
        "id": 1,
        "title": "Banner 1",
        "description": "Mô tả banner 1",
        "image_id": 15,
        "url": "https://example.com",
        "is_active": true,
        "order": 1,
        "image": {
            "id": 15,
            "url": "https://demoapi.andyanh.id.vn/static/images/banners/banner_uuid.jpg",
            "alt_text": "Banner: Banner 1",
            "width": 1920,
            "height": 600
        }
    }
]
```

#### Frontend Usage

```javascript
// React/Vue example
const [banners, setBanners] = useState([]);

useEffect(() => {
    fetch('/api/banners/active')
        .then(res => res.json())
        .then(data => setBanners(data));
}, []);

// Render banners
{banners.map(banner => (
    <div key={banner.id} className="banner">
        <a href={banner.url} target="_blank">
            <img 
                src={banner.image.url} 
                alt={banner.image.alt_text}
                title={banner.title}
            />
        </a>
    </div>
))}
```

---

### 5. 👁️ Lấy banner theo ID

**`GET /api/banners/{banner_id}`**

#### Response

```json
{
    "id": 1,
    "title": "Banner 1",
    "description": "Mô tả banner 1",
    "image_id": 15,
    "url": "https://example.com",
    "is_active": true,
    "order": 1,
    "created_at": "2024-01-01T10:00:00",
    "updated_at": "2024-01-01T10:00:00",
    "created_by": 1,
    "image": { ... },
    "creator": { ... }
}
```

---

### 6. ✏️ Cập nhật banner

**`PUT /api/banners/{banner_id}`**

#### Request Body (tất cả fields đều optional)

```json
{
    "title": "Tiêu đề mới",
    "description": "Mô tả mới", 
    "image_id": 20,
    "url": "https://newlink.com",
    "is_active": false,
    "order": 5
}
```

#### Response

```json
{
    "id": 1,
    "title": "Tiêu đề mới",
    "description": "Mô tả mới",
    "image_id": 20,
    "url": "https://newlink.com",
    "is_active": false,
    "order": 5,
    "created_at": "2024-01-01T10:00:00",
    "updated_at": "2024-01-01T11:00:00",
    "created_by": 1
}
```

---

### 7. 🔄 Toggle trạng thái banner

**`PATCH /api/banners/{banner_id}/toggle`**

Chuyển đổi nhanh trạng thái ẩn/hiện banner.

#### Response

```json
{
    "id": 1,
    "title": "Banner 1",
    "is_active": false, // Đã chuyển từ true -> false
    "updated_at": "2024-01-01T11:00:00"
}
```

#### Frontend Usage

```javascript
// Toggle button
const toggleBanner = async (bannerId) => {
    const response = await fetch(`/api/banners/${bannerId}/toggle`, {
        method: 'PATCH',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });
  
    if (response.ok) {
        const updatedBanner = await response.json();
        console.log(`Banner ${updatedBanner.is_active ? 'hiện' : 'ẩn'}`);
    }
};
```

---

### 8. 🗑️ Xóa banner

**`DELETE /api/banners/{banner_id}`**

#### Query Parameters

- `delete_image`: boolean (default: false)
  - `true`: Xóa cả ảnh liên quan
  - `false`: Chỉ xóa banner, giữ lại ảnh

#### Examples

```javascript
// Chỉ xóa banner
fetch('/api/banners/1', { method: 'DELETE' })

// Xóa banner và ảnh
fetch('/api/banners/1?delete_image=true', { method: 'DELETE' })
```

#### Response

```json
{
    "message": "Xóa banner thành công",
    "deleted_image": true
}
```

---

## 🖼️ Upload File Requirements

### Formats hỗ trợ

- `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.bmp`

### Kích thước

- **Tối đa**: 15MB cho banner
- **Khuyến nghị**: 1920x600px (ratio 16:5)

### Mime Types

- `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/bmp`

---

## 🎨 Frontend Integration Examples

### React Component

```jsx
import React, { useState, useEffect } from 'react';

const BannerSlider = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const response = await fetch('/api/banners/active');
            const data = await response.json();
            setBanners(data);
        } catch (error) {
            console.error('Error fetching banners:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading banners...</div>;

    return (
        <div className="banner-slider">
            {banners.map((banner, index) => (
                <div key={banner.id} className="banner-slide">
                    {banner.url ? (
                        <a href={banner.url} target="_blank" rel="noopener noreferrer">
                            <img 
                                src={banner.image.url}
                                alt={banner.image.alt_text}
                                title={banner.title}
                                loading={index === 0 ? "eager" : "lazy"}
                            />
                        </a>
                    ) : (
                        <img 
                            src={banner.image.url}
                            alt={banner.image.alt_text}
                            title={banner.title}
                            loading={index === 0 ? "eager" : "lazy"}
                        />
                    )}
                    {banner.title && (
                        <div className="banner-content">
                            <h3>{banner.title}</h3>
                            {banner.description && <p>{banner.description}</p>}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default BannerSlider;
```

### Admin Upload Component

```jsx
const BannerUpload = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        url: '',
        is_active: true,
        order: 1
    });
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
    
        const uploadData = new FormData();
        uploadData.append('file', file);
        Object.keys(formData).forEach(key => {
            uploadData.append(key, formData[key]);
        });

        try {
            const response = await fetch('/api/banners/upload-with-banner', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: uploadData
            });

            if (response.ok) {
                const result = await response.json();
                onSuccess?.(result);
                alert('Upload banner thành công!');
            } else {
                const error = await response.json();
                alert('Lỗi: ' + error.detail);
            }
        } catch (error) {
            alert('Lỗi upload: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="banner-upload-form">
            <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                required
            />
        
            <input
                type="text"
                placeholder="Tiêu đề banner"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
            />
        
            <textarea
                placeholder="Mô tả banner (optional)"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
        
            <input
                type="url"
                placeholder="Link chuyển hướng (optional)"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
            />
        
            <input
                type="number"
                placeholder="Thứ tự hiển thị"
                value={formData.order}
                onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                min="1"
            />
        
            <label>
                <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                />
                Hiển thị banner
            </label>
        
            <button type="submit" disabled={uploading || !file}>
                {uploading ? 'Đang upload...' : 'Upload Banner'}
            </button>
        </form>
    );
};
```

---

## ⚠️ Error Codes


| Status Code | Message                      | Giải thích                        |
| ----------- | ---------------------------- | ----------------------------------- |
| `400`       | File không hợp lệ         | Sai format hoặc quá kích thước |
| `401`       | Unauthorized                 | Thiếu hoặc sai JWT token          |
| `403`       | Forbidden                    | Không có quyền admin             |
| `404`       | Banner/Ảnh không tồn tại | ID không đúng                    |
| `500`       | Lỗi server                  | Lỗi upload file hoặc database     |

---

## 🚀 Setup Instructions

### 1. Chạy Migration

```bash
# Tạo bảng banners
python create_banners_table.py
```

### 2. Restart Server

```bash
# Khởi động lại FastAPI server
python main.py
```

### 3. Test API

- Swagger UI: `http://localhost:8000/api/docs`
- Test endpoint: `GET /api/banners/active`

---

## 📝 Notes

1. **Thứ tự hiển thị**: Banner có `order` nhỏ hơn sẽ hiển thị trước
2. **URL ảnh**: Tự động tạo absolute URL với HTTPS
3. **Caching**: Có thể cache endpoint `/api/banners/active` ở frontend
4. **SEO**: Đã có alt_text cho ảnh banner
5. **Responsive**: Frontend cần handle responsive cho ảnh banner

Chúc bạn code vui vẻ! 🎉
