# 📸 Hướng dẫn Upload Ảnh - Services & Printing

## 🎯 Tổng quan thay đổi

Hệ thống đã được cập nhật để hỗ trợ upload ảnh trực tiếp thay vì sử dụng URL:

### **Services**
- ❌ **Cũ**: `image_url` (String URL)
- ✅ **Mới**: Upload ảnh trực tiếp với `multipart/form-data`

### **Printing** 
- ✅ **Cũ**: Upload ảnh gallery (đã có)
- ✅ **Mới**: Chèn ảnh vào content với shortcode `[image:123]`

---

## 🔧 **1. Services API - Upload ảnh trực tiếp**

### **Tạo Service mới**
```http
POST /api/services/
Content-Type: multipart/form-data

Fields:
- name: string (required)
- description: string (required) 
- price: float (required)
- category: string (optional)
- is_active: boolean (default: true)
- featured: boolean (default: false)
- image: file (optional) - Upload ảnh trực tiếp
```

**Ví dụ với cURL:**
```bash
curl -X POST "http://localhost:8000/api/services/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=In Name Card" \
  -F "description=Dịch vụ in name card chất lượng cao" \
  -F "price=50000" \
  -F "category=name-card" \
  -F "featured=true" \
  -F "image=@/path/to/image.jpg"
```

### **Cập nhật Service**
```http
PUT /api/services/{service_id}
Content-Type: multipart/form-data

Fields: (tất cả optional)
- name: string
- description: string
- price: float
- category: string
- is_active: boolean
- featured: boolean
- image: file - Upload ảnh mới (sẽ thay thế ảnh cũ)
- remove_image: boolean - Xóa ảnh hiện tại
```

### **Response Format**
```json
{
  "id": 1,
  "name": "In Name Card",
  "description": "Dịch vụ in name card chất lượng cao",
  "price": 50000.0,
  "image_id": 15,
  "category": "name-card", 
  "is_active": true,
  "featured": true,
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00",
  "image": {
    "id": 15,
    "filename": "namecard.jpg",
    "url": "https://api.domain.com/static/images/uploads/uuid.jpg",
    "alt_text": null,
    "width": 800,
    "height": 600
  }
}
```

---

## 🖼️ **2. Printing - Chèn ảnh vào Content**

### **Upload ảnh cho Content**
```http
POST /api/printing/upload-content-image
Content-Type: multipart/form-data

Fields:
- file: file (required) - Ảnh cần upload
- alt_text: string (optional) - Mô tả ảnh
```

**Response:**
```json
{
  "message": "Upload ảnh thành công",
  "image": {
    "id": 25,
    "url": "https://api.domain.com/static/images/uploads/uuid.jpg",
    "filename": "product.jpg",
    "alt_text": "Sản phẩm in ấn"
  },
  "shortcode": "[image:25|Sản phẩm in ấn]",
  "usage": "Sao chép shortcode này và dán vào content tại vị trí muốn hiển thị ảnh"
}
```

### **Sử dụng Shortcode trong Content**

**1. Shortcode cơ bản:**
```
[image:25]
```

**2. Shortcode với mô tả:**
```
[image:25|Mô tả ảnh tùy chỉnh]
```

**3. Ví dụ Content:**
```
Chúng tôi chuyên in ấn các sản phẩm chất lượng cao.

[image:25|Sản phẩm name card đẹp]

Đặc biệt, chúng tôi có các mẫu thiết kế độc đáo:

[image:26|Mẫu thiết kế 1]
[image:27|Mẫu thiết kế 2]

Liên hệ ngay để được tư vấn!
```

### **Content được Parse thành HTML:**
```html
Chúng tôi chuyên in ấn các sản phẩm chất lượng cao.

<img src="https://api.domain.com/static/images/uploads/uuid1.jpg" 
     alt="Sản phẩm name card đẹp" 
     class="content-image" 
     style="max-width: 100%; height: auto;" />

Đặc biệt, chúng tôi có các mẫu thiết kế độc đáo:

<img src="https://api.domain.com/static/images/uploads/uuid2.jpg" 
     alt="Mẫu thiết kế 1" 
     class="content-image" 
     style="max-width: 100%; height: auto;" />
<img src="https://api.domain.com/static/images/uploads/uuid3.jpg" 
     alt="Mẫu thiết kế 2" 
     class="content-image" 
     style="max-width: 100%; height: auto;" />

Liên hệ ngay để được tư vấn!
```

### **GET Printing Response**
```json
{
  "id": 1,
  "title": "In ấn name card",
  "time": "1-2 ngày",
  "content": "Dịch vụ in ấn [image:25|Sản phẩm đẹp] chất lượng cao",
  "content_html": "Dịch vụ in ấn <img src='...' alt='Sản phẩm đẹp' class='content-image' style='max-width: 100%; height: auto;' /> chất lượng cao",
  "is_visible": true,
  "images": [...],
  "creator": {...}
}
```

---

## 🔄 **3. Migration & Setup**

### **Chạy Migration**
```bash
python migrate_services_to_image_upload.py
```

Migration sẽ:
- ✅ Thêm `image_id` column vào bảng `services`
- ✅ Tạo foreign key với bảng `images`  
- ⚠️ Xóa `image_url` column (với xác nhận)

### **Restart Server**
```bash
python main.py
# hoặc
uvicorn main:app --reload
```

---

## 📱 **4. Frontend Integration**

### **Services Form (Multipart)**
```javascript
// Tạo FormData cho Services
const formData = new FormData();
formData.append('name', 'Tên dịch vụ');
formData.append('description', 'Mô tả');
formData.append('price', 50000);
formData.append('featured', true);
formData.append('image', fileInput.files[0]); // File từ input

// POST request
fetch('/api/services/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### **Printing Content Editor**
```javascript
// 1. Upload ảnh trước
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('alt_text', 'Mô tả ảnh');
  
  const response = await fetch('/api/printing/upload-content-image', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  
  const result = await response.json();
  return result.shortcode; // "[image:123|Mô tả ảnh]"
};

// 2. Chèn shortcode vào textarea/editor
const insertImage = async (file) => {
  const shortcode = await uploadImage(file);
  const textarea = document.getElementById('content');
  const cursorPos = textarea.selectionStart;
  const textBefore = textarea.value.substring(0, cursorPos);
  const textAfter = textarea.value.substring(cursorPos);
  
  textarea.value = textBefore + shortcode + textAfter;
};
```

### **Display Content với HTML**
```javascript
// Sử dụng content_html để hiển thị
const PrintingDisplay = ({ printing }) => {
  return (
    <div>
      <h1>{printing.title}</h1>
      <div 
        dangerouslySetInnerHTML={{ __html: printing.content_html }}
        className="printing-content"
      />
    </div>
  );
};
```

---

## 🚨 **5. Lưu ý quan trọng**

### **File Constraints**
- **Kích thước**: Tối đa 10MB
- **Định dạng**: JPG, JPEG, PNG, GIF, WEBP, BMP
- **Bảo mật**: Chỉ Admin có quyền upload

### **Database Changes**
- ❌ `services.image_url` đã bị xóa
- ✅ `services.image_id` → Foreign key tới `images.id`
- ✅ Cascade delete: Xóa service → xóa ảnh liên quan

### **Breaking Changes**
- ⚠️ **Frontend phải chuyển từ JSON sang multipart/form-data**
- ⚠️ **Services API response đã thay đổi structure**
- ⚠️ **Cần update tất cả API calls cho Services**

### **Backward Compatibility**
- ✅ Printing API vẫn tương thích với code cũ
- ✅ Chỉ thêm tính năng chèn ảnh vào content
- ✅ Existing printing posts vẫn hoạt động bình thường

---

## 🧪 **6. Testing**

### **Test Services Upload**
```bash
# Test create service với ảnh
curl -X POST "http://localhost:8000/api/services/" \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=Test Service" \
  -F "description=Test Description" \
  -F "price=100000" \
  -F "image=@test.jpg"

# Test update service - xóa ảnh
curl -X PUT "http://localhost:8000/api/services/1" \
  -H "Authorization: Bearer $TOKEN" \
  -F "remove_image=true"
```

### **Test Printing Content Image**
```bash
# Upload ảnh cho content
curl -X POST "http://localhost:8000/api/printing/upload-content-image" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@content-image.jpg" \
  -F "alt_text=Test Content Image"

# Response sẽ có shortcode để chèn vào content
```

---

## 🎯 **Kết luận**

Hệ thống đã được nâng cấp để:

1. **Services**: Upload ảnh trực tiếp thay vì URL
2. **Printing**: Chèn ảnh vào content với shortcode
3. **Quản lý file**: Tập trung trong hệ thống Images
4. **Bảo mật**: Kiểm tra file type và kích thước
5. **Performance**: Tối ưu storage và loading

Frontend cần cập nhật để tương thích với API mới! 🚀 