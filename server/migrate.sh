#!/bin/bash

echo "🐳 Container Migration Script"
echo "================================="

# Kiểm tra đang chạy trong container không
if [ -f "/.dockerenv" ]; then
    echo "✅ Đang chạy trong Docker container"
else
    echo "⚠️  Warning: Không phát hiện Docker container"
fi

echo ""
echo "🔄 Chạy migration cho Services Image Upload..."
echo ""

# Chạy migration script
python3 scripts/migrate_services_images.py

echo ""
echo "🎯 Hoàn thành migration script!"
echo ""
echo "📝 Lưu ý: Hãy restart server để áp dụng thay đổi"
echo "   docker-compose restart" 