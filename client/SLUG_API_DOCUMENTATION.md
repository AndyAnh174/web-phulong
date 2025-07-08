# 🔗 API Documentation - Slug URLs

## 📋 Tổng quan

Backend đã được cập nhật để sử dụng **slug** thay vì **ID** cho các endpoint lấy chi tiết. Điều này giúp:

- ✅ URL thân thiện với SEO
- ✅ Dễ đọc và nhớ cho người dùng  
- ✅ Tự động tạo từ tên/tiêu đề bằng tiếng Việt
- ✅ Tương thích với các công cụ tìm kiếm

## 🔄 Migration Summary

| **Trước đây (ID)** | **Bây giờ (Slug)** |
|-------------------|-------------------|
| `/api/services/123` | `/api/services/thiet-ke-website` |
| `/api/blogs/456` | `/api/blogs/xu-huong-thiet-ke-web-2024` |
| `/api/printing/789` | `/api/printing/in-an-chat-luong-cao` |

---

## 🔧 Services API

### 1. Lấy chi tiết dịch vụ theo slug

**Endpoint:** `GET /api/services/{slug}`

**Ví dụ:**
```bash
GET /api/services/thiet-ke-website
GET /api/services/in-an-brochure
GET /api/services/dich-vu-seo-marketing
```

**Response:**
```json
{
  "id": 1,
  "name": "Thiết kế website",
  "description": "Dịch vụ thiết kế website chuyên nghiệp...",
  "price": 5000000.0,
  "category": "web-design",
  "is_active": true,
  "featured": true,
  "image": {
    "id": 123,
    "url": "https://api.phulong.com/static/images/uploads/website-design.jpg",
    "alt_text": "Thiết kế website"
  },
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

### 2. Cập nhật dịch vụ theo slug

**Endpoint:** `PUT /api/services/{slug}` (ADMIN only)

**Ví dụ:**
```bash
PUT /api/services/thiet-ke-website
Content-Type: multipart/form-data

name=Thiết kế website chuyên nghiệp
description=Mô tả mới...
price=6000000
```

### 3. Xóa dịch vụ theo slug

**Endpoint:** `DELETE /api/services/{slug}` (ADMIN only)

### 4. Lấy reviews của dịch vụ

**Endpoint:** `GET /api/services/{slug}/reviews`

### 5. Tạo review cho dịch vụ

**Endpoint:** `POST /api/services/{slug}/reviews`

---

## 📰 Blogs API

### 1. Lấy chi tiết blog theo slug

**Endpoint:** `GET /api/blogs/{slug}`

**Ví dụ:**
```bash
GET /api/blogs/xu-huong-thiet-ke-web-2024
GET /api/blogs/cach-toi-uu-seo-cho-website
GET /api/blogs/10-meo-thiet-ke-logo-dep
```

**Response:**
```json
{
  "id": 1,
  "title": "Xu hướng thiết kế web 2024",
  "content": "Nội dung bài viết...",
  "image_url": "https://api.phulong.com/static/images/blog1.jpg",
  "category": "web-design",
  "is_active": true,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

### 2. Cập nhật blog theo slug

**Endpoint:** `PUT /api/blogs/{slug}` (ADMIN only)

### 3. Xóa blog theo slug

**Endpoint:** `DELETE /api/blogs/{slug}` (ADMIN only)

---

## 🖨️ Printing API

### 1. Lấy chi tiết bài đăng in ấn theo slug

**Endpoint:** `GET /api/printing/{slug}`

**Ví dụ:**
```bash
GET /api/printing/in-an-chat-luong-cao
GET /api/printing/dich-vu-in-nhanh-24h
GET /api/printing/in-card-visit-name-card
```

**Response:**
```json
{
  "id": 1,
  "title": "In ấn chất lượng cao",
  "time": "1-2 ngày",
  "content": "Nội dung bài đăng...",
  "content_html": "<p>Nội dung đã parse...</p>",
  "is_visible": true,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z",
  "creator": {
    "id": 1,
    "username": "admin"
  },
  "images": [
    {
      "id": 1,
      "order": 1,
      "image": {
        "id": 123,
        "url": "https://api.phulong.com/static/images/uploads/printing1.jpg",
        "alt_text": "In ấn chất lượng"
      }
    }
  ]
}
```

### 2. Cập nhật bài đăng in ấn theo slug

**Endpoint:** `PUT /api/printing/{slug}` (ADMIN only)

### 3. Xóa bài đăng in ấn theo slug

**Endpoint:** `DELETE /api/printing/{slug}` (ADMIN only)

### 4. Thay đổi trạng thái hiển thị

**Endpoint:** `PATCH /api/printing/{slug}/visibility` (ADMIN only)

---

## 🔍 Cách tạo Slug

Slug được tự động tạo từ `name` (services) hoặc `title` (blogs, printing) theo quy tắc:

### Quy tắc chuyển đổi:
1. **Chuyển ký tự tiếng Việt:** `à, á, ạ, ả, ã` → `a`
2. **Chuyển về lowercase:** `ABC` → `abc`
3. **Thay khoảng trắng bằng dấu gạch ngang:** `hello world` → `hello-world`
4. **Loại bỏ ký tự đặc biệt:** `@#$%` → bỏ
5. **Loại bỏ dấu gạch ngang thừa:** `a--b` → `a-b`

### Ví dụ chuyển đổi:

| **Tên gốc** | **Slug** |
|-------------|----------|
| `Thiết kế website` | `thiet-ke-website` |
| `In ấn brochure` | `in-an-brochure` |
| `Dịch vụ SEO Marketing` | `dich-vu-seo-marketing` |
| `10 mẹo thiết kế logo đẹp` | `10-meo-thiet-ke-logo-dep` |
| `Có ký tự đặc biệt @#$%` | `co-ky-tu-dac-biet` |

---

## 🚀 Hướng dẫn Migration Frontend

### 1. Cập nhật Routes

**Trước đây:**
```javascript
// React Router
<Route path="/services/:id" component={ServiceDetail} />
<Route path="/blogs/:id" component={BlogDetail} />
<Route path="/printing/:id" component={PrintingDetail} />
```

**Bây giờ:**
```javascript
// React Router  
<Route path="/services/:slug" component={ServiceDetail} />
<Route path="/blogs/:slug" component={BlogDetail} />
<Route path="/printing/:slug" component={PrintingDetail} />
```

### 2. Cập nhật API Calls

**Trước đây:**
```javascript
// Fetch service by ID
const fetchService = async (id) => {
  const response = await fetch(`/api/services/${id}`);
  return response.json();
};
```

**Bây giờ:**
```javascript
// Fetch service by slug
const fetchService = async (slug) => {
  const response = await fetch(`/api/services/${slug}`);
  return response.json();
};
```

### 3. Tạo slug từ Frontend (nếu cần)

```javascript
// Utility function để tạo slug
function createSlug(text) {
  const vietnameseChars = {
    'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
    'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
    'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
    'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
    'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
    'đ': 'd'
  };
  
  return text
    .toLowerCase()
    .split('')
    .map(char => vietnameseChars[char] || char)
    .join('')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

// Ví dụ sử dụng
const slug = createSlug("Thiết kế website"); // "thiet-ke-website"
```

### 4. Cập nhật Links

**Trước đây:**
```jsx
<Link to={`/services/${service.id}`}>
  {service.name}
</Link>
```

**Bây giờ:**
```jsx
// Tạo slug từ tên
const slug = createSlug(service.name);

<Link to={`/services/${slug}`}>
  {service.name}
</Link>
```

### 5. Cập nhật Navigation

```javascript
// Hàm navigate trong React Router
const navigateToService = (service) => {
  const slug = createSlug(service.name);
  navigate(`/services/${slug}`);
};

const navigateToBlog = (blog) => {
  const slug = createSlug(blog.title);
  navigate(`/blogs/${slug}`);
};

const navigateToPrinting = (printing) => {
  const slug = createSlug(printing.title);
  navigate(`/printing/${slug}`);
};
```

---

## ⚠️ Lưu ý quan trọng

### 1. Error Handling
- Khi slug không tồn tại, API sẽ trả về `404 Not Found`
- Message lỗi: `"Dịch vụ với slug 'slug-name' không tồn tại"`

### 2. SEO Benefits
- URL thân thiện: `/services/thiet-ke-website` thay vì `/services/123`
- Tốt cho Google indexing và tìm kiếm
- Dễ chia sẻ và nhớ

### 3. Backward Compatibility
- **Các endpoint LIST vẫn giữ nguyên:** `/api/services`, `/api/blogs`, `/api/printing`
- **Chỉ các endpoint CHI TIẾT thay đổi:** từ `/{id}` sang `/{slug}`

### 4. Unique Slugs
- Backend tự động đảm bảo slug unique
- Nếu trùng, sẽ thêm số: `thiet-ke-website-2`, `thiet-ke-website-3`

---

## 🧪 Testing

Bạn có thể test các slug endpoints:

```bash
# Test Services
curl https://api.phulong.com/api/services/thiet-ke-website
curl https://api.phulong.com/api/services/in-an-brochure

# Test Blogs  
curl https://api.phulong.com/api/blogs/xu-huong-thiet-ke-web-2024

# Test Printing
curl https://api.phulong.com/api/printing/in-an-chat-luong-cao
```

---

## ❓ FAQ

**Q: Slug có phân biệt hoa thường không?**
A: Không, tất cả slug đều được chuyển về lowercase.

**Q: Slug có thể thay đổi không?**
A: Có, khi admin cập nhật tên/tiêu đề, slug sẽ được tạo lại.

**Q: Nếu slug quá dài thì sao?**
A: Hiện tại chưa có giới hạn độ dài, nhưng nên giữ tên/tiêu đề ngắn gọn.

**Q: Slug có hỗ trợ emoji không?**
A: Không, emoji sẽ bị loại bỏ trong quá trình tạo slug.

---

## 📞 Support

Nếu có vấn đề gì về việc migration hoặc sử dụng slug APIs, liên hệ team backend để được hỗ trợ! 