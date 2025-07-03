"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  Image as ImageIcon,
  Eye,
  Activity,
  Upload,
  Loader2,
  ExternalLink,
  Copy
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"

interface Banner {
  id: number
  title: string
  description?: string
  image_id: number
  url?: string
  is_active: boolean
  order: number
  created_at: string
  updated_at: string
  created_by: number
  image: {
    id: number
    filename: string
    url: string
    alt_text: string
    width: number
    height: number
    file_size: number
    mime_type: string
  }
  creator?: {
    id: number
    username: string
    email: string
    role: string
  }
}

interface FormData {
  title: string
  description: string
  url: string
  is_active: boolean
  order: number
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null)
  
  // Form states
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    url: "",
    is_active: true,
    order: 1
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string>("")
  
  // Toggle loading states
  const [toggleActiveLoading, setToggleActiveLoading] = useState<number | null>(null)

  const { toast } = useToast()
  const { token } = useAuth()

  // Fetch banners
  const fetchBanners = useCallback(async (isRefresh = false) => {
    if (!token) return
    
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      
      let url = `http://14.187.180.6:12122/api/banners`
      
      if (statusFilter !== "all") {
        url += `?is_active=${statusFilter === "active"}`
      }
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBanners(Array.isArray(data) ? data : [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast({
          title: "Lỗi",
          description: errorData.detail || "Không thể tải danh sách banner",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching banners:", error)
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối đến server. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [token, statusFilter, toast])

  useEffect(() => {
    fetchBanners()
  }, [fetchBanners])

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Lỗi",
          description: "Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP, BMP)",
          variant: "destructive",
        })
        return
      }

      // Validate file size (max 15MB for banners)
      if (file.size > 15 * 1024 * 1024) {
        toast({
          title: "Lỗi",
          description: "Kích thước file không được vượt quá 15MB",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
      const previewUrl = URL.createObjectURL(file)
      setFilePreview(previewUrl)
    }
  }

  // Create banner with image upload
  const handleCreateBanner = async () => {
    if (!selectedFile) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file ảnh",
        variant: "destructive",
      })
      return
    }

    if (!formData.title.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tiêu đề banner",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      
      // Use upload-with-banner endpoint (recommended)
      const uploadData = new FormData()
      uploadData.append('file', selectedFile)
      uploadData.append('title', formData.title.trim())
      uploadData.append('description', formData.description.trim())
      uploadData.append('url', formData.url.trim())
      uploadData.append('is_active', formData.is_active.toString())
      uploadData.append('order', formData.order.toString())

      const response = await fetch("http://14.187.180.6:12122/api/banners/upload-with-banner", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadData,
      })

      if (response.ok) {
        const newBanner = await response.json()
        toast({
          title: "Thành công",
          description: `Tạo banner "${newBanner.title}" thành công`,
        })
        setIsCreateDialogOpen(false)
        resetForm()
        fetchBanners()
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast({
          title: "Lỗi tạo banner",
          description: errorData.detail || "Không thể tạo banner. Vui lòng thử lại.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating banner:", error)
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối đến server. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Update banner
  const handleUpdateBanner = async () => {
    if (!selectedBanner) return

    if (!formData.title.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tiêu đề banner",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      
      const requestBody = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        url: formData.url.trim(),
        is_active: formData.is_active,
        order: formData.order
      }

      const response = await fetch(`http://14.187.180.6:12122/api/banners/${selectedBanner.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        const updatedBanner = await response.json()
        toast({
          title: "Thành công",
          description: `Cập nhật banner "${updatedBanner.title}" thành công`,
        })
        setIsEditDialogOpen(false)
        resetForm()
        fetchBanners()
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast({
          title: "Lỗi cập nhật",
          description: errorData.detail || "Không thể cập nhật banner.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating banner:", error)
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối đến server. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Delete banner
  const handleDeleteBanner = async () => {
    if (!selectedBanner) return

    try {
      setSubmitting(true)
      
      // Delete with image (query param delete_image=true)
      const response = await fetch(`http://14.187.180.6:12122/api/banners/${selectedBanner.id}?delete_image=true`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Thành công",
          description: `Xóa banner "${selectedBanner.title}" thành công`,
        })
        setIsDeleteDialogOpen(false)
        fetchBanners()
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast({
          title: "Lỗi xóa banner",
          description: errorData.detail || "Không thể xóa banner này.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting banner:", error)
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối đến server. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Toggle banner active status
  const handleToggleActive = async (banner: Banner) => {
    if (toggleActiveLoading === banner.id) return
    
    try {
      setToggleActiveLoading(banner.id)
      
      const response = await fetch(`http://14.187.180.6:12122/api/banners/${banner.id}/toggle`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Thành công",
          description: `Banner "${banner.title}" đã ${result.is_active ? 'hiển thị' : 'ẩn'}`,
          duration: 2000,
        })
        fetchBanners()
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast({
          title: "Lỗi",
          description: errorData.detail || "Không thể thay đổi trạng thái banner",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error toggling banner:", error)
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối đến server",
        variant: "destructive",
      })
    } finally {
      setToggleActiveLoading(null)
    }
  }

  // Dialog handlers
  const openEditDialog = (banner: Banner) => {
    setSelectedBanner(banner)
    setFormData({
      title: banner.title,
      description: banner.description || "",
      url: banner.url || "",
      is_active: banner.is_active,
      order: banner.order
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (banner: Banner) => {
    setSelectedBanner(banner)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      url: "",
      is_active: true,
      order: 1
    })
    setSelectedFile(null)
    setFilePreview("")
    setSelectedBanner(null)
  }

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Copy URL to clipboard
  const copyUrlToClipboard = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Đã copy",
        description: "URL ảnh đã được copy vào clipboard",
        duration: 2000,
      })
    }).catch(() => {
      toast({
        title: "Lỗi",
        description: "Không thể copy URL",
        variant: "destructive",
      })
    })
  }

  // Filter banners
  const filteredBanners = banners.filter((banner) => {
    const matchesSearch = searchTerm === "" || 
      banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (banner.description && banner.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && banner.is_active) ||
      (statusFilter === "inactive" && !banner.is_active)
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Quản lý Banner
          </h2>
          <p className="text-gray-500 mt-1">Tạo và quản lý banner hiển thị trên trang chủ</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchBanners(true)}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          
          <Button 
            onClick={() => setIsCreateDialogOpen(true)} 
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg"
            disabled={loading}
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm Banner
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tiêu đề hoặc mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-200"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-md bg-white"
          >
            <option value="all">Tất cả</option>
            <option value="active">Đang hiển thị</option>
            <option value="inactive">Đã ẩn</option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
              <p className="text-gray-500">Đang tải danh sách banner...</p>
            </div>
          </div>
        ) : filteredBanners.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có banner nào</h3>
            <p className="text-gray-500 mb-6">Tạo banner đầu tiên để hiển thị trên trang chủ</p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-red-600 hover:bg-red-700">
              <Plus className="mr-2 h-4 w-4" />
              Tạo banner đầu tiên
            </Button>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">STT</TableHead>
                    <TableHead>Banner</TableHead>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>URL Link</TableHead>
                    <TableHead>Thứ tự</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBanners.map((banner, index) => (
                    <TableRow key={banner.id}>
                      <TableCell className="font-mono text-sm">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 h-10 rounded border overflow-hidden">
                            <Image
                              src={banner.image.url.startsWith('http') ? banner.image.url : `http://14.187.180.6:12122${banner.image.url}`}
                              alt={banner.image.alt_text || banner.title}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg?height=40&width=64"
                              }}
                            />
                          </div>
                          <div className="text-xs text-gray-500">
                            {banner.image.width}×{banner.image.height}
                            <br />
                            {(banner.image.file_size / 1024 / 1024).toFixed(1)}MB
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <h4 className="font-medium">{banner.title}</h4>
                          {banner.description && (
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {banner.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {banner.url ? (
                          <div className="flex items-center gap-1">
                            <a 
                              href={banner.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm truncate max-w-xs"
                            >
                              {banner.url}
                            </a>
                            <ExternalLink className="h-3 w-3 text-gray-400" />
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Không có</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{banner.order}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={banner.is_active}
                            onCheckedChange={() => handleToggleActive(banner)}
                            disabled={toggleActiveLoading === banner.id}
                            className="data-[state=checked]:bg-green-500"
                          />
                          <span className={`text-sm ${banner.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                            {banner.is_active ? 'Hiển thị' : 'Ẩn'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(banner.created_at).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.open(banner.image.url.startsWith('http') ? banner.image.url : `http://14.187.180.6:12122${banner.image.url}`, '_blank')}>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem ảnh
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copyUrlToClipboard(banner.image.url.startsWith('http') ? banner.image.url : `http://14.187.180.6:12122${banner.image.url}`)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy URL
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(banner)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(banner)}>
                              <Activity className={`mr-2 h-4 w-4 ${banner.is_active ? 'text-green-500' : 'text-gray-400'}`} />
                              {banner.is_active ? 'Ẩn banner' : 'Hiển thị banner'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDeleteDialog(banner)} className="text-red-600">
                              <Trash className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>

      {/* Create Banner Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl font-semibold">
              <Plus className="mr-2 h-5 w-5 text-red-600" />
              Thêm Banner Mới
            </DialogTitle>
            <DialogDescription>Upload ảnh và tạo banner hiển thị trên trang chủ</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* File Upload */}
            <div className="space-y-2">
              <Label className="flex items-center text-sm font-medium">
                <Upload className="mr-2 h-4 w-4" />
                Chọn ảnh banner <span className="text-red-500">*</span>
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
                <input
                  type="file"
                  id="banner-upload"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label htmlFor="banner-upload" className="cursor-pointer flex flex-col items-center space-y-2 text-gray-600 hover:text-red-600">
                  <Upload className="h-12 w-12" />
                  <span className="text-sm font-medium">
                    Chọn ảnh banner hoặc kéo thả vào đây
                  </span>
                  <span className="text-xs text-gray-500">
                    Hỗ trợ: JPG, PNG, GIF, WEBP, BMP (tối đa 15MB)
                    <br />
                    Khuyến nghị: 1920x600px (ratio 16:5)
                  </span>
                </label>
              </div>
              
              {/* File Preview */}
              {filePreview && (
                <div className="mt-4">
                  <Label className="text-sm text-gray-600 mb-2 block">Preview:</Label>
                  <div className="relative w-full h-32 border rounded-lg overflow-hidden">
                    <Image
                      src={filePreview}
                      alt="Banner preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    File: {selectedFile?.name} ({((selectedFile?.size || 0) / 1024 / 1024).toFixed(1)}MB)
                  </div>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Tiêu đề banner <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Nhập tiêu đề banner"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order" className="text-sm font-medium">
                  Thứ tự hiển thị
                </Label>
                <Input
                  id="order"
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={(e) => handleInputChange("order", parseInt(e.target.value) || 1)}
                  placeholder="1"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Mô tả (tùy chọn)
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Mô tả ngắn về banner"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="url" className="text-sm font-medium">
                URL chuyển hướng (tùy chọn)
              </Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => handleInputChange("url", e.target.value)}
                placeholder="https://example.com"
              />
              <p className="text-xs text-gray-500">URL sẽ được mở khi người dùng click vào banner</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange("is_active", checked)}
              />
              <Label htmlFor="is_active" className="text-sm">
                Hiển thị banner ngay
              </Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreateDialogOpen(false)
                resetForm()
              }}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button 
              onClick={handleCreateBanner} 
              className="bg-red-600 hover:bg-red-700"
              disabled={submitting || !selectedFile}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo Banner
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Banner Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl font-semibold">
              <Edit className="mr-2 h-5 w-5 text-orange-600" />
              Chỉnh sửa Banner
            </DialogTitle>
            <DialogDescription>Cập nhật thông tin cho "{selectedBanner?.title}"</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Current Banner Preview */}
            {selectedBanner && (
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Banner hiện tại:</Label>
                <div className="relative w-full h-32 border rounded-lg overflow-hidden">
                  <Image
                    src={selectedBanner.image.url.startsWith('http') ? selectedBanner.image.url : `http://14.187.180.6:12122${selectedBanner.image.url}`}
                    alt={selectedBanner.image.alt_text || selectedBanner.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-xs text-gray-500">
                  {selectedBanner.image.width}×{selectedBanner.image.height} • {(selectedBanner.image.file_size / 1024 / 1024).toFixed(1)}MB
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="text-sm font-medium">
                  Tiêu đề banner <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Nhập tiêu đề banner"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-order" className="text-sm font-medium">
                  Thứ tự hiển thị
                </Label>
                <Input
                  id="edit-order"
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={(e) => handleInputChange("order", parseInt(e.target.value) || 1)}
                  placeholder="1"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-sm font-medium">
                Mô tả (tùy chọn)
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Mô tả ngắn về banner"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-url" className="text-sm font-medium">
                URL chuyển hướng (tùy chọn)
              </Label>
              <Input
                id="edit-url"
                type="url"
                value={formData.url}
                onChange={(e) => handleInputChange("url", e.target.value)}
                placeholder="https://example.com"
              />
              <p className="text-xs text-gray-500">URL sẽ được mở khi người dùng click vào banner</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange("is_active", checked)}
              />
              <Label htmlFor="edit-is_active" className="text-sm">
                Hiển thị banner
              </Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditDialogOpen(false)
                resetForm()
              }}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button 
              onClick={handleUpdateBanner} 
              className="bg-orange-600 hover:bg-orange-700"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Cập nhật
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600 text-xl font-semibold">
              <Trash className="mr-2 h-5 w-5" />
              Xác nhận xóa banner
            </DialogTitle>
            <DialogDescription className="pt-2">
              Bạn có chắc chắn muốn xóa banner <strong>"{selectedBanner?.title}"</strong>?
              <br />
              <span className="text-red-600 font-medium">Hành động này sẽ xóa cả ảnh và không thể hoàn tác!</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button 
              onClick={handleDeleteBanner} 
              variant="destructive"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash className="mr-2 h-4 w-4" />
                  Xóa Banner
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 