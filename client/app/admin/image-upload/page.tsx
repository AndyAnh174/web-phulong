"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  Image,
  Copy,
  Check,
  X,
  AlertCircle,
  Info,
  ImageIcon,
  Download,
  Trash2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

export default function ImageUploadPage() {
  // Image upload states
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [urlCopied, setUrlCopied] = useState(false)
  const [uploadHistory, setUploadHistory] = useState<Array<{
    url: string
    filename: string
    timestamp: Date
    id: number
  }>>([])

  const { toast } = useToast()
  const { token } = useAuth()

  // Image upload functions
  const handleImageUpload = async (file: File) => {
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Lỗi",
        description: "Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP, BMP)",
        variant: "destructive"
      })
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Lỗi", 
        description: "Kích thước file không được vượt quá 10MB",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', 'upload-tool')
      formData.append('alt_text', `Upload từ image tool - ${file.name}`)

      const response = await fetch('http://14.187.198.210:12122/api/images/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      const newImageUrl = result.image.url
      setUploadedImageUrl(newImageUrl)
      
      // Add to history
      setUploadHistory(prev => [{
        url: newImageUrl,
        filename: file.name,
        timestamp: new Date(),
        id: result.image.id
      }, ...prev.slice(0, 9)]) // Keep only last 10 uploads
      
      toast({
        title: "Thành công",
        description: "Upload ảnh thành công! URL đã được tạo.",
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Lỗi",
        description: "Không thể upload ảnh. Vui lòng thử lại.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleImageUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleImageUpload(files[0])
    }
  }

  const copyUrlToClipboard = async (url?: string) => {
    const urlToCopy = url || uploadedImageUrl
    if (!urlToCopy) return
    
    try {
      await navigator.clipboard.writeText(urlToCopy)
      setUrlCopied(true)
      toast({
        title: "Đã sao chép",
        description: "URL ảnh đã được sao chép vào clipboard"
      })
      
      setTimeout(() => setUrlCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể sao chép URL",
        variant: "destructive"
      })
    }
  }

  const clearUploadedImage = () => {
    setUploadedImageUrl("")
    setUrlCopied(false)
  }

  const clearHistory = () => {
    setUploadHistory([])
    toast({
      title: "Đã xóa",
      description: "Lịch sử upload đã được xóa"
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Upload Ảnh & Lấy URL
              </h1>
              <p className="text-gray-600">
                Công cụ upload ảnh chuyên dụng để lấy URL sử dụng trong nội dung
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl">
              <ImageIcon className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <Card className="border border-gray-200 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 via-purple-100 to-blue-50 rounded-t-lg">
                <CardTitle className="flex items-center text-gray-900">
                  <Upload className="mr-3 h-5 w-5 text-purple-600" />
                  Upload Ảnh
                  <Badge variant="outline" className="ml-3 bg-white">
                    Drag & Drop
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Upload Area */}
                  <div 
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                      dragOver 
                        ? 'border-purple-400 bg-purple-50' 
                        : 'border-gray-300 hover:border-purple-300 hover:bg-purple-50/50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {isUploading ? (
                      <div className="space-y-4">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
                        <p className="text-purple-600 font-medium text-lg">Đang upload...</p>
                        <p className="text-sm text-gray-500">Vui lòng đợi trong giây lát</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center">
                          <Image className="h-10 w-10 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-medium text-gray-900 mb-3">
                            Kéo thả ảnh vào đây
                          </p>
                          <p className="text-gray-500 mb-6">
                            hoặc click để chọn file từ máy tính
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="imageUpload"
                          />
                          <Button
                            onClick={() => document.getElementById('imageUpload')?.click()}
                            size="lg"
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          >
                            <Upload className="mr-2 h-5 w-5" />
                            Chọn ảnh từ máy tính
                          </Button>
                        </div>
                        <div className="text-sm text-gray-400 space-y-2">
                          <p><strong>Định dạng hỗ trợ:</strong> JPG, PNG, GIF, WEBP, BMP</p>
                          <p><strong>Kích thước tối đa:</strong> 10MB</p>
                          <p><strong>Khuyến nghị:</strong> Ảnh có chất lượng cao để hiển thị tốt nhất</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Current Upload Result */}
                  {uploadedImageUrl && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-green-800 flex items-center">
                          <Check className="mr-2 h-5 w-5" />
                          Upload thành công!
                        </h3>
                        <Button
                          onClick={clearUploadedImage}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Preview Image */}
                      <div className="mb-4">
                        <div className="aspect-video bg-white rounded-lg border-2 border-green-200 overflow-hidden max-w-md">
                          <img 
                            src={uploadedImageUrl} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      
                      {/* URL Display */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-green-800">URL ảnh:</label>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 p-3 bg-white rounded-lg border border-green-300">
                            <code className="text-sm text-gray-600 break-all">
                              {uploadedImageUrl}
                            </code>
                          </div>
                          <Button
                            onClick={() => copyUrlToClipboard()}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {urlCopied ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        
                        {urlCopied && (
                          <div className="flex items-center text-green-700 text-sm">
                            <Check className="mr-1 h-4 w-4" />
                            URL đã được sao chép vào clipboard!
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Instructions */}
            <Card className="border border-blue-200 shadow-lg bg-white/90">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                <CardTitle className="flex items-center text-blue-900">
                  <Info className="mr-2 h-5 w-5" />
                  Hướng dẫn sử dụng
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">1.</span>
                    Chọn hoặc kéo thả ảnh vào khu vực upload
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">2.</span>
                    Đợi ảnh upload thành công
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">3.</span>
                    Sao chép URL để sử dụng
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">4.</span>
                    Dán URL vào nội dung blog, services
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Upload History */}
            {uploadHistory.length > 0 && (
              <Card className="border border-gray-200 shadow-lg bg-white/90">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-gray-900">
                      <ImageIcon className="mr-2 h-5 w-5" />
                      Lịch sử upload
                    </CardTitle>
                    <Button
                      onClick={clearHistory}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {uploadHistory.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
                        <div className="w-12 h-12 bg-white rounded border overflow-hidden">
                          <img 
                            src={item.url} 
                            alt={item.filename}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.filename}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        <Button
                          onClick={() => copyUrlToClipboard(item.url)}
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 