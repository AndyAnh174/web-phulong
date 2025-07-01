 
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