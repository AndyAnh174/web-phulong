#!/bin/bash

# ==============================================================================
# 🔄 PHÚLONG SERVER RESTORE SCRIPT v2.0
# ==============================================================================
# Script tự động restore toàn bộ server từ backup bao gồm:
# - Database PostgreSQL với validation
# - Uploaded files (static/)
# - Source code với rollback
# - Docker images & volumes
# - Configurations
# - Health check và rollback capabilities
# ==============================================================================

set -e  # Exit on any error

# Cấu hình mặc định
PROJECT_NAME="phulong"
DB_CONTAINER="phulong_db"
API_CONTAINER="phulong_api"
DB_USER="postgres"
DB_NAME="phulong"
BACKUP_DIR=""
RESTORE_MODE="full"  # full, database-only, files-only
DRY_RUN=false

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

log_critical() {
    echo -e "${RED}🚨 CRITICAL: $1${NC}"
}

# Show progress bar
show_progress() {
    local current=$1
    local total=$2
    local progress=$((current * 100 / total))
    local bar_length=50
    local filled_length=$((progress * bar_length / 100))
    
    printf "\r${CYAN}Progress: ["
    for ((i=0; i<filled_length; i++)); do printf "█"; done
    for ((i=filled_length; i<bar_length; i++)); do printf "░"; done
    printf "] %d%% (%d/%d)${NC}" $progress $current $total
}

# Show usage
show_usage() {
    echo "Phú Long Server Restore Script v2.0"
    echo "Usage: $0 <backup_directory> [options]"
    echo
    echo "Arguments:"
    echo "  backup_directory    Path to extracted backup directory"
    echo
    echo "Options:"
    echo "  --mode=MODE         Restore mode: full, database-only, files-only"
    echo "  --dry-run          Show what would be restored without doing it"
    echo "  --force            Skip confirmation prompts"
    echo "  --db-container=NAME Override database container name"
    echo "  --help, -h         Show this help message"
    echo
    echo "Examples:"
    echo "  $0 backup_20241201_140000/"
    echo "  $0 backup_20241201_140000/ --mode=database-only"
    echo "  $0 backup_20241201_140000/ --dry-run"
}

# Parse arguments
parse_arguments() {
    if [ $# -eq 0 ]; then
        log_error "Thiếu đường dẫn backup directory!"
        show_usage
        exit 1
    fi
    
    BACKUP_DIR="$1"
    shift
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --mode=*)
                RESTORE_MODE="${1#*=}"
                ;;
            --dry-run)
                DRY_RUN=true
                ;;
            --force)
                FORCE=true
                ;;
            --db-container=*)
                DB_CONTAINER="${1#*=}"
                ;;
            --help|-h)
                show_usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
        shift
    done
}

# Validate backup directory
validate_backup() {
    log_step "Validating backup directory..."
    
    if [ ! -d "$BACKUP_DIR" ]; then
        log_error "Backup directory không tồn tại: $BACKUP_DIR"
        exit 1
    fi
    
    # Check for required files based on restore mode
    case $RESTORE_MODE in
        "full"|"database-only")
            if [ ! -f "$BACKUP_DIR/database/database.sql.gz" ]; then
                log_error "Database backup file không tồn tại!"
                exit 1
            fi
            
            # Test database file integrity
            if ! gunzip -t "$BACKUP_DIR/database/database.sql.gz" 2>/dev/null; then
                log_error "Database backup file bị hỏng!"
                exit 1
            fi
            log_success "✓ Database backup file hợp lệ"
            ;;
    esac
    
    case $RESTORE_MODE in
        "full"|"files-only")
            if [ ! -f "$BACKUP_DIR/static/static_files.tar.gz" ] && [ ! -f "$BACKUP_DIR/static/no_files.txt" ]; then
                log_warning "Static files backup không tồn tại"
            else
                log_success "✓ Static files backup found"
            fi
            
            if [ ! -f "$BACKUP_DIR/config/source_code.tar.gz" ]; then
                log_error "Source code backup không tồn tại!"
                exit 1
            fi
            log_success "✓ Source code backup found"
            ;;
    esac
    
    # Read backup info
    if [ -f "$BACKUP_DIR/README.md" ]; then
        local backup_date=$(grep "Backup Date:" "$BACKUP_DIR/README.md" | cut -d: -f2- | xargs)
        local backup_size=$(grep "Backup Size:" "$BACKUP_DIR/README.md" | cut -d: -f2 | xargs)
        log_info "Backup Date: $backup_date"
        log_info "Backup Size: $backup_size"
    fi
    
    log_success "Backup validation completed"
}

# Pre-restore checks
pre_restore_checks() {
    log_step "Pre-restore system checks..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker không được cài đặt!"
        exit 1
    fi
    
    if ! docker ps &> /dev/null; then
        log_error "Docker daemon không chạy!"
        exit 1
    fi
    
    # Check disk space
    local required_space_gb=5
    local available_gb=$(df . | awk 'NR==2 {print int($4/1024/1024)}')
    
    if [ $available_gb -lt $required_space_gb ]; then
        log_error "Không đủ dung lượng! Cần ${required_space_gb}GB, có ${available_gb}GB"
        exit 1
    fi
    
    log_success "System checks passed"
}

# Create backup of current state
create_current_backup() {
    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY RUN] Would create backup of current state"
        return
    fi
    
    log_step "Creating backup of current state for rollback..."
    
    local rollback_dir="rollback_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$rollback_dir"
    
    # Backup current database if container exists
    if docker ps -q -f name=$DB_CONTAINER | grep -q .; then
        log_info "Backing up current database..."
        docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME | gzip > "$rollback_dir/current_database.sql.gz"
        log_success "✓ Current database backed up"
    fi
    
    # Backup current static files
    if [ -d "static" ]; then
        tar -czf "$rollback_dir/current_static.tar.gz" static/ 2>/dev/null
        log_success "✓ Current static files backed up"
    fi
    
    # Backup current source (selective)
    tar -czf "$rollback_dir/current_source.tar.gz" \
        --exclude='.git' \
        --exclude='__pycache__' \
        --exclude='*.pyc' \
        --exclude='logs' \
        --exclude='backup_*' \
        --exclude='rollback_*' \
        . 2>/dev/null
    log_success "✓ Current source backed up"
    
    echo "$rollback_dir" > /tmp/phulong_rollback_dir
    log_success "Rollback backup created: $rollback_dir"
}

# Stop services safely
stop_services() {
    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY RUN] Would stop services"
        return
    fi
    
    log_step "Stopping services for restore..."
    
    # Stop API container if running
    if docker ps -q -f name=$API_CONTAINER | grep -q .; then
        docker stop $API_CONTAINER
        log_success "✓ API container stopped"
    fi
    
    # Don't stop database container - we need it for restore
    log_success "Services prepared for restore"
}

# Restore database
restore_database() {
    if [ "$RESTORE_MODE" != "full" ] && [ "$RESTORE_MODE" != "database-only" ]; then
        return
    fi
    
    log_step "Restoring database..."
    
    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY RUN] Would restore database from: $BACKUP_DIR/database/database.sql.gz"
        return
    fi
    
    # Ensure database container is running
    if ! docker ps -q -f name=$DB_CONTAINER | grep -q .; then
        log_error "Database container '$DB_CONTAINER' is not running!"
        log_info "Please start the database container first"
        exit 1
    fi
    
    # Drop existing database and recreate
    log_info "Recreating database..."
    docker exec $DB_CONTAINER psql -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;"
    docker exec $DB_CONTAINER psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;"
    
    # Restore database
    log_info "Importing database dump..."
    gunzip -c "$BACKUP_DIR/database/database.sql.gz" | docker exec -i $DB_CONTAINER psql -U $DB_USER $DB_NAME
    
    if [ $? -eq 0 ]; then
        log_success "✓ Database restored successfully"
        
        # Verify restore
        local table_count=$(docker exec $DB_CONTAINER psql -U $DB_USER $DB_NAME -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
        log_success "✓ Tables restored: $table_count"
    else
        log_error "Database restore failed!"
        exit 1
    fi
}

# Restore static files
restore_static_files() {
    if [ "$RESTORE_MODE" != "full" ] && [ "$RESTORE_MODE" != "files-only" ]; then
        return
    fi
    
    log_step "Restoring static files..."
    
    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY RUN] Would restore static files"
        return
    fi
    
    # Remove existing static directory
    if [ -d "static" ]; then
        rm -rf static/
        log_info "✓ Removed existing static files"
    fi
    
    # Restore static files if they exist
    if [ -f "$BACKUP_DIR/static/static_files.tar.gz" ]; then
        tar -xzf "$BACKUP_DIR/static/static_files.tar.gz"
        
        local file_count=$(find static -type f 2>/dev/null | wc -l)
        log_success "✓ Static files restored: $file_count files"
    else
        mkdir -p static
        log_warning "No static files to restore"
    fi
}

# Restore source code
restore_source_code() {
    if [ "$RESTORE_MODE" != "full" ] && [ "$RESTORE_MODE" != "files-only" ]; then
        return
    fi
    
    log_step "Restoring source code..."
    
    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY RUN] Would restore source code"
        return
    fi
    
    # Create temporary extraction directory
    local temp_dir="temp_source_restore"
    mkdir -p "$temp_dir"
    
    # Extract source code to temp directory
    tar -xzf "$BACKUP_DIR/config/source_code.tar.gz" -C "$temp_dir"
    
    # Selectively restore source files (preserve some current files)
    local preserve_files=(".env" "logs/" "backup_*" "rollback_*")
    
    # Copy everything except preserved files
    for item in "$temp_dir"/*; do
        local basename=$(basename "$item")
        local should_preserve=false
        
        for preserve in "${preserve_files[@]}"; do
            if [[ "$basename" == $preserve ]]; then
                should_preserve=true
                break
            fi
        done
        
        if [ "$should_preserve" = false ]; then
            cp -r "$item" .
        fi
    done
    
    # Cleanup
    rm -rf "$temp_dir"
    
    log_success "✓ Source code restored (preserved local configs)"
}

# Restore Docker components
restore_docker() {
    if [ "$RESTORE_MODE" != "full" ]; then
        return
    fi
    
    log_step "Restoring Docker components..."
    
    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY RUN] Would restore Docker images and volumes"
        return
    fi
    
    # Load Docker images
    if [ -d "$BACKUP_DIR/docker" ]; then
        local loaded=0
        for image_file in "$BACKUP_DIR/docker"/*.tar.gz; do
            if [ -f "$image_file" ] && [[ "$(basename $image_file)" != volume_* ]]; then
                log_info "Loading image: $(basename $image_file)"
                gunzip -c "$image_file" | docker load
                ((loaded++))
            fi
        done
        
        if [ $loaded -gt 0 ]; then
            log_success "✓ Docker images loaded: $loaded"
        fi
        
        # Note: Volume restore is complex and risky, skipping for safety
        log_warning "Docker volumes not restored (requires manual intervention)"
    fi
}

# Start services
start_services() {
    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY RUN] Would start services"
        return
    fi
    
    log_step "Starting services..."
    
    # Start API container if it was stopped
    if docker ps -a -q -f name=$API_CONTAINER | grep -q .; then
        docker start $API_CONTAINER
        log_success "✓ API container started"
        
        # Wait for service to be ready
        log_info "Waiting for API to be ready..."
        local attempts=0
        while [ $attempts -lt 30 ]; do
            if curl -f http://localhost:8000/ > /dev/null 2>&1; then
                log_success "✓ API is responding"
                break
            fi
            sleep 2
            ((attempts++))
        done
        
        if [ $attempts -eq 30 ]; then
            log_warning "API not responding after 60 seconds"
        fi
    fi
}

# Post-restore verification
verify_restore() {
    log_step "Verifying restore..."
    
    local health_score=0
    local total_checks=4
    
    # Check database
    if docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1; then
        log_success "✓ Database connectivity"
        ((health_score++))
    else
        log_error "✗ Database connection failed"
    fi
    
    # Check database content
    local table_count=$(docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs || echo "0")
    if [ "$table_count" -gt 0 ]; then
        log_success "✓ Database tables: $table_count"
        ((health_score++))
    else
        log_error "✗ No database tables found"
    fi
    
    # Check static files
    if [ -d "static" ]; then
        local file_count=$(find static -type f 2>/dev/null | wc -l)
        log_success "✓ Static files: $file_count"
        ((health_score++))
    else
        log_warning "✗ Static directory missing"
    fi
    
    # Check API response
    if curl -f http://localhost:8000/ > /dev/null 2>&1; then
        log_success "✓ API responding"
        ((health_score++))
    else
        log_warning "✗ API not responding"
    fi
    
    log_info "Health score: $health_score/$total_checks"
    
    if [ $health_score -ge 3 ]; then
        log_success "✅ RESTORE SUCCESSFUL!"
        return 0
    else
        log_error "⚠️ RESTORE COMPLETED WITH ISSUES"
        return 1
    fi
}

# Rollback function
rollback() {
    local rollback_dir=$(cat /tmp/phulong_rollback_dir 2>/dev/null)
    
    if [ -z "$rollback_dir" ] || [ ! -d "$rollback_dir" ]; then
        log_error "No rollback data available!"
        return 1
    fi
    
    log_warning "🔄 PERFORMING ROLLBACK..."
    
    # Rollback database
    if [ -f "$rollback_dir/current_database.sql.gz" ]; then
        log_info "Rolling back database..."
        docker exec $DB_CONTAINER psql -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;"
        docker exec $DB_CONTAINER psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;"
        gunzip -c "$rollback_dir/current_database.sql.gz" | docker exec -i $DB_CONTAINER psql -U $DB_USER $DB_NAME
        log_success "✓ Database rolled back"
    fi
    
    # Rollback static files
    if [ -f "$rollback_dir/current_static.tar.gz" ]; then
        rm -rf static/
        tar -xzf "$rollback_dir/current_static.tar.gz"
        log_success "✓ Static files rolled back"
    fi
    
    # Rollback source code
    if [ -f "$rollback_dir/current_source.tar.gz" ]; then
        # Preserve the rollback directory itself
        mv "$rollback_dir" "${rollback_dir}_temp"
        tar -xzf "${rollback_dir}_temp/current_source.tar.gz"
        mv "${rollback_dir}_temp" "$rollback_dir"
        log_success "✓ Source code rolled back"
    fi
    
    log_success "🔄 ROLLBACK COMPLETED!"
}

# Cleanup
cleanup() {
    log_step "Cleaning up temporary files..."
    
    # Remove temporary files
    rm -f /tmp/phulong_rollback_dir
    
    # Ask about rollback data
    if [ "$FORCE" != true ] && [ -d "rollback_*" 2>/dev/null ]; then
        echo
        read -p "Remove rollback data? (y/n): " remove_rollback
        if [ "$remove_rollback" = "y" ]; then
            rm -rf rollback_*
            log_success "✓ Rollback data removed"
        else
            log_info "Rollback data preserved for future use"
        fi
    fi
}

# Show restore summary
show_summary() {
    local end_time=$(date)
    local duration=$(($(date +%s) - $(cat /tmp/restore_start_timestamp 2>/dev/null || echo $(date +%s))))
    
    echo
    echo "======================================================"
    echo "🎉 RESTORE HOÀN TẤT!"
    echo "======================================================"
    echo "📁 Backup source: $BACKUP_DIR"
    echo "🔄 Restore mode: $RESTORE_MODE"
    echo "⏰ Duration: $duration seconds"
    echo "🕐 Completed: $end_time"
    echo "======================================================"
    echo
    echo "📋 Next steps:"
    echo "1. 🧪 Test your application thoroughly"
    echo "2. 🔍 Check logs for any issues"
    echo "3. 🗑️ Clean up rollback data if everything works"
    echo
    echo "📞 Support: admin@phulong.com"
    echo
}

# Error handler
error_handler() {
    local exit_code=$?
    log_critical "Restore failed with exit code: $exit_code"
    
    if [ "$FORCE" != true ]; then
        echo
        read -p "Perform rollback? (y/n): " do_rollback
        if [ "$do_rollback" = "y" ]; then
            rollback
        fi
    fi
    
    exit $exit_code
}

# Main execution
main() {
    # Store start time
    date +%s > /tmp/restore_start_timestamp
    
    clear
    echo "🔄 PHÚLONG SERVER RESTORE SCRIPT v2.0"
    echo "======================================"
    echo
    
    # Parse and validate arguments
    parse_arguments "$@"
    
    log_info "Restore mode: $RESTORE_MODE"
    log_info "Backup source: $BACKUP_DIR"
    if [ "$DRY_RUN" = true ]; then
        log_warning "DRY RUN MODE - No changes will be made"
    fi
    echo
    
    # Pre-flight checks
    validate_backup
    pre_restore_checks
    
    # Confirmation
    if [ "$FORCE" != true ] && [ "$DRY_RUN" != true ]; then
        echo
        log_warning "⚠️  CẢNH BÁO: Quá trình restore sẽ ghi đè dữ liệu hiện tại!"
        read -p "Bạn có chắc chắn muốn tiếp tục? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            log_info "Restore cancelled by user"
            exit 0
        fi
    fi
    
    local total_steps=8
    local current_step=0
    
    # Step 1: Create rollback backup
    ((current_step++))
    show_progress $current_step $total_steps
    create_current_backup
    
    # Step 2: Stop services
    ((current_step++))
    show_progress $current_step $total_steps
    stop_services
    
    # Step 3: Restore database
    ((current_step++))
    show_progress $current_step $total_steps
    restore_database
    
    # Step 4: Restore static files
    ((current_step++))
    show_progress $current_step $total_steps
    restore_static_files
    
    # Step 5: Restore source code
    ((current_step++))
    show_progress $current_step $total_steps
    restore_source_code
    
    # Step 6: Restore Docker components
    ((current_step++))
    show_progress $current_step $total_steps
    restore_docker
    
    # Step 7: Start services
    ((current_step++))
    show_progress $current_step $total_steps
    start_services
    
    # Step 8: Verify restore
    ((current_step++))
    show_progress $current_step $total_steps
    
    echo
    if verify_restore; then
        show_summary
        cleanup
    else
        log_error "Restore completed with issues!"
        if [ "$FORCE" != true ]; then
            read -p "Perform rollback? (y/n): " do_rollback
            if [ "$do_rollback" = "y" ]; then
                rollback
            fi
        fi
    fi
    
    # Cleanup
    rm -f /tmp/restore_start_timestamp
}

# Set up error handling
trap error_handler ERR
trap 'log_error "Restore interrupted!"; exit 1' INT TERM

# Show help if no arguments
if [ $# -eq 0 ]; then
    show_usage
    exit 1
fi

# Run main function
main "$@"
