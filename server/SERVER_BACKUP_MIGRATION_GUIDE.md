# 🚀 **SERVER BACKUP & MIGRATION GUIDE**

Hướng dẫn đầy đủ về backup và di chuyển server Phú Long API sang môi trường mới.

---

## 📋 **CÁC PHƯƠNG ÁN BACKUP & MIGRATION**

### **1. 🐳 Docker Backup (KHUYẾN NGHỊ)**
### **2. 📁 Full Project Backup**  
### **3. ☁️ Cloud Migration**
### **4. 🔄 Database Migration Only**

---

# 🐳 **PHƯƠNG ÁN 1: DOCKER BACKUP & MIGRATION**

## **BƯỚC 1: Backup toàn bộ**

### **1.1. Tạo script backup tự động:**

```bash
# backup.sh
#!/bin/bash

# Tạo thư mục backup với timestamp
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

echo "🚀 Bắt đầu backup server..."

# 1. Backup Database
echo "📦 Backup database..."
docker exec phulong_db pg_dump -U postgres phulong > $BACKUP_DIR/database.sql

# 2. Backup uploaded files
echo "📁 Backup uploaded files..."
cp -r static/ $BACKUP_DIR/

# 3. Backup toàn bộ source code
echo "💾 Backup source code..."
tar -czf $BACKUP_DIR/source_code.tar.gz \
  --exclude='.git' \
  --exclude='__pycache__' \
  --exclude='*.pyc' \
  --exclude='logs' \
  --exclude='.env' \
  .

# 4. Export Docker images
echo "🐳 Export Docker images..."
docker save phulong_api:latest > $BACKUP_DIR/phulong_api_image.tar
docker save postgres:15 > $BACKUP_DIR/postgres_image.tar

# 5. Backup Docker volumes
echo "💿 Backup Docker volumes..."
docker run --rm -v server_postgres_data:/source:ro -v $(pwd)/$BACKUP_DIR:/backup alpine \
  tar -czf /backup/postgres_volume.tar.gz -C /source .

# 6. Backup configuration
echo "⚙️ Backup configurations..."
cp docker-compose.yml $BACKUP_DIR/
cp Dockerfile $BACKUP_DIR/
cp requirements.txt $BACKUP_DIR/

# 7. Tạo tệp archive cuối cùng
echo "📦 Tạo archive cuối cùng..."
tar -czf "${BACKUP_DIR}.tar.gz" $BACKUP_DIR/
rm -rf $BACKUP_DIR/

echo "✅ Backup hoàn tất: ${BACKUP_DIR}.tar.gz"
```

### **1.2. Chạy backup:**

```bash
# Cho phép thực thi script
chmod +x backup.sh

# Chạy backup
./backup.sh
```

---

## **BƯỚC 2: Di chuyển sang server mới**

### **2.1. Tạo script restore:**

```bash
# restore.sh
#!/bin/bash

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "❌ Vui lòng chỉ định file backup!"
    echo "Sử dụng: ./restore.sh backup_20241220_143000.tar.gz"
    exit 1
fi

echo "🔄 Bắt đầu restore từ $BACKUP_FILE..."

# 1. Giải nén backup
tar -xzf $BACKUP_FILE
BACKUP_DIR=${BACKUP_FILE%.tar.gz}

# 2. Stop các containers cũ (nếu có)
echo "⏹️ Stop containers cũ..."
docker-compose down -v

# 3. Load Docker images
echo "🐳 Load Docker images..."
docker load < $BACKUP_DIR/phulong_api_image.tar
docker load < $BACKUP_DIR/postgres_image.tar

# 4. Restore source code
echo "💾 Restore source code..."
tar -xzf $BACKUP_DIR/source_code.tar.gz

# 5. Restore static files
echo "📁 Restore static files..."
rm -rf static/
cp -r $BACKUP_DIR/static/ .

# 6. Restore configurations
echo "⚙️ Restore configurations..."
cp $BACKUP_DIR/docker-compose.yml .
cp $BACKUP_DIR/Dockerfile .
cp $BACKUP_DIR/requirements.txt .

# 7. Start containers
echo "🚀 Start containers..."
docker-compose up -d

# Đợi database khởi động
echo "⏳ Đợi database khởi động..."
sleep 10

# 8. Restore database
echo "📦 Restore database..."
docker exec -i phulong_db psql -U postgres -d phulong < $BACKUP_DIR/database.sql

# 9. Restore Docker volume
echo "💿 Restore Docker volume (nếu cần)..."
# docker run --rm -v server_postgres_data:/target -v $(pwd)/$BACKUP_DIR:/backup alpine \
#   tar -xzf /backup/postgres_volume.tar.gz -C /target

echo "✅ Restore hoàn tất!"
echo "🌐 Server đang chạy tại: http://localhost:8000"

# Cleanup
rm -rf $BACKUP_DIR/
```

### **2.2. Sử dụng trên server mới:**

```bash
# 1. Copy file backup sang server mới
scp backup_20241220_143000.tar.gz user@new-server:/home/user/

# 2. SSH vào server mới
ssh user@new-server

# 3. Cài đặt Docker & Docker Compose (nếu chưa có)
sudo apt update
sudo apt install docker.io docker-compose -y
sudo usermod -aG docker $USER

# 4. Upload script restore
chmod +x restore.sh

# 5. Chạy restore
./restore.sh backup_20241220_143000.tar.gz
```

---

# 📁 **PHƯƠNG ÁN 2: FULL PROJECT BACKUP**

## **2.1. Script backup đơn giản:**

```bash
# simple_backup.sh
#!/bin/bash

BACKUP_NAME="phulong_backup_$(date +%Y%m%d_%H%M%S)"

echo "📦 Tạo backup: $BACKUP_NAME"

# Backup database
docker exec phulong_db pg_dump -U postgres phulong > database_backup.sql

# Tạo archive toàn bộ project
tar -czf "${BACKUP_NAME}.tar.gz" \
  --exclude='.git' \
  --exclude='__pycache__' \
  --exclude='*.pyc' \
  --exclude='logs/*.log' \
  .

echo "✅ Backup hoàn tất: ${BACKUP_NAME}.tar.gz"
```

## **2.2. Restore trên server mới:**

```bash
# 1. Giải nén project
tar -xzf phulong_backup_20241220_143000.tar.gz

# 2. Cài đặt dependencies
pip install -r requirements.txt

# 3. Setup PostgreSQL database
sudo -u postgres createdb phulong
psql -U postgres -d phulong < database_backup.sql

# 4. Cập nhật config database
# Edit config/database.py với thông tin DB mới

# 5. Chạy server
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

# ☁️ **PHƯƠNG ÁN 3: CLOUD MIGRATION**

## **3.1. Backup lên Google Drive/Dropbox:**

```bash
# install_cloud_backup.sh
#!/bin/bash

# Cài đặt rclone cho cloud sync
curl https://rclone.org/install.sh | sudo bash

# Config cloud (chạy 1 lần)
# rclone config

echo "☁️ Backup lên cloud..."

# Tạo backup
./backup.sh

# Upload lên cloud
BACKUP_FILE=$(ls backup_*.tar.gz | head -1)
rclone copy $BACKUP_FILE googledrive:/server_backups/
# hoặc: rclone copy $BACKUP_FILE dropbox:/server_backups/

echo "✅ Đã upload $BACKUP_FILE lên cloud!"
```

## **3.2. Auto backup hằng ngày:**

```bash
# Thêm vào crontab
crontab -e

# Backup hằng ngày lúc 2:00 AM
0 2 * * * /path/to/backup.sh && rclone copy backup_*.tar.gz googledrive:/server_backups/
```

---

# 🔄 **PHƯƠNG ÁN 4: DATABASE MIGRATION ONLY**

## **4.1. Export data:**

```bash
# Export tất cả tables
docker exec phulong_db pg_dump -U postgres --data-only phulong > data_only.sql

# Export schema only
docker exec phulong_db pg_dump -U postgres --schema-only phulong > schema_only.sql

# Export specific tables
docker exec phulong_db pg_dump -U postgres -t users -t services -t images phulong > important_tables.sql
```

## **4.2. Import vào database mới:**

```bash
# Tạo database mới
createdb new_phulong

# Import schema trước
psql -U postgres -d new_phulong < schema_only.sql

# Import data
psql -U postgres -d new_phulong < data_only.sql
```

---

# 🔧 **SCRIPTS TIỆN ÍCH**

## **Auto Backup Script với Cleanup:**

```bash
# auto_backup_cleanup.sh
#!/bin/bash

# Cấu hình
MAX_BACKUPS=5  # Giữ tối đa 5 backup
BACKUP_DIR="/backups"

mkdir -p $BACKUP_DIR
cd $BACKUP_DIR

# Tạo backup mới
./backup.sh

# Cleanup backup cũ (giữ lại $MAX_BACKUPS file mới nhất)
ls -t backup_*.tar.gz | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -f

echo "🧹 Cleaned up old backups, kept $MAX_BACKUPS latest"
```

## **Health Check trước khi backup:**

```bash
# health_check.sh
#!/bin/bash

echo "🔍 Kiểm tra tình trạng server..."

# Check containers
if ! docker ps | grep -q "phulong_api"; then
    echo "❌ API container không chạy!"
    exit 1
fi

if ! docker ps | grep -q "phulong_db"; then
    echo "❌ Database container không chạy!"
    exit 1
fi

# Check API response
if ! curl -f http://localhost:8000/ > /dev/null 2>&1; then
    echo "❌ API không phản hồi!"
    exit 1
fi

# Check database connection
if ! docker exec phulong_db psql -U postgres -d phulong -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Database không kết nối được!"
    exit 1
fi

echo "✅ Server khỏe mạnh, có thể backup!"
```

---

# 🚀 **QUICK START - MIGRATION CHECKLIST**

## **Server cũ:**

```bash
# 1. Health check
./health_check.sh

# 2. Backup
./backup.sh

# 3. Upload backup file
scp backup_20241220_143000.tar.gz user@new-server:/home/user/
```

## **Server mới:**

```bash
# 1. Cài đặt Docker
sudo apt update && sudo apt install docker.io docker-compose -y

# 2. Download restore script
wget https://gist.githubusercontent.com/.../restore.sh
chmod +x restore.sh

# 3. Restore
./restore.sh backup_20241220_143000.tar.gz

# 4. Verify
curl http://localhost:8000/
```

---

# ⚙️ **CẤU HÌNH NÂNG CAO**

## **Environment Variables cho server mới:**

```bash
# .env.new_server
DATABASE_HOST=localhost  # hoặc IP database mới
BACKEND_URL=https://new-domain.com
UPLOAD_DIR=static/uploads

# Copy và edit
cp .env .env.backup
cp .env.new_server .env
```

## **Nginx Config cho server mới:**

```nginx
# /etc/nginx/sites-available/phulong-api
server {
    listen 80;
    server_name your-new-domain.com;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /static/ {
        alias /home/user/phulong/static/;
    }
}
```

---

# 📋 **TROUBLESHOOTING**

## **Lỗi thường gặp:**

### **1. Database connection failed:**
```bash
# Check PostgreSQL service
sudo systemctl status postgresql
sudo systemctl start postgresql

# Check Docker volume
docker volume ls
docker volume inspect server_postgres_data
```

### **2. Permission denied cho static files:**
```bash
sudo chown -R $USER:$USER static/
chmod -R 755 static/
```

### **3. Port already in use:**
```bash
# Check port usage
sudo netstat -tulnp | grep :8000

# Kill process if needed
sudo kill -9 $(lsof -t -i:8000)
```

---

**🎯 KHUYẾN NGHỊ: Sử dụng Phương án 1 (Docker Backup) để migration dễ dàng và an toàn nhất!** 