-- Script SQL để tạo bảng cho Printing API
-- Chạy script này nếu muốn tạo bảng thủ công

-- Tạo bảng printings
CREATE TABLE IF NOT EXISTS printings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    time VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- Tạo index cho tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_printings_title ON printings(title);
CREATE INDEX IF NOT EXISTS idx_printings_is_visible ON printings(is_visible);
CREATE INDEX IF NOT EXISTS idx_printings_created_at ON printings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_printings_created_by ON printings(created_by);

-- Tạo bảng printing_images (bảng trung gian giữa printings và images)
CREATE TABLE IF NOT EXISTS printing_images (
    id SERIAL PRIMARY KEY,
    printing_id INTEGER NOT NULL REFERENCES printings(id) ON DELETE CASCADE,
    image_id INTEGER NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    "order" INTEGER DEFAULT 1 CHECK ("order" >= 1 AND "order" <= 3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(printing_id, image_id),
    UNIQUE(printing_id, "order")
);

-- Tạo index cho bảng printing_images
CREATE INDEX IF NOT EXISTS idx_printing_images_printing_id ON printing_images(printing_id);
CREATE INDEX IF NOT EXISTS idx_printing_images_image_id ON printing_images(image_id);
CREATE INDEX IF NOT EXISTS idx_printing_images_order ON printing_images("order");

-- Trigger để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Áp dụng trigger cho bảng printings
DROP TRIGGER IF EXISTS update_printings_updated_at ON printings;
CREATE TRIGGER update_printings_updated_at
    BEFORE UPDATE ON printings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Tạo dữ liệu mẫu (tùy chọn)
INSERT INTO printings (title, time, content, is_visible, created_by) VALUES 
('In ấn name card cao cấp', '1-2 ngày', 'Dịch vụ in ấn name card với chất lượng cao, sử dụng giấy art paper 300gsm, hoàn thiện bóng cục bộ. Thiết kế chuyên nghiệp, tạo ấn tượng mạnh mẽ cho khách hàng.', TRUE, 1),
('In brochure quảng cáo', '2-3 ngày', 'In brochure quảng cáo với nhiều kích thước và kiểu dáng đa dạng. Sử dụng máy in offset chất lượng cao, màu sắc sống động, bắt mắt.', TRUE, 1),
('In catalogue sản phẩm', '3-5 ngày', 'Dịch vụ in catalogue sản phẩm chuyên nghiệp với thiết kế bắt mắt, giấy in chất lượng cao. Hoàn thiện với nhiều tùy chọn như gáy xoắn, đóng gáy keo...', FALSE, 1)
ON CONFLICT DO NOTHING;

-- Hiển thị thông tin sau khi tạo bảng
SELECT 'Printing tables created successfully!' as message; 