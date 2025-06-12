-- Script để thêm trường tùy chỉnh vào bảng images
-- Bạn có thể sửa đổi theo nhu cầu

-- Ví dụ 1: Thêm trường priority (độ ưu tiên)
ALTER TABLE images ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;

-- Ví dụ 2: Thêm trường is_featured (ảnh nổi bật)
ALTER TABLE images ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Ví dụ 3: Thêm trường tags (các thẻ tag)
ALTER TABLE images ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Ví dụ 4: Thêm trường description (mô tả chi tiết)
ALTER TABLE images ADD COLUMN IF NOT EXISTS description TEXT;

-- Ví dụ 5: Thêm trường sort_order (thứ tự sắp xếp)
ALTER TABLE images ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Tạo index cho các trường mới (tùy chọn)
CREATE INDEX IF NOT EXISTS idx_images_priority ON images(priority);
CREATE INDEX IF NOT EXISTS idx_images_is_featured ON images(is_featured);
CREATE INDEX IF NOT EXISTS idx_images_sort_order ON images(sort_order);

-- Kiểm tra cấu trúc bảng sau khi thêm
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'images' 
ORDER BY ordinal_position; 