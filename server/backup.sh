#!/bin/bash

# ==============================================================================
# 🚀 PHÚLONG SERVER BACKUP SCRIPT v2.1
# ==============================================================================
# Script tự động backup toàn bộ server bao gồm:
# - Database PostgreSQL 
# - Uploaded files (static/)
# - Source code
# - Docker images & volumes
# - Configurations
# ==============================================================================

set -e  # Exit on any error

# Cấu hình mặc định
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
PROJECT_NAME="phulong"
DB_CONTAINER="phulong_db"
API_CONTAINER="phulong_api"
DB_USER="postgres"
DB_NAME="phulong"
MIN_DISK_SPACE_GB=2  # Tối thiểu 2GB free space

# Màu sắc cho output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

log_step() {
    echo -e "${PURPLE}🔄 $1${NC}"
}

# Check disk space (simplified for cross-platform)
check_disk_space() {
    log_step "Kiểm tra dung lượng ổ đĩa..."
    
    if command -v df &> /dev/null; then
        local available_gb=$(df . | awk 'NR==2 {print int($4/1024/1024)}' 2>/dev/null || echo "10")
        
        if [ $available_gb -lt $MIN_DISK_SPACE_GB ]; then
            log_warning "Cảnh báo: Có thể không đủ dung lượng ổ đĩa!"
        else
            log_success "Dung lượng khả dụng: ${available_gb}GB"
        fi
    else
        log_warning "Không thể kiểm tra dung lượng ổ đĩa"
    fi
}

# Kiểm tra Docker
check_docker() {
    log_step "Kiểm tra Docker environment..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker không được cài đặt!"
        exit 1
    fi
    
    if ! docker ps &> /dev/null; then
        log_error "Docker daemon không chạy hoặc không có quyền truy cập!"
        exit 1
    fi
    
    log_success "Docker đang hoạt động"
}

# Kiểm tra containers
check_containers() {
    log_step "Kiểm tra containers..."
    
    if ! docker ps | grep -q "$DB_CONTAINER"; then
        log_warning "Database container '$DB_CONTAINER' không chạy!"
        
        # Try to find any postgres container
        local postgres_container=$(docker ps --format "{{.Names}}" | grep -i postgres | head -1)
        if [ ! -z "$postgres_container" ]; then
            log_warning "Tìm thấy container PostgreSQL: $postgres_container"
            DB_CONTAINER=$postgres_container
            log_success "Sử dụng container: $DB_CONTAINER"
        else
            log_error "Không tìm thấy PostgreSQL container nào đang chạy!"
            exit 1
        fi
    else
        log_success "Database container hoạt động: $DB_CONTAINER"
    fi
    
    if ! docker ps | grep -q "$API_CONTAINER"; then
        log_warning "API container '$API_CONTAINER' không chạy!"
    else
        log_success "API container hoạt động: $API_CONTAINER"
    fi
}

# Health check (simplified)
health_check() {
    log_step "Health check server..."
    
    # Test database connection
    if docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1; then
        log_success "✓ Database kết nối thành công"
    else
        log_error "✗ Database không kết nối được!"
        exit 1
    fi
    
    # Check database size
    local db_size=$(docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -t -c "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));" 2>/dev/null | xargs || echo "Unknown")
    log_success "✓ Database size: $db_size"
    
    # Check static files
    if [ -d "static" ] && [ "$(ls -A static 2>/dev/null)" ]; then
        log_success "✓ Static files tồn tại"
    else
        log_warning "✗ Thư mục static trống hoặc không tồn tại"
    fi
}

# Tạo thư mục backup
create_backup_dir() {
    log_step "Tạo thư mục backup..."
    
    mkdir -p $BACKUP_DIR/{database,static,config,docker,logs}
    log_success "Tạo thư mục backup: $BACKUP_DIR"
}

# Backup database
backup_database() {
    log_step "Backup database..."
    
    # Create dump
    if docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/database/database.sql; then
        # Compress if gzip is available
        if command -v gzip &> /dev/null; then
            gzip $BACKUP_DIR/database/database.sql
            local size=$(ls -lh $BACKUP_DIR/database/database.sql.gz 2>/dev/null | awk '{print $5}' || echo "Unknown")
            log_success "Database backup hoàn tất ($size)"
        else
            local size=$(ls -lh $BACKUP_DIR/database/database.sql 2>/dev/null | awk '{print $5}' || echo "Unknown")
            log_success "Database backup hoàn tất ($size)"
        fi
        
        # Create schema info
        docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "\dt" > $BACKUP_DIR/database/schema_info.txt 2>/dev/null || echo "Schema info not available" > $BACKUP_DIR/database/schema_info.txt
        
    else
        log_error "Backup database thất bại!"
        exit 1
    fi
}

# Backup static files
backup_static_files() {
    log_step "Backup uploaded files..."
    
    if [ -d "static" ]; then
        # Create tar
        tar -czf $BACKUP_DIR/static/static_files.tar.gz static/ 2>/dev/null || tar -cf $BACKUP_DIR/static/static_files.tar static/ 2>/dev/null
        
        if [ -f "$BACKUP_DIR/static/static_files.tar.gz" ] || [ -f "$BACKUP_DIR/static/static_files.tar" ]; then
            local file_count=$(find static -type f 2>/dev/null | wc -l || echo "0")
            log_success "Static files backup hoàn tất ($file_count files)"
            
            # Create file inventory
            find static -type f 2>/dev/null > $BACKUP_DIR/static/file_inventory.txt || echo "File listing not available" > $BACKUP_DIR/static/file_inventory.txt
        else
            log_warning "Không thể tạo archive cho static files"
        fi
    else
        log_warning "Thư mục static không tồn tại"
        mkdir -p $BACKUP_DIR/static
        echo "No static files found" > $BACKUP_DIR/static/no_files.txt
    fi
}

# Backup source code
backup_source_code() {
    log_step "Backup source code..."
    
    # Include git information if available
    if [ -d ".git" ]; then
        git log --oneline -10 > $BACKUP_DIR/config/git_recent_commits.txt 2>/dev/null || echo "No git history" > $BACKUP_DIR/config/git_recent_commits.txt
        git status > $BACKUP_DIR/config/git_status.txt 2>/dev/null || echo "No git status" > $BACKUP_DIR/config/git_status.txt
        git branch -v > $BACKUP_DIR/config/git_branches.txt 2>/dev/null || echo "No git branches" > $BACKUP_DIR/config/git_branches.txt
    fi
    
    # Create source archive
    tar -czf $BACKUP_DIR/config/source_code.tar.gz \
        --exclude='.git' \
        --exclude='__pycache__' \
        --exclude='*.pyc' \
        --exclude='logs' \
        --exclude='.env' \
        --exclude="$BACKUP_DIR" \
        --exclude='*.tar.gz' \
        --exclude='backup_*' \
        . 2>/dev/null || tar -cf $BACKUP_DIR/config/source_code.tar \
        --exclude='.git' \
        --exclude='__pycache__' \
        --exclude='*.pyc' \
        --exclude='logs' \
        --exclude='.env' \
        --exclude="$BACKUP_DIR" \
        --exclude='*.tar.gz' \
        --exclude='backup_*' \
        . 2>/dev/null
        
    if [ -f "$BACKUP_DIR/config/source_code.tar.gz" ] || [ -f "$BACKUP_DIR/config/source_code.tar" ]; then
        log_success "Source code backup hoàn tất"
    else
        log_warning "Không thể tạo source code backup"
    fi
}

# Docker backup (simplified)
backup_docker_images() {
    log_step "Export Docker images..."
    
    # Get current images
    local images=($(docker ps --format "{{.Image}}" | sort | uniq))
    local saved_count=0
    
    for image in "${images[@]}"; do
        if [[ $image == *"phulong"* ]] || [[ $image == *"postgres"* ]]; then
            local safe_name=$(echo $image | sed 's/[\/:]/_/g')
            if docker save $image | gzip > $BACKUP_DIR/docker/${safe_name}.tar.gz 2>/dev/null; then
                log_success "✓ Saved image: $image"
                ((saved_count++))
            elif docker save $image > $BACKUP_DIR/docker/${safe_name}.tar 2>/dev/null; then
                log_success "✓ Saved image: $image (uncompressed)"
                ((saved_count++))
            else
                log_warning "✗ Failed to save image: $image"
            fi
        fi
    done
    
    log_success "Docker images exported: $saved_count images"
    
    # Save docker info
    docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" > $BACKUP_DIR/docker/containers_info.txt 2>/dev/null || echo "Container info not available" > $BACKUP_DIR/docker/containers_info.txt
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" > $BACKUP_DIR/docker/images_info.txt 2>/dev/null || echo "Images info not available" > $BACKUP_DIR/docker/images_info.txt
}

# Backup configurations
backup_configurations() {
    log_step "Backup configurations..."
    
    # Copy config files
    local config_files=("docker-compose.yml" "docker-compose.prod.yml" "Dockerfile" "requirements.txt" ".env.example" "alembic.ini")
    local copied=0
    
    for file in "${config_files[@]}"; do
        if [ -f "$file" ]; then
            cp "$file" $BACKUP_DIR/config/ 2>/dev/null && {
                log_success "✓ $file"
                ((copied++))
            }
        fi
    done
    
    # Copy entire config directory if exists
    if [ -d "config" ]; then
        cp -r config/ $BACKUP_DIR/config/app_config/ 2>/dev/null && log_success "✓ config/ directory"
    fi
    
    # Create environment info
    cat > $BACKUP_DIR/config/environment_info.txt << EOF
# =============================================================================
# PHÚLONG SERVER ENVIRONMENT INFO
# =============================================================================
Backup Date: $(date)
Server: $(hostname 2>/dev/null || echo "Unknown")
Backup Script Version: 2.1
Project: $PROJECT_NAME

# System Info:
OS: $(uname -a 2>/dev/null || echo "Unknown OS")

# Docker Info:
Docker Version: $(docker --version 2>/dev/null || echo "Docker not available")

# Database Info:
DB Container: $DB_CONTAINER
DB User: $DB_USER
DB Name: $DB_NAME

# Configuration Files Copied: $copied
EOF
    
    log_success "Environment info saved ($copied config files)"
}

# Create backup README
create_backup_readme() {
    log_step "Tạo documentation..."
    
    cat > $BACKUP_DIR/README.md << EOF
# 📦 Phú Long Server Backup v2.1

**Backup Date:** $(date)  
**Project:** $PROJECT_NAME

## 📁 Cấu trúc backup:

\`\`\`
backup_YYYYMMDD_HHMMSS/
├── database/
│   ├── database.sql[.gz]    # PostgreSQL dump
│   └── schema_info.txt      # Database schema information
├── static/
│   ├── static_files.tar[.gz] # All uploaded files
│   └── file_inventory.txt    # File listing
├── config/
│   ├── source_code.tar[.gz]  # Complete source code
│   ├── environment_info.txt  # Server environment details
│   ├── git_*.txt            # Git repository info
│   └── [config files]       # Docker compose, Dockerfile, etc.
├── docker/
│   ├── *.tar[.gz]           # Docker images
│   ├── containers_info.txt  # Running containers
│   └── images_info.txt      # Available images
└── README.md               # This file
\`\`\`

## 🔄 Restore Instructions:

### Database Restore:
\`\`\`bash
# If compressed:
gunzip database.sql.gz
docker exec -i phulong_db psql -U postgres phulong < database.sql

# If not compressed:
docker exec -i phulong_db psql -U postgres phulong < database.sql
\`\`\`

### Static Files Restore:
\`\`\`bash
tar -xzf static_files.tar.gz
# or
tar -xf static_files.tar
\`\`\`

### Source Code Restore:
\`\`\`bash
tar -xzf source_code.tar.gz
# or  
tar -xf source_code.tar
\`\`\`

### Docker Images Restore:
\`\`\`bash
docker load < image_name.tar.gz
# or
docker load < image_name.tar
\`\`\`
EOF

    log_success "Backup documentation created"
}

# Create final archive (optional)
create_final_archive() {
    log_step "Tạo archive cuối cùng..."
    
    # Create archive
    if tar -czf "${BACKUP_DIR}.tar.gz" $BACKUP_DIR/ 2>/dev/null; then
        rm -rf $BACKUP_DIR/
        local final_size=$(ls -lh "${BACKUP_DIR}.tar.gz" 2>/dev/null | awk '{print $5}' || echo "Unknown")
        log_success "Archive tạo thành công: ${BACKUP_DIR}.tar.gz ($final_size)"
    elif tar -cf "${BACKUP_DIR}.tar" $BACKUP_DIR/ 2>/dev/null; then
        rm -rf $BACKUP_DIR/
        local final_size=$(ls -lh "${BACKUP_DIR}.tar" 2>/dev/null | awk '{print $5}' || echo "Unknown")
        log_success "Archive tạo thành công: ${BACKUP_DIR}.tar ($final_size)"
    else
        log_warning "Không thể tạo archive, giữ nguyên thư mục: $BACKUP_DIR/"
    fi
}

# Show summary
show_summary() {
    local end_time=$(date)
    
    echo
    echo "======================================================"
    echo "🎉 BACKUP HOÀN TẤT THÀNH CÔNG!"
    echo "======================================================"
    if [ -f "${BACKUP_DIR}.tar.gz" ]; then
        echo "📁 File backup: ${BACKUP_DIR}.tar.gz"
        echo "📊 Kích thước: $(ls -lh "${BACKUP_DIR}.tar.gz" | awk '{print $5}')"
    elif [ -f "${BACKUP_DIR}.tar" ]; then
        echo "📁 File backup: ${BACKUP_DIR}.tar"
        echo "📊 Kích thước: $(ls -lh "${BACKUP_DIR}.tar" | awk '{print $5}')"
    else
        echo "📁 Thư mục backup: $BACKUP_DIR/"
    fi
    echo "🕐 Hoàn thành: $end_time"
    echo "======================================================"
    echo
    echo "📋 Bước tiếp theo:"
    echo "1. Copy backup sang server mới"
    echo "2. Extract và restore theo hướng dẫn trong README.md"
    echo
}

# Main execution
main() {
    clear
    echo "🚀 PHÚLONG SERVER BACKUP SCRIPT v2.1"
    echo "====================================="
    echo
    
    check_disk_space
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
    backup_configurations
    create_backup_readme
    create_final_archive
    
    show_summary
}

# Script options
case "${1:-}" in
    --help|-h)
        echo "Phú Long Server Backup Script v2.1"
        echo "Usage: $0 [options]"
        echo "Options:"
        echo "  --help, -h    Show this help message"
        echo "  --no-archive  Don't create final archive"
        exit 0
        ;;
    --no-archive)
        log_info "No archive mode enabled"
        create_final_archive() { log_info "Skipping archive creation"; }
        ;;
esac

# Chạy script với error handling
trap 'log_error "Backup bị gián đoạn!"; exit 1' INT TERM
main "$@" 