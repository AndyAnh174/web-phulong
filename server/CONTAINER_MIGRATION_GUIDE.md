# 🐳 Hướng dẫn Migration trong Container

## 🎯 Tổng quan

Sau khi sửa lỗi **forward reference** trong Pydantic, bạn cần chạy migration để cập nhật database.

### ✅ **Lỗi đã sửa:**
- `PydanticUndefinedAnnotation: name 'ImageOut' is not defined`
- Di chuyển `ImageOut` lên trước `ServiceOut` trong `schemas.py`

---

## 🚀 **Cách 1: Chạy script từ container**

### **Bước 1: Vào container**
```bash
# Lấy container ID hoặc name
docker ps

# Vào container (thay YOUR_CONTAINER_ID/NAME)
docker exec -it YOUR_CONTAINER_ID bash
# hoặc
docker exec -it phulong-server bash
```

### **Bước 2: Chạy migration script**
```bash
# Từ trong container
cd /app
./migrate.sh
```

**Hoặc chạy trực tiếp:**
```bash
python3 scripts/migrate_services_images.py
```

---

## 🚀 **Cách 2: Một lệnh từ host**

```bash
# Chạy migration từ ngoài container (thay CONTAINER_ID)
docker exec -it YOUR_CONTAINER_ID /app/migrate.sh
```

---

## 📋 **Output mong đợi**

```
🐳 Container Migration Script
=================================
✅ Đang chạy trong Docker container

🔄 Chạy migration cho Services Image Upload...

🔄 MIGRATION SCRIPT - Services Image Upload
============================================================
Database: db:5432/phulong_db
User: postgres
============================================================
✅ Kết nối database thành công
🚀 Bắt đầu migration: Services image_url -> image_id
============================================================
📝 Kiểm tra column image_id...
   → Thêm column image_id vào bảng services...
   ✅ Đã thêm column image_id
📝 Tạo foreign key constraint...
   ✅ Đã tạo foreign key constraint
📝 Xử lý column image_url...
   → Xóa column image_url (không có dữ liệu)...
   ✅ Đã xóa column image_url

🎉 Migration hoàn thành!
📋 Tóm tắt:
   ✓ Column image_id đã sẵn sàng
   ✓ Foreign key constraint đã được tạo
   ✓ API Services đã hỗ trợ upload trực tiếp

✅ Migration thành công!

📝 Bước tiếp theo:
   1. Restart server để áp dụng model changes
   2. Test API endpoints:
      - POST /api/services/ (multipart/form-data)
      - POST /api/printing/upload-content-image

🎯 Hoàn thành migration script!

📝 Lưu ý: Hãy restart server để áp dụng thay đổi
   docker-compose restart
```

---

## 🔄 **Restart server**

### **Từ host machine:**
```bash
# Restart container
docker-compose restart

# Hoặc restart service cụ thể
docker-compose restart server
```

### **Từ trong container:**
```bash
# Reload gunicorn (nếu dùng)
kill -HUP 1

# Hoặc exit và restart container
exit
```

---

## 🧪 **Test API sau migration**

### **1. Kiểm tra server khởi động**
```bash
curl http://localhost:8000/

# Response: {"message": "Phú Long API is running!"}
```

### **2. Test Services API mới**
```bash
# Login để lấy token
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your_password"}'

# Test create service với upload ảnh
curl -X POST "http://localhost:8000/api/services/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Test Service" \
  -F "description=Test description" \
  -F "price=50000" \
  -F "image=@test.jpg"
```

### **3. Test Printing content image**
```bash
# Upload ảnh cho content
curl -X POST "http://localhost:8000/api/printing/upload-content-image" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@content.jpg" \
  -F "alt_text=Test content image"

# Response sẽ có shortcode: [image:123|Test content image]
```

---

## ❗ **Xử lý lỗi thường gặp**

### **Lỗi: Permission denied**
```bash
# Cấp quyền cho script
chmod +x /app/migrate.sh
```

### **Lỗi: ModuleNotFoundError**
```bash
# Đảm bảo PYTHONPATH
export PYTHONPATH=/app:$PYTHONPATH
cd /app
python3 scripts/migrate_services_images.py
```

### **Lỗi: Database connection**
```bash
# Kiểm tra database service
docker-compose ps

# Restart database nếu cần
docker-compose restart db
```

### **Lỗi: Column already exists**
```
ℹ️  Column image_id đã tồn tại
ℹ️  Foreign key constraint đã tồn tại
```
**→ Đây là normal, migration đã chạy trước đó**

---

## 🎯 **Kiểm tra kết quả**

### **1. Kiểm tra database schema**
```sql
-- Vào PostgreSQL
\d services

-- Should see:
-- image_id | integer | foreign key to images(id)
-- image_url | (should be removed)
```

### **2. Test API endpoints**
```bash
# GET services - should have image object
curl "http://localhost:8000/api/services/"

# Response structure:
{
  "id": 1,
  "name": "Service name",
  "image_id": 5,
  "image": {
    "id": 5,
    "url": "https://domain.com/static/images/uploads/uuid.jpg",
    "filename": "image.jpg"
  }
}
```

---

## ✅ **Hoàn thành**

Sau khi migration thành công:

1. ✅ **Services API** đã chuyển từ `image_url` sang upload trực tiếp
2. ✅ **Printing API** đã hỗ trợ chèn ảnh vào content với shortcode
3. ✅ **Database** đã được cập nhật cấu trúc
4. ✅ **Forward reference error** đã được sửa

### **🚀 Ready to use:**
- Upload ảnh cho Services
- Chèn ảnh vào Printing content  
- Quản lý ảnh tập trung

**Happy coding! 🎉** 