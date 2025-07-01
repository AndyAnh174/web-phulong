# Docker Setup cho Next.js App

## Yêu cầu
- Docker
- Docker Compose

## Cách chạy

### 1. Build và chạy với Docker Compose
```bash
docker-compose up --build
```

### 2. Chạy ở chế độ background
```bash
docker-compose up -d --build
```

### 3. Xem logs
```bash
docker-compose logs -f
```

### 4. Dừng containers
```bash
docker-compose down
```

## Thông tin
- Ứng dụng sẽ chạy tại: http://localhost:8080
- Sử dụng npm với --legacy-peer-deps
- Không sử dụng nginx
- Next.js chạy ở chế độ standalone

## Các lệnh Docker hữu ích

### Build lại image
```bash
docker-compose build --no-cache
```

### Xóa containers và images
```bash
docker-compose down --rmi all
```

### Truy cập vào container
```bash
docker exec -it nextjs-app sh
``` 