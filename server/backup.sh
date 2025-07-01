#!/bin/bash

# ==============================================================================
# 🚀 PHÚLONG SERVER BACKUP SCRIPT
# ==============================================================================
# Script tự động backup toàn bộ server bao gồm:
# - Database PostgreSQL
# - Uploaded files (static/)
# - Source code
# - Docker images & volumes
# - Configurations
# ==============================================================================

set -e  # Exit on any error

# Cấu hình
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
PROJECT_NAME="phulong"
DB_CONTAINER="phulong_db"
API_CONTAINER="phulong_api"
DB_USER="postgres"
DB_NAME="phulong"

# Màu sắc cho output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Kiểm tra Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker không được cài đặt!"
        exit 1
    fi
    
    if ! docker ps &> /dev/null; then
        log_error "Docker daemon không chạy hoặc không có quyền truy cập!"
        exit 1
    fi
}

# Kiểm tra containers
check_containers() {
    if ! docker ps | grep -q "$DB_CONTAINER"; then
        log_error "Database container '$DB_CONTAINER' không chạy!"
        exit 1
    fi
    
    if ! docker ps | grep -q "$API_CONTAINER"; then
        log_warning "API container '$API_CONTAINER' không chạy!"
    fi
}

# Health check
health_check() {
    log_info "Kiểm tra tình trạng server..."
    
    # Test API endpoint
    if curl -f http://localhost:8000/ > /dev/null 2>&1; then
        log_success "API đang hoạt động"
    else
        log_warning "API không phản hồi"
    fi
    
    # Test database connection
    if docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1; then
        log_success "Database kết nối thành công"
    else
        log_error "Database không kết nối được!"
        exit 1
    fi
}

# Tạo thư mục backup
create_backup_dir() {
    mkdir -p $BACKUP_DIR
    log_success "Tạo thư mục backup: $BACKUP_DIR"
}

# Backup database
backup_database() {
    log_info "Backup database..."
    
    if docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/database.sql; then
        local size=$(du -h $BACKUP_DIR/database.sql | cut -f1)
        log_success "Database backup hoàn tất ($size)"
    else
        log_error "Backup database thất bại!"
        exit 1
    fi
}

# Backup uploaded files
backup_static_files() {
    log_info "Backup uploaded files..."
    
    if [ -d "static" ]; then
        cp -r static/ $BACKUP_DIR/
        local size=$(du -sh $BACKUP_DIR/static | cut -f1)
        log_success "Static files backup hoàn tất ($size)"
    else
        log_warning "Thư mục static không tồn tại"
        mkdir -p $BACKUP_DIR/static
    fi
}

# Backup source code
backup_source_code() {
    log_info "Backup source code..."
    
    tar -czf $BACKUP_DIR/source_code.tar.gz \
        --exclude='.git' \
        --exclude='__pycache__' \
        --exclude='*.pyc' \
        --exclude='logs' \
        --exclude='.env' \
        --exclude="$BACKUP_DIR" \
        . 2>/dev/null
        
    local size=$(du -h $BACKUP_DIR/source_code.tar.gz | cut -f1)
    log_success "Source code backup hoàn tất ($size)"
}

# Export Docker images
backup_docker_images() {
    log_info "Export Docker images..."
    
    # Get current image names
    local api_image=$(docker ps --format "table {{.Image}}" | grep -v "IMAGE" | grep -E "(phulong|fastapi|python)" | head -1)
    local db_image="postgres:15"
    
    if [ ! -z "$api_image" ]; then
        docker save $api_image > $BACKUP_DIR/phulong_api_image.tar
        log_success "API image exported: $api_image"
    else
        log_warning "Không tìm thấy API image"
    fi
    
    if docker images | grep -q "postgres.*15"; then
        docker save $db_image > $BACKUP_DIR/postgres_image.tar
        log_success "PostgreSQL image exported: $db_image"
    else
        log_warning "Không tìm thấy PostgreSQL image"
    fi
}

# Backup Docker volumes
backup_docker_volumes() {
    log_info "Backup Docker volumes..."
    
    # Find postgres volume
    local volume_name=$(docker volume ls | grep -E "(postgres|phulong)" | awk '{print $2}' | head -1)
    
    if [ ! -z "$volume_name" ]; then
        docker run --rm \
            -v $volume_name:/source:ro \
            -v $(pwd)/$BACKUP_DIR:/backup \
            alpine tar -czf /backup/postgres_volume.tar.gz -C /source . 2>/dev/null
        log_success "Docker volume backup hoàn tất: $volume_name"
    else
        log_warning "Không tìm thấy PostgreSQL volume"
    fi
}

# Backup configurations
backup_configurations() {
    log_info "Backup configurations..."
    
    # Copy important config files
    for file in docker-compose.yml Dockerfile requirements.txt .env.example; do
        if [ -f "$file" ]; then
            cp "$file" $BACKUP_DIR/
            log_success "Backup: $file"
        fi
    done
    
    # Create environment info
    cat > $BACKUP_DIR/environment_info.txt << EOF
# Server Environment Info
Backup Date: $(date)
Server: $(hostname)
Docker Version: $(docker --version)
Docker Compose Version: $(docker-compose --version 2>/dev/null || echo "Not installed")
Python Version: $(python3 --version 2>/dev/null || echo "Not available")

# Running Containers:
$(docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}")

# Docker Volumes:
$(docker volume ls)

# Disk Usage:
$(df -h)
EOF
    
    log_success "Environment info saved"
}

# Tạo README cho backup
create_backup_readme() {
    cat > $BACKUP_DIR/README.md << EOF
# 📦 Phú Long Server Backup

**Backup Date:** $(date)  
**Server:** $(hostname)  
**Backup Size:** $(du -sh $BACKUP_DIR | cut -f1)

## 📁 Nội dung backup:

- \`database.sql\` - PostgreSQL database dump
- \`static/\` - Uploaded files và static assets  
- \`source_code.tar.gz\` - Complete source code
- \`*_image.tar\` - Docker images
- \`postgres_volume.tar.gz\` - PostgreSQL data volume
- \`docker-compose.yml\` - Docker compose configuration
- \`Dockerfile\` - Docker build configuration  
- \`requirements.txt\` - Python dependencies
- \`environment_info.txt\` - Server environment details

## 🔄 Restore Instructions:

\`\`\`bash
# 1. Extract backup
tar -xzf backup_YYYYMMDD_HHMMSS.tar.gz

# 2. Run restore script
chmod +x restore.sh
./restore.sh backup_YYYYMMDD_HHMMSS.tar.gz
\`\`\`

## 📞 Support:
- Email: admin@phulong.com
- Documentation: /SERVER_BACKUP_MIGRATION_GUIDE.md
EOF
}

# Tạo file archive cuối cùng
create_final_archive() {
    log_info "Tạo archive cuối cùng..."
    
    tar -czf "${BACKUP_DIR}.tar.gz" $BACKUP_DIR/ 2>/dev/null
    
    if [ $? -eq 0 ]; then
        rm -rf $BACKUP_DIR/
        local final_size=$(du -h "${BACKUP_DIR}.tar.gz" | cut -f1)
        log_success "Archive tạo thành công: ${BACKUP_DIR}.tar.gz ($final_size)"
    else
        log_error "Tạo archive thất bại!"
        exit 1
    fi
}

# Hiển thị thống kê
show_summary() {
    echo
    echo "======================================================"
    echo "🎉 BACKUP HOÀN TẤT!"
    echo "======================================================"
    echo "📁 File backup: ${BACKUP_DIR}.tar.gz"
    echo "📊 Kích thước: $(du -h "${BACKUP_DIR}.tar.gz" | cut -f1)"
    echo "⏰ Thời gian: $(date)"
    echo "======================================================"
    echo
    echo "📋 Bước tiếp theo:"
    echo "1. Copy file backup sang server mới:"
    echo "   scp ${BACKUP_DIR}.tar.gz user@new-server:~/"
    echo
    echo "2. Chạy restore trên server mới:"
    echo "   ./restore.sh ${BACKUP_DIR}.tar.gz"
    echo
    echo "📖 Xem thêm: SERVER_BACKUP_MIGRATION_GUIDE.md"
    echo
}

# Main execution
main() {
    clear
    echo "🚀 PHÚLONG SERVER BACKUP SCRIPT"
    echo "==============================="
    echo
    
    check_docker
    check_containers
    health_check
    
    echo
    log_info "Bắt đầu backup server..."
    
    create_backup_dir
    backup_database
    backup_static_files  
    backup_source_code
    backup_docker_images
    backup_docker_volumes
    backup_configurations
    create_backup_readme
    create_final_archive
    
    show_summary
}

# Chạy script
main "$@" 