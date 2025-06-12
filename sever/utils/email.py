import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config.settings import settings
import logging
import traceback
from datetime import datetime

# Thiết lập logging để đảm bảo ghi log đúng cách
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Ở đầu file, sau các import
ADMIN_EMAIL_TEMPLATE = """
<html>
    <head>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
            
            body {{ 
                font-family: 'Roboto', Arial, sans-serif; 
                line-height: 1.6; 
                background-color: #f5f5f5;
                margin: 0;
                padding: 0;
                color: #333;
            }}
            .container {{ 
                width: 100%; 
                max-width: 650px; 
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }}
            .header {{ 
                background: linear-gradient(135deg, #FF5722, #FF9800);
                padding: 30px 20px; 
                text-align: center;
                color: white;
            }}
            .header h1 {{
                margin: 0;
                font-size: 28px;
                font-weight: 700;
                letter-spacing: 1px;
            }}
            .content {{ 
                padding: 30px 25px;
            }}
            .highlight {{
                color: #FF5722;
                font-weight: 500;
            }}
            .order-details {{ 
                margin: 25px 0;
                border: 1px solid #e0e0e0;
                border-radius: 6px;
                overflow: hidden;
            }}
            .order-details h2 {{ 
                background-color: #f5f5f5;
                margin: 0;
                padding: 15px 20px;
                font-size: 20px;
                color: #FF5722;
                border-bottom: 1px solid #e0e0e0;
            }}
            .order-details table {{ 
                width: 100%; 
                border-collapse: collapse; 
            }}
            .order-details th, .order-details td {{ 
                padding: 12px 20px; 
                text-align: left; 
                border-bottom: 1px solid #e0e0e0;
            }}
            .order-details th {{ 
                background-color: #fafafa; 
                font-weight: 500;
                width: 40%;
            }}
            .order-details tr:last-child th,
            .order-details tr:last-child td {{
                border-bottom: none;
            }}
            .order-id {{
                color: #FF5722;
                font-weight: 700;
                font-size: 18px;
            }}
            .service-name {{
                color: #FF5722;
                font-weight: 500;
                font-size: 16px;
            }}
            .quantity {{
                font-weight: 500;
                font-size: 16px;
            }}
            .footer {{ 
                background-color: #FF5722; 
                padding: 15px; 
                text-align: center; 
                font-size: 14px;
                color: rgba(255,255,255,0.8);
            }}
            .company-name {{
                font-weight: 700;
                color: white;
            }}
            .call-to-action {{
                background-color: #FF5722;
                color: white;
                padding: 10px 20px;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                border-radius: 4px;
                font-weight: bold;
                margin-top: 20px;
            }}
            .call-to-action:hover {{
                background-color: #E64A19;
            }}
            .admin-notice {{
                font-weight: bold;
                background-color: #FFF3E0;
                padding: 15px;
                border-radius: 4px;
                margin-top: 20px;
                border-left: 4px solid #FF5722;
            }}
            .customer-info {{
                background-color: #E3F2FD;
                border-left: 4px solid #2196F3;
                padding: 15px;
                border-radius: 4px;
                margin-bottom: 20px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔔 THÔNG BÁO - ĐƠN HÀNG MỚI</h1>
            </div>
            <div class="content">
                <p><strong>Xin chào Admin,</strong></p>
                <p>Hệ thống vừa nhận được một đơn hàng mới từ khách hàng <span class="highlight">{customer_name}</span> vào lúc <span class="highlight">{order_date}</span>.</p>
                
                <div class="customer-info">
                    <h3 style="margin-top: 0; color: #2196F3;">Thông tin khách hàng:</h3>
                    <p><strong>Tên:</strong> {customer_name}<br>
                    <strong>Email:</strong> {customer_email}<br>
                    <strong>SĐT:</strong> {customer_phone}</p>
                </div>
                
                <div class="order-details">
                    <h2>Chi tiết đơn hàng #{order_id}</h2>
                    <table>
                        <tr>
                            <th>Dịch vụ</th>
                            <td><span class="service-name">{service_name}</span></td>
                        </tr>
                        <tr>
                            <th>Số lượng</th>
                            <td><span class="quantity">{quantity}</span></td>
                        </tr>
                        <tr>
                            <th>Kích thước</th>
                            <td>{size}</td>
                        </tr>
                        <tr>
                            <th>Chất liệu</th>
                            <td>{material}</td>
                        </tr>
                        <tr>
                            <th>Ghi chú</th>
                            <td>{notes}</td>
                        </tr>
                        <tr>
                            <th>Tệp thiết kế</th>
                            <td>{design_file}</td>
                        </tr>
                    </table>
                </div>
                
                <div class="admin-notice">
                    <p>🔹 Đơn hàng này đã được tự động xác nhận và gửi thông báo đến khách hàng.</p>
                    <p>🔹 Vui lòng kiểm tra và liên hệ lại với khách hàng để xác nhận chi tiết đơn hàng.</p>
                </div>
                
                <p style="text-align: center; margin-top: 30px;">
                    <a href="{admin_url}" class="call-to-action">XEM CHI TIẾT ĐƠN HÀNG</a>
                </p>
            </div>
            <div class="footer">
                <p>© {year} <span class="company-name">CÔNG TY TNHH THIẾT KẾ VÀ IN ẤN PHÚ LONG</span></p>
                <p>Email nội bộ - Không chia sẻ</p>
            </div>
        </div>
    </body>
</html>
"""

def send_email(to_email: str, subject: str, html_content: str):
    """
    Gửi email HTML đến địa chỉ nhận.
    Trả về True nếu gửi thành công, False nếu thất bại.
    """
    logging.info(f"Chuẩn bị gửi email đến: {to_email}")
    try:
        # Tạo message
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = settings.EMAIL_FROM
        message["To"] = to_email
        
        # Thêm nội dung HTML
        html_part = MIMEText(html_content, "html")
        message.attach(html_part)
        
        # Ghi log thông tin SMTP
        logging.info(f"Kết nối SMTP - Server: {settings.SMTP_SERVER}, Port: {settings.SMTP_PORT}")
        logging.info(f"Tài khoản SMTP: {settings.SMTP_USERNAME}")
        
        # Gửi email
        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
            server.set_debuglevel(1)  # Bật debug để xem các thông tin trao đổi SMTP
            logging.info(f"Bắt đầu kết nối TLS với máy chủ SMTP")
            server.starttls()
            logging.info(f"Đăng nhập vào máy chủ SMTP")
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            logging.info(f"Đăng nhập thành công, bắt đầu gửi email từ {settings.SMTP_USERNAME} đến {to_email}")
            server.sendmail(settings.SMTP_USERNAME, to_email, message.as_string())
            logging.info(f"Email đã được gửi thành công đến {to_email}")
        
        return True
    except Exception as e:
        logging.error(f"Lỗi khi gửi email đến {to_email}: {str(e)}")
        logging.error(f"Chi tiết lỗi: {traceback.format_exc()}")
        return False

def send_order_confirmation(order, service):
    """
    Gửi email xác nhận đơn hàng đến khách hàng và thông báo đơn hàng mới đến admin.
    """
    logging.info(f"Xử lý gửi email xác nhận đơn hàng #{order.id} cho khách hàng {order.customer_name}")
    
    # Kiểm tra thông tin
    if not order.customer_email:
        logging.error(f"Không thể gửi email: Email khách hàng không được cung cấp cho đơn hàng #{order.id}")
        return False
        
    if not service:
        logging.error(f"Không thể gửi email: Thông tin dịch vụ không được cung cấp cho đơn hàng #{order.id}")
        return False
    
    # -- GỬI EMAIL XÁC NHẬN CHO KHÁCH HÀNG --
    logging.info("Chuẩn bị gửi email xác nhận cho khách hàng")
    
    # HTML cho khách hàng
    customer_html_content = f"""
    <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
                
                body {{ 
                    font-family: 'Roboto', Arial, sans-serif; 
                    line-height: 1.6; 
                    background-color: #f5f5f5;
                    margin: 0;
                    padding: 0;
                    color: #333;
                }}
                .container {{ 
                    width: 100%; 
                    max-width: 650px; 
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }}
                .header {{ 
                    background: linear-gradient(135deg, #3f51b5, #2196f3);
                    padding: 30px 20px; 
                    text-align: center;
                    color: white;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 28px;
                    font-weight: 700;
                    letter-spacing: 1px;
                }}
                .content {{ 
                    padding: 30px 25px;
                }}
                .greeting {{
                    font-size: 18px;
                    color: #3f51b5;
                    font-weight: 500;
                }}
                .message {{
                    font-size: 16px;
                    margin-bottom: 25px;
                }}
                .highlight {{
                    color: #e91e63;
                    font-weight: 500;
                }}
                .order-details {{ 
                    margin: 25px 0;
                    border: 1px solid #e0e0e0;
                    border-radius: 6px;
                    overflow: hidden;
                }}
                .order-details h2 {{ 
                    background-color: #f5f5f5;
                    margin: 0;
                    padding: 15px 20px;
                    font-size: 20px;
                    color: #3f51b5;
                    border-bottom: 1px solid #e0e0e0;
                }}
                .order-details table {{ 
                    width: 100%; 
                    border-collapse: collapse; 
                }}
                .order-details th, .order-details td {{ 
                    padding: 12px 20px; 
                    text-align: left; 
                    border-bottom: 1px solid #e0e0e0;
                }}
                .order-details th {{ 
                    background-color: #fafafa; 
                    font-weight: 500;
                    width: 40%;
                }}
                .order-details tr:last-child th,
                .order-details tr:last-child td {{
                    border-bottom: none;
                }}
                .order-id {{
                    color: #e91e63;
                    font-weight: 700;
                    font-size: 18px;
                }}
                .service-name {{
                    color: #3f51b5;
                    font-weight: 500;
                    font-size: 16px;
                }}
                .quantity {{
                    font-weight: 500;
                    font-size: 16px;
                }}
                .contact-info {{
                    background-color: #f5f5f5;
                    padding: 20px;
                    border-radius: 6px;
                    margin-top: 25px;
                }}
                .contact-info p {{
                    margin: 8px 0;
                }}
                .footer {{ 
                    background-color: #3f51b5; 
                    padding: 15px; 
                    text-align: center; 
                    font-size: 14px;
                    color: rgba(255,255,255,0.8);
                }}
                .company-name {{
                    font-weight: 700;
                    color: white;
                }}
                .thank-you {{
                    font-size: 18px;
                    text-align: center;
                    margin: 30px 0 20px;
                    color: #3f51b5;
                    font-weight: 500;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✓ ĐƠN HÀNG ĐÃ ĐƯỢC XÁC NHẬN</h1>
                </div>
                <div class="content">
                    <p class="greeting">Xin chào <span class="highlight">{order.customer_name}</span>,</p>
                    <p class="message">Cảm ơn bạn đã đặt hàng tại <strong> CÔNG TY TNHH THIẾT KẾ VÀ IN ẤN PHÚ LONG </strong>. Chúng tôi rất vui khi được phục vụ bạn và đã nhận được đơn hàng của bạn.</p>
                    
                    <div class="order-details">
                        <h2>Chi tiết đơn hàng</h2>
                        <table>
                            <tr>
                                <th>Mã đơn hàng</th>
                                <td><span class="order-id">#{order.id}</span></td>
                            </tr>
                            <tr>
                                <th>Dịch vụ</th>
                                <td><span class="service-name">{service.name}</span></td>
                            </tr>
                            <tr>
                                <th>Số lượng</th>
                                <td><span class="quantity">{order.quantity}</span></td>
                            </tr>
                            <tr>
                                <th>Kích thước</th>
                                <td>{order.size or 'Không có'}</td>
                            </tr>
                            <tr>
                                <th>Chất liệu</th>
                                <td>{order.material or 'Không có'}</td>
                            </tr>
                            <tr>
                                <th>Ghi chú</th>
                                <td>{order.notes or 'Không có'}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <p class="message">Chúng tôi đã bắt đầu xử lý đơn hàng của bạn và sẽ thông báo cho bạn khi đơn hàng sẵn sàng để giao.</p>
                    
                    <div class="contact-info">
                        <p><strong>Nếu bạn có bất kỳ câu hỏi nào</strong>, vui lòng liên hệ với chúng tôi:</p>
                        <p>📞 Số điện thoại | Zalo: <strong>0977 007 763</strong></p>
                        <p>📧 Email: <strong>inphulong@gmail.com</strong></p>
                        <p>📍 Địa chỉ: <strong>Số 2 Lê Văn Chí, Phường Linh Chiểu, Thành phố Thủ Đức, TP. HCM</strong></p>
                        <p>🌐 Fanpage: <strong>https://www.facebook.com/inanphulong</strong></p>
                        <p>
                    </div>
                    
                    <p class="thank-you">Cảm ơn bạn đã chọn  CÔNG TY TNHH THIẾT KẾ VÀ IN ẤN PHÚ LONG!</p>
                </div>
                <div class="footer">
                    <p>© {datetime.now().year} <span class="company-name">CÔNG TY TNHH THIẾT KẾ VÀ IN ẤN PHÚ LONG</span>. Tất cả các quyền được bảo lưu.</p>
                </div>
            </div>
        </body>
    </html>
    """
    
    # -- GỬI EMAIL THÔNG BÁO ĐƠN HÀNG MỚI CHO ADMIN --
    logging.info("Chuẩn bị gửi email thông báo đơn hàng mới cho admin")
    
    # Sử dụng mẫu ADMIN_EMAIL_TEMPLATE để tạo email cho admin
    admin_html_content = ADMIN_EMAIL_TEMPLATE.format(
        customer_name=order.customer_name,
        customer_email=order.customer_email,
        customer_phone=order.customer_phone,
        order_id=order.id,
        service_name=service.name,
        quantity=order.quantity,
        size=order.size or 'Không có',
        material=order.material or 'Không có',
        notes=order.notes or 'Không có',
        design_file=order.design_file_url or 'Không có',
        order_date=order.created_at.strftime('%H:%M:%S %d/%m/%Y'),
        admin_url=f"http://localhost:8000/api/orders/{order.id}",
        year=datetime.now().year
    )
    
    # Gửi email cho khách hàng
    customer_subject = f"Đơn hàng #{order.id} của bạn tại Phú Long đã được xác nhận"
    customer_email_sent = False
    try:
        logging.info(f"Gửi email xác nhận đến khách hàng: {order.customer_email}")
        customer_email_sent = send_email(order.customer_email, customer_subject, customer_html_content)
    except Exception as e:
        logging.error(f"Lỗi khi gửi email đến khách hàng: {str(e)}")
    
    # Gửi email thông báo đơn hàng mới cho admin
    admin_subject = f"[PHÚ LONG] Đơn hàng mới #{order.id} từ {order.customer_name}"
    admin_email = settings.SMTP_USERNAME  # Sử dụng chính tài khoản SMTP làm người nhận
    admin_email_sent = False
    
    try:
        logging.info(f"Gửi email thông báo đơn hàng mới đến admin: {admin_email}")
        admin_email_sent = send_email(admin_email, admin_subject, admin_html_content)
    except Exception as e:
        logging.error(f"Lỗi khi gửi email đến admin: {str(e)}")
    
    logging.info(f"Kết quả gửi email - Khách hàng ({order.customer_email}): {'Thành công' if customer_email_sent else 'Thất bại'}")
    logging.info(f"Kết quả gửi email - Admin ({admin_email}): {'Thành công' if admin_email_sent else 'Thất bại'}")
    
    return customer_email_sent or admin_email_sent 