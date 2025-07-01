FROM python:3.9-slim

WORKDIR /app

# Cài đặt các dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Sao chép mã nguồn vào container
COPY . .

# Tạo thư mục uploads và đảm bảo quyền truy cập
RUN mkdir -p static/uploads && chmod -R 777 static

# Mở cổng 8000
EXPOSE 8000

# Chạy ứng dụng
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"] 