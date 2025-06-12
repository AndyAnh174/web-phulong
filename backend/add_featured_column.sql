-- Thêm trường featured vào bảng services
-- Script này sẽ thêm cột featured với giá trị mặc định là false

-- Thêm cột featured (cho phép NULL ban đầu)
ALTER TABLE services ADD COLUMN featured BOOLEAN;

-- Cập nhật tất cả các bản ghi hiện tại để có giá trị mặc định false
UPDATE services SET featured = false WHERE featured IS NULL;

-- Thiết lập NOT NULL constraint và default value
ALTER TABLE services ALTER COLUMN featured SET NOT NULL;
ALTER TABLE services ALTER COLUMN featured SET DEFAULT false;

-- Thông báo hoàn thành
SELECT 'Đã thêm thành công trường featured vào bảng services' as message; 