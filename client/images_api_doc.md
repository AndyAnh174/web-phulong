# 📸 Images API Documentation

## 1. POST /api/images/upload
**Description:** Upload a new image (ADMIN only)  
**Requirements:**
- File must be valid (jpg, png, gif, webp, bmp)
- Max size: 10MB
- Only ADMIN can upload

**Request (multipart/form-data):**
- file (required): binary
- alt_text (optional): string
- category (optional): string
- is_visible (optional): boolean (default: true)

**Sample Response:**
{
  "message": "Upload ảnh thành công",
  "image": {
    "id": 4,
    "filename": "Banner1-1136x900px.png",
    ...
  }
}

---

## 2. GET /api/images/
**Description:** Get image list with optional filters and pagination

**Query Params:**
- skip (integer, default 0)
- limit (integer, default 100)
- is_visible (boolean)
- category (string)

**Sample Response:**
[
  {
    "id": 2,
    "filename": "banner2-1920x400px.png",
    ...
  }
]

---

## 3. GET /api/images/{image_id}
**Description:** Get single image metadata by ID

---

## 4. PUT /api/images/{image_id}
**Description:** Update image metadata (ADMIN only)  
**Body:** alt_text, category, is_visible

---

## 5. DELETE /api/images/{image_id}
**Description:** Delete image by ID (ADMIN only)

---

## 6. GET /api/images/categories/list
**Description:** Get available image categories

**Sample Response:**
["banner", "thumbnail", "avatar", ...]

---

## 7. GET /api/images/download/{image_id}
**Description:** Download image file by ID

---

## 🔒 Authorization
Endpoints like POST, PUT, DELETE require a valid admin token via Authorization header.

---

## 🔁 Summary Table

| Endpoint                            | Method | Description                        | Access  |
|-------------------------------------|--------|------------------------------------|---------|
| /api/images/upload                  | POST   | Upload image                       | ADMIN   |
| /api/images/                        | GET    | Get list of images                 | PUBLIC  |
| /api/images/{image_id}             | GET    | Get single image info              | PUBLIC  |
| /api/images/{image_id}             | PUT    | Update image info                  | ADMIN   |
| /api/images/{image_id}             | DELETE | Delete image                       | ADMIN   |
| /api/images/categories/list        | GET    | Get list of image categories       | PUBLIC  |
| /api/images/download/{image_id}    | GET    | Download image file                | PUBLIC  |