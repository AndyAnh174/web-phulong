#!/bin/bash

# ==============================================================================
# 🚀 PHÚLONG SIMPLE BACKUP SCRIPT
# ==============================================================================
# Script backup đơn giản chỉ backup:
# - Database PostgreSQL 
# - Static files (uploaded images)
# ==============================================================================

set -e  # Exit on any error

# Cấu hình
BACKUP_DIR="simple_backup_$(date +%Y%m%d_%H%M%S)"
DB_CONTAINER="phulong_db"
DB_USER="postgres"
DB_NAME="phulong"

# Màu sắc
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

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
    log_info "Kiểm tra Docker..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker không được cài đặt!"
        exit 1
    fi
    
    if ! docker ps &> /dev/null; then
        log_error "Docker không chạy!"
        exit 1
    fi
    
    log_success "Docker OK"
}

# Kiểm tra database container
check_database() {
    log_info "Kiểm tra database container..."
    
    if ! docker ps | grep -q "$DB_CONTAINER"; then
        # Tự động tìm postgres container
        local postgres_container=$(docker ps --format "{{.Names}}" | grep -i postgres | head -1)
        if [ ! -z "$postgres_container" ]; then
            DB_CONTAINER=$postgres_container
            log_success "Tìm thấy PostgreSQL container: $DB_CONTAINER"
        else
            log_error "Không tìm thấy PostgreSQL container!"
            exit 1
        fi
    else
        log_success "Database container: $DB_CONTAINER"
    fi
    
    # Test kết nối
    if docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1; then
        log_success "Database kết nối thành công"
    else
        log_error "Không thể kết nối database!"
        exit 1
    fi
}

# Tạo thư mục backup
create_backup_dir() {
    log_info "Tạo thư mục backup..."
    mkdir -p $BACKUP_DIR
    log_success "Tạo thư mục: $BACKUP_DIR"
}

# Backup database
backup_database() {
    log_info "Backup database..."
    
    if docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/database.sql; then
        # Nén file nếu có gzip
        if command -v gzip &> /dev/null; then
            gzip $BACKUP_DIR/database.sql
            local size=$(ls -lh $BACKUP_DIR/database.sql.gz 2>/dev/null | awk '{print $5}' || echo "Unknown")
            log_success "Database backup: database.sql.gz ($size)"
        else
            local size=$(ls -lh $BACKUP_DIR/database.sql 2>/dev/null | awk '{print $5}' || echo "Unknown")
            log_success "Database backup: database.sql ($size)"
        fi
    else
        log_error "Backup database thất bại!"
        exit 1
    fi
}

# Backup static files
backup_static_files() {
    log_info "Backup static files..."
    
    if [ -d "static" ]; then
        # Đếm số files
        local file_count=$(find static -type f 2>/dev/null | wc -l || echo "0")
        
        if [ "$file_count" -gt 0 ]; then
            # Nén static folder
            if tar -czf $BACKUP_DIR/static_files.tar.gz static/ 2>/dev/null; then
                local size=$(ls -lh $BACKUP_DIR/static_files.tar.gz 2>/dev/null | awk '{print $5}' || echo "Unknown")
                log_success "Static files backup: static_files.tar.gz ($size, $file_count files)"
            elif tar -cf $BACKUP_DIR/static_files.tar static/ 2>/dev/null; then
                local size=$(ls -lh $BACKUP_DIR/static_files.tar 2>/dev/null | awk '{print $5}' || echo "Unknown")
                log_success "Static files backup: static_files.tar ($size, $file_count files)"
            else
                log_warning "Không thể tạo archive cho static files"
            fi
        else
            log_warning "Thư mục static trống"
            echo "Empty static folder" > $BACKUP_DIR/static_empty.txt
        fi
    else
        log_warning "Không tìm thấy thư mục static"
        echo "No static folder found" > $BACKUP_DIR/no_static.txt
    fi
}

# Tạo file hướng dẫn restore
create_restore_guide() {
    log_info "Tạo hướng dẫn restore..."
    
    cat > $BACKUP_DIR/RESTORE_GUIDE.txt << EOF
=============================================================================
PHÚ LONG - HƯỚNG DẪN RESTORE BACKUP
=============================================================================
Backup Date: $(date)
Database Container: $DB_CONTAINER

🔄 RESTORE DATABASE:
-------------------
# Nếu file nén (.gz):
gunzip database.sql.gz
docker exec -i $DB_CONTAINER psql -U $DB_USER $DB_NAME < database.sql

# Nếu file thường (.sql):
docker exec -i $DB_CONTAINER psql -U $DB_USER $DB_NAME < database.sql

🖼️ RESTORE STATIC FILES:
------------------------
# Nếu file nén (.tar.gz):
tar -xzf static_files.tar.gz

# Nếu file thường (.tar):
tar -xf static_files.tar

📋 GHI CHÚ:
-----------
- Backup chỉ chứa database data và static files
- Đảm bảo database container đang chạy trước khi restore
- Backup static files sẽ tạo lại thư mục static/

🆘 HỖ TRỢ:
-----------
Nếu có vấn đề, liên hệ team kỹ thuật.
=============================================================================
EOF

    log_success "Tạo hướng dẫn restore: RESTORE_GUIDE.txt"
}

# Tạo archive cuối cùng (optional)
create_final_archive() {
    log_info "Tạo archive cuối cùng..."
    
    if tar -czf "${BACKUP_DIR}.tar.gz" $BACKUP_DIR/ 2>/dev/null; then
        rm -rf $BACKUP_DIR/
        local final_size=$(ls -lh "${BACKUP_DIR}.tar.gz" 2>/dev/null | awk '{print $5}' || echo "Unknown")
        log_success "Archive: ${BACKUP_DIR}.tar.gz ($final_size)"
        echo "${BACKUP_DIR}.tar.gz"
    elif tar -cf "${BACKUP_DIR}.tar" $BACKUP_DIR/ 2>/dev/null; then
        rm -rf $BACKUP_DIR/
        local final_size=$(ls -lh "${BACKUP_DIR}.tar" 2>/dev/null | awk '{print $5}' || echo "Unknown")
        log_success "Archive: ${BACKUP_DIR}.tar ($final_size)"
        echo "${BACKUP_DIR}.tar"
    else
        log_warning "Không thể tạo archive, giữ nguyên folder: $BACKUP_DIR/"
        echo "$BACKUP_DIR/"
    fi
}

# Hiển thị kết quả
show_summary() {
    echo
    echo "========================================"
    echo "🎉 BACKUP HOÀN TẤT!"
    echo "========================================"
    
    if [ -f "${BACKUP_DIR}.tar.gz" ]; then
        echo "📁 File: ${BACKUP_DIR}.tar.gz"
        echo "📊 Size: $(ls -lh "${BACKUP_DIR}.tar.gz" | awk '{print $5}')"
    elif [ -f "${BACKUP_DIR}.tar" ]; then
        echo "📁 File: ${BACKUP_DIR}.tar"
        echo "📊 Size: $(ls -lh "${BACKUP_DIR}.tar" | awk '{print $5}')"
    else
        echo "📁 Folder: $BACKUP_DIR/"
    fi
    
    echo "🕐 Time: $(date)"
    echo "========================================"
    echo
    echo "📋 Nội dung backup:"
    echo "✅ Database: $DB_NAME"
    echo "✅ Static files: static/"
    echo
    echo "🔄 Để restore, xem file RESTORE_GUIDE.txt"
    echo
}

# Main function
main() {
    clear
    echo "🚀 PHÚLONG SIMPLE BACKUP"
    echo "========================"
    echo "Backup: Database + Static files"
    echo
    
    check_docker
    check_database
    create_backup_dir
    backup_database
    backup_static_files
    create_restore_guide
    create_final_archive
    show_summary
}

# Xử lý options
case "${1:-}" in
    --help|-h)
        echo "Phú Long Simple Backup Script"
        echo "Usage: $0 [options]"
        echo "Options:"
        echo "  --help, -h       Show this help"
        echo "  --no-archive     Don't create final archive"
        echo
        echo "Backup includes:"
        echo "  - PostgreSQL database"
        echo "  - Static files (images, uploads)"
        exit 0
        ;;
    --no-archive)
        log_info "No archive mode"
        create_final_archive() { echo "$BACKUP_DIR/"; }
        ;;
esac

# Chạy backup
trap 'log_error "Backup bị gián đoạn!"; exit 1' INT TERM
main "$@" 