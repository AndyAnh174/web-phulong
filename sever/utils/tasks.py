from datetime import datetime
from sqlalchemy.orm import Session
from models.models import AdminAccessLog
import logging
from config.database import get_db

def cleanup_expired_access_logs():
    """
    Hàm xóa các bản ghi access log đã hết hạn (> 3 tháng)
    Hàm này được thiết kế để chạy định kỳ qua cron job
    """
    try:
        # Lấy thời gian hiện tại
        now = datetime.utcnow()
        
        # Lấy DB session
        db: Session = next(get_db())
        
        # Tìm và xóa các bản ghi đã hết hạn
        expired_logs = db.query(AdminAccessLog).filter(AdminAccessLog.expires_at < now).all()
        
        if expired_logs:
            count = len(expired_logs)
            # Xóa các log hết hạn
            for log in expired_logs:
                db.delete(log)
            
            # Lưu thay đổi
            db.commit()
            logging.info(f"Đã xóa {count} bản ghi log admin hết hạn")
        else:
            logging.info("Không có bản ghi log admin nào hết hạn")
            
    except Exception as e:
        logging.error(f"Lỗi khi xóa bản ghi log hết hạn: {str(e)}") 