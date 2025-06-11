# Phú Long - Backend API

Backend API cho website giới thiệu sản phẩm in ấn của công ty Phú Long, phát triển bằng FastAPI và PostgreSQL.

## Cài đặt

### Yêu cầu

- Python 3.9+
- PostgreSQL

### Các bước cài đặt

1. Clone repository:

```
git clone <repository-url>
cd backend
```

2. Tạo môi trường ảo và kích hoạt:

```
python -m venv venv
source venv/bin/activate  # Trên Linux/Mac
venv\Scripts\activate     # Trên Windows
```

3. Cài đặt dependencies:

```
pip install -r requirements.txt
```

4. Tạo file `.env` từ mẫu:

```
cp .env.example .env
```

5. Cập nhật thông tin cấu hình trong file `.env` với thông tin kết nối PostgreSQL và các thiết lập khác.

6. Chạy ứng dụng:

```
uvicorn main:app --reload
```

## Cấu trúc API

Backend được phát triển với các endpoint sau:

### Authentication

- `POST /api/auth/register`: Đăng ký người dùng mới (chỉ Root)
- `POST /api/auth/login`: Đăng nhập
- `GET /api/auth/login-history`: Xem lịch sử đăng nhập (chỉ Root)

### Dịch vụ in ấn

- `GET /api/services`: Danh sách tất cả dịch vụ
- `GET /api/services/{service_id}`: Chi tiết dịch vụ
- `POST /api/services`: Thêm dịch vụ mới (yêu cầu quyền Admin)
- `PUT /api/services/{service_id}`: Cập nhật dịch vụ (yêu cầu quyền Admin)
- `DELETE /api/services/{service_id}`: Xóa dịch vụ (yêu cầu quyền Admin)

### Blog

- `GET /api/blogs`: Danh sách tất cả bài viết
- `GET /api/blogs/{blog_id}`: Chi tiết bài viết
- `POST /api/blogs`: Thêm bài viết mới (yêu cầu quyền Admin)
- `PUT /api/blogs/{blog_id}`: Cập nhật bài viết (yêu cầu quyền Admin)
- `DELETE /api/blogs/{blog_id}`: Xóa bài viết (yêu cầu quyền Admin)

### Đơn hàng

- `POST /api/orders`: Khách hàng gửi đơn hàng
- `GET /api/orders`: Admin xem danh sách đơn hàng (yêu cầu quyền Admin)
- `GET /api/orders/{order_id}`: Xem chi tiết đơn hàng (yêu cầu quyền Admin)
- `PUT /api/orders/{order_id}`: Cập nhật trạng thái đơn hàng (yêu cầu quyền Admin)
- `GET /api/orders/export/csv`: Xuất danh sách đơn hàng ra file CSV (yêu cầu quyền Admin)

### Người dùng

- `GET /api/users/me`: Lấy thông tin người dùng hiện tại
- `GET /api/users`: Root xem danh sách người dùng (chỉ Root)
- `GET /api/users/{user_id}`: Xem chi tiết người dùng (chỉ Root)
- `PUT /api/users/{user_id}`: Cập nhật quyền người dùng (chỉ Root)

## Phân quyền

- **Root**: Có tất cả quyền, bao gồm quản lý người dùng
- **Admin**: Có quyền quản lý dịch vụ, blog, đơn hàng

## Swagger Docs

Swagger UI docs có thể được truy cập tại:

```
http://localhost:8000/docs
```

## Triển khai

1. Cập nhật các biến môi trường trong file `.env` cho môi trường production
2. Chạy ứng dụng bằng Gunicorn hoặc Uvicorn:

```
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

hoặc

```
uvicorn main:app --host 0.0.0.0 --port 8000
``` 