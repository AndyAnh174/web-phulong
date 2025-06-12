# API Documentation

## Tổng quan

API Backend cho website giới thiệu sản phẩm in ấn. Base URL: `/api`

## Authentication

### Đăng ký tài khoản

- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Description**: Đăng ký tài khoản mới (Chỉ ROOT mới có quyền)
- **Request Body**:
  ```json
  {
    "username": "string",
    "email": "user@example.com",
    "password": "string",
    "role": "admin"
  }
  ```
- **Response**:
  ```json
  {
    "id": 1,
    "username": "string",
    "email": "user@example.com",
    "role": "admin",
    "is_active": true,
    "created_at": "2023-01-01T00:00:00.000Z"
  }
  ```

### Đăng nhập

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Description**: Đăng nhập (form data cho Swagger UI)
- **Request Body**: Form data (`username`, `password`)
- **Response**:
  ```json
  {
    "access_token": "string",
    "token_type": "bearer"
  }
  ```

### Đăng nhập (JSON)

- **URL**: `/api/auth/login-json`
- **Method**: `POST`
- **Description**: Đăng nhập với dữ liệu JSON
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "access_token": "string",
    "token_type": "bearer"
  }
  ```

### Lịch sử đăng nhập

- **URL**: `/api/auth/login-history`
- **Method**: `GET`
- **Description**: Lấy lịch sử đăng nhập (Chỉ ROOT mới có quyền)
- **Authentication**: Required (ROOT)
- **Response**: Danh sách lịch sử đăng nhập

## Dịch vụ (Services)

### Lấy danh sách dịch vụ

- **URL**: `/api/services`
- **Method**: `GET`
- **Description**: Lấy danh sách dịch vụ
- **Parameters**:
  - `skip` (query): Số lượng bản ghi bỏ qua (phân trang)
  - `limit` (query): Số lượng bản ghi tối đa trả về
  - `is_active` (query): Lọc theo trạng thái kích hoạt
  - `featured` (query): Lọc các dịch vụ nổi bật
  - `category` (query): Lọc theo danh mục/tag
- **Response**: Danh sách các dịch vụ

### Lấy dịch vụ đề xuất

- **URL**: `/api/services/suggested`
- **Method**: `GET`
- **Description**: Lấy danh sách dịch vụ đề xuất
- **Parameters**:
  - `current_id` (query): ID dịch vụ hiện tại (bắt buộc)
- **Response**: Danh sách các dịch vụ đề xuất (tối đa 4)

### Chi tiết dịch vụ

- **URL**: `/api/services/{service_id}`
- **Method**: `GET`
- **Description**: Lấy thông tin chi tiết của dịch vụ
- **Parameters**:
  - `service_id` (path): ID dịch vụ
- **Response**: Chi tiết dịch vụ

### Tạo dịch vụ mới

- **URL**: `/api/services`
- **Method**: `POST`
- **Description**: Tạo dịch vụ mới (Chỉ ADMIN mới có quyền)
- **Authentication**: Required (ADMIN)
- **Request Body**:
  ```json
  {
    "name": "string",
    "description": "string",
    "price": 0,
    "image_url": "string",
    "category": "string",
    "is_active": true
  }
  ```
- **Response**: Chi tiết dịch vụ đã tạo

### Cập nhật dịch vụ

- **URL**: `/api/services/{service_id}`
- **Method**: `PUT`
- **Description**: Cập nhật dịch vụ (Chỉ ADMIN mới có quyền)
- **Authentication**: Required (ADMIN)
- **Parameters**:
  - `service_id` (path): ID dịch vụ
- **Request Body**:
  ```json
  {
    "name": "string",
    "description": "string",
    "price": 0,
    "image_url": "string",
    "category": "string",
    "is_active": true
  }
  ```
- **Response**: Chi tiết dịch vụ đã cập nhật

### Xóa dịch vụ

- **URL**: `/api/services/{service_id}`
- **Method**: `DELETE`
- **Description**: Xóa dịch vụ (Chỉ ADMIN mới có quyền)
- **Authentication**: Required (ADMIN)
- **Parameters**:
  - `service_id` (path): ID dịch vụ
- **Response**: No content (204)

### Lấy đánh giá dịch vụ

- **URL**: `/api/services/{service_id}/reviews`
- **Method**: `GET`
- **Description**: Lấy danh sách đánh giá của dịch vụ
- **Parameters**:
  - `service_id` (path): ID dịch vụ
- **Response**: Danh sách đánh giá

### Tạo đánh giá dịch vụ

- **URL**: `/api/services/{service_id}/reviews`
- **Method**: `POST`
- **Description**: Tạo đánh giá mới cho dịch vụ
- **Parameters**:
  - `service_id` (path): ID dịch vụ
- **Request Body**:
  ```json
  {
    "rating": 5,
    "content": "string",
    "author_name": "string",
    "is_anonymous": false
  }
  ```
- **Response**: Chi tiết đánh giá đã tạo

## Blog

### Lấy danh sách bài viết

- **URL**: `/api/blogs`
- **Method**: `GET`
- **Description**: Lấy danh sách bài viết
- **Parameters**:
  - `skip` (query): Số lượng bản ghi bỏ qua (phân trang)
  - `limit` (query): Số lượng bản ghi tối đa trả về
  - `is_active` (query): Lọc theo trạng thái kích hoạt
  - `category` (query): Lọc theo danh mục
- **Response**: Danh sách bài viết

### Chi tiết bài viết

- **URL**: `/api/blogs/{blog_id}`
- **Method**: `GET`
- **Description**: Lấy thông tin chi tiết của bài viết
- **Parameters**:
  - `blog_id` (path): ID bài viết
- **Response**: Chi tiết bài viết

### Tạo bài viết mới

- **URL**: `/api/blogs`
- **Method**: `POST`
- **Description**: Tạo bài viết mới (Chỉ ADMIN mới có quyền)
- **Authentication**: Required (ADMIN)
- **Request Body**:
  ```json
  {
    "title": "string",
    "content": "string",
    "image_url": "string",
    "category": "string",
    "is_active": true
  }
  ```
- **Response**: Chi tiết bài viết đã tạo

### Cập nhật bài viết

- **URL**: `/api/blogs/{blog_id}`
- **Method**: `PUT`
- **Description**: Cập nhật bài viết (Chỉ ADMIN mới có quyền)
- **Authentication**: Required (ADMIN)
- **Parameters**:
  - `blog_id` (path): ID bài viết
- **Request Body**:
  ```json
  {
    "title": "string",
    "content": "string",
    "image_url": "string",
    "category": "string",
    "is_active": true
  }
  ```
- **Response**: Chi tiết bài viết đã cập nhật

### Xóa bài viết

- **URL**: `/api/blogs/{blog_id}`
- **Method**: `DELETE`
- **Description**: Xóa bài viết (Chỉ ADMIN mới có quyền)
- **Authentication**: Required (ADMIN)
- **Parameters**:
  - `blog_id` (path): ID bài viết
- **Response**: No content (204)

## Đơn hàng (Orders)

### Tạo đơn hàng mới

- **URL**: `/api/orders`
- **Method**: `POST`
- **Description**: Tạo đơn hàng mới
- **Request Body**: Form data
  - `customer_name` (required): Tên khách hàng
  - `customer_email` (required): Email khách hàng
  - `customer_phone` (required): Số điện thoại
  - `service_id` (required): ID dịch vụ
  - `quantity` (required): Số lượng
  - `size` (optional): Kích thước
  - `material` (optional): Chất liệu
  - `notes` (optional): Ghi chú
  - `design_file` (optional): File thiết kế
- **Response**: Chi tiết đơn hàng đã tạo

### Lấy danh sách đơn hàng

- **URL**: `/api/orders`
- **Method**: `GET`
- **Description**: Lấy danh sách đơn hàng (Chỉ ADMIN mới có quyền)
- **Authentication**: Required (ADMIN)
- **Parameters**:
  - `skip` (query): Số lượng bản ghi bỏ qua (phân trang)
  - `limit` (query): Số lượng bản ghi tối đa trả về
  - `customer_name` (query): Lọc theo tên khách hàng
  - `service_id` (query): Lọc theo ID dịch vụ
  - `status` (query): Lọc theo trạng thái
  - `start_date` (query): Lọc theo ngày bắt đầu
  - `end_date` (query): Lọc theo ngày kết thúc
- **Response**: Danh sách đơn hàng với pagination

### Chi tiết đơn hàng

- **URL**: `/api/orders/{order_id}`
- **Method**: `GET`
- **Description**: Lấy thông tin chi tiết đơn hàng (Chỉ ADMIN mới có quyền)
- **Authentication**: Required (ADMIN)
- **Parameters**:
  - `order_id` (path): ID đơn hàng
- **Response**: Chi tiết đơn hàng

### Cập nhật trạng thái đơn hàng

- **URL**: `/api/orders/{order_id}`
- **Method**: `PUT`
- **Description**: Cập nhật trạng thái đơn hàng (Chỉ ADMIN mới có quyền)
- **Authentication**: Required (ADMIN)
- **Parameters**:
  - `order_id` (path): ID đơn hàng
- **Request Body**:
  ```json
  {
    "status": "pending | processing | completed | cancelled"
  }
  ```
- **Response**: Chi tiết đơn hàng đã cập nhật

### Xuất đơn hàng ra CSV

- **URL**: `/api/orders/export/csv`
- **Method**: `GET`
- **Description**: Xuất danh sách đơn hàng ra file CSV (Chỉ ADMIN mới có quyền)
- **Authentication**: Required (ADMIN)
- **Parameters**:
  - `customer_name` (query): Lọc theo tên khách hàng
  - `service_id` (query): Lọc theo ID dịch vụ
  - `status` (query): Lọc theo trạng thái
  - `start_date` (query): Lọc theo ngày bắt đầu
  - `end_date` (query): Lọc theo ngày kết thúc
  - `token` (query): Token cho phép tải file mà không cần xác thực header
- **Response**: File CSV

## Người dùng (Users)

### Lấy thông tin người dùng hiện tại

- **URL**: `/api/users/me`
- **Method**: `GET`
- **Description**: Lấy thông tin của người dùng hiện tại
- **Authentication**: Required
- **Response**: Thông tin người dùng

### Lấy danh sách người dùng

- **URL**: `/api/users`
- **Method**: `GET`
- **Description**: Lấy danh sách người dùng (Chỉ ROOT mới có quyền)
- **Authentication**: Required (ROOT)
- **Parameters**:
  - `skip` (query): Số lượng bản ghi bỏ qua (phân trang)
  - `limit` (query): Số lượng bản ghi tối đa trả về
- **Response**: Danh sách người dùng

### Chi tiết người dùng

- **URL**: `/api/users/{user_id}`
- **Method**: `GET`
- **Description**: Lấy thông tin chi tiết người dùng (Chỉ ROOT mới có quyền)
- **Authentication**: Required (ROOT)
- **Parameters**:
  - `user_id` (path): ID người dùng
- **Response**: Chi tiết người dùng

### Lấy lịch sử truy cập admin

- **URL**: `/api/users/access-logs/admin`
- **Method**: `GET`
- **Description**: Lấy lịch sử truy cập của admin (Chỉ ROOT mới có quyền)
- **Authentication**: Required (ROOT)
- **Parameters**:
  - `user_id` (query): Lọc theo ID người dùng
  - `role` (query): Lọc theo vai trò
  - `start_date` (query): Lọc theo ngày bắt đầu
  - `end_date` (query): Lọc theo ngày kết thúc
  - `skip` (query): Số lượng bản ghi bỏ qua (phân trang)
  - `limit` (query): Số lượng bản ghi tối đa trả về
- **Response**: Danh sách lịch sử truy cập

### Tạo người dùng mới

- **URL**: `/api/users`
- **Method**: `POST`
- **Description**: Tạo người dùng mới (Chỉ ROOT mới có quyền)
- **Authentication**: Required (ROOT)
- **Request Body**:
  ```json
  {
    "username": "string",
    "email": "user@example.com",
    "password": "string",
    "role": "admin"
  }
  ```
- **Response**: Chi tiết người dùng đã tạo

### Cập nhật người dùng

- **URL**: `/api/users/{user_id}`
- **Method**: `PUT`
- **Description**: Cập nhật thông tin người dùng (Chỉ ROOT mới có quyền)
- **Authentication**: Required (ROOT)
- **Parameters**:
  - `user_id` (path): ID người dùng
- **Request Body**:
  ```json
  {
    "username": "string",
    "email": "user@example.com",
    "role": "admin",
    "is_active": true,
    "password": "string"
  }
  ```
- **Response**: Chi tiết người dùng đã cập nhật

### Xóa người dùng

- **URL**: `/api/users/{user_id}`
- **Method**: `DELETE`
- **Description**: Xóa người dùng (Chỉ ROOT mới có quyền)
- **Authentication**: Required (ROOT)
- **Parameters**:
  - `user_id` (path): ID người dùng
- **Response**: Chi tiết người dùng đã xóa

### Xóa người dùng theo username

- **URL**: `/api/users/by-username/{username}`
- **Method**: `DELETE`
- **Description**: Xóa người dùng theo username (Chỉ ROOT mới có quyền)
- **Authentication**: Required (ROOT)
- **Parameters**:
  - `username` (path): Username người dùng
- **Response**: Chi tiết người dùng đã xóa

### Xóa lịch sử truy cập hết hạn

- **URL**: `/api/users/access-logs/cleanup`
- **Method**: `DELETE`
- **Description**: Xóa các bản ghi log đã quá hạn (Chỉ ROOT mới có quyền)
- **Authentication**: Required (ROOT)
- **Response**: No content (204)

## Dashboard

### Lấy thông tin tổng quan

- **URL**: `/api/dashboard/summary`
- **Method**: `GET`
- **Description**: Lấy thông tin tổng quan cho dashboard (Chỉ ADMIN mới có quyền)
- **Authentication**: Required (ADMIN)
- **Response**:
  ```json
  {
    "new_orders": 0,
    "services": 0,
    "customers": 0,
    "revenue": 0
  }
  ```

### Lấy doanh thu theo ngày

- **URL**: `/api/dashboard/revenue-by-date`
- **Method**: `GET`
- **Description**: Lấy dữ liệu doanh thu theo ngày cho biểu đồ (Chỉ ADMIN mới có quyền)
- **Authentication**: Required (ADMIN)
- **Response**:
  ```json
  {
    "labels": ["01/01", "02/01", ...],
    "values": [10, 20, ...]
  }
  ```

### Lấy đơn hàng theo dịch vụ

- **URL**: `/api/dashboard/orders-by-service`
- **Method**: `GET`
- **Description**: Lấy dữ liệu số đơn hàng theo dịch vụ cho biểu đồ (Chỉ ADMIN mới có quyền)
- **Authentication**: Required (ADMIN)
- **Response**:
  ```json
  {
    "labels": ["Dịch vụ 1", "Dịch vụ 2", ...],
    "values": [10, 20, ...]
  }
  ```

## Liên hệ (Contact)

### Gửi form liên hệ

- **URL**: `/api/contact/submit`
- **Method**: `POST`
- **Description**: Gửi form liên hệ và lưu vào database
- **Request Body**:
  ```json
  {
    "fullname": "string",
    "email": "user@example.com",
    "phone": "string",
    "subject": "string",
    "message": "string"
  }
  ```
- **Response**:
  ```json
  {
    "id": 1,
    "message": "Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể.",
    "created_at": "2023-01-01T00:00:00.000Z"
  }
  ```

### Lấy danh sách liên hệ

- **URL**: `/api/contact/list`
- **Method**: `GET`
- **Description**: Lấy danh sách các liên hệ (Chỉ ADMIN mới có quyền)
- **Authentication**: Required (ADMIN)
- **Parameters**:
  - `skip` (query): Số lượng bản ghi bỏ qua (phân trang)
  - `limit` (query): Số lượng bản ghi tối đa trả về
- **Response**: Danh sách các liên hệ

### Chi tiết liên hệ

- **URL**: `/api/contact/{contact_id}`
- **Method**: `GET`
- **Description**: Lấy thông tin chi tiết một liên hệ (Chỉ ADMIN mới có quyền)
- **Authentication**: Required (ADMIN)
- **Parameters**:
  - `contact_id` (path): ID liên hệ
- **Response**: Chi tiết liên hệ

### Xóa liên hệ

- **URL**: `/api/contact/{contact_id}`
- **Method**: `DELETE`
- **Description**: Xóa một liên hệ (Chỉ ADMIN mới có quyền)
- **Authentication**: Required (ADMIN)
- **Parameters**:
  - `contact_id` (path): ID liên hệ
- **Response**: No content (204)

## Cấu hình (Config)

### Lấy biến môi trường công khai

- **URL**: `/api/config/env`
- **Method**: `GET`
- **Description**: Lấy các biến môi trường công khai cho frontend
- **Response**:
  ```json
  {
    "API_URL": "string",
    "SITE_NAME": "string",
    "SITE_DESCRIPTION": "string",
    "CONTACT_EMAIL": "string",
    "CONTACT_PHONE": "string",
    "CONTACT_ADDRESS": "string",
    "ITEMS_PER_PAGE": 10,
    "ENABLE_ANALYTICS": false
  }
  ```

### Lấy biến môi trường cho admin

- **URL**: `/api/config/admin-env`
- **Method**: `GET`
- **Description**: Lấy các biến môi trường dành cho admin
- **Authentication**: Required
- **Response**:
  ```json
  {
    "API_URL": "string",
    "SITE_NAME": "string",
    "SITE_DESCRIPTION": "string",
    "CONTACT_EMAIL": "string",
    "CONTACT_PHONE": "string",
    "CONTACT_ADDRESS": "string",
    "ITEMS_PER_PAGE": 10,
    "ENABLE_ANALYTICS": false,
    "ADMIN_DASHBOARD_TITLE": "string",
    "LOG_RETENTION_DAYS": 90,
    "MAX_UPLOAD_SIZE_MB": 10
  }
  ```

## Xác thực và Phân quyền

API sử dụng JWT (JSON Web Token) để xác thực người dùng. Token được trả về sau khi đăng nhập thành công và cần được đính kèm trong header `Authorization` của các request yêu cầu xác thực:

```
Authorization: Bearer {token}
```

### Phân quyền:

- **PUBLIC**: Các API không yêu cầu xác thực
- **USER**: Yêu cầu token xác thực hợp lệ
- **ADMIN**: Yêu cầu token với quyền admin
- **ROOT**: Yêu cầu token với quyền root (cao nhất)

### Mã lỗi phổ biến:

- **401 Unauthorized**: Token không hợp lệ hoặc hết hạn
- **403 Forbidden**: Không có quyền truy cập vào API
- **404 Not Found**: Không tìm thấy tài nguyên
- **400 Bad Request**: Dữ liệu không hợp lệ
- **500 Internal Server Error**: Lỗi server

## Quản lý ảnh (Images)

### Upload ảnh

- **URL**: `/api/images/upload`
- **Method**: `POST`
- **Description**: Upload ảnh mới (Chỉ ADMIN mới có quyền)
- **Authentication**: Required (ADMIN)
- **Content-Type**: `multipart/form-data`
- **Request Body**: Form data
  - `file` (required): File ảnh (jpg, png, gif, webp, bmp, tối đa 10MB)
  - `alt_text` (optional): Mô tả ảnh
  - `category` (optional): Danh mục ảnh
  - `is_visible` (optional): Có hiển thị hay không (default: true)
- **Response**:
  ```json
  {
    "message": "Upload ảnh thành công",
    "image": {
      "id": 1,
      "filename": "example.jpg",
      "file_path": "/path/to/file",
      "url": "/static/images/uploads/uuid.jpg",
      "alt_text": "Mô tả ảnh",
      "file_size": 1024000,
      "mime_type": "image/jpeg",
      "width": 1920,
      "height": 1080,
      "is_visible": true,
      "category": "portfolio",
      "uploaded_by": 1,
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  }
  ```

### Lấy danh sách ảnh

- **URL**: `/api/images`
- **Method**: `GET`
- **Description**: Lấy danh sách ảnh
- **Parameters**:
  - `skip` (query): Số lượng bản ghi bỏ qua (phân trang)
  - `limit` (query): Số lượng bản ghi tối đa trả về
  - `is_visible` (query): Lọc theo trạng thái hiển thị
  - `category` (query): Lọc theo danh mục
- **Response**: Danh sách ảnh

### Chi tiết ảnh

- **URL**: `/api/images/{image_id}`
- **Method**: `GET`
- **Description**: Lấy thông tin chi tiết của ảnh
- **Parameters**:
  - `image_id` (path): ID ảnh
- **Response**: Chi tiết ảnh

### Cập nhật ảnh

- **URL**: `/api/images/{image_id}`
- **Method**: `PUT`
- **Description**: Cập nhật thông tin ảnh (Chỉ ADMIN mới có quyền)
- **Authentication**: Required (ADMIN)
- **Parameters**:
  - `image_id` (path): ID ảnh
- **Request Body**:
  ```json
  {
    "alt_text": "string",
    "is_visible": true,
    "category": "string"
  }
  ```
- **Response**: Chi tiết ảnh đã cập nhật

### Xóa ảnh

- **URL**: `/api/images/{image_id}`
- **Method**: `DELETE`
- **Description**: Xóa ảnh (Chỉ ADMIN mới có quyền)
- **Authentication**: Required (ADMIN)
- **Parameters**:
  - `image_id` (path): ID ảnh
- **Response**: 
  ```json
  {
    "message": "Đã xóa ảnh example.jpg thành công"
  }
  ```

### Lấy danh sách danh mục ảnh

- **URL**: `/api/images/categories/list`
- **Method**: `GET`
- **Description**: Lấy danh sách các danh mục ảnh có sẵn
- **Response**: Danh sách các danh mục

### Download ảnh

- **URL**: `/api/images/download/{image_id}`
- **Method**: `GET`
- **Description**: Download ảnh trực tiếp
- **Parameters**:
  - `image_id` (path): ID ảnh
- **Response**: File ảnh
