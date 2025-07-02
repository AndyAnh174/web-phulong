"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Progress } from "@/components/ui/progress"
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  Calendar,
  Eye,
  Filter,
  RefreshCw,
  Grid3X3,
  List,
  Star,
  Clock,
  FileText,
  Tag,
  TrendingUp,
  ChevronRight as ChevronRightIcon,
  Image as ImageIcon,
  Activity,
  Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"

// Import MDEditor dynamically to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
)

interface Blog {
  id: number
  title: string
  content: string
  image_url: string
  category: string
  is_active: boolean
  created_at: string
  author?: string
  views?: number
  tags?: string[]
}

interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface FormData {
  title: string
  content: string
  image_url: string
  category: string
  is_active: boolean
}

interface FormErrors {
  title?: string
  content?: string
  image_url?: string
  category?: string
}

const API_BASE_URL =  'http://14.187.180.6:12122/api'

export default function AdminBlogsPage() {
  // Debug API URL
  console.log("API_BASE_URL:", API_BASE_URL)
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1
  })
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null)
  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    image_url: "",
    category: "",
    is_active: true,
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  // State cho Image Uploader
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

  const { toast } = useToast()
  const { token } = useAuth()
  const itemsPerPage = 12

  // Get unique categories for filter
  const categories = Array.from(new Set(blogs.map(blog => blog.category))).filter(Boolean)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Form validation
  const validateForm = (): boolean => {
    const errors: FormErrors = {}

    if (!formData.title.trim()) {
      errors.title = "Tiêu đề là bắt buộc"
    } else if (formData.title.length < 5) {
      errors.title = "Tiêu đề phải có ít nhất 5 ký tự"
    }

    if (!formData.content.trim()) {
      errors.content = "Nội dung là bắt buộc"
    } else if (formData.content.length < 50) {
      errors.content = "Nội dung phải có ít nhất 50 ký tự"
    }

    if (!formData.category.trim()) {
      errors.category = "Danh mục là bắt buộc"
    }

    if (formData.image_url && !isValidUrl(formData.image_url)) {
      errors.image_url = "URL hình ảnh không hợp lệ"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  // Fetch blogs with proper pagination
  const fetchBlogs = useCallback(async (isRefresh = false) => {
    if (!token) {
      console.log("No token available for fetching blogs")
      return
    }
    
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      
      const skip = (currentPage - 1) * itemsPerPage
      const fetchUrl = `${API_BASE_URL}/blogs?skip=${skip}&limit=${itemsPerPage}`
      console.log("Fetching blogs from:", fetchUrl)
      
      const response = await fetch(fetchUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Fetch blogs response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Blogs fetched successfully:", data)
        setBlogs(Array.isArray(data) ? data : [])

        // Update pagination info
        setPagination({
          total: data.length,
          page: currentPage,
          limit: itemsPerPage,
          totalPages: Math.ceil(data.length / itemsPerPage) || 1
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast({
          title: "Lỗi",
          description: errorData.detail || "Không thể tải danh sách bài viết",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching blogs:", error)
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối đến server. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [token, currentPage, itemsPerPage, toast])

  useEffect(() => {
    fetchBlogs()
  }, [fetchBlogs])

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleCreateBlog = async () => {
    if (!validateForm()) {
      console.log("Form validation failed:", formErrors)
      return
    }

    try {
      setSubmitting(true)
      const requestBody = {
        title: formData.title.trim(),
        content: formData.content, // Markdown content
        image_url: formData.image_url.trim(),
        category: formData.category.trim(),
        is_active: formData.is_active,
      }

      console.log("Creating blog with data:", requestBody)
      console.log("API URL:", `${API_BASE_URL}/blogs`)
      console.log("Token available:", !!token)

      const response = await fetch(`${API_BASE_URL}/blogs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const newBlog = await response.json()
        console.log("Blog created successfully:", newBlog)
        toast({
          title: "Thành công",
          description: `Tạo bài viết "${newBlog.title}" thành công`,
        })
        setIsCreateDialogOpen(false)
        resetForm()
        fetchBlogs()
      } else {
        const responseText = await response.text()
        console.error("Error response text:", responseText)
        
        let errorData: any = {}
        try {
          errorData = JSON.parse(responseText)
        } catch (e) {
          console.error("Failed to parse error response as JSON:", e)
        }
        
        toast({
          title: "Lỗi tạo bài viết",
          description: errorData.detail || responseText || "Không thể tạo bài viết. Vui lòng kiểm tra lại thông tin.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating blog:", error)
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối đến server. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateBlog = async () => {
    if (!selectedBlog || !validateForm()) return

    try {
      setSubmitting(true)
      const requestBody = {
        title: formData.title.trim(),
        content: formData.content, // Markdown content
        image_url: formData.image_url.trim(),
        category: formData.category.trim(),
        is_active: formData.is_active,
      }

      const response = await fetch(`${API_BASE_URL}/blogs/${selectedBlog.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        const updatedBlog = await response.json()
        toast({
          title: "Thành công",
          description: `Cập nhật bài viết "${updatedBlog.title}" thành công`,
        })
        setIsEditDialogOpen(false)
        resetForm()
        fetchBlogs()
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast({
          title: "Lỗi cập nhật",
          description: errorData.detail || "Không thể cập nhật bài viết. Vui lòng kiểm tra lại thông tin.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating blog:", error)
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối đến server. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteBlog = async () => {
    if (!selectedBlog) return

    try {
      setSubmitting(true)
      const response = await fetch(`${API_BASE_URL}/blogs/${selectedBlog.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Thành công",
          description: `Xóa bài viết "${selectedBlog.title}" thành công`,
        })
        setIsDeleteDialogOpen(false)
        fetchBlogs()
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast({
          title: "Lỗi xóa bài viết",
          description: errorData.detail || "Không thể xóa bài viết này.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting blog:", error)
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối đến server. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const openEditDialog = (blog: Blog) => {
    setSelectedBlog(blog)
    setFormData({
      title: blog.title,
      content: blog.content,
      image_url: blog.image_url,
      category: blog.category,
      is_active: blog.is_active,
    })
    setFormErrors({})
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (blog: Blog) => {
    setSelectedBlog(blog)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      image_url: "",
      category: "",
      is_active: true,
    })
    setFormErrors({})
    setSelectedBlog(null)
  }

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (field in formErrors && formErrors[field as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [field as keyof FormErrors]: undefined }))
    }
  }

  // Upload ảnh và lấy URL
  const handleImageUpload = async (file: File, altText: string = '', category: string = 'blog') => {
    try {
      setImageUploadLoading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alt_text', altText);
      formData.append('category', category);
      formData.append('is_visible', 'true');

      const response = await fetch('http://14.187.180.6:12122/api/images/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setUploadedImageUrl(result.image.url);
      
      toast({
        title: 'Thành công',
        description: `Upload ảnh thành công! URL: ${result.image.url}`,
      });
      
      return result.image.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể upload ảnh. Vui lòng thử lại.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setImageUploadLoading(false);
    }
  };

  // Copy URL to clipboard
  const copyUrlToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Đã copy',
        description: 'URL ảnh đã được copy vào clipboard',
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể copy URL',
        variant: 'destructive',
      });
    }
  };

  // Filter blogs based on search and filters
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch = debouncedSearchTerm === "" || 
      blog.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      blog.content.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      blog.category.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === "all" || blog.category === categoryFilter
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && blog.is_active) || 
      (statusFilter === "inactive" && !blog.is_active)
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Pagination calculations
  const getPageNumbers = () => {
    const totalPages = pagination.totalPages
    const current = pagination.page
    const pages = []
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (current >= totalPages - 3) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = current - 1; i <= current + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  // Blog Card Component
  const BlogCard = ({ blog }: { blog: Blog }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 border-0 shadow-md">
      <div className="relative overflow-hidden rounded-t-lg">
        {blog.image_url ? (
          <Image
            src={blog.image_url}
            alt={blog.title}
            width={400}
            height={200}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-blog.jpg'
            }}
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <BookOpen className="h-16 w-16 text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant={blog.is_active ? "default" : "secondary"} className="shadow-md">
            {blog.is_active ? "Hoạt động" : "Ẩn"}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs">
            <Tag className="mr-1 h-3 w-3" />
            {blog.category}
          </Badge>
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="mr-1 h-3 w-3" />
            {new Date(blog.created_at).toLocaleDateString("vi-VN")}
          </div>
        </div>
        
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {blog.title}
        </h3>
        
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {blog.content.replace(/[#*`]/g, '').substring(0, 120)}...
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {blog.views && (
              <div className="flex items-center">
                <Eye className="mr-1 h-3 w-3" />
                {blog.views}
              </div>
            )}
            <div className="flex items-center">
              <Activity className="mr-1 h-3 w-3" />
              ID: {blog.id}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEditDialog(blog)}>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openDeleteDialog(blog)} className="text-red-600">
                <Trash className="mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Quản lý bài viết
          </h2>
          <p className="text-gray-500 mt-1">Tạo và quản lý nội dung blog với Markdown editor</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchBlogs(true)}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            onClick={() => setIsCreateDialogOpen(true)} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            disabled={loading}
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm bài viết
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tiêu đề, nội dung hoặc danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-200"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Ẩn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-500">Đang tải danh sách bài viết...</p>
            </div>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có bài viết nào</h3>
            <p className="text-gray-500 mb-6">Tạo bài viết đầu tiên để bắt đầu xây dựng nội dung blog</p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Tạo bài viết đầu tiên
            </Button>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        ) : (
          // Table view
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">ID</TableHead>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBlogs.map((blog) => (
                    <TableRow key={blog.id}>
                      <TableCell className="font-mono text-sm">{blog.id}</TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <h4 className="font-medium truncate">{blog.title}</h4>
                          <p className="text-sm text-gray-500 truncate">
                            {blog.content.replace(/[#*`]/g, '').substring(0, 60)}...
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{blog.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={blog.is_active ? "default" : "secondary"}>
                          {blog.is_active ? "Hoạt động" : "Ẩn"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(blog.created_at).toLocaleDateString("vi-VN")}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(blog)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDeleteDialog(blog)} className="text-red-600">
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Hiển thị {filteredBlogs.length} / {pagination.total} bài viết
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={index} className="px-2 text-gray-400">...</span>
              ) : (
                <Button
                  key={index}
                  variant={pagination.page === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page as number)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              )
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create Blog Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl font-semibold">
              <Plus className="mr-2 h-5 w-5 text-blue-600" />
              Thêm bài viết mới
            </DialogTitle>
            <DialogDescription>Tạo nội dung blog với Markdown editor chuyên nghiệp</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="flex items-center text-sm font-medium">
                  <FileText className="mr-2 h-4 w-4" />
                  Tiêu đề bài viết <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Nhập tiêu đề bài viết"
                  className={formErrors.title ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"}
                />
                {formErrors.title && (
                  <p className="text-xs text-red-500">{formErrors.title}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="flex items-center text-sm font-medium">
                  <Tag className="mr-2 h-4 w-4" />
                  Danh mục <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  placeholder="VD: Công nghệ, Kinh doanh, Du lịch"
                  className={formErrors.category ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"}
                />
                {formErrors.category && (
                  <p className="text-xs text-red-500">{formErrors.category}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image_url" className="flex items-center text-sm font-medium">
                <ImageIcon className="mr-2 h-4 w-4" />
                URL hình ảnh (tùy chọn)
              </Label>
              
              {/* Image Uploader - Upload lên server và lấy URL */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                <Label className="text-sm font-medium text-blue-800 mb-2 block">
                  🌟 Upload ảnh lên server (lấy URL)
                </Label>
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    id="blog-url-image-upload"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const url = await handleImageUpload(file, 'Blog image', 'blog');
                          // Tự động điền vào input image_url
                          handleInputChange("image_url", url);
                        } catch (error) {
                          // Error handled in function
                        }
                      }
                      e.target.value = ''; // Reset input
                    }}
                    className="hidden"
                    disabled={imageUploadLoading}
                  />
                  <label htmlFor="blog-url-image-upload" className="cursor-pointer flex flex-col items-center space-y-2 text-blue-600 hover:text-blue-700">
                    {imageUploadLoading ? (
                      <>
                        <RefreshCw className="h-8 w-8 animate-spin" />
                        <span className="text-sm font-medium">Đang upload...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-8 w-8" />
                        <span className="text-sm font-medium">Upload ảnh để lấy URL</span>
                        <span className="text-xs text-blue-500">
                          JPG, PNG, GIF, WEBP, BMP (tối đa 10MB)
                        </span>
                      </>
                    )}
                  </label>
                </div>
                
                {/* Display uploaded URL */}
                {uploadedImageUrl && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Label className="text-xs font-medium text-green-800 mb-1 block">
                      ✅ URL ảnh đã upload:
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={uploadedImageUrl}
                        readOnly
                        className="text-xs bg-white border-green-300 flex-1"
                        onClick={(e) => e.target.select()}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => copyUrlToClipboard(uploadedImageUrl)}
                        className="text-xs border-green-300 text-green-700 hover:bg-green-50"
                      >
                        Copy
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleInputChange("image_url", uploadedImageUrl)}
                        className="text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        Dùng URL
                      </Button>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      👆 Copy URL hoặc click "Dùng URL" để tự động điền vào input
                    </p>
                  </div>
                )}
              </div>

              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => handleInputChange("image_url", e.target.value)}
                placeholder="https://example.com/image.jpg hoặc upload ảnh ở trên"
                className={formErrors.image_url ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"}
              />
              {formErrors.image_url && (
                <p className="text-xs text-red-500">{formErrors.image_url}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content" className="flex items-center text-sm font-medium">
                <FileText className="mr-2 h-4 w-4" />
                Nội dung bài viết (Markdown) <span className="text-red-500">*</span>
              </Label>
              <div className={formErrors.content ? "border border-red-500 rounded-md" : ""}>
                <MDEditor
                  value={formData.content}
                  onChange={(value) => handleInputChange("content", value || "")}
                  height={400}
                  data-color-mode="light"
                />
              </div>
              {formErrors.content && (
                <p className="text-xs text-red-500">{formErrors.content}</p>
              )}
              <p className="text-xs text-gray-500">
                Hỗ trợ Markdown: **bold**, *italic*, `code`, # headers, - lists, [links](url), ![images](url)
              </p>
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange("is_active", checked)}
              />
              <Label htmlFor="is_active" className="text-sm">
                Xuất bản bài viết ngay
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
              onClick={handleCreateBlog} 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo bài viết
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Blog Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl font-semibold">
              <Edit className="mr-2 h-5 w-5 text-orange-600" />
              Chỉnh sửa bài viết
            </DialogTitle>
            <DialogDescription>Cập nhật nội dung cho "{selectedBlog?.title}"</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="flex items-center text-sm font-medium">
                  <FileText className="mr-2 h-4 w-4" />
                  Tiêu đề bài viết <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Nhập tiêu đề bài viết"
                  className={formErrors.title ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"}
                />
                {formErrors.title && (
                  <p className="text-xs text-red-500">{formErrors.title}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category" className="flex items-center text-sm font-medium">
                  <Tag className="mr-2 h-4 w-4" />
                  Danh mục <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  placeholder="VD: Công nghệ, Kinh doanh, Du lịch"
                  className={formErrors.category ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"}
                />
                {formErrors.category && (
                  <p className="text-xs text-red-500">{formErrors.category}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-image_url" className="flex items-center text-sm font-medium">
                <ImageIcon className="mr-2 h-4 w-4" />
                URL hình ảnh (tùy chọn)
              </Label>
              
              {/* Image Uploader - Upload lên server và lấy URL */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                <Label className="text-sm font-medium text-blue-800 mb-2 block">
                  🌟 Upload ảnh lên server (lấy URL)
                </Label>
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    id="edit-blog-url-image-upload"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const url = await handleImageUpload(file, 'Blog image', 'blog');
                          // Tự động điền vào input image_url
                          handleInputChange("image_url", url);
                        } catch (error) {
                          // Error handled in function
                        }
                      }
                      e.target.value = ''; // Reset input
                    }}
                    className="hidden"
                    disabled={imageUploadLoading}
                  />
                  <label htmlFor="edit-blog-url-image-upload" className="cursor-pointer flex flex-col items-center space-y-2 text-blue-600 hover:text-blue-700">
                    {imageUploadLoading ? (
                      <>
                        <RefreshCw className="h-8 w-8 animate-spin" />
                        <span className="text-sm font-medium">Đang upload...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-8 w-8" />
                        <span className="text-sm font-medium">Upload ảnh để lấy URL</span>
                        <span className="text-xs text-blue-500">
                          JPG, PNG, GIF, WEBP, BMP (tối đa 10MB)
                        </span>
                      </>
                    )}
                  </label>
                </div>
                
                {/* Display uploaded URL */}
                {uploadedImageUrl && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Label className="text-xs font-medium text-green-800 mb-1 block">
                      ✅ URL ảnh đã upload:
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={uploadedImageUrl}
                        readOnly
                        className="text-xs bg-white border-green-300 flex-1"
                        onClick={(e) => e.target.select()}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => copyUrlToClipboard(uploadedImageUrl)}
                        className="text-xs border-green-300 text-green-700 hover:bg-green-50"
                      >
                        Copy
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleInputChange("image_url", uploadedImageUrl)}
                        className="text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        Dùng URL
                      </Button>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      👆 Copy URL hoặc click "Dùng URL" để tự động điền vào input
                    </p>
                  </div>
                )}
              </div>

              <Input
                id="edit-image_url"
                value={formData.image_url}
                onChange={(e) => handleInputChange("image_url", e.target.value)}
                placeholder="https://example.com/image.jpg hoặc upload ảnh ở trên"
                className={formErrors.image_url ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"}
              />
              {formErrors.image_url && (
                <p className="text-xs text-red-500">{formErrors.image_url}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-content" className="flex items-center text-sm font-medium">
                <FileText className="mr-2 h-4 w-4" />
                Nội dung bài viết (Markdown) <span className="text-red-500">*</span>
              </Label>
              <div className={formErrors.content ? "border border-red-500 rounded-md" : ""}>
                <MDEditor
                  value={formData.content}
                  onChange={(value) => handleInputChange("content", value || "")}
                  height={400}
                  data-color-mode="light"
                />
              </div>
              {formErrors.content && (
                <p className="text-xs text-red-500">{formErrors.content}</p>
              )}
              <p className="text-xs text-gray-500">
                Hỗ trợ Markdown: **bold**, *italic*, `code`, # headers, - lists, [links](url), ![images](url)
              </p>
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="edit-is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange("is_active", checked)}
              />
              <Label htmlFor="edit-is_active" className="text-sm">
                Bài viết hoạt động
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
              onClick={handleUpdateBlog} 
              className="bg-orange-600 hover:bg-orange-700"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
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
              Xác nhận xóa bài viết
            </DialogTitle>
            <DialogDescription className="pt-2">
              Bạn có chắc chắn muốn xóa bài viết <strong>"{selectedBlog?.title}"</strong>?
              <br />
              <span className="text-red-600 font-medium">Hành động này không thể hoàn tác!</span>
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
              onClick={handleDeleteBlog} 
              variant="destructive"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash className="mr-2 h-4 w-4" />
                  Xóa bài viết
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
