#!/bin/bash

# ==============================================================================
# 🔄 PHÚLONG SIMPLE RESTORE SCRIPT
# ==============================================================================
# Script restore đơn giản để restore:
# - Database PostgreSQL từ backup
# - Static files từ backup
# ==============================================================================

set -e  # Exit on any error

# Cấu hình
DB_CONTAINER="phulong_db"
DB_USER="postgres"
DB_NAME="phulong"
BACKUP_FILE=""
EXTRACT_DIR=""

# Màu sắc
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
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

log_step() {
    echo -e "${PURPLE}🔄 $1${NC}"
}

# Hiển thị help
show_help() {
    echo "Phú Long Simple Restore Script"
    echo "Usage: $0 <backup_file.tar.gz> [options]"
    echo
    echo "Examples:"
    echo "  $0 simple_backup_20250704_101200.tar.gz --clean"
    echo "  $0 backup.tar.gz --db-only --clean"
    echo "  $0 backup.tar.gz --static-only"
    echo "  $0 backup.tar.gz --clean --force"
    echo
    echo "Options:"
    echo "  --help, -h        Show this help"
    echo "  --db-only         Only restore database"
    echo "  --static-only     Only restore static files"
    echo "  --clean           Clean database before restore (recommended)"
    echo "  --dry-run         Show what would be restored (don't execute)"
    echo "  --force           Skip confirmations"
    echo
    echo "Notes:"
    echo "  - Database container must be running"
    echo "  - Use --clean to avoid conflicts with existing data"
    echo "  - Static files will be merged (not replaced)"
}

# Kiểm tra backup file
check_backup_file() {
    if [ -z "$BACKUP_FILE" ]; then
        log_error "Vui lòng chỉ định file backup!"
        echo "Usage: $0 <backup_file.tar.gz>"
        exit 1
    fi
    
    if [ ! -f "$BACKUP_FILE" ]; then
        log_error "File backup không tồn tại: $BACKUP_FILE"
        exit 1
    fi
    
    log_success "Tìm thấy file backup: $BACKUP_FILE"
    
    # Kiểm tra kích thước file
    local size=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
    log_info "Kích thước backup: $size"
}

# Kiểm tra Docker
check_docker() {
    log_step "Kiểm tra Docker..."
    
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
    log_step "Kiểm tra database container..."
    
    if ! docker ps | grep -q "$DB_CONTAINER"; then
        # Tự động tìm postgres container
        local postgres_container=$(docker ps --format "{{.Names}}" | grep -i postgres | head -1)
        if [ ! -z "$postgres_container" ]; then
            DB_CONTAINER=$postgres_container
            log_success "Tìm thấy PostgreSQL container: $DB_CONTAINER"
        else
            log_error "Không tìm thấy PostgreSQL container!"
            log_info "Vui lòng khởi động database container trước!"
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

# Extract backup file
extract_backup() {
    log_step "Extract backup file..."
    
    EXTRACT_DIR="restore_temp_$(date +%s)"
    mkdir -p $EXTRACT_DIR
    
    # Extract file
    if [[ "$BACKUP_FILE" == *.tar.gz ]]; then
        tar -xzf "$BACKUP_FILE" -C $EXTRACT_DIR 2>/dev/null
    elif [[ "$BACKUP_FILE" == *.tar ]]; then
        tar -xf "$BACKUP_FILE" -C $EXTRACT_DIR 2>/dev/null
    else
        log_error "Format file không được hỗ trợ! Chỉ hỗ trợ .tar.gz và .tar"
        exit 1
    fi
    
    # Tìm thư mục backup bên trong
    local backup_folder=$(find $EXTRACT_DIR -maxdepth 2 -type d -name "simple_backup_*" | head -1)
    if [ ! -z "$backup_folder" ]; then
        EXTRACT_DIR="$backup_folder"
    fi
    
    log_success "Extract thành công vào: $EXTRACT_DIR"
    
    # Hiển thị nội dung
    log_info "Nội dung backup:"
    ls -la "$EXTRACT_DIR" | grep -E "(database|static|RESTORE)" | while read line; do
        echo "  $line"
    done
}

# Clean database
clean_database() {
    log_step "Clean database trước khi restore..."
    
    # Backup database hiện tại nếu không force
    if [ "$FORCE_MODE" != "true" ]; then
        echo
        log_warning "⚠️  CẢNH BÁO: Sẽ xóa toàn bộ dữ liệu hiện tại!"
        log_info "Database sẽ được backup tự động trước khi xóa"
        read -p "Bạn có chắc chắn muốn tiếp tục? (y/N): " confirm
        if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
            log_info "Hủy clean database"
            return 1
        fi
        
        # Backup database hiện tại
        local backup_name="db_backup_before_restore_$(date +%Y%m%d_%H%M%S).sql"
        log_info "Backup database hiện tại..."
        if docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME > "$backup_name"; then
            log_success "✅ Database backup: $backup_name"
        else
            log_warning "⚠️ Không thể backup database hiện tại"
        fi
    fi
    
    # Drop và recreate database
    log_info "Drop và recreate database..."
    
    # Disconnect tất cả connections
    docker exec $DB_CONTAINER psql -U $DB_USER -d postgres -c "
        SELECT pg_terminate_backend(pid) 
        FROM pg_stat_activity 
        WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();
    " > /dev/null 2>&1 || true
    
    # Drop database
    if docker exec $DB_CONTAINER psql -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" > /dev/null 2>&1; then
        log_success "✅ Dropped database: $DB_NAME"
    else
        log_error "❌ Không thể drop database!"
        return 1
    fi
    
    # Create database
    if docker exec $DB_CONTAINER psql -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" > /dev/null 2>&1; then
        log_success "✅ Created database: $DB_NAME"
    else
        log_error "❌ Không thể tạo database!"
        return 1
    fi
}

# Restore database
restore_database() {
    log_step "Restore database..."
    
    local db_file=""
    
    # Tìm file database
    if [ -f "$EXTRACT_DIR/database.sql.gz" ]; then
        db_file="$EXTRACT_DIR/database.sql.gz"
        log_info "Tìm thấy: database.sql.gz"
    elif [ -f "$EXTRACT_DIR/database.sql" ]; then
        db_file="$EXTRACT_DIR/database.sql"
        log_info "Tìm thấy: database.sql"
    else
        log_error "Không tìm thấy file database trong backup!"
        return 1
    fi
    
    # Clean database nếu được yêu cầu
    if [ "$CLEAN_DB" = "true" ]; then
        clean_database
        if [ $? -ne 0 ]; then
            return 1
        fi
    else
        # Xác nhận restore vào database hiện tại
        if [ "$FORCE_MODE" != "true" ]; then
            echo
            log_warning "⚠️  CẢNH BÁO: Restore vào database hiện tại có thể gây conflict!"
            log_info "💡 Khuyến nghị: Sử dụng --clean để clean database trước"
            read -p "Tiếp tục restore vào database hiện tại? (y/N): " confirm
            if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
                log_info "Hủy restore database"
                return 0
            fi
        fi
    fi
    
    # Restore database
    if [[ "$db_file" == *.gz ]]; then
        # File nén
        log_info "Restore từ file nén..."
        if gunzip -c "$db_file" | docker exec -i $DB_CONTAINER psql -U $DB_USER $DB_NAME; then
            log_success "✅ Database restored thành công!"
        else
            log_error "Restore database thất bại!"
            return 1
        fi
    else
        # File thường
        log_info "Restore từ file SQL..."
        if docker exec -i $DB_CONTAINER psql -U $DB_USER $DB_NAME < "$db_file"; then
            log_success "✅ Database restored thành công!"
        else
            log_error "Restore database thất bại!"
            return 1
        fi
    fi
}

# Restore static files
restore_static_files() {
    log_step "Restore static files..."
    
    local static_file=""
    
    # Tìm file static
    if [ -f "$EXTRACT_DIR/static_files.tar.gz" ]; then
        static_file="$EXTRACT_DIR/static_files.tar.gz"
        log_info "Tìm thấy: static_files.tar.gz"
    elif [ -f "$EXTRACT_DIR/static_files.tar" ]; then
        static_file="$EXTRACT_DIR/static_files.tar"
        log_info "Tìm thấy: static_files.tar"
    elif [ -f "$EXTRACT_DIR/static_empty.txt" ]; then
        log_warning "Backup không có static files (static_empty.txt)"
        return 0
    elif [ -f "$EXTRACT_DIR/no_static.txt" ]; then
        log_warning "Backup không có static files (no_static.txt)"
        return 0
    else
        log_error "Không tìm thấy file static trong backup!"
        return 1
    fi
    
    # Backup static hiện tại nếu tồn tại
    if [ -d "static" ] && [ "$(ls -A static 2>/dev/null)" ]; then
        if [ "$FORCE_MODE" != "true" ]; then
            echo
            log_warning "⚠️  Thư mục static hiện tại sẽ được backup trước khi restore"
            read -p "Tiếp tục? (y/N): " confirm
            if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
                log_info "Hủy restore static files"
                return 0
            fi
        fi
        
        # Backup static hiện tại
        local backup_name="static_backup_$(date +%Y%m%d_%H%M%S)"
        mv static "$backup_name" 2>/dev/null || true
        log_info "Backup static hiện tại: $backup_name"
    fi
    
    # Restore static files
    if [[ "$static_file" == *.tar.gz ]]; then
        # File nén
        log_info "Extract static files từ tar.gz..."
        if tar -xzf "$static_file"; then
            local file_count=$(find static -type f 2>/dev/null | wc -l || echo "0")
            log_success "✅ Static files restored thành công! ($file_count files)"
        else
            log_error "Restore static files thất bại!"
            return 1
        fi
    else
        # File thường
        log_info "Extract static files từ tar..."
        if tar -xf "$static_file"; then
            local file_count=$(find static -type f 2>/dev/null | wc -l || echo "0")
            log_success "✅ Static files restored thành công! ($file_count files)"
        else
            log_error "Restore static files thất bại!"
            return 1
        fi
    fi
}

# Cleanup
cleanup() {
    log_step "Cleanup..."
    
    if [ ! -z "$EXTRACT_DIR" ] && [ -d "$EXTRACT_DIR" ]; then
        rm -rf "$EXTRACT_DIR"
        log_success "Cleanup hoàn tất"
    fi
}

# Hiển thị kết quả
show_summary() {
    echo
    echo "========================================"
    echo "🎉 RESTORE HOÀN TẤT!"
    echo "========================================"
    echo "📁 Backup file: $BACKUP_FILE"
    echo "🕐 Time: $(date)"
    echo "========================================"
    echo
    
    if [ "$RESTORE_DB" = "true" ]; then
        echo "✅ Database: $DB_NAME restored"
    fi
    
    if [ "$RESTORE_STATIC" = "true" ]; then
        echo "✅ Static files: static/ restored"
    fi
    
    echo
    echo "🚀 Server sẵn sàng sử dụng!"
    echo
}

# Main function
main() {
    clear
    echo "🔄 PHÚLONG SIMPLE RESTORE"
    echo "========================="
    echo "Restore từ: $BACKUP_FILE"
    echo
    
    if [ "$DRY_RUN" = "true" ]; then
        echo "🧪 DRY RUN MODE - Chỉ hiển thị, không thực thi"
        echo
    fi
    
    check_backup_file
    check_docker
    check_database
    extract_backup
    
    echo
    log_info "Bắt đầu restore..."
    
    # Restore theo options
    if [ "$RESTORE_DB" = "true" ]; then
        if [ "$DRY_RUN" = "true" ]; then
            if [ "$CLEAN_DB" = "true" ]; then
                log_info "[DRY RUN] Sẽ clean database và restore"
            else
                log_info "[DRY RUN] Sẽ restore database (có thể có conflicts)"
            fi
        else
            restore_database
        fi
    fi
    
    if [ "$RESTORE_STATIC" = "true" ]; then
        if [ "$DRY_RUN" = "true" ]; then
            log_info "[DRY RUN] Sẽ restore static files"
        else
            restore_static_files
        fi
    fi
    
    if [ "$DRY_RUN" != "true" ]; then
        show_summary
    else
        echo
        echo "🧪 DRY RUN hoàn tất - Không có thay đổi nào được thực hiện"
    fi
    
    cleanup
}

# Xử lý arguments và options
RESTORE_DB="true"
RESTORE_STATIC="true"
DRY_RUN="false"
FORCE_MODE="false"
CLEAN_DB="false"

while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            show_help
            exit 0
            ;;
        --db-only)
            RESTORE_DB="true"
            RESTORE_STATIC="false"
            log_info "Mode: Database only"
            ;;
        --static-only)
            RESTORE_DB="false"
            RESTORE_STATIC="true"
            log_info "Mode: Static files only"
            ;;
        --clean)
            CLEAN_DB="true"
            log_info "Mode: Clean database before restore"
            ;;
        --dry-run)
            DRY_RUN="true"
            log_info "Mode: Dry run"
            ;;
        --force)
            FORCE_MODE="true"
            log_info "Mode: Force (skip confirmations)"
            ;;
        -*)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
        *)
            if [ -z "$BACKUP_FILE" ]; then
                BACKUP_FILE="$1"
            else
                log_error "Too many arguments!"
                show_help
                exit 1
            fi
            ;;
    esac
    shift
done

# Kiểm tra backup file được chỉ định
if [ -z "$BACKUP_FILE" ]; then
    echo "❌ Thiếu file backup!"
    echo
    show_help
    exit 1
fi

# Chạy restore
trap 'cleanup; log_error "Restore bị gián đoạn!"; exit 1' INT TERM
main "$@" 