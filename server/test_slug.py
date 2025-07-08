#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Test file để kiểm tra hàm tạo slug
Chạy: python test_slug.py
"""

from utils.slug import create_slug

def test_slug_creation():
    """Test các trường hợp tạo slug từ tiếng Việt"""
    
    test_cases = [
        # Services
        ("Thiết kế website", "thiet-ke-website"),
        ("In ấn brochure", "in-an-brochure"), 
        ("Dịch vụ SEO Marketing", "dich-vu-seo-marketing"),
        ("Thiết kế logo & nhận diện thương hiệu", "thiet-ke-logo-nhan-dien-thuong-hieu"),
        
        # Blogs
        ("Xu hướng thiết kế web 2024", "xu-huong-thiet-ke-web-2024"),
        ("Cách tối ưu SEO cho website", "cach-toi-uu-seo-cho-website"),
        ("10 mẹo thiết kế logo đẹp", "10-meo-thiet-ke-logo-dep"),
        
        # Printing
        ("In ấn chất lượng cao", "in-an-chat-luong-cao"),
        ("Dịch vụ in nhanh 24h", "dich-vu-in-nhanh-24h"),
        ("In card visit, name card", "in-card-visit-name-card"),
        
        # Edge cases
        ("", ""),
        ("   ", ""),
        ("Có ký tự đặc biệt @#$%", "co-ky-tu-dac-biet"),
        ("VIẾT HOA TẤT CẢ", "viet-hoa-tat-ca"),
        ("có    nhiều    khoảng    trắng", "co-nhieu-khoang-trang"),
        ("Với-dấu-gạch-ngang", "voi-dau-gach-ngang"),
        ("Số 123 và chữ ABC", "so-123-va-chu-abc"),
    ]
    
    print("🧪 Test tạo slug từ tiếng Việt:")
    print("=" * 60)
    
    all_passed = True
    
    for input_text, expected in test_cases:
        result = create_slug(input_text)
        status = "✅" if result == expected else "❌"
        
        if result != expected:
            all_passed = False
        
        print(f"{status} '{input_text}' -> '{result}'")
        if result != expected:
            print(f"   Mong muốn: '{expected}'")
    
    print("=" * 60)
    if all_passed:
        print("🎉 Tất cả test cases đều PASS!")
    else:
        print("⚠️  Có một số test cases FAIL!")
    
    return all_passed

def demo_slug_examples():
    """Demo các ví dụ slug cho website"""
    
    print("\n📝 Ví dụ các URL slug sẽ tạo:")
    print("=" * 60)
    
    services = [
        "Thiết kế website",
        "Thiết kế logo", 
        "Dịch vụ SEO",
        "In ấn brochure",
        "Quản trị fanpage"
    ]
    
    blogs = [
        "Xu hướng thiết kế web năm 2024",
        "Cách tăng traffic cho website",
        "10 mẹo SEO hiệu quả"
    ]
    
    printings = [
        "In ấn chất lượng cao",
        "Dịch vụ in nhanh",
        "In card visit đẹp"
    ]
    
    print("🔧 Services:")
    for service in services:
        slug = create_slug(service)
        print(f"   /api/services/{slug}")
    
    print("\n📰 Blogs:")
    for blog in blogs:
        slug = create_slug(blog)
        print(f"   /api/blogs/{slug}")
    
    print("\n🖨️  Printing:")
    for printing in printings:
        slug = create_slug(printing)
        print(f"   /api/printing/{slug}")

if __name__ == "__main__":
    # Chạy tests
    test_passed = test_slug_creation()
    
    # Demo ví dụ
    demo_slug_examples()
    
    print(f"\n{'🎯 Test hoàn thành!' if test_passed else '🚨 Cần kiểm tra lại!'}") 