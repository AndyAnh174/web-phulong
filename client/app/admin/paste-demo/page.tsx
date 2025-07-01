"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ContentEditor from "@/components/admin/content-editor"
import { useAuth } from "@/contexts/auth-context"

export default function PasteDemoPage() {
  const [content, setContent] = useState(`# Demo Paste Ảnh cho Printing Content

Chào mừng bạn đến với demo chức năng paste ảnh!

## 🖼️ Cách sử dụng:

1. **Copy ảnh** từ bất kỳ đâu:
   - Screenshot (Print Screen)
   - Copy ảnh từ web browser
   - Copy từ ứng dụng khác

2. **Paste vào textarea bên dưới** (Ctrl+V hoặc Cmd+V)

3. **Hoặc drag & drop** ảnh từ máy tính vào textarea

## ✨ Tính năng:

- ✅ Tự động upload ảnh
- ✅ Chèn shortcode tại vị trí cursor
- ✅ Live preview với ảnh thực
- ✅ Validation file (max 10MB, JPG/PNG/GIF/WEBP/BMP)
- ✅ Toast notifications

## 📝 Ví dụ shortcode:

[image:123|Mô tả ảnh]

Hãy thử paste ảnh vào đây! 👇`)

  const { user } = useAuth()

  const handleSaveDemo = () => {
    console.log("Demo content saved:", content)
    alert("Demo: Content đã được lưu vào console!")
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>❌ Không có quyền truy cập</CardTitle>
            <CardDescription>
              Chỉ admin mới có thể truy cập trang demo này.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">🖼️ Paste Image Demo</h1>
            <p className="text-gray-600 mt-2">
              Demo chức năng paste ảnh trực tiếp vào content editor
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">Admin Only</Badge>
            <Badge variant="outline">Beta Feature</Badge>
          </div>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">📋 Copy & Paste</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600">
                Copy ảnh từ clipboard và paste vào editor
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">🎯 Drag & Drop</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600">
                Kéo thả ảnh từ máy tính vào textarea
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">⚡ Auto Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600">
                Tự động upload và tạo shortcode
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">👁️ Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600">
                Preview real-time với ảnh thực
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>📝 Content Editor với Paste Support</CardTitle>
              <CardDescription>
                Hãy thử copy ảnh và paste vào textarea bên dưới, hoặc drag & drop ảnh vào đây!
              </CardDescription>
            </div>
            <Button onClick={handleSaveDemo} variant="outline">
              💾 Lưu Demo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ContentEditor
            content={content}
            onContentChange={setContent}
            placeholder="Paste ảnh vào đây hoặc nhập nội dung..."
            showPreview={true}
          />
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">💡 Tips sử dụng:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Windows:</strong> Print Screen → Ctrl+V</li>
              <li>• <strong>Mac:</strong> Cmd+Shift+4 → Cmd+V</li>
              <li>• <strong>Web:</strong> Right click image → Copy → Paste vào editor</li>
              <li>• <strong>File:</strong> Drag & drop file ảnh từ folder vào textarea</li>
              <li>• <strong>Shortcode:</strong> [image:ID|mô_tả] sẽ render thành &lt;img&gt;</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">🔧 Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <strong>Content Length:</strong> {content.length} characters
            </div>
            <div>
              <strong>Images Found:</strong> {content.match(/\[image:\d+(\|[^\]]*?)?\]/g)?.length || 0}
            </div>
            <div>
              <strong>User:</strong> {user?.name} ({user?.role})
            </div>
            <div>
              <strong>Feature Status:</strong> 
              <Badge variant="outline" className="ml-2">Active</Badge>
            </div>
          </div>
          
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium">📄 Raw Content</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
              {content}
            </pre>
          </details>
        </CardContent>
      </Card>
    </div>
  )
} 