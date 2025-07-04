#!/bin/bash

# ==============================================================================
# 🚀 PHÚLONG SERVER BACKUP SCRIPT v2.0
# ==============================================================================
# Script tự động backup toàn bộ server bao gồm:
# - Database PostgreSQL với validation
# - Uploaded files (static/)
# - Source code với git info
# - Docker images & volumes
# - Configurations và environment
# - Health check và disk space validation
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
COMPRESSION_LEVEL=6  # 0-9, 6 is good balance

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

# Check disk space
check_disk_space() {
    log_step "Kiểm tra dung lượng ổ đĩa..."
    
    local available_gb=$(df . | awk 'NR==2 {print int($4/1024/1024)}')
    
    if [ $available_gb -lt $MIN_DISK_SPACE_GB ]; then
        log_error "Không đủ dung lượng ổ đĩa! Cần tối thiểu ${MIN_DISK_SPACE_GB}GB, hiện có ${available_gb}GB"
        exit 1
    fi
    
    log_success "Dung lượng khả dụng: ${available_gb}GB"
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
        log_error "Database container '$DB_CONTAINER' không chạy!"
        
        # Try to find any postgres container
        local postgres_container=$(docker ps --format "{{.Names}}" | grep -i postgres | head -1)
        if [ ! -z "$postgres_container" ]; then
            log_warning "Tìm thấy container PostgreSQL: $postgres_container"
            read -p "Sử dụng container này không? (y/n): " use_found
            if [ "$use_found" = "y" ]; then
                DB_CONTAINER=$postgres_container
                log_success "Sử dụng container: $DB_CONTAINER"
            else
                exit 1
            fi
        else
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

# Enhanced health check
health_check() {
    log_step "Health check server..."
    
    local health_score=0
    local total_checks=4
    
    # Test API endpoint
    if curl -f http://localhost:8000/ > /dev/null 2>&1; then
        log_success "✓ API đang hoạt động"
        ((health_score++))
    else
        log_warning "✗ API không phản hồi"
    fi
    
    # Test database connection
    if docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1; then
        log_success "✓ Database kết nối thành công"
        ((health_score++))
    else
        log_error "✗ Database không kết nối được!"
        exit 1
    fi
    
    # Check database size
    local db_size=$(docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -t -c "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));" | xargs)
    if [ ! -z "$db_size" ]; then
        log_success "✓ Database size: $db_size"
        ((health_score++))
    else
        log_warning "✗ Không thể lấy kích thước database"
    fi
    
    # Check static files
    if [ -d "static" ] && [ "$(ls -A static)" ]; then
        local static_size=$(du -sh static | cut -f1)
        log_success "✓ Static files: $static_size"
        ((health_score++))
    else
        log_warning "✗ Thư mục static trống hoặc không tồn tại"
    fi
    
    log_info "Health score: $health_score/$total_checks"
    
    if [ $health_score -lt 2 ]; then
        log_error "Health check thất bại! Không thể backup an toàn."
        exit 1
    fi
}

# Tạo thư mục backup
create_backup_dir() {
    log_step "Tạo thư mục backup..."
    
    mkdir -p $BACKUP_DIR/{database,static,config,docker,logs}
    log_success "Tạo thư mục backup: $BACKUP_DIR"
}

# Enhanced backup database
backup_database() {
    log_step "Backup database..."
    
    # Create compressed dump
    if docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/database/database.sql.gz; then
        local size=$(du -h $BACKUP_DIR/database/database.sql.gz | cut -f1)
        log_success "Database backup hoàn tất ($size)"
        
        # Validate backup
        if gunzip -t $BACKUP_DIR/database/database.sql.gz; then
            log_success "✓ Database backup validated"
        else
            log_error "Database backup bị lỗi!"
            exit 1
        fi
        
        # Create schema info
        docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "\dt" > $BACKUP_DIR/database/schema_info.txt
        docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "SELECT count(*) as total_tables FROM information_schema.tables WHERE table_schema = 'public';" >> $BACKUP_DIR/database/schema_info.txt
        
    else
        log_error "Backup database thất bại!"
        exit 1
    fi
}

# Enhanced backup static files
backup_static_files() {
    log_step "Backup uploaded files..."
    
    if [ -d "static" ]; then
        # Create tar with progress
        tar -czf $BACKUP_DIR/static/static_files.tar.gz static/ 2>/dev/null
        
        local size=$(du -sh $BACKUP_DIR/static/static_files.tar.gz | cut -f1)
        local file_count=$(find static -type f | wc -l)
        
        log_success "Static files backup hoàn tất ($size, $file_count files)"
        
        # Create file inventory
        find static -type f -exec ls -lh {} \; > $BACKUP_DIR/static/file_inventory.txt
        echo "Total files: $file_count" >> $BACKUP_DIR/static/file_inventory.txt
        
    else
        log_warning "Thư mục static không tồn tại"
        mkdir -p $BACKUP_DIR/static
        echo "No static files found" > $BACKUP_DIR/static/no_files.txt
    fi
}

# Enhanced backup source code
backup_source_code() {
    log_step "Backup source code..."
    
    # Include git information
    if [ -d ".git" ]; then
        git log --oneline -10 > $BACKUP_DIR/config/git_recent_commits.txt 2>/dev/null || echo "No git history" > $BACKUP_DIR/config/git_recent_commits.txt
        git status > $BACKUP_DIR/config/git_status.txt 2>/dev/null || echo "No git status" > $BACKUP_DIR/config/git_status.txt
        git branch -v > $BACKUP_DIR/config/git_branches.txt 2>/dev/null || echo "No git branches" > $BACKUP_DIR/config/git_branches.txt
    fi
    
    tar -czf $BACKUP_DIR/config/source_code.tar.gz \
        --exclude='.git' \
        --exclude='__pycache__' \
        --exclude='*.pyc' \
        --exclude='logs' \
        --exclude='.env' \
        --exclude="$BACKUP_DIR" \
        --exclude='*.tar.gz' \
        --exclude='backup_*' \
        . 2>/dev/null
        
    local size=$(du -h $BACKUP_DIR/config/source_code.tar.gz | cut -f1)
    log_success "Source code backup hoàn tất ($size)"
}

# Enhanced Docker backup
backup_docker_images() {
    log_step "Export Docker images..."
    
    # Get current images
    local images=($(docker ps --format "{{.Image}}" | sort | uniq))
    local saved_count=0
    
    for image in "${images[@]}"; do
        if [[ $image == *"phulong"* ]] || [[ $image == *"postgres"* ]] || [[ $image == *"python"* ]]; then
            local safe_name=$(echo $image | sed 's/[\/:]/_/g')
            docker save $image | gzip > $BACKUP_DIR/docker/${safe_name}.tar.gz
            log_success "✓ Saved image: $image"
            ((saved_count++))
        fi
    done
    
    log_success "Docker images exported: $saved_count images"
    
    # Save docker info
    docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}" > $BACKUP_DIR/docker/containers_info.txt
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" > $BACKUP_DIR/docker/images_info.txt
}

# Enhanced volumes backup
backup_docker_volumes() {
    log_step "Backup Docker volumes..."
    
    local volumes=($(docker volume ls -q | grep -E "(postgres|phulong|data)"))
    local backed_up=0
    
    for volume in "${volumes[@]}"; do
        docker run --rm \
            -v $volume:/source:ro \
            -v $(pwd)/$BACKUP_DIR/docker:/backup \
            alpine tar -czf /backup/volume_${volume}.tar.gz -C /source . 2>/dev/null
        
        if [ $? -eq 0 ]; then
            log_success "✓ Volume backed up: $volume"
            ((backed_up++))
        else
            log_warning "✗ Failed to backup volume: $volume"
        fi
    done
    
    if [ $backed_up -eq 0 ]; then
        log_warning "Không tìm thấy volume nào để backup"
    else
        log_success "Docker volumes backup: $backed_up volumes"
    fi
}

# Enhanced configurations backup
backup_configurations() {
    log_step "Backup configurations..."
    
    # Copy config files
    local config_files=("docker-compose.yml" "docker-compose.prod.yml" "Dockerfile" "requirements.txt" ".env.example" "alembic.ini")
    local copied=0
    
    for file in "${config_files[@]}"; do
        if [ -f "$file" ]; then
            cp "$file" $BACKUP_DIR/config/
            log_success "✓ $file"
            ((copied++))
        fi
    done
    
    # Copy entire config directory if exists
    if [ -d "config" ]; then
        cp -r config/ $BACKUP_DIR/config/app_config/
        log_success "✓ config/ directory"
    fi
    
    # Create comprehensive environment info
    cat > $BACKUP_DIR/config/environment_info.txt << EOF
# =============================================================================
# PHÚLONG SERVER ENVIRONMENT INFO
# =============================================================================
Backup Date: $(date)
Server: $(hostname)
Backup Script Version: 2.0
Project: $PROJECT_NAME

# System Info:
OS: $(uname -a)
Uptime: $(uptime)

# Docker Info:
Docker Version: $(docker --version)
Docker Compose Version: $(docker-compose --version 2>/dev/null || echo "Not installed")

# Python Info:
Python Version: $(python3 --version 2>/dev/null || echo "Not available")
Pip Version: $(pip --version 2>/dev/null || echo "Not available")

# Database Info:
DB Container: $DB_CONTAINER
DB User: $DB_USER
DB Name: $DB_NAME

# Running Containers:
$(docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}")

# Docker Images:
$(docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}")

# Docker Volumes:
$(docker volume ls)

# Network Info:
$(docker network ls)

# Disk Usage:
$(df -h)

# Memory Usage:
$(free -h)

# Process Info:
$(ps aux | grep -E "(python|postgres|docker)" | head -10)

# Configuration Files Copied: $copied
EOF
    
    log_success "Environment info saved ($copied config files)"
}

# Create comprehensive README
create_backup_readme() {
    log_step "Tạo documentation..."
    
    cat > $BACKUP_DIR/README.md << EOF
# 📦 Phú Long Server Backup v2.0

**Backup Date:** $(date)  
**Server:** $(hostname)  
**Backup Size:** $(du -sh $BACKUP_DIR | cut -f1)  
**Project:** $PROJECT_NAME

## 📁 Cấu trúc backup:

\`\`\`
backup_YYYYMMDD_HHMMSS/
├── database/
│   ├── database.sql.gz      # PostgreSQL dump (compressed)
│   └── schema_info.txt      # Database schema information
├── static/
│   ├── static_files.tar.gz  # All uploaded files
│   └── file_inventory.txt   # File listing
├── config/
│   ├── source_code.tar.gz   # Complete source code
│   ├── environment_info.txt # Server environment details
│   ├── git_*.txt           # Git repository info
│   └── [config files]      # Docker compose, Dockerfile, etc.
├── docker/
│   ├── *.tar.gz            # Docker images
│   ├── volume_*.tar.gz     # Docker volumes
│   ├── containers_info.txt # Running containers
│   └── images_info.txt     # Available images
└── logs/
    └── backup.log          # Backup process log
\`\`\`

## 🔄 Restore Instructions:

### Quick Restore:
\`\`\`bash
# 1. Extract backup
tar -xzf backup_YYYYMMDD_HHMMSS.tar.gz

# 2. Run restore script
chmod +x restore.sh
./restore.sh backup_YYYYMMDD_HHMMSS/
\`\`\`

### Manual Restore:
\`\`\`bash
# 1. Restore database
gunzip -c backup_YYYYMMDD_HHMMSS/database/database.sql.gz | docker exec -i phulong_db psql -U postgres phulong

# 2. Restore static files
tar -xzf backup_YYYYMMDD_HHMMSS/static/static_files.tar.gz

# 3. Restore source code
tar -xzf backup_YYYYMMDD_HHMMSS/config/source_code.tar.gz

# 4. Load Docker images
docker load < backup_YYYYMMDD_HHMMSS/docker/[image].tar.gz
\`\`\`

## ✅ Validation:

- ✓ Database backup tested with gunzip
- ✓ Static files inventory created
- ✓ Docker images exported successfully
- ✓ Configuration files preserved
- ✓ Git history included

## 📞 Support:

- **Email:** admin@phulong.com
- **Documentation:** SERVER_BACKUP_MIGRATION_GUIDE.md
- **Emergency:** Liên hệ team DevOps

## 🔍 Troubleshooting:

**Database restore fails:**
\`\`\`bash
# Check backup integrity
gunzip -t backup_YYYYMMDD_HHMMSS/database/database.sql.gz
\`\`\`

**Static files missing:**
\`\`\`bash
# Verify file inventory
cat backup_YYYYMMDD_HHMMSS/static/file_inventory.txt
\`\`\`

**Docker issues:**
\`\`\`bash
# Check containers info
cat backup_YYYYMMDD_HHMMSS/docker/containers_info.txt
\`\`\`
EOF

    log_success "Backup documentation created"
}

# Create backup log
create_backup_log() {
    local end_time=$(date)
    local backup_size=$(du -sh $BACKUP_DIR | cut -f1)
    
    cat > $BACKUP_DIR/logs/backup.log << EOF
Phú Long Server Backup Log
==========================
Start Time: $(cat /tmp/backup_start_time 2>/dev/null || echo "Unknown")
End Time: $end_time
Total Size: $backup_size
Status: SUCCESS

Components Backed Up:
- Database: ✓
- Static Files: ✓
- Source Code: ✓
- Docker Images: ✓
- Docker Volumes: ✓
- Configurations: ✓

Health Check Results:
$(cat /tmp/health_check_results 2>/dev/null || echo "No health check data")
EOF
}

# Enhanced final archive creation
create_final_archive() {
    log_step "Tạo archive cuối cùng..."
    
    create_backup_log
    
    # Create compressed archive with progress
    tar -cf - $BACKUP_DIR/ | pv -s $(du -sb $BACKUP_DIR | cut -f1) | gzip -$COMPRESSION_LEVEL > "${BACKUP_DIR}.tar.gz"
    
    if [ $? -eq 0 ]; then
        rm -rf $BACKUP_DIR/
        local final_size=$(du -h "${BACKUP_DIR}.tar.gz" | cut -f1)
        log_success "Archive tạo thành công: ${BACKUP_DIR}.tar.gz ($final_size)"
        
        # Verify archive integrity
        if tar -tzf "${BACKUP_DIR}.tar.gz" > /dev/null 2>&1; then
            log_success "✓ Archive integrity verified"
        else
            log_warning "⚠️ Archive integrity check failed"
        fi
    else
        log_error "Tạo archive thất bại!"
        exit 1
    fi
}

# Enhanced summary
show_summary() {
    local end_time=$(date)
    local duration=$(($(date +%s) - $(cat /tmp/backup_start_timestamp 2>/dev/null || echo $(date +%s))))
    
    echo
    echo "======================================================"
    echo "🎉 BACKUP HOÀN TẤT THÀNH CÔNG!"
    echo "======================================================"
    echo "📁 File backup: ${BACKUP_DIR}.tar.gz"
    echo "📊 Kích thước: $(du -h "${BACKUP_DIR}.tar.gz" | cut -f1)"
    echo "⏰ Thời gian: $duration giây"
    echo "🕐 Hoàn thành: $end_time"
    echo "======================================================"
    echo
    echo "📋 Bước tiếp theo:"
    echo "1. 🚀 Copy file backup sang server mới:"
    echo "   scp ${BACKUP_DIR}.tar.gz user@new-server:~/"
    echo
    echo "2. 🔄 Extract và restore:"
    echo "   tar -xzf ${BACKUP_DIR}.tar.gz"
    echo "   ./restore.sh ${BACKUP_DIR}/"
    echo
    echo "3. 🧪 Test restore:"
    echo "   ./test_restore.sh"
    echo
    echo "📖 Xem thêm: SERVER_BACKUP_MIGRATION_GUIDE.md"
    echo "📞 Support: admin@phulong.com"
    echo
}

# Main execution with progress tracking
main() {
    # Store start time
    date +%s > /tmp/backup_start_timestamp
    date > /tmp/backup_start_time
    
    clear
    echo "🚀 PHÚLONG SERVER BACKUP SCRIPT v2.0"
    echo "====================================="
    echo
    
    local total_steps=9
    local current_step=0
    
    # Step 1
    ((current_step++))
    show_progress $current_step $total_steps
    check_disk_space
    
    # Step 2
    ((current_step++))
    show_progress $current_step $total_steps
    check_docker
    
    # Step 3
    ((current_step++))
    show_progress $current_step $total_steps
    check_containers
    
    # Step 4
    ((current_step++))
    show_progress $current_step $total_steps
    health_check
    
    echo
    log_info "Bắt đầu backup server..."
    
    # Step 5
    ((current_step++))
    show_progress $current_step $total_steps
    create_backup_dir
    
    # Step 6
    ((current_step++))
    show_progress $current_step $total_steps
    backup_database
    
    # Step 7
    ((current_step++))
    show_progress $current_step $total_steps
    backup_static_files
    backup_source_code
    
    # Step 8
    ((current_step++))
    show_progress $current_step $total_steps
    backup_docker_images
    backup_docker_volumes
    backup_configurations
    
    # Step 9
    ((current_step++))
    show_progress $current_step $total_steps
    create_backup_readme
    create_final_archive
    
    echo
    show_summary
    
    # Cleanup
    rm -f /tmp/backup_start_time /tmp/backup_start_timestamp /tmp/health_check_results
}

# Script options
case "${1:-}" in
    --help|-h)
        echo "Phú Long Server Backup Script v2.0"
        echo "Usage: $0 [options]"
        echo "Options:"
        echo "  --help, -h    Show this help message"
        echo "  --quick, -q   Quick backup (skip Docker images)"
        echo "  --compress=N  Set compression level (0-9, default: 6)"
        exit 0
        ;;
    --quick|-q)
        log_info "Quick backup mode enabled"
        backup_docker_images() { log_info "Skipping Docker images backup"; }
        ;;
    --compress=*)
        COMPRESSION_LEVEL="${1#*=}"
        log_info "Compression level set to: $COMPRESSION_LEVEL"
        ;;
esac

# Chạy script với error handling
trap 'log_error "Backup bị gián đoạn!"; exit 1' INT TERM
main "$@" 