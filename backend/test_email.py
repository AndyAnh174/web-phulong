"""
Đây là file test để kiểm tra chức năng gửi email.
Chạy file này trực tiếp để test việc gửi email đến admin và khách hàng.
"""

import os
import sys
import logging
from datetime import datetime

# Thêm thư mục gốc vào sys.path để import các module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Thiết lập logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Import các module cần thiết
from utils.email import send_email
from config.settings import settings

def test_send_direct_email():
    """Test gửi email trực tiếp đến khách hàng và admin."""
    
    # Email của khách hàng (thay đổi thành email thực)
    customer_email = "anhvietho113@gmail.com"
    
    # Sử dụng tài khoản SMTP làm email admin
    admin_email = settings.SMTP_USERNAME  # hovietanh147@gmail.com
    
    # Nội dung HTML đơn giản
    html_content = f"""
    <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                }}
                .container {{
                    width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    border: 1px solid #ddd;
                }}
                .header {{
                    background-color: #3f51b5;
                    color: white;
                    padding: 10px;
                    text-align: center;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Email Test</h1>
                </div>
                <div class="content">
                    <p>Đây là email test để kiểm tra chức năng gửi email.</p>
                    <p>Thời gian: {datetime.now().strftime('%H:%M:%S %d/%m/%Y')}</p>
                    <p><strong>Email này được gửi đến chính tài khoản SMTP để kiểm tra khả năng tự gửi.</strong></p>
                </div>
            </div>
        </body>
    </html>
    """
    
    # Gửi email cho khách hàng
    logging.info(f"Đang gửi email đến khách hàng: {customer_email}")
    customer_result = send_email(
        customer_email,
        "Email Test - Khách hàng",
        html_content
    )
    logging.info(f"Kết quả gửi email đến khách hàng: {'Thành công' if customer_result else 'Thất bại'}")
    
    # Gửi email cho admin (là chính tài khoản SMTP)
    logging.info(f"Đang gửi email đến admin (tự gửi): {admin_email}")
    admin_result = send_email(
        admin_email,
        "Email Test - Tự gửi cho SMTP_USERNAME",
        html_content
    )
    logging.info(f"Kết quả gửi email đến admin (tự gửi): {'Thành công' if admin_result else 'Thất bại'}")
    
    return customer_result, admin_result

if __name__ == "__main__":
    print("Bắt đầu test gửi email...")
    print(f"SMTP Server: {settings.SMTP_SERVER}")
    print(f"SMTP Port: {settings.SMTP_PORT}")
    print(f"SMTP Username: {settings.SMTP_USERNAME}")
    
    customer_success, admin_success = test_send_direct_email()
    
    if customer_success and admin_success:
        print("Test thành công! Đã gửi email đến cả khách hàng và admin (tự gửi).")
    elif customer_success:
        print("Chỉ gửi được email đến khách hàng, không gửi được đến admin (tự gửi).")
    elif admin_success:
        print("Chỉ gửi được email đến admin (tự gửi), không gửi được đến khách hàng.")
    else:
        print("Test thất bại! Không gửi được email đến cả khách hàng và admin (tự gửi).") 