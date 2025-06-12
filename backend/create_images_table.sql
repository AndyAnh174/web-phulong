-- Tạo bảng images để quản lý ảnh upload
CREATE TABLE IF NOT EXISTS images (
    id SERIAL PRIMARY KEY,
    filename VARCHAR NOT NULL,  -- Tên file gốc
    file_path VARCHAR NOT NULL,  -- Đường dẫn file trên server
    url VARCHAR NOT NULL,  -- URL để truy cập ảnh
    alt_text VARCHAR,  -- Mô tả ảnh (cho SEO)
    file_size INTEGER,  -- Kích thước file (bytes)
    mime_type VARCHAR,  -- Loại file (image/jpeg, image/png, etc.)
    width INTEGER,  -- Chiều rộng ảnh
    height INTEGER,  -- Chiều cao ảnh
    is_visible BOOLEAN DEFAULT true,  -- Có hiển thị hay không
    category VARCHAR,  -- Danh mục ảnh (portfolio, blog, service, etc.)
    uploaded_by INTEGER REFERENCES users(id),  -- Người upload
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo index để tăng hiệu suất truy vấn
CREATE INDEX IF NOT EXISTS idx_images_is_visible ON images(is_visible);
CREATE INDEX IF NOT EXISTS idx_images_category ON images(category);
CREATE INDEX IF NOT EXISTS idx_images_uploaded_by ON images(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at DESC);

-- Thông báo hoàn thành
SELECT 'Đã tạo thành công bảng images và các index' as message; 