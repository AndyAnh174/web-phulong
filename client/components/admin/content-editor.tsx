"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Upload, Image as ImageIcon, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import api from "@/lib/api"

interface ContentEditorProps {
  content: string
  onContentChange: (content: string) => void
  placeholder?: string
}

export default function ContentEditor({ content, onContentChange, placeholder = "Nhập nội dung..." }: ContentEditorProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [altText, setAltText] = useState("")
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const { toast } = useToast()
  const { token } = useAuth()

  // Handle file upload và chèn shortcode
  const handleImageUpload = async (file: File) => {
    if (!token) {
      toast({
        title: "Lỗi",
        description: "Bạn cần đăng nhập để upload ảnh",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    
    try {
      // Kiểm tra kích thước file (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Lỗi",
          description: "Kích thước ảnh không được vượt quá 10MB",
          variant: "destructive",
        })
        return
      }

      // Kiểm tra định dạng file
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Lỗi",
          description: "Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP, BMP)",
          variant: "destructive",
        })
        return
      }

      // Upload ảnh thông qua API
      const result = await api.printing.uploadContentImage(file, altText || file.name, token)
      
      // Chèn shortcode vào content tại vị trí cursor
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const beforeText = content.substring(0, start)
        const afterText = content.substring(end)
        
        const newContent = beforeText + result.shortcode + afterText
        onContentChange(newContent)
        
        // Set focus về textarea sau khi chèn
        setTimeout(() => {
          textarea.focus()
          const newPosition = start + result.shortcode.length
          textarea.setSelectionRange(newPosition, newPosition)
        }, 100)
      } else {
        // Fallback: thêm vào cuối content
        onContentChange(content + '\n\n' + result.shortcode)
      }

      toast({
        title: "Thành công",
        description: "Đã upload và chèn ảnh vào content",
      })

      // Reset form
      setAltText("")
      setShowUploadDialog(false)
      
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể upload ảnh",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
    // Reset input
    e.target.value = ''
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Nội dung</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowUploadDialog(true)}
            disabled={isUploading}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Chèn ảnh
          </Button>
        </div>
      </div>

      {/* Upload Dialog */}
      {showUploadDialog && (
        <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Upload ảnh cho content</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowUploadDialog(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div>
            <Label htmlFor="alt-text">Mô tả ảnh (tùy chọn)</Label>
            <Input
              id="alt-text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Nhập mô tả ảnh..."
              className="mt-1"
            />
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
            <input
              type="file"
              id="content-image-upload"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
            <label 
              htmlFor="content-image-upload" 
              className={`cursor-pointer flex flex-col items-center space-y-2 ${
                isUploading ? 'text-gray-400' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Upload className="h-6 w-6" />
              <span className="text-sm font-medium">
                {isUploading ? 'Đang upload...' : 'Chọn ảnh để upload'}
              </span>
              <span className="text-xs text-gray-500">
                Hỗ trợ: JPG, PNG, GIF, WEBP, BMP (tối đa 10MB)
              </span>
            </label>
          </div>

          <div className="text-xs text-gray-600">
            <p><strong>Hướng dẫn:</strong></p>
            <p>• Ảnh sẽ được chèn vào content dưới dạng shortcode [image:ID|mô_tả]</p>
            <p>• Bạn có thể di chuyển cursor đến vị trí muốn chèn ảnh trước khi upload</p>
            <p>• Shortcode sẽ được render thành thẻ HTML khi hiển thị</p>
          </div>
        </div>
      )}

      {/* Content Textarea */}
      <Textarea
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder={placeholder}
        rows={12}
        className="font-mono text-sm"
      />

      <div className="text-xs text-gray-600">
        <p><strong>Hỗ trợ Markdown và Shortcode:</strong></p>
        <p>• Markdown: **bold**, *italic*, # heading, - list, [link](url)</p>
        <p>• Ảnh: [image:ID|mô_tả] - sử dụng nút "Chèn ảnh" để thêm</p>
      </div>
    </div>
  )
} 