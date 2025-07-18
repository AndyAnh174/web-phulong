# 📷 **IMAGES API - HƯỚNG DẪN CHO FRONTEND**

Tài liệu API đầy đủ cho hệ thống quản lý ảnh của Phú Long API Backend.

---

## 🔐 **XÁC THỰC**

Tất cả endpoints trừ `GET /api/images/` đều yêu cầu authentication:

```javascript
// Header Authorization
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

**Lưu ý**: Upload, Update, Delete chỉ dành cho **ADMIN**

---

## 📋 **DANH SÁCH ENDPOINTS**

| Method | Endpoint | Mô tả | Authentication |
|--------|----------|-------|----------------|
| POST | `/api/images/upload` | Upload ảnh mới | ADMIN |
| GET | `/api/images/` | Lấy danh sách ảnh | Public |
| GET | `/api/images/{image_id}` | Lấy chi tiết một ảnh | Public |
| PUT | `/api/images/{image_id}` | Cập nhật thông tin ảnh | ADMIN |
| DELETE | `/api/images/{image_id}` | Xóa ảnh | ADMIN |
| GET | `/api/images/categories/list` | Lấy danh sách categories | Public |
| GET | `/api/images/download/{image_id}` | Download ảnh trực tiếp | Public |

---

## 📤 **1. UPLOAD ẢNH**

### **POST** `/api/images/upload`

Upload ảnh mới với metadata

#### **Request (multipart/form-data)**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]); // Required
formData.append('alt_text', 'Mô tả ảnh');   // Optional
formData.append('category', 'logo');         // Optional
formData.append('is_visible', 'true');       // Optional (default: true)

fetch('/api/images/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: formData
})
```

#### **Response (200)**
```json
{
  "message": "Upload ảnh thành công",
  "image": {
    "id": 123,
    "filename": "logo.png",
    "file_path": "/path/to/static/images/uploads/uuid-filename.png",
    "url": "https://demoapi.andyanh.id.vn/static/images/uploads/uuid-filename.png",
    "alt_text": "Mô tả ảnh",
    "file_size": 1048576,
    "mime_type": "image/png",
    "width": 1920,
    "height": 1080,
    "is_visible": true,
    "category": "logo",
    "uploaded_by": 1,
    "created_at": "2024-01-15T10:30:00",
    "updated_at": "2024-01-15T10:30:00",
    "uploader": {
      "id": 1,
      "username": "admin",
      "email": "admin@phulong.com",
      "role": "admin",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00"
    }
  }
}
```

#### **Ràng buộc File**
- **Định dạng**: JPG, JPEG, PNG, GIF, WEBP, BMP
- **Kích thước tối đa**: 10MB
- **MIME types**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/bmp`

#### **JavaScript Example - Complete Upload Function**
```javascript
async function uploadImage(file, altText = '', category = '', isVisible = true) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    if (altText) formData.append('alt_text', altText);
    if (category) formData.append('category', category);
    formData.append('is_visible', isVisible.toString());

    const response = await fetch('/api/images/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Upload success:', result.image.url); // ⭐ URL ảnh để dùng
    return result;
    
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

// Sử dụng
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    const result = await uploadImage(file, 'Logo công ty', 'logo');
    // result.image.url là URL để hiển thị ảnh
    document.getElementById('preview').src = result.image.url;
  }
});
```

---

## 📋 **2. DANH SÁCH ẢNH**

### **GET** `/api/images/`

Lấy danh sách ảnh với phân trang và filter

#### **Query Parameters**
```javascript
const params = new URLSearchParams({
  skip: '0',           // Bỏ qua số bản ghi (phân trang)
  limit: '50',         // Số lượng tối đa trả về (max: 100)
  is_visible: 'true',  // Filter theo trạng thái hiển thị
  category: 'logo'     // Filter theo danh mục
});

fetch(`/api/images/?${params}`)
```

#### **Response (200)**
```json
[
  {
    "id": 123,
    "filename": "logo.png", 
    "file_path": "/path/to/file",
    "url": "https://demoapi.andyanh.id.vn/static/images/uploads/uuid-filename.png",
    "alt_text": "Logo công ty",
    "file_size": 1048576,
    "mime_type": "image/png", 
    "width": 1920,
    "height": 1080,
    "is_visible": true,
    "category": "logo",
    "uploaded_by": 1,
    "created_at": "2024-01-15T10:30:00",
    "updated_at": "2024-01-15T10:30:00",
    "uploader": {
      "id": 1,
      "username": "admin",
      "email": "admin@phulong.com", 
      "role": "admin",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00"
    }
  }
]
```

#### **JavaScript Example - Gallery với Phân trang**
```javascript
async function loadImages(page = 0, limit = 20, category = null) {
  try {
    const params = new URLSearchParams({
      skip: (page * limit).toString(),
      limit: limit.toString(),
      is_visible: 'true'
    });
    
    if (category) params.append('category', category);

    const response = await fetch(`/api/images/?${params}`);
    const images = await response.json();
    
    // Render gallery
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = images.map(img => `
      <div class="image-item" data-id="${img.id}">
        <img src="${img.url}" alt="${img.alt_text || img.filename}" 
             onclick="selectImage(${img.id}, '${img.url}')">
        <p>${img.filename}</p>
        <small>${img.category || 'Uncategorized'}</small>
      </div>
    `).join('');
    
    return images;
    
  } catch (error) {
    console.error('Load images failed:', error);
  }
}

// Image selector function 
function selectImage(imageId, imageUrl) {
  console.log('Selected image:', { id: imageId, url: imageUrl });
  // Sử dụng imageUrl để hiển thị hoặc lưu vào form
  document.getElementById('selectedImagePreview').src = imageUrl;
  document.getElementById('selectedImageId').value = imageId;
}
```

---

## 🔍 **3. CHI TIẾT MỘT ẢNH**

### **GET** `/api/images/{image_id}`

#### **Request**
```javascript
fetch('/api/images/123')
```

#### **Response (200)** - Giống format trong danh sách

#### **JavaScript Example**
```javascript
async function getImageDetails(imageId) {
  try {
    const response = await fetch(`/api/images/${imageId}`);
    
    if (!response.ok) {
      throw new Error('Image not found');
    }
    
    const image = await response.json();
    console.log('Image URL:', image.url); // ⭐ URL để sử dụng
    return image;
    
  } catch (error) {
    console.error('Get image failed:', error);
  }
}
```

---

## ✏️ **4. CẬP NHẬT THÔNG TIN ẢNH**

### **PUT** `/api/images/{image_id}`

#### **Request (JSON)**
```javascript
const updateData = {
  alt_text: "Mô tả mới",
  is_visible: false,
  category: "banner"
};

fetch('/api/images/123', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify(updateData)
})
```

#### **Response (200)** - Trả về image object đã cập nhật

---

## 🗑️ **5. XÓA ẢNH**

### **DELETE** `/api/images/{image_id}`

#### **Request**
```javascript
fetch('/api/images/123', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
})
```

#### **Response (200)**
```json
{
  "message": "Đã xóa ảnh logo.png thành công"
}
```

---

## 📂 **6. DANH SÁCH CATEGORIES**

### **GET** `/api/images/categories/list`

#### **Response (200)**
```json
["logo", "banner", "product", "gallery"]
```

#### **JavaScript Example**
```javascript
async function loadCategories() {
  const response = await fetch('/api/images/categories/list');
  const categories = await response.json();
  
  // Populate dropdown
  const select = document.getElementById('categorySelect');
  select.innerHTML = '<option value="">All Categories</option>' +
    categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}
```

---

## ⬇️ **7. DOWNLOAD ẢNH**

### **GET** `/api/images/download/{image_id}`

Trả về file ảnh trực tiếp để download

#### **JavaScript Example**
```javascript
function downloadImage(imageId, filename) {
  const link = document.createElement('a');
  link.href = `/api/images/download/${imageId}`;
  link.download = filename;
  link.click();
}
```

---

## 🎯 **CÁC TRƯỜNG HỢP SỬ DỤNG PHỔ BIẾN**

### **1. Image Picker Component**
```javascript
class ImagePicker {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.selectedImage = null;
    this.init();
  }
  
  async init() {
    await this.loadImages();
    this.renderUploadButton();
  }
  
  async loadImages() {
    const images = await loadImages(0, 50);
    this.renderGallery(images);
  }
  
  renderGallery(images) {
    const gallery = document.createElement('div');
    gallery.className = 'image-gallery';
    gallery.innerHTML = images.map(img => `
      <div class="image-item ${this.selectedImage?.id === img.id ? 'selected' : ''}" 
           onclick="this.selectImage(${img.id}, '${img.url}')">
        <img src="${img.url}" alt="${img.alt_text}">
        <span>${img.filename}</span>
      </div>
    `).join('');
    this.container.appendChild(gallery);
  }
  
  selectImage(id, url) {
    this.selectedImage = { id, url };
    this.onImageSelected(this.selectedImage);
    // Update UI
    this.container.querySelectorAll('.image-item').forEach(item => {
      item.classList.toggle('selected', item.dataset.id == id);
    });
  }
  
  onImageSelected(image) {
    // Override in implementation
    console.log('Selected:', image);
  }
}

// Sử dụng
const picker = new ImagePicker('imagePickerContainer');
picker.onImageSelected = (image) => {
  document.getElementById('productImage').value = image.id;
  document.getElementById('productImagePreview').src = image.url;
};
```

### **2. Upload với Preview**
```javascript
function createUploadWithPreview(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  
  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Preview local trước
    const reader = new FileReader();
    reader.onload = (e) => preview.src = e.target.result;
    reader.readAsDataURL(file);
    
    try {
      // Upload lên server
      const result = await uploadImage(file);
      
      // Cập nhật preview với URL chính thức
      preview.src = result.image.url;
      
      // Lưu ID để submit form
      document.getElementById('imageId').value = result.image.id;
      
      console.log('✅ Upload success, URL:', result.image.url);
      
    } catch (error) {
      alert('Upload failed: ' + error.message);
    }
  });
}
```

---

## ⚠️ **LỖI THƯỜNG GẶP**

### **400 Bad Request**
```json
{
  "detail": "File không hợp lệ. Chỉ chấp nhận file ảnh (jpg, png, gif, webp, bmp)"
}
```

### **401 Unauthorized**
```json
{
  "detail": "Not authenticated"
}
```

### **403 Forbidden**
```json
{
  "detail": "Not enough permissions"
}
```

### **404 Not Found**
```json
{
  "detail": "Ảnh với ID 123 không tồn tại"
}
```

### **413 File Too Large**
```json
{
  "detail": "File quá lớn. Kích thước tối đa là 10MB"
}
```

---

## 🚀 **BEST PRACTICES**

### **1. URL Caching**
```javascript
// Cache URLs đã load để tránh duplicate requests
const imageUrlCache = new Map();

async function getImageUrl(imageId) {
  if (imageUrlCache.has(imageId)) {
    return imageUrlCache.get(imageId);
  }
  
  const image = await getImageDetails(imageId);
  imageUrlCache.set(imageId, image.url);
  return image.url;
}
```

### **2. Lazy Loading**
```javascript
// Sử dụng Intersection Observer cho lazy loading
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.add('loaded');
      imageObserver.unobserve(img);
    }
  });
});

// Apply to images
document.querySelectorAll('img[data-src]').forEach(img => {
  imageObserver.observe(img);
});
```

### **3. Error Handling**
```javascript
async function safeImageLoad(imageId) {
  try {
    const image = await getImageDetails(imageId);
    return image.url;
  } catch (error) {
    console.warn(`Image ${imageId} not found, using fallback`);
    return '/static/images/placeholder.png'; // Fallback image
  }
}
```

---

## 📱 **RESPONSIVE IMAGES**

Sử dụng URL gốc và CSS để tối ưu:

```css
.responsive-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  max-width: 800px;
}

@media (max-width: 768px) {
  .responsive-image {
    max-width: 400px;
  }
}
```

---

## ✅ **CHECKLIST IMPLEMENTATION**

- [ ] Setup authentication headers
- [ ] Implement upload function với FormData  
- [ ] Xử lý file validation trước khi upload
- [ ] Build image picker/gallery component
- [ ] Implement error handling cho tất cả cases
- [ ] Add loading states cho upload/fetch
- [ ] Cache image URLs để performance
- [ ] Implement lazy loading cho galleries
- [ ] Add fallback images cho error cases
- [ ] Test với different file types và sizes

---

**🎯 KEY POINT**: Sau khi upload thành công, `result.image.url` chính là URL bạn cần để hiển thị ảnh trong frontend!
