
## Yêu cầu giao diện và chức năng:

### 1. Giao diện chính
- Header với logo "Phú Long", thanh menu (Trang chủ, Dịch vụ, Bảng giá, Blog, Đặt hàng, Liên hệ)
- Footer có thông tin liên hệ, mạng xã hội, bản quyền

### 2. Dịch vụ in ấn
- Trang hiển thị danh sách dịch vụ (`GET /api/services`)
- Bộ lọc theo danh mục, nổi bật, trạng thái
- Trang chi tiết dịch vụ (`GET /api/services/{id}`)

### 3. Bảng giá
- Hiển thị bảng giá theo từng danh mục dịch vụ, lấy từ dữ liệu dịch vụ (`name`, `price`, `description`)
- Giao diện dễ đọc, responsive

### 4. Blog
- Trang danh sách bài viết (`GET /api/blogs`)
- Trang chi tiết bài viết (`GET /api/blogs/{id}`)

### 5. Đặt hàng
- Form đặt hàng (`POST /api/orders`), có upload file thiết kế
- Các trường: tên, email, điện thoại, dịch vụ, số lượng, kích thước, chất liệu, ghi chú

### 6. Quản trị (ADMIN)
- Đăng nhập (`/api/auth/login-json`)
- Dashboard: số đơn hàng mới, doanh thu, biểu đồ
- Quản lý: dịch vụ, bài viết, đơn hàng, người dùng

### 7. Liên hệ
- Form liên hệ (`POST /api/contact/submit`)
- Hiển thị thông báo sau khi gửi thành công

### 8. Cấu hình động
- Lấy thông tin cấu hình từ API `/api/config/env`
- Hiển thị tên website, số điện thoại, địa chỉ, v.v.

## UI/UX:
- Hiện đại, màu sắc hài hòa với thương hiệu Phú Long, Màu chủ đạo là đỏ-trắng-xám
- Sử dụng TailwindCSS, layout responsive
- Toast/thông báo sau các thao tác
- Loading, error state đầy đủ

## Lưu ý:
- Sử dụng JWT (Authorization: Bearer <token>) cho các API cần xác thực
- Phân quyền rõ ràng: PUBLIC, USER, ADMIN, ROOT
