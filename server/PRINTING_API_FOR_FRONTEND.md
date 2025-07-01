# 📝 Printing API - Frontend Documentation

API quản lý bài đăng in ấn cho hệ thống Phú Long - Hướng dẫn cho Frontend Developer.

## 🌐 Base Information

- **Base URL**: `https://your-domain.com/api/printing`
- **Content-Type**: `application/json`
- **CORS**: Đã được cấu hình, frontend có thể gọi trực tiếp

## 🔐 Authentication

- **Public Endpoints**: `GET` requests không cần token
- **Admin Endpoints**: `POST`, `PUT`, `DELETE`, `PATCH` cần JWT token

```javascript
// Header cho admin requests
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${adminToken}`
};
```

## 📚 API Endpoints

### 1. 🔍 Lấy danh sách bài đăng (Public)

```
GET /api/printing
```

**Query Parameters:**
| Tham số | Kiểu | Mặc định | Mô tả |
|---------|------|----------|-------|
| `skip` | number | 0 | Số bản ghi bỏ qua (pagination) |
| `limit` | number | 100 | Số bản ghi tối đa |
| `is_visible` | boolean | null | Lọc theo trạng thái hiển thị |
| `search` | string | null | Tìm kiếm theo tiêu đề/nội dung |

**JavaScript Example:**
```javascript
// Lấy tất cả bài đăng hiển thị
const response = await fetch('/api/printing?is_visible=true&limit=10');
const data = await response.json();

// Tìm kiếm bài đăng
const searchResponse = await fetch('/api/printing?search=name card&is_visible=true');
const searchData = await searchResponse.json();

// Pagination
const page2 = await fetch('/api/printing?skip=10&limit=10&is_visible=true');
const page2Data = await page2.json();
```

**Response Format:**
```json
{
  "items": [
    {
      "id": 1,
      "title": "In ấn name card cao cấp",
      "time": "1-2 ngày",
      "content": "Dịch vụ in ấn name card với chất lượng cao...",
      "is_visible": true,
      "created_at": "2023-12-01T10:00:00Z",
      "updated_at": "2023-12-01T10:00:00Z",
      "created_by": 1,
      "creator": {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "role": "admin"
      },
      "images": [
        {
          "id": 1,
          "printing_id": 1,
          "image_id": 10,
          "order": 1,
          "created_at": "2023-12-01T10:00:00Z",
          "image": {
            "id": 10,
            "filename": "namecard.jpg",
            "url": "https://your-domain.com/static/images/uploads/namecard.jpg",
            "alt_text": "Name card mẫu",
            "width": 800,
            "height": 600,
            "is_visible": true,
            "category": "printing"
          }
        }
      ]
    }
  ],
  "total": 25
}
```

### 2. 📖 Lấy chi tiết bài đăng (Public)

```
GET /api/printing/{id}
```

**JavaScript Example:**
```javascript
const printingId = 1;
const response = await fetch(`/api/printing/${printingId}`);

if (response.ok) {
  const printing = await response.json();
  console.log(printing);
} else {
  console.error('Bài đăng không tồn tại');
}
```

### 3. ✏️ Tạo bài đăng mới (Admin Only)

```
POST /api/printing
Authorization: Bearer <token>
```

**Request Body:**
```javascript
const newPrinting = {
  title: "In ấn banner quảng cáo",
  time: "2-3 ngày",
  content: "Dịch vụ in banner với chất liệu bạt hiflex, in màu sắc sống động...",
  is_visible: true,
  image_ids: [15, 16, 17] // Tối đa 3 ảnh, optional
};

const response = await fetch('/api/printing', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify(newPrinting)
});

const result = await response.json();
```

### 4. 🔄 Cập nhật bài đăng (Admin Only)

```
PUT /api/printing/{id}
Authorization: Bearer <token>
```

### 5. 🗑️ Xóa bài đăng (Admin Only)

```
DELETE /api/printing/{id}
Authorization: Bearer <token>
```

### 6. 👁️ Ẩn/hiện bài đăng (Admin Only)

```
PATCH /api/printing/{id}/visibility
Authorization: Bearer <token>
```

## 🚀 Frontend Integration Examples

### React Component Example

```jsx
import React, { useState, useEffect } from 'react';

const PrintingList = () => {
  const [printings, setPrintings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPrintings();
  }, [search]);

  const fetchPrintings = async () => {
    try {
      setLoading(true);
      const url = `/api/printing?is_visible=true${search ? `&search=${search}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      setPrintings(data.items);
    } catch (error) {
      console.error('Error fetching printings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Tìm kiếm bài đăng..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <div className="printing-list">
          {printings.map(printing => (
            <div key={printing.id} className="printing-item">
              <h3>{printing.title}</h3>
              <p><strong>Thời gian:</strong> {printing.time}</p>
              <p>{printing.content}</p>
              
              {printing.images.length > 0 && (
                <div className="images">
                  {printing.images.map(img => (
                    <img
                      key={img.id}
                      src={img.image.url}
                      alt={img.image.alt_text || printing.title}
                      style={{ width: '200px', height: 'auto' }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrintingList;
```

### Vue.js Example

```vue
<template>
  <div>
    <input 
      v-model="search" 
      placeholder="Tìm kiếm bài đăng..."
      @input="fetchPrintings"
    />
    
    <div v-if="loading">Đang tải...</div>
    
    <div v-else class="printing-grid">
      <div 
        v-for="printing in printings" 
        :key="printing.id"
        class="printing-card"
      >
        <h3>{{ printing.title }}</h3>
        <p><strong>Thời gian:</strong> {{ printing.time }}</p>
        <p>{{ printing.content }}</p>
        
        <div v-if="printing.images.length > 0" class="images">
          <img
            v-for="img in printing.images"
            :key="img.id"
            :src="img.image.url"
            :alt="img.image.alt_text || printing.title"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      printings: [],
      loading: true,
      search: ''
    };
  },
  
  async mounted() {
    await this.fetchPrintings();
  },
  
  methods: {
    async fetchPrintings() {
      try {
        this.loading = true;
        const url = `/api/printing?is_visible=true${this.search ? `&search=${this.search}` : ''}`;
        const response = await fetch(url);
        const data = await response.json();
        this.printings = data.items;
      } catch (error) {
        console.error('Error:', error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
```

## ⚠️ Error Handling

```javascript
async function handlePrintingAPI(url, options) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json();
      
      switch (response.status) {
        case 400:
          throw new Error(`Dữ liệu không hợp lệ: ${error.detail}`);
        case 401:
          throw new Error('Chưa đăng nhập hoặc token hết hạn');
        case 403:
          throw new Error('Không có quyền thực hiện hành động này');
        case 404:
          throw new Error('Bài đăng không tồn tại');
        case 500:
          throw new Error('Lỗi server, vui lòng thử lại sau');
        default:
          throw new Error(`Lỗi không xác định: ${error.detail}`);
      }
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
}
```

## 💡 Best Practices

### 1. Pagination cho performance
```javascript
// Infinite scroll
let currentPage = 0;
const limit = 10;

async function loadMorePrintings() {
  const response = await fetch(`/api/printing?skip=${currentPage * limit}&limit=${limit}&is_visible=true`);
  const data = await response.json();
  
  printings.push(...data.items);
  currentPage++;
  
  return data.items.length < limit; // true nếu hết data
}
```

### 2. Search debouncing
```javascript
let searchTimeout;

function handleSearch(query) {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    const response = await fetch(`/api/printing?search=${query}&is_visible=true`);
    const data = await response.json();
    updateSearchResults(data.items);
  }, 300);
}
```

### 3. Caching cho UX tốt hơn
```javascript
const cache = new Map();

async function getCachedPrinting(id) {
  if (cache.has(id)) {
    return cache.get(id);
  }
  
  const response = await fetch(`/api/printing/${id}`);
  const printing = await response.json();
  
  cache.set(id, printing);
  return printing;
}
```

## 🔗 Related APIs

- **Images API**: `/api/images` - Upload và quản lý ảnh
- **Auth API**: `/api/auth` - Đăng nhập admin
- **Services API**: `/api/services` - Các dịch vụ in ấn khác

## 📞 Support

- **Swagger Documentation**: `https://your-domain.com/api/docs`
- **API Base URL**: `https://your-domain.com/api/printing`

## Tổng quan
API này cung cấp các chức năng quản lý bài đăng in ấn với hỗ trợ **upload ảnh trực tiếp**.

## Base URL
```
http://localhost:8000
```

## Authentication
- **Public endpoints**: GET (xem danh sách và chi tiết)
- **ADMIN/ROOT only**: POST, PUT, DELETE, PATCH (quản lý)

Để truy cập endpoints của ADMIN, cần gửi `Authorization: Bearer <token>` trong header.

---

## 📋 Danh sách Endpoints

### 1. Lấy danh sách bài đăng (Public)
**GET** `/api/printing`

**Query Parameters:**
- `skip`: Bỏ qua n bài đăng đầu (default: 0)
- `limit`: Số bài đăng tối đa (default: 20, max: 100)
- `search`: Tìm kiếm theo title hoặc content
- `is_visible`: Filter theo trạng thái hiển thị (true/false)

**Response:**
```json
{
    "total": 50,
    "items": [
        {
            "id": 1,
            "title": "In Catalogue chất lượng cao",
            "time": "1-2 ngày",
            "content": "Chúng tôi chuyên in ấn catalogue...",
            "is_visible": true,
            "created_at": "2024-01-15T10:30:00",
            "updated_at": "2024-01-15T10:30:00",
            "created_by": 1,
            "images": [
                {
                    "id": 1,
                    "image_id": 15,
                    "order": 1,
                    "image": {
                        "id": 15,
                        "filename": "catalogue-sample.jpg",
                        "url": "/static/images/uploads/abc123.jpg",
                        "alt_text": null,
                        "width": 800,
                        "height": 600
                    }
                }
            ]
        }
    ]
}
```

---

### 2. Lấy chi tiết bài đăng (Public)
**GET** `/api/printing/{id}`

**Response:**
```json
{
    "id": 1,
    "title": "In Catalogue chất lượng cao",
    "time": "1-2 ngày", 
    "content": "Nội dung chi tiết về dịch vụ in catalogue...",
    "is_visible": true,
    "created_at": "2024-01-15T10:30:00",
    "updated_at": "2024-01-15T10:30:00",
    "created_by": 1,
    "images": [
        {
            "id": 1,
            "image_id": 15,
            "order": 1,
            "image": {
                "id": 15,
                "filename": "catalogue-sample.jpg",
                "url": "/static/images/uploads/abc123.jpg",
                "alt_text": null,
                "width": 800,
                "height": 600
            }
        }
    ]
}
```

---

### 3. Tạo bài đăng mới (ADMIN only) 
**POST** `/api/printing`

**Content-Type**: `multipart/form-data`

**Form Fields:**
- `title` (required): Tiêu đề bài đăng
- `time` (required): Thời gian in ấn (VD: "1-2 ngày")
- `content` (required): Nội dung bài đăng
- `is_visible` (optional): true/false (default: true)
- `images` (optional): Tối đa 3 file ảnh

**File Requirements:**
- Định dạng: JPG, PNG, GIF, WebP, BMP
- Kích thước tối đa: 10MB mỗi file
- Số lượng: Tối đa 3 ảnh

**JavaScript Example:**
```javascript
const createPrinting = async (formData) => {
    // Tạo FormData object
    const form = new FormData();
    form.append('title', 'In Catalogue chất lượng cao');
    form.append('time', '1-2 ngày');
    form.append('content', 'Nội dung chi tiết về dịch vụ...');
    form.append('is_visible', 'true');
    
    // Thêm file ảnh (tối đa 3 file)
    const fileInput = document.getElementById('images');
    for (let i = 0; i < fileInput.files.length && i < 3; i++) {
        form.append('images', fileInput.files[i]);
    }
    
    try {
        const response = await fetch('/api/printing', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: form
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Tạo thành công:', result);
        } else {
            const error = await response.json();
            console.error('Lỗi:', error.detail);
        }
    } catch (error) {
        console.error('Lỗi:', error);
    }
};
```

**React Example:**
```jsx
import React, { useState } from 'react';

const CreatePrintingForm = () => {
    const [formData, setFormData] = useState({
        title: '',
        time: '',
        content: '',
        is_visible: true
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files).slice(0, 3); // Tối đa 3 file
        setSelectedFiles(files);
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const form = new FormData();
        form.append('title', formData.title);
        form.append('time', formData.time);
        form.append('content', formData.content);
        form.append('is_visible', formData.is_visible);
        
        // Thêm file ảnh
        selectedFiles.forEach(file => {
            form.append('images', file);
        });
        
        try {
            const response = await fetch('/api/printing', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: form
            });
            
            if (response.ok) {
                const result = await response.json();
                alert('Tạo bài đăng thành công!');
                // Reset form
                setFormData({ title: '', time: '', content: '', is_visible: true });
                setSelectedFiles([]);
            } else {
                const error = await response.json();
                alert(`Lỗi: ${error.detail}`);
            }
        } catch (error) {
            alert(`Lỗi: ${error.message}`);
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Tiêu đề"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
            />
            
            <input
                type="text"
                placeholder="Thời gian (VD: 1-2 ngày)"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                required
            />
            
            <textarea
                placeholder="Nội dung"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                required
            />
            
            <label>
                <input
                    type="checkbox"
                    checked={formData.is_visible}
                    onChange={(e) => setFormData({...formData, is_visible: e.target.checked})}
                />
                Hiển thị công khai
            </label>
            
            <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
            />
            <p>Đã chọn: {selectedFiles.length}/3 ảnh</p>
            
            <button type="submit">Tạo bài đăng</button>
        </form>
    );
};

export default CreatePrintingForm;
```

---

### 4. Cập nhật bài đăng (ADMIN only)
**PUT** `/api/printing/{id}`

**Content-Type**: `multipart/form-data`

**Form Fields:**
- `title` (optional): Tiêu đề mới
- `time` (optional): Thời gian in ấn mới
- `content` (optional): Nội dung mới
- `is_visible` (optional): true/false
- `images` (optional): File ảnh mới (tối đa 3 file)
- `keep_existing_images` (optional): true/false (default: false)

**Lưu ý:**
- Nếu `keep_existing_images = false`: Ảnh mới sẽ **thay thế** tất cả ảnh cũ
- Nếu `keep_existing_images = true`: Ảnh mới sẽ được **thêm vào** (tổng cộng không quá 3)

**JavaScript Example:**
```javascript
const updatePrinting = async (id, updateData, newImages, keepExisting = false) => {
    const form = new FormData();
    
    // Chỉ append các field không null/undefined
    if (updateData.title !== undefined) form.append('title', updateData.title);
    if (updateData.time !== undefined) form.append('time', updateData.time);
    if (updateData.content !== undefined) form.append('content', updateData.content);
    if (updateData.is_visible !== undefined) form.append('is_visible', updateData.is_visible);
    
    form.append('keep_existing_images', keepExisting);
    
    // Thêm file ảnh mới
    if (newImages && newImages.length > 0) {
        for (let i = 0; i < newImages.length; i++) {
            form.append('images', newImages[i]);
        }
    }
    
    try {
        const response = await fetch(`/api/printing/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: form
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Cập nhật thành công:', result);
        } else {
            const error = await response.json();
            console.error('Lỗi:', error.detail);
        }
    } catch (error) {
        console.error('Lỗi:', error);
    }
};

// Sử dụng
updatePrinting(1, {
    title: 'Tiêu đề mới',
    content: 'Nội dung mới'
}, [file1, file2], true); // true = giữ ảnh cũ
```

---

### 5. Xóa bài đăng (ADMIN only)
**DELETE** `/api/printing/{id}`

**Response:**
```json
{
    "message": "Xóa bài đăng thành công"
}
```

---

### 6. Ẩn/Hiện bài đăng (ADMIN only)
**PATCH** `/api/printing/{id}/visibility`

**Request Body:**
```json
{
    "is_visible": false
}
```

**Response:**
```json
{
    "message": "Đã ẩn bài đăng",
    "printing": {
        "id": 1,
        "title": "In Catalogue chất lượng cao",
        "is_visible": false
    }
}
```

---

## 🔧 Error Handling

**Common Error Responses:**

**400 Bad Request:**
```json
{
    "detail": "File image.txt không hợp lệ. Chỉ chấp nhận file ảnh (jpg, png, gif, webp, bmp)"
}
```

**401 Unauthorized:**
```json
{
    "detail": "Could not validate credentials"
}
```

**403 Forbidden:**
```json
{
    "detail": "Bạn không có quyền thực hiện thao tác này"
}
```

**404 Not Found:**
```json
{
    "detail": "Bài đăng với ID 999 không tồn tại"
}
```

**413 Payload Too Large:**
```json
{
    "detail": "File quá lớn. Kích thước tối đa là 10MB"
}
```

---

## 💡 Best Practices

### 1. Upload Ảnh
```javascript
// Kiểm tra file trước khi upload
const validateFiles = (files) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    for (let file of files) {
        if (!allowedTypes.includes(file.type)) {
            throw new Error(`File ${file.name} không phải là ảnh hợp lệ`);
        }
        if (file.size > maxSize) {
            throw new Error(`File ${file.name} quá lớn (>10MB)`);
        }
    }
    
    if (files.length > 3) {
        throw new Error('Chỉ được upload tối đa 3 ảnh');
    }
};
```

### 2. Preview Ảnh trước khi Upload
```javascript
const previewImages = (files) => {
    const previews = [];
    
    for (let file of files) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previews.push({
                file: file,
                url: e.target.result,
                name: file.name,
                size: file.size
            });
        };
        reader.readAsDataURL(file);
    }
    
    return previews;
};
```

### 3. Progress Tracking
```javascript
const uploadWithProgress = async (formData) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                console.log(`Upload progress: ${percentComplete}%`);
            }
        });
        
        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                reject(new Error('Upload failed'));
            }
        });
        
        xhr.open('POST', '/api/printing');
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
    });
};
```

### 4. Responsive Image Display
```css
.printing-image {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.printing-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
    margin: 16px 0;
}

@media (max-width: 768px) {
    .printing-gallery {
        grid-template-columns: 1fr;
    }
}
```

---

## 🚀 Quick Start

**1. Lấy danh sách bài đăng công khai:**
```javascript
fetch('/api/printing?limit=10')
    .then(response => response.json())
    .then(data => console.log(data.items));
```

**2. Upload bài đăng với ảnh (ADMIN):**
```javascript
const form = new FormData();
form.append('title', 'Dịch vụ in ấn mới');
form.append('time', '2-3 ngày');
form.append('content', 'Mô tả dịch vụ...');
form.append('images', fileInput.files[0]);

fetch('/api/printing', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: form
});
```

**3. Hiển thị ảnh trong bài đăng:**
```javascript
const displayPrinting = (printing) => {
    const imagesHtml = printing.images
        .sort((a, b) => a.order - b.order)
        .map(img => `<img src="${img.image.url}" alt="${img.image.filename}" class="printing-image">`)
        .join('');
    
    return `
        <div class="printing-item">
            <h3>${printing.title}</h3>
            <p><strong>Thời gian:</strong> ${printing.time}</p>
            <div class="printing-gallery">${imagesHtml}</div>
            <div class="printing-content">${printing.content}</div>
        </div>
    `;
};
```

API này giờ đã hỗ trợ upload ảnh trực tiếp, giúp frontend dễ dàng tích hợp hơn! 🎉 