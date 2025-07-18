-- Migration: Thêm SEO fields vào bảng blogs
-- Chạy file này để thêm các trường tối ưu SEO

-- Thêm các cột SEO vào bảng blogs
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255);
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS meta_keywords VARCHAR(500);

-- Tạo index cho SEO fields để tăng hiệu suất search
CREATE INDEX IF NOT EXISTS idx_blogs_meta_title ON blogs(meta_title);
CREATE INDEX IF NOT EXISTS idx_blogs_meta_keywords ON blogs(meta_keywords);

-- Thêm comment cho các cột mới
COMMENT ON COLUMN blogs.meta_title IS 'Tiêu đề SEO (meta title) - tối đa 255 ký tự';
COMMENT ON COLUMN blogs.meta_description IS 'Mô tả SEO (meta description) - tối đa 160 ký tự khuyến nghị';
COMMENT ON COLUMN blogs.meta_keywords IS 'Từ khóa SEO - phân cách bằng dấu phẩy';

-- Thông báo hoàn thành
SELECT 'Đã thêm thành công các trường SEO vào bảng blogs' as message; 