-- Tạo bảng banners để quản lý banner của website
CREATE TABLE IF NOT EXISTS banners (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_id INTEGER NOT NULL REFERENCES images(id),
    url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    "order" INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- Tạo index cho các trường thường được query
CREATE INDEX IF NOT EXISTS idx_banners_is_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_banners_order ON banners("order");
CREATE INDEX IF NOT EXISTS idx_banners_created_at ON banners(created_at);

-- Thêm comment cho bảng
COMMENT ON TABLE banners IS 'Bảng quản lý banner của website';
COMMENT ON COLUMN banners.title IS 'Tiêu đề banner';
COMMENT ON COLUMN banners.description IS 'Mô tả banner';
COMMENT ON COLUMN banners.image_id IS 'ID ảnh banner (tham chiếu từ bảng images)';
COMMENT ON COLUMN banners.url IS 'Link chuyển hướng khi click banner';
COMMENT ON COLUMN banners.is_active IS 'Trạng thái hiển thị banner (true: hiện, false: ẩn)';
COMMENT ON COLUMN banners."order" IS 'Thứ tự hiển thị banner (số nhỏ hiện trước)';
COMMENT ON COLUMN banners.created_by IS 'ID người tạo banner'; 