from fastapi import FastAPI, Request, status
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import logging
import os
from datetime import datetime
import uvicorn
from routers import services, blogs, orders, users, auth, dashboard, contact, config, images
from middlewares.auth_middleware import get_current_user, get_admin_user, get_root_user
from middlewares.logging_middleware import AdminLoggingMiddleware
from fastapi.staticfiles import StaticFiles
from config.database import engine, Base
from models import models
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
from fastapi_utils.tasks import repeat_every
from utils.tasks import cleanup_expired_access_logs
from config.settings import settings
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Tạo thư mục logs nếu chưa tồn tại
logs_dir = "logs"
if not os.path.exists(logs_dir):
    os.makedirs(logs_dir)

# Cấu hình logging
log_filename = f"logs/app_{datetime.now().strftime('%Y%m%d')}.log"
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_filename, encoding='utf-8'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("phulong-api")

# Tạo database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Phú Long - API Backend",
    description="API Backend cho website giới thiệu sản phẩm in ấn",
    version="1.0.0",
    docs_url=None,  # Tắt docs mặc định
    redoc_url=None,
    openapi_url=None  # Tắt endpoint OpenAPI mặc định
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    allow_headers=[
        "*",
        "Accept",
        "Accept-Language", 
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Origin",
        "Cache-Control",
        "Content-Language",
        "Last-Event-ID",
        "User-Agent",
        "X-CSRF-Token"
    ],
    expose_headers=[
        "Content-Length",
        "Content-Range",
        "Content-Type",
        "Access-Control-Allow-Origin",
        "Access-Control-Allow-Headers",
        "Access-Control-Allow-Methods"
    ]
)

# Thêm middleware xử lý OPTIONS requests
@app.middleware("http")
async def cors_handler(request: Request, call_next):
    if request.method == "OPTIONS":
        response = JSONResponse(content={})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Max-Age"] = "3600"
        return response
    
    response = await call_next(request)
    return response

# Đăng ký Admin Logging Middleware
app.add_middleware(AdminLoggingMiddleware)

# Static files
static_dir = "static"
if not os.path.exists(static_dir):
    os.makedirs(static_dir)

app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
async def read_root():
    return {"message": "Phú Long API is running!"}

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_message = f"Unhandled exception: {str(exc)}"
    logger.error(error_message)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Đã xảy ra lỗi. Vui lòng thử lại sau."}
    )

# Đăng ký các routers
app.include_router(auth.router, tags=["Authentication"])
app.include_router(services.router, tags=["Services"])
app.include_router(blogs.router, tags=["Blogs"])
app.include_router(orders.router, tags=["Orders"])
app.include_router(users.router, tags=["Users"])
app.include_router(dashboard.router, tags=["Dashboard"])
app.include_router(contact.router, prefix="/api/contact", tags=["Contact"])
app.include_router(config.router, prefix="/api/config", tags=["Configuration"])
app.include_router(images.router, tags=["Images"])

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    # Tạo schema OpenAPI với phiên bản được chỉ định rõ ràng
    openapi_schema = {
        "openapi": "3.0.0",  # Phiên bản OpenAPI
        "info": {
            "title": app.title,
            "description": app.description,
            "version": app.version
        },
        "paths": {},
    }
    
    # Kết hợp với schema được tạo bởi FastAPI
    generated_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    
    # Cập nhật schema với các đường dẫn và thông tin khác từ FastAPI
    if "paths" in generated_schema:
        openapi_schema["paths"] = generated_schema["paths"]
    if "components" in generated_schema:
        openapi_schema["components"] = generated_schema["components"]
        
    # Lưu schema
    app.openapi_schema = openapi_schema
    return app.openapi_schema

# Tùy chỉnh docs
@app.get("/api/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url="/api/openapi.json",
        title=app.title + " - API Documentation",
        swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui-bundle.js",
        swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui.css",
    )

@app.get("/api/openapi.json", include_in_schema=False)
async def get_open_api_endpoint():
    return custom_openapi()

# Endpoint để lấy favicon.ico
@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse("static/images/favicon.ico")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 