# Hướng dẫn sử dụng Docker cho Ứng dụng Backend Phú Long

Tài liệu này cung cấp hướng dẫn về cách chạy ứng dụng backend Phú Long bằng Docker.

## Yêu cầu hệ thống

- Docker và Docker Compose đã được cài đặt
- Kết nối internet để tải các image

## Cấu hình môi trường

1. Tạo file `.env` từ file mẫu:

```bash
cp .env.example .env
```

2. Chỉnh sửa các thông tin cấu hình trong file `.env`:
   - Thông tin kết nối database
   - Cấu hình JWT
   - Cấu hình email SMTP
   - Thư mục upload

## Chạy ứng dụng với Docker Compose

### Môi trường Development

```bash
# Xây dựng và chạy các container
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng các container
docker-compose down
```

### Môi trường Production

```bash
# Xây dựng và chạy các container
docker-compose -f docker-compose.prod.yml up -d

# Xem logs
docker-compose -f docker-compose.prod.yml logs -f

# Dừng các container
docker-compose -f docker-compose.prod.yml down
```

## Cấu trúc Container

1. **phulong_api**: Container chạy ứng dụng FastAPI
   - Port: 8000
   - Volumes: Chia sẻ thư mục `static` với host

2. **phulong_db**: Container chạy PostgreSQL
   - Port: 5432
   - Volumes: Lưu trữ dữ liệu PostgreSQL

## Truy cập ứng dụng

- API: http://localhost:8000/
- API Documentation: http://localhost:8000/docs
- Database: localhost:5432 (có thể truy cập bằng pgAdmin hoặc công cụ khác)

## Quản lý dữ liệu

Dữ liệu PostgreSQL được lưu trữ trong Docker volume `postgres_data`. Nó sẽ được giữ lại ngay cả khi các container bị xóa.

## Xử lý lỗi thường gặp

1. **Lỗi kết nối database**:
   - Kiểm tra file `.env` và đảm bảo thông tin kết nối database chính xác
   - Đảm bảo container database đã được khởi động: `docker-compose ps`

2. **Lỗi gửi email**:
   - Kiểm tra cấu hình SMTP trong file `.env`
   - Đối với Gmail, bạn có thể cần tạo "App Password"

3. **Lỗi port đã được sử dụng**:
   - Đảm bảo không có ứng dụng nào đang sử dụng port 8000 hoặc 5432
   - Thay đổi port mapping trong file `docker-compose.yml` nếu cần

4. **Vấn đề về quyền truy cập file**:
   - Đảm bảo thư mục `static/uploads` có quyền ghi
   - Trong trường hợp cần thiết: `sudo chmod -R 777 static/uploads`

## Backup và Restore

### Backup Database

```bash
docker exec phulong_db pg_dump -U postgres phulong > backup.sql
```

### Restore Database

```bash
docker exec -i phulong_db psql -U postgres phulong < backup.sql
``` 