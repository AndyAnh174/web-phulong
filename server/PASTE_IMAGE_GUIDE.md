# 📋 Hướng dẫn Paste Ảnh vào Printing Content

## 🎯 **Tính năng mới: Copy & Paste Ảnh**

Giờ đây bạn có thể **copy ảnh từ bất kỳ đâu và paste trực tiếp** vào content editor của Printing! Hệ thống sẽ tự động upload và chèn shortcode.

## ✨ **Tính năng**

### **🖼️ Copy & Paste**

- Copy ảnh từ web browser, ứng dụng khác
- Paste vào textarea content → Tự động upload
- Chèn shortcode `[image:123|mô tả]` vào vị trí cursor

### **🎯 Drag & Drop**

- Kéo ảnh từ máy tính vào textarea
- Tự động upload và chèn shortcode
- Visual feedback khi drag over

### **👁️ Live Preview**

- Preview content với ảnh real-time
- Parse shortcode thành HTML `<img>` tags
- Update tự động khi thay đổi content

---

## 🔧 **API Endpoints mới**

### **1. Paste Image Upload**

```http
POST /api/printing/paste-image
Content-Type: multipart/form-data
Authorization: Bearer {token}

Fields:
- file: File (required) - Ảnh từ clipboard/drag-drop
- alt_text: String (optional) - Mô tả ảnh
```

**Response:**

```json
{
  "success": true,
  "message": "Upload ảnh paste thành công",
  "image": {
    "id": 123,
    "url": "https://api.com/static/images/uploads/uuid.jpg",
    "filename": "pasted-image-1640000000.jpg",
    "alt_text": "Ảnh paste lúc 14:30 20/01/2024",
    "width": 800,
    "height": 600
  },
  "shortcode": "[image:123|Ảnh paste lúc 14:30 20/01/2024]",
  "insertion_type": "paste"
}
```

### **2. Parse Content Preview**

```http
POST /api/printing/parse-content
Content-Type: application/json

Body:
{
  "content": "Nội dung với [image:123|mô tả] shortcode"
}
```

**Response:**

```json
{
  "content_html": "Nội dung với <img src='...' alt='mô tả' class='content-image' style='max-width: 100%; height: auto;' /> shortcode",
  "original_content": "Nội dung với [image:123|mô tả] shortcode",
  "images_found": 1,
  "success": true
}
```

---

## 🖥️ **Frontend Integration**

### **1. Include JavaScript Helper**

```html
<!-- Thêm vào <head> hoặc trước </body> -->
<script src="/static/js/printing-paste-helper.js"></script>
```

### **2. Setup Paste Helper**

```javascript
const pasteHelper = createPrintingPasteHelper({
    apiBaseUrl: 'https://your-api.com',
    authToken: 'your-jwt-token',
    contentSelector: '#content',          // Textarea selector
    previewSelector: '#content-preview',  // Preview div selector
  
    // Callbacks
    onSuccess: (result) => {
        console.log('Upload thành công:', result);
        showToast('✅ Đã chèn ảnh vào nội dung!');
    },
  
    onError: (error) => {
        console.error('Lỗi upload:', error);
        showToast('❌ Lỗi: ' + error.message);
    },
  
    onUploading: (isUploading) => {
        // Toggle loading indicator
        document.getElementById('loading').style.display = 
            isUploading ? 'block' : 'none';
    }
});
```

### **3. HTML Structure**

```html
<div class="editor-container">
    <!-- Content Editor -->
    <div class="editor-panel">
        <label for="content">Nội dung bài đăng:</label>
        <textarea 
            id="content" 
            placeholder="Nhập nội dung... Paste ảnh vào đây!"
            rows="10"
        ></textarea>
        <div class="editor-help">
            💡 Paste ảnh từ clipboard hoặc drag & drop ảnh vào đây
        </div>
    </div>
  
    <!-- Preview Panel -->
    <div class="preview-panel">
        <h4>👁️ Preview</h4>
        <div id="content-preview">
            <em>Preview sẽ hiển thị tại đây...</em>
        </div>
    </div>
</div>

<!-- Loading indicator -->
<div id="loading" style="display: none;">
    📤 Đang upload ảnh...
</div>
```

---

## 🎨 **CSS Styling**

```css
/* Textarea với drag & drop support */
#content {
    width: 100%;
    min-height: 300px;
    padding: 12px;
    border: 2px solid #ddd;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    transition: border-color 0.3s;
}

#content:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

/* Drag over effect */
#content.drag-over {
    border-color: #2196F3 !important;
    background-color: rgba(33, 150, 243, 0.1) !important;
}

/* Preview panel */
#content-preview {
    min-height: 300px;
    padding: 16px;
    border: 1px solid #eee;
    border-radius: 4px;
    background: #fafafa;
    line-height: 1.6;
}

/* Content images */
.content-image {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin: 10px 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* Shortcode placeholder (trong editor) */
.shortcode-placeholder {
    display: inline-block;
    background: #f0f0f0;
    border: 1px dashed #ccc;
    padding: 4px 8px;
    margin: 2px;
    border-radius: 3px;
    font-size: 12px;
    color: #666;
}
```

---

## 🧪 **Cách sử dụng**

### **1. Copy & Paste**

1. **Copy ảnh** từ bất kỳ đâu:

   - Screenshot (Print Screen)
   - Copy ảnh từ web browser
   - Copy từ ứng dụng khác (Photoshop, Paint, etc.)
2. **Paste vào textarea** (Ctrl+V):

   - Ảnh tự động upload lên server
   - Shortcode được chèn vào vị trí cursor
   - Preview cập nhật real-time

### **2. Drag & Drop**

1. **Kéo file ảnh** từ máy tính
2. **Thả vào textarea**
3. Tự động upload và chèn shortcode

### **3. Shortcode Manual**

```
[image:123]                    // Ảnh với ID 123
[image:123|Mô tả ảnh]         // Ảnh với mô tả custom
[image:123|Sản phẩm ABC]      // Ví dụ thực tế
```

---

## 🔍 **Demo & Testing**

### **Demo Page**

Mở file demo để test:

```
http://localhost:8000/static/paste-example.html
```

### **Test Steps**

1. **Login** để lấy JWT token
2. **Nhập token** vào demo page
3. **Copy ảnh** từ web hoặc screenshot
4. **Paste vào textarea** → Kiểm tra upload
5. **Xem preview** → Kiểm tra parse HTML

### **Test với cURL**

```bash
# Test paste endpoint
curl -X POST "http://localhost:8000/api/printing/paste-image" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@image.jpg" \
  -F "alt_text=Test paste image"

# Test parse endpoint  
curl -X POST "http://localhost:8000/api/printing/parse-content" \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello [image:1|test] world"}'
```

---

## ⚡ **Advanced Usage**

### **Multiple Image Paste**

```javascript
// Custom handler cho multiple images
const pasteHelper = createPrintingPasteHelper({
    // ... config ...
    onSuccess: (result) => {
        // Track uploaded images
        window.uploadedImages = window.uploadedImages || [];
        window.uploadedImages.push(result.image);
      
        console.log(`Total uploaded: ${window.uploadedImages.length}`);
    }
});
```

### **Custom Shortcode Format**

```javascript
// Override shortcode generation
const pasteHelper = createPrintingPasteHelper({
    // ... config ...
    generateShortcode: (imageId, altText) => {
        return `![${altText}](image:${imageId})`;  // Markdown style
    }
});
```

### **Batch Upload**

```javascript
// Handle multiple files at once
const handleMultipleFiles = async (files) => {
    for (const file of files) {
        if (file.type.startsWith('image/')) {
            await pasteHelper.handleImagePaste(file, contentElement);
        }
    }
};
```

---

## 🚨 **Lưu ý quan trọng**

### **File Constraints**

- ✅ **Định dạng**: JPG, JPEG, PNG, GIF, WEBP, BMP
- ✅ **Kích thước**: Tối đa 10MB per file
- ✅ **Authentication**: Chỉ admin có quyền upload

### **Browser Support**

- ✅ **Chrome/Edge**: Full support
- ✅ **Firefox**: Full support
- ✅ **Safari**: Limited clipboard API support
- ❌ **IE**: Không support

### **Security**

- 🔒 **JWT required** cho tất cả upload endpoints
- 🔒 **File validation** trên server
- 🔒 **Unique filename** để tránh conflict
- 🔒 **MIME type checking**

### **Performance**

- ⚡ **Auto-resize**: Large images sẽ được optimize
- ⚡ **Lazy loading**: Preview load on demand
- ⚡ **Debounced preview**: Tránh update quá nhiều

---

## 🎯 **Workflow hoàn chỉnh**

```
1. User copy ảnh → 📋 Clipboard
2. User paste vào editor → 🎯 Detect paste event  
3. Extract image from clipboard → 📎 File object
4. Upload to /api/printing/paste-image → ☁️ Server
5. Server validate & save → 💾 Database + Storage
6. Return shortcode → 📝 [image:123|alt]
7. Insert vào cursor position → ✏️ Textarea
8. Auto parse & update preview → 👁️ Live preview
9. User see ảnh trong preview → ✅ Complete
```

---

## 🎉 **Kết luận**

Tính năng Paste Image mang lại:

1. **🚀 Productivity**: Paste ảnh cực nhanh, không cần manual upload
2. **💡 UX tốt**: Drag & drop, visual feedback, live preview
3. **🔧 Developer friendly**: JavaScript helper dễ integrate
4. **🔒 Secure**: Authentication + validation đầy đủ
5. **📱 Responsive**: Hoạt động trên mọi device

**Ready to use! Paste away! 📋→🖼️→✨**
