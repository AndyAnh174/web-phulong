-- Fix database schema
-- Thêm cột total_price vào bảng orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_price FLOAT;

-- Kiểm tra xem cột fullname có tồn tại không trước khi rename
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'fullname') THEN
        ALTER TABLE contacts RENAME COLUMN fullname TO name;
    END IF;
END $$;

-- Kiểm tra xem cột is_read có tồn tại không trước khi thay đổi
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'is_read') THEN
        -- Thêm cột status mới
        ALTER TABLE contacts ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'new';
        
        -- Update data từ is_read sang status
        UPDATE contacts SET status = CASE 
            WHEN is_read = true THEN 'read' 
            ELSE 'new' 
        END;
        
        -- Xóa cột is_read cũ
        ALTER TABLE contacts DROP COLUMN is_read;
    END IF;
END $$; 