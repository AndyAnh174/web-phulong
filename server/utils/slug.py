import re
import unicodedata

def create_slug(text: str) -> str:
    """
    Tạo slug từ text tiếng Việt
    Ví dụ: "Thiết kế website" -> "thiet-ke-website"
    """
    if not text:
        return ""
    
    # Bảng chuyển đổi ký tự tiếng Việt
    vietnamese_chars = {
        'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a',
        'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a',
        'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
        'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e',
        'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
        'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
        'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o',
        'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o',
        'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
        'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u',
        'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
        'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
        'đ': 'd',
        # Uppercase
        'À': 'a', 'Á': 'a', 'Ạ': 'a', 'Ả': 'a', 'Ã': 'a',
        'Â': 'a', 'Ầ': 'a', 'Ấ': 'a', 'Ậ': 'a', 'Ẩ': 'a', 'Ẫ': 'a',
        'Ă': 'a', 'Ằ': 'a', 'Ắ': 'a', 'Ặ': 'a', 'Ẳ': 'a', 'Ẵ': 'a',
        'È': 'e', 'É': 'e', 'Ẹ': 'e', 'Ẻ': 'e', 'Ẽ': 'e',
        'Ê': 'e', 'Ề': 'e', 'Ế': 'e', 'Ệ': 'e', 'Ể': 'e', 'Ễ': 'e',
        'Ì': 'i', 'Í': 'i', 'Ị': 'i', 'Ỉ': 'i', 'Ĩ': 'i',
        'Ò': 'o', 'Ó': 'o', 'Ọ': 'o', 'Ỏ': 'o', 'Õ': 'o',
        'Ô': 'o', 'Ồ': 'o', 'Ố': 'o', 'Ộ': 'o', 'Ổ': 'o', 'Ỗ': 'o',
        'Ơ': 'o', 'Ờ': 'o', 'Ớ': 'o', 'Ợ': 'o', 'Ở': 'o', 'Ỡ': 'o',
        'Ù': 'u', 'Ú': 'u', 'Ụ': 'u', 'Ủ': 'u', 'Ũ': 'u',
        'Ư': 'u', 'Ừ': 'u', 'Ứ': 'u', 'Ự': 'u', 'Ử': 'u', 'Ữ': 'u',
        'Ỳ': 'y', 'Ý': 'y', 'Ỵ': 'y', 'Ỷ': 'y', 'Ỹ': 'y',
        'Đ': 'd'
    }
    
    # Chuyển đổi ký tự tiếng Việt
    result = ""
    for char in text:
        result += vietnamese_chars.get(char, char)
    
    # Chuyển về lowercase
    result = result.lower()
    
    # Loại bỏ các ký tự không phải chữ, số, space, dấu gạch ngang
    result = re.sub(r'[^\w\s-]', '', result)
    
    # Thay thế khoảng trắng và dấu gạch dưới bằng dấu gạch ngang
    result = re.sub(r'[\s_]+', '-', result)
    
    # Loại bỏ dấu gạch ngang ở đầu và cuối
    result = result.strip('-')
    
    # Loại bỏ các dấu gạch ngang liên tiếp
    result = re.sub(r'-+', '-', result)
    
    return result

def get_model_by_slug(slug: str, model_class, db_session, name_field='name'):
    """
    Tìm model theo slug được tạo từ trường name/title
    """
    # Tìm tất cả records có thể match
    if name_field == 'name':
        records = db_session.query(model_class).all()
    elif name_field == 'title':
        records = db_session.query(model_class).all()
    else:
        return None
    
    # Kiểm tra từng record xem slug có khớp không
    for record in records:
        record_name = getattr(record, name_field, '')
        if record_name and create_slug(record_name) == slug:
            return record
    
    return None

def ensure_unique_slug(base_slug: str, model_class, db_session, name_field='name', id_to_exclude=None) -> str:
    """
    Đảm bảo slug là duy nhất bằng cách thêm số vào cuối nếu cần
    Sử dụng với dynamic slug (không có field slug trong database)
    """
    slug = base_slug
    counter = 1
    
    while True:
        # Tìm record có slug trùng
        existing = get_model_by_slug(slug, model_class, db_session, name_field)
        
        if not existing:
            return slug
        
        # Nếu là record hiện tại thì bỏ qua
        if id_to_exclude is not None and existing.id == id_to_exclude:
            return slug
        
        counter += 1
        slug = f"{base_slug}-{counter}" 