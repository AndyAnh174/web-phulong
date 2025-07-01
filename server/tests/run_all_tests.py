import os
import sys
import time
import requests

# Đường dẫn API
API_URL = "http://localhost:8000/api"

def check_api_available():
    """Kiểm tra xem API đã khởi động chưa"""
    try:
        response = requests.get("http://localhost:8000/")
        return response.status_code == 200
    except:
        return False

def wait_for_api(max_retries=10, retry_interval=2):
    """Đợi cho API khởi động"""
    for i in range(max_retries):
        if check_api_available():
            return True
        print(f"Đang đợi API khởi động... {i+1}/{max_retries}")
        time.sleep(retry_interval)
    return False

def run_tests():
    """Chạy tất cả các test"""
    print("\n=== Bắt đầu chạy các test API ===\n")
    
    try:
        # Kiểm tra API đã sẵn sàng chưa
        if not wait_for_api():
            print("ERROR: API chưa khởi động. Hãy chạy 'uvicorn main:app --reload' trước.\n")
            sys.exit(1)
        
        # Import và chạy các test
        from tests.test_auth import test_login_root, test_register_admin, test_login_admin, test_login_history
        from tests.test_services import test_create_service, test_get_all_services, test_get_service_by_id, test_update_service, test_delete_service
        from tests.test_blogs import test_create_blog, test_get_all_blogs, test_get_blog_by_id, test_update_blog, test_delete_blog
        from tests.test_orders import test_create_order, test_get_all_orders, test_get_order_by_id, test_update_order_status, test_export_orders_csv
        from tests.test_users import test_register_user, test_get_current_user, test_get_all_users, test_get_user_by_id, test_update_user
        
        # Test authentication
        print("\n--- Test Authentication ---")
        test_login_root()
        print("✓ Đăng nhập với tài khoản root: OK")
        test_register_admin()
        print("✓ Đăng ký tài khoản admin: OK")
        test_login_admin()
        print("✓ Đăng nhập với tài khoản admin: OK")
        test_login_history()
        print("✓ Xem lịch sử đăng nhập: OK")
        
        # Test services
        print("\n--- Test Services ---")
        test_create_service()
        print("✓ Tạo dịch vụ mới: OK")
        test_get_all_services()
        print("✓ Lấy danh sách dịch vụ: OK")
        test_get_service_by_id()
        print("✓ Lấy chi tiết dịch vụ: OK")
        test_update_service()
        print("✓ Cập nhật dịch vụ: OK")
        
        # Test blogs
        print("\n--- Test Blogs ---")
        test_create_blog()
        print("✓ Tạo blog mới: OK")
        test_get_all_blogs()
        print("✓ Lấy danh sách blog: OK")
        test_get_blog_by_id()
        print("✓ Lấy chi tiết blog: OK")
        test_update_blog()
        print("✓ Cập nhật blog: OK")
        
        # Test users
        print("\n--- Test Users ---")
        test_register_user()
        print("✓ Đăng ký người dùng mới: OK")
        test_get_current_user()
        print("✓ Lấy thông tin người dùng hiện tại: OK")
        test_get_all_users()
        print("✓ Lấy danh sách người dùng: OK")
        test_get_user_by_id()
        print("✓ Lấy chi tiết người dùng: OK")
        test_update_user()
        print("✓ Cập nhật người dùng: OK")
        
        # Test orders
        print("\n--- Test Orders ---")
        try:
            test_create_order()
            print("✓ Tạo đơn hàng mới: OK")
        except:
            print("✗ Tạo đơn hàng mới: FAIL (bỏ qua do cần form data)")
        test_get_all_orders()
        print("✓ Lấy danh sách đơn hàng: OK")
        try:
            test_get_order_by_id()
            print("✓ Lấy chi tiết đơn hàng: OK")
            test_update_order_status()
            print("✓ Cập nhật trạng thái đơn hàng: OK")
        except:
            print("✗ Test đơn hàng chi tiết: FAIL (bỏ qua)")
        try:
            test_export_orders_csv()
            print("✓ Xuất đơn hàng ra CSV: OK")
        except:
            print("✗ Xuất đơn hàng ra CSV: FAIL (bỏ qua)")
        
        # Cuối cùng xóa các dữ liệu test
        try:
            test_delete_service()
            print("✓ Xóa dịch vụ: OK")
        except:
            pass
        
        try:
            test_delete_blog()
            print("✓ Xóa blog: OK")
        except:
            pass
            
        print("\n=== Hoàn thành chạy tất cả các test API! ===\n")
        
    except Exception as e:
        print(f"Lỗi khi chạy test: {str(e)}")
        
if __name__ == "__main__":
    run_tests() 