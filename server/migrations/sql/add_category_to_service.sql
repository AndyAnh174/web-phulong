-- Thêm cột category vào bảng services
ALTER TABLE services ADD COLUMN IF NOT EXISTS category VARCHAR; 