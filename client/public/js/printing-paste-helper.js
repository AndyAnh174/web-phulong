/**
 * Printing Paste Image Helper
 * Hỗ trợ paste ảnh trực tiếp vào content editor cho Printing
 */

class PrintingPasteHelper {
    constructor(options = {}) {
        this.apiBaseUrl = options.apiBaseUrl || '';
        this.authToken = options.authToken || '';
        this.onSuccess = options.onSuccess || (() => {});
        this.onError = options.onError || ((error) => console.error('Paste error:', error));
        this.onUploading = options.onUploading || (() => {});
        
        // Các element selector
        this.contentSelector = options.contentSelector || '#content';
        this.previewSelector = options.previewSelector || '#content-preview';
        
        this.init();
    }
    
    init() {
        this.setupPasteListener();
        this.setupDragDropListener();
    }
    
    /**
     * Setup paste listener cho textarea/content editor
     */
    setupPasteListener() {
        const contentElement = document.querySelector(this.contentSelector);
        if (!contentElement) {
            console.warn('Content element not found:', this.contentSelector);
            return;
        }
        
        contentElement.addEventListener('paste', async (event) => {
            const items = event.clipboardData?.items;
            if (!items) return;
            
            // Tìm item image trong clipboard
            let imageFile = null;
            for (let item of items) {
                if (item.type.startsWith('image/')) {
                    imageFile = item.getAsFile();
                    break;
                }
            }
            
            if (imageFile) {
                event.preventDefault(); // Ngăn paste default behavior
                await this.handleImagePaste(imageFile, contentElement);
            }
        });
    }
    
    /**
     * Setup drag & drop listener (bonus feature)
     */
    setupDragDropListener() {
        const contentElement = document.querySelector(this.contentSelector);
        if (!contentElement) return;
        
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            contentElement.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });
        
        // Highlight on drag over
        contentElement.addEventListener('dragover', () => {
            contentElement.classList.add('drag-over');
        });
        
        contentElement.addEventListener('dragleave', () => {
            contentElement.classList.remove('drag-over');
        });
        
        // Handle drop
        contentElement.addEventListener('drop', async (event) => {
            contentElement.classList.remove('drag-over');
            
            const files = event.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('image/')) {
                await this.handleImagePaste(files[0], contentElement);
            }
        });
    }
    
    /**
     * Xử lý việc paste/drop ảnh
     */
    async handleImagePaste(imageFile, contentElement) {
        try {
            this.onUploading(true);
            
            // Lưu vị trí cursor hiện tại
            const cursorPosition = contentElement.selectionStart;
            
            // Upload ảnh
            const result = await this.uploadPasteImage(imageFile);
            
            if (result.success) {
                // Chèn shortcode vào vị trí cursor
                this.insertShortcodeAtCursor(contentElement, result.shortcode, cursorPosition);
                
                // Update preview nếu có
                this.updatePreview();
                
                // Gọi callback success
                this.onSuccess(result);
                
                // Hiển thị notification
                this.showNotification('✅ Đã chèn ảnh vào nội dung!', 'success');
            }
            
        } catch (error) {
            this.onError(error);
            this.showNotification('❌ Lỗi khi upload ảnh: ' + error.message, 'error');
        } finally {
            this.onUploading(false);
        }
    }
    
    /**
     * Upload ảnh paste lên server
     */
    async uploadPasteImage(imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('alt_text', `Ảnh paste lúc ${new Date().toLocaleString('vi-VN')}`);
        
        const response = await fetch(`${this.apiBaseUrl}/api/printing/upload-content-image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.authToken}`
            },
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Upload failed');
        }
        
        const data = await response.json();
        return {
            success: true,
            message: data.message,
            image: data.image,
            shortcode: data.shortcode
        };
    }
    
    /**
     * Chèn shortcode vào vị trí cursor
     */
    insertShortcodeAtCursor(element, shortcode, position) {
        const textBefore = element.value.substring(0, position);
        const textAfter = element.value.substring(position);
        
        // Thêm line breaks cho đẹp
        const insertion = `\n${shortcode}\n`;
        element.value = textBefore + insertion + textAfter;
        
        // Di chuyển cursor về sau shortcode
        const newPosition = position + insertion.length;
        element.setSelectionRange(newPosition, newPosition);
        
        // Trigger change event để update reactive frameworks
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.focus();
    }
    
    /**
     * Update preview content (nếu có)
     */
    updatePreview() {
        const previewElement = document.querySelector(this.previewSelector);
        const contentElement = document.querySelector(this.contentSelector);
        
        if (previewElement && contentElement) {
            // Parse content và update preview
            this.parseAndUpdatePreview(contentElement.value, previewElement);
        }
    }
    
    /**
     * Parse content với shortcode và update preview
     */
    async parseAndUpdatePreview(content, previewElement) {
        try {
            // Gọi API để parse content (nếu có endpoint)
            const response = await fetch(`${this.apiBaseUrl}/api/printing/parse-content`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: JSON.stringify({ content: content })
            });
            
            if (response.ok) {
                const result = await response.json();
                previewElement.innerHTML = result.content_html;
            } else {
                // Fallback: basic parsing
                previewElement.innerHTML = this.basicParseContent(content);
            }
        } catch (error) {
            // Fallback: basic parsing
            previewElement.innerHTML = this.basicParseContent(content);
        }
    }
    
    /**
     * Basic content parsing (fallback)
     */
    basicParseContent(content) {
        // Chuyển newlines thành <br>
        return content
            .replace(/\n/g, '<br>')
            .replace(/\[image:(\d+)(\|([^\]]*))?\]/g, 
                '<div class="shortcode-placeholder">🖼️ Ảnh ID: $1 $3</div>');
    }
    
    /**
     * Hiển thị notification
     */
    showNotification(message, type = 'info') {
        // Tạo notification element
        const notification = document.createElement('div');
        notification.className = `paste-notification paste-notification-${type}`;
        notification.innerHTML = `
            <div class="paste-notification-content">
                ${message}
                <button class="paste-notification-close">&times;</button>
            </div>
        `;
        
        // Thêm styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        
        // Thêm vào DOM
        document.body.appendChild(notification);
        
        // Auto remove sau 3 giây
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
        
        // Close button
        notification.querySelector('.paste-notification-close').onclick = () => {
            notification.remove();
        };
    }
    
    /**
     * Set auth token mới
     */
    setAuthToken(token) {
        this.authToken = token;
    }
    
    /**
     * Destroy helper (cleanup)
     */
    destroy() {
        const contentElement = document.querySelector(this.contentSelector);
        if (contentElement) {
            // Remove listeners (trong thực tế cần store references để remove)
            contentElement.removeEventListener('paste', this.handlePaste);
        }
    }
}

/**
 * Utility function để tạo helper dễ dàng
 */
window.createPrintingPasteHelper = function(options) {
    return new PrintingPasteHelper(options);
};

/**
 * CSS cho drag & drop và notifications
 */
const pasteHelperCSS = `
    .drag-over {
        border: 2px dashed #2196F3 !important;
        background-color: rgba(33, 150, 243, 0.1) !important;
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .paste-notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
    }
    
    .paste-notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        margin: 0;
        line-height: 1;
    }
    
    .paste-notification-close:hover {
        opacity: 0.8;
    }
    
    .shortcode-placeholder {
        display: inline-block;
        background: #f0f0f0;
        border: 1px dashed #ccc;
        padding: 4px 8px;
        margin: 2px;
        border-radius: 3px;
        font-size: 12px;
        color: #666;
    }
`;

// Inject CSS
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = pasteHelperCSS;
    document.head.appendChild(style);
} 