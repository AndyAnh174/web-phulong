"""
Test tạo đơn hàng và gửi email
"""
import os
import sys
import logging
import requests
import json
from datetime import datetime

# Thiết lập logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Thông tin API
BASE_URL = "http://localhost:8000"  # Thay đổi URL nếu API chạy ở cổng khác
ORDERS_ENDPOINT = f"{BASE_URL}/api/orders"
SERVICES_ENDPOINT = f"{BASE_URL}/api/services"

def get_service_id():
    """Lấy ID của một dịch vụ có sẵn để sử dụng trong test"""
    try:
        response = requests.get(SERVICES_ENDPOINT)
        if response.status_code == 200:
            services = response.json()
            if services and len(services) > 0:
                return services[0]["id"]
        return None
    except Exception as e:
        logging.error(f"Lỗi khi lấy ID dịch vụ: {str(e)}")
        return None

def test_create_order():
    """Test API tạo đơn hàng"""
    logging.info("Bắt đầu test tạo đơn hàng")
    
    # Lấy ID dịch vụ
    service_id = get_service_id()
    if not service_id:
        logging.error("Không thể tìm thấy dịch vụ nào để test")
        return False
    
    # Dữ liệu đơn hàng
    order_data = {
        "customer_name": f"Khách hàng Test {datetime.now().strftime('%H:%M:%S')}",
        "customer_email": "anhvietho113@gmail.com",  # Email thật để nhận thông báo
        "customer_phone": "0123456789",
        "service_id": service_id,
        "quantity": 10,
        "size": "A4",
        "material": "Giấy thường",
        "notes": f"Đơn hàng test từ script test_create_order.py - {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}"
    }
    
    logging.info(f"Gửi request tạo đơn hàng với dữ liệu: {json.dumps(order_data, indent=2, ensure_ascii=False)}")
    
    # Gửi request POST để tạo đơn hàng
    try:
        response = requests.post(ORDERS_ENDPOINT, data=order_data)
        logging.info(f"Status code: {response.status_code}")
        
        if response.status_code == 200 or response.status_code == 201:
            result = response.json()
            order_id = result.get('id')
            logging.info(f"Tạo đơn hàng thành công, ID: {order_id}")
            logging.info(f"Xem chi tiết đơn hàng tại: {ORDERS_ENDPOINT}/{order_id}")
            return True
        else:
            logging.error(f"Tạo đơn hàng thất bại: {response.text}")
            return False
    except Exception as e:
        logging.error(f"Lỗi khi gửi request: {str(e)}")
        return False

if __name__ == "__main__":
    print(f"Kiểm tra endpoint đặt hàng ({ORDERS_ENDPOINT})")
    success = test_create_order()
    if success:
        print("Test thành công! Đơn hàng đã được tạo.")
        print("Vui lòng kiểm tra email (anhvietho113@gmail.com và hovietanh147@gmail.com) để xác nhận email đã được gửi.")
        print("Email cho khách hàng và admin có giao diện khác nhau để dễ phân biệt.")
    else:
        print("Test thất bại. Vui lòng kiểm tra logs để biết thêm chi tiết.") 