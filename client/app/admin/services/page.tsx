"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
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
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  RefreshCw,
  Package,
  Eye,
  Star,
  Activity,
  Grid3X3,
  List,
  Calendar,
  TrendingUp,
  Image as ImageIcon,
  Upload
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"
import { ensureHttps } from "@/lib/utils"

interface Service {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  category: string
  featured: boolean
  is_active: boolean
  created_at: string
}

interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface ImageItem {
  id: number
  filename: string
  alt_text?: string
  category?: string
  is_visible: boolean
  full_url: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  })
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category: "",
    featured: false,
    is_active: true,
  })

  const [images, setImages] = useState<ImageItem[]>([])
  const [imageLoading, setImageLoading] = useState(true)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isEditImageDialogOpen, setIsEditImageDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null)
  const [uploadFormData, setUploadFormData] = useState<{file: File | null; alt_text: string; is_visible: boolean}>({file: null, alt_text: "", is_visible: true})

  const router = useRouter()
  const { toast } = useToast()
  const { token } = useAuth()
  const itemsPerPage = 10

  // Get unique categories for filter
  const categories = Array.from(new Set(services.map(service => service.category))).filter(Boolean)

  const fetchServices = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      
      const skip = (currentPage - 1) * itemsPerPage
      let url = `${API_URL}/api/services?skip=${skip}&limit=${itemsPerPage}`
      
      // Add filters to URL (search is handled on frontend)
      if (categoryFilter !== "all") {
        url += `&category=${encodeURIComponent(categoryFilter)}`
      }
      if (statusFilter !== "all") {
        url += `&is_active=${statusFilter === "active"}`
      }
      // Note: search filtering is done on frontend, not in API
      
      console.log('Fetching URL:', url)
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('API Response:', data)
        
        // Debug: Kiểm tra cấu trúc service
        if (Array.isArray(data) && data.length > 0) {
          console.log('First service structure:', data[0])
          console.log('Service has featured field?', 'featured' in data[0])
          console.log('Featured value:', data[0].featured)
        }
        
        // Handle different API response formats
        if (Array.isArray(data)) {
          setServices(data)
          // For pagination, we need total count from a separate API call or header
          // For now, let's assume if we get less than itemsPerPage, we're on last page
          const isLastPage = data.length < itemsPerPage
          const estimatedTotal = isLastPage ? ((currentPage - 1) * itemsPerPage) + data.length : currentPage * itemsPerPage + 1
          
          setPagination({
            total: estimatedTotal,
            page: currentPage,
            limit: itemsPerPage,
            totalPages: isLastPage ? currentPage : currentPage + 1
          })
        } else if (data.items && data.total !== undefined) {
          // If API returns paginated response
          setServices(data.items)
          setPagination({
            total: data.total,
            page: currentPage,
            limit: itemsPerPage,
            totalPages: Math.ceil(data.total / itemsPerPage) || 1
          })
        } else {
          setServices(data)
          setPagination({
            total: data.length || 0,
            page: currentPage,
            limit: itemsPerPage,
            totalPages: Math.ceil((data.length || 0) / itemsPerPage) || 1
          })
        }
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách dịch vụ",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching services:", error)
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến server",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [currentPage, categoryFilter, statusFilter, token, itemsPerPage, toast])

  const fetchImages = async () => {
    try {
      setImageLoading(true)
      const res = await fetch(`${API_URL}/api/images?category=printing&limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        const processedImages = Array.isArray(data) ? data.map((img:any)=>({
          ...img, 
          full_url: ensureHttps(img.file_path? `${API_URL}/${img.file_path}`: `${API_URL}/uploads/${img.filename}`)
        })) : []
        setImages(processedImages)
      } else {
        toast({ title: "Lỗi", description: "Không thể tải danh sách ảnh", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error fetch images", error)
    } finally {
      setImageLoading(false)
    }
  }

  const handleUploadImage = async () => {
    if (!uploadFormData.file) return
    try {
      const fd = new FormData()
      fd.append("file", uploadFormData.file)
      fd.append("alt_text", uploadFormData.alt_text)
      fd.append("category", "printing")
      fd.append("is_visible", String(uploadFormData.is_visible))
      const res = await fetch(`${API_URL}/api/images/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      })
      if (res.ok) {
        toast({ title: "Thành công", description: "Đã tải ảnh" })
        fetchImages()
        setIsUploadDialogOpen(false)
        setUploadFormData({file:null,alt_text:"",is_visible:true})
      } else {
        toast({ title: "Lỗi", description: "Không thể tải ảnh", variant: "destructive" })
      }
    } catch (e) { console.error(e) }
  }

  const handleUpdateImage = async () => {
    if (!selectedImage) return
    try {
      const res = await fetch(`${API_URL}/api/images/${selectedImage.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ alt_text: selectedImage.alt_text, is_visible: selectedImage.is_visible })
      })
      if (res.ok) {
        toast({ title: "Đã cập nhật" })
        fetchImages()
        setIsEditImageDialogOpen(false)
      } else toast({ title: "Lỗi", description: "Cập nhật thất bại", variant:"destructive" })
    } catch(e){console.error(e)}
  }

  const handleDeleteImage = async (img: ImageItem) => {
    if (!confirm("Xóa ảnh này?")) return
    try {
      const res = await fetch(`${API_URL}/api/images/${img.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        toast({ title: "Đã xóa ảnh" })
        fetchImages()
      } else toast({ title: "Lỗi", description: "Xóa thất bại", variant:"destructive" })
    } catch(e){console.error(e)}
  }

  // Main effect for fetching data when page or filters change
  useEffect(() => {
    if (token) {
      fetchServices()
      fetchImages()
    }
  }, [token, fetchServices])

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm, categoryFilter, statusFilter])

  const handleCreateService = async () => {
    try {
      // Chỉ gửi những field mà API hỗ trợ theo document
      const requestBody = {
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        image_url: formData.image_url,
        category: formData.category,
        is_active: formData.is_active,
      }
      
      console.log('Creating service with body:', requestBody)
      
      const response = await fetch(`${API_URL}/api/services`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        const responseData = await response.json()
        console.log('Create response:', responseData)
        
        toast({
          title: "Thành công",
          description: "Tạo dịch vụ mới thành công",
        })
        setIsCreateDialogOpen(false)
        resetForm()
        fetchServices()
      } else {
        const errorData = await response.json()
        console.error('Create error:', errorData)
        toast({
          title: "Lỗi",
          description: errorData.detail || "Không thể tạo dịch vụ",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating service:", error)
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến server",
        variant: "destructive",
      })
    }
  }

  const handleUpdateService = async () => {
    if (!selectedService) return

    try {
      // Chỉ gửi những field mà API hỗ trợ theo document
      const requestBody = {
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        image_url: formData.image_url,
        category: formData.category,
        is_active: formData.is_active,
      }
      
      console.log('Updating service with body:', requestBody)
      console.log('Original service featured value:', selectedService.featured)
      
      const response = await fetch(`${API_URL}/api/services/${selectedService.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        const responseData = await response.json()
        console.log('Update response:', responseData)
        console.log('Response featured value:', responseData.featured)
        
        toast({
          title: "Thành công",
          description: "Cập nhật dịch vụ thành công",
        })
        setIsEditDialogOpen(false)
        resetForm()
        fetchServices()
      } else {
        const errorData = await response.json()
        console.error('Update error:', errorData)
        toast({
          title: "Lỗi",
          description: errorData.detail || "Không thể cập nhật dịch vụ",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating service:", error)
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến server",
        variant: "destructive",
      })
    }
  }

  const handleDeleteService = async () => {
    if (!selectedService) return

    try {
      const response = await fetch(`${API_URL}/api/services/${selectedService.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Xóa dịch vụ thành công",
        })
        setIsDeleteDialogOpen(false)
        fetchServices()
      } else {
        const errorData = await response.json()
        toast({
          title: "Lỗi",
          description: errorData.detail || "Không thể xóa dịch vụ",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting service:", error)
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến server",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (service: Service) => {
    setSelectedService(service)
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      image_url: service.image_url,
      category: service.category,
      featured: service.featured,
      is_active: service.is_active,
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (service: Service) => {
    setSelectedService(service)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      image_url: "",
      category: "",
      featured: false,
      is_active: true,
    })
    setSelectedService(null)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page)
      // fetchServices will be called automatically by useEffect
    }
  }

  const filteredServices = services.filter((service) => {
    const matchesSearch = debouncedSearchTerm === "" || 
      service.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === "all" || 
      service.category === categoryFilter
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && service.is_active) ||
      (statusFilter === "inactive" && !service.is_active) ||
      (statusFilter === "featured" && service.featured)
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  // State để track loading khi toggle active status
  const [toggleActiveLoading, setToggleActiveLoading] = useState<number | null>(null)
  
  // State để track loading khi toggle featured status
  const [toggleFeaturedLoading, setToggleFeaturedLoading] = useState<number | null>(null)

  // Function để toggle is_active status
  const handleToggleActive = async (service: Service) => {
    if (toggleActiveLoading === service.id) return // Prevent double clicks
    
    try {
      setToggleActiveLoading(service.id)
      const newActiveStatus = !service.is_active
      
      console.log(`Toggling is_active for service ${service.id}: ${service.is_active} -> ${newActiveStatus}`)
      
      // Cập nhật optimistic UI - update local state trước  
      setServices(prevServices => 
        prevServices.map(s => 
          s.id === service.id ? { ...s, is_active: newActiveStatus } : s
        )
      )
      
      // Call API với PUT và full data + is_active
      const response = await fetch(`${API_URL}/api/services/${service.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: service.name,
          description: service.description,
          price: service.price,
          image_url: service.image_url,
          category: service.category,
          is_active: newActiveStatus,
        }),
      })

      if (response.ok) {
        const responseData = await response.json()
        console.log('is_active toggle response:', responseData)
        console.log('New is_active status in response:', responseData.is_active)
        
        toast({
          title: "Thành công",
          description: `${newActiveStatus ? "Kích hoạt" : "Vô hiệu hóa"} dịch vụ "${service.name}"`,
          duration: 2000,
        })
        
        // Refresh data to make sure we have latest state
        await fetchServices()
      } else {
        // Revert optimistic update on error
        setServices(prevServices => 
          prevServices.map(s => 
            s.id === service.id ? { ...s, is_active: service.is_active } : s
          )
        )
        
        const errorData = await response.json()
        console.error('is_active toggle error:', errorData)
        throw new Error(errorData.detail || "Không thể cập nhật trạng thái dịch vụ")
      }
    } catch (error) {
      console.error("Error toggling is_active:", error)
      
      // Revert optimistic update on error
      setServices(prevServices => 
        prevServices.map(s => 
          s.id === service.id ? { ...s, is_active: service.is_active } : s
        )
      )
      
      toast({
        title: "Lỗi", 
        description: error instanceof Error ? error.message : "Không thể cập nhật trạng thái dịch vụ",
        variant: "destructive",
      })
    } finally {
      setToggleActiveLoading(null)
    }
  }

  // Function để toggle featured status
  const handleToggleFeatured = async (service: Service) => {
    if (toggleFeaturedLoading === service.id) return // Prevent double clicks
    
    try {
      setToggleFeaturedLoading(service.id)
      const newFeaturedStatus = !service.featured
      
      console.log(`Toggling featured for service ${service.id}: ${service.featured} -> ${newFeaturedStatus}`)
      
      // Cập nhật optimistic UI - update local state trước  
      setServices(prevServices => 
        prevServices.map(s => 
          s.id === service.id ? { ...s, featured: newFeaturedStatus } : s
        )
      )
      
      // Thử call API với PATCH method trước
      let response = await fetch(`${API_URL}/api/services/${service.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          featured: newFeaturedStatus
        }),
      })

      // Nếu PATCH không work, thử PUT với full data + featured
      if (!response.ok) {
        console.log('PATCH failed, trying PUT with full data...')
        response = await fetch(`${API_URL}/api/services/${service.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: service.name,
            description: service.description,
            price: service.price,
            image_url: service.image_url,
            category: service.category,
            is_active: service.is_active,
            featured: newFeaturedStatus,
          }),
        })
      }

      if (response.ok) {
        const responseData = await response.json()
        console.log('Featured toggle response:', responseData)
        console.log('New featured status in response:', responseData.featured)
        
        toast({
          title: "Thành công",
          description: `${newFeaturedStatus ? "Đánh dấu" : "Bỏ đánh dấu"} dịch vụ "${service.name}" nổi bật`,
          duration: 2000,
        })
        
        // Refresh data to make sure we have latest state
        await fetchServices()
      } else {
        // Revert optimistic update on error
        setServices(prevServices => 
          prevServices.map(s => 
            s.id === service.id ? { ...s, featured: service.featured } : s
          )
        )
        
        const errorData = await response.json()
        console.error('Featured toggle error:', errorData)
        throw new Error(errorData.detail || "Không thể cập nhật trạng thái nổi bật")
      }
    } catch (error) {
      console.error("Error toggling featured:", error)
      
      // Revert optimistic update on error
      setServices(prevServices => 
        prevServices.map(s => 
          s.id === service.id ? { ...s, featured: service.featured } : s
        )
      )
      
      toast({
        title: "Lỗi", 
        description: error instanceof Error ? error.message : "Không thể cập nhật trạng thái nổi bật",
        variant: "destructive",
      })
    } finally {
      setToggleFeaturedLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
      <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-red-50/50 to-transparent"></div>
      
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 relative z-10 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Enhanced Responsive Header */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  Quản lý dịch vụ
                </h2>
                <p className="text-sm sm:text-base text-gray-600 flex items-center">
                  <Package className="mr-2 h-4 w-4 text-red-500 flex-shrink-0" />
                  <span className="hidden sm:inline">Quản lý và theo dõi {pagination.total} dịch vụ của Phú Long</span>
                  <span className="sm:hidden">{pagination.total} dịch vụ</span>
                </p>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => fetchServices(true)}
                  disabled={refreshing}
                  className="border-gray-300 flex-1 sm:flex-none"
                >
                  <RefreshCw className={`mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Làm mới</span>
                  <span className="sm:hidden">Làm mới</span>
                </Button>
                <Button 
                  size="sm"
                  onClick={() => setIsCreateDialogOpen(true)} 
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg flex-1 sm:flex-none"
                >
                  <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Thêm dịch vụ</span>
                  <span className="sm:hidden">Thêm</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Responsive Filters Card */}
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="flex items-center text-gray-900 text-base sm:text-lg">
                  <Filter className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-600 flex-shrink-0" />
                  <span className="hidden sm:inline">Bộ lọc và tìm kiếm</span>
                  <span className="sm:hidden">Lọc & Tìm</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}
                    className="border-gray-300"
                  >
                    {viewMode === "table" ? (
                      <>
                        <Grid3X3 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Lưới</span>
                      </>
                    ) : (
                      <>
                        <List className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Bảng</span>
                      </>
                    )}
                  </Button>
                  <Badge variant="outline" className="bg-white text-xs sm:text-sm">
                    {filteredServices.length} kết quả
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Search */}
              <div className="relative sm:col-span-2 lg:col-span-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm dịch vụ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 sm:pl-10 border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm sm:text-base h-9 sm:h-10"
                />
              </div>

              {/* Category Filter */}
              <div className="sm:col-span-1">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm sm:text-base h-9 sm:h-10">
                    <SelectValue placeholder="Danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="sm:col-span-1">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm sm:text-base h-9 sm:h-10">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Ẩn</SelectItem>
                    <SelectItem value="featured">Nổi bật</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Actions */}
              <div className="sm:col-span-2 lg:col-span-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("")
                    setCategoryFilter("all")
                    setStatusFilter("all")
                  }}
                  className="w-full border-gray-300 text-sm sm:text-base h-9 sm:h-10"
                >
                  <span className="hidden sm:inline">Xóa bộ lọc</span>
                  <span className="sm:hidden">Xóa lọc</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responsive Main Content Card */}
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg p-4 sm:p-6">
            <CardTitle className="flex items-center text-gray-900 text-base sm:text-lg">
              <Package className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
              <span className="hidden sm:inline">Danh sách dịch vụ</span>
              <span className="sm:hidden">Dịch vụ</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative p-0 sm:p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-red-600 mx-auto"></div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400/20 to-red-600/20 animate-pulse"></div>
                  </div>
                  <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
                </div>
              </div>
            ) : (
              <>
                {refreshing && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <RefreshCw className="h-5 w-5 animate-spin text-red-600" />
                        <span className="text-gray-700">Đang làm mới...</span>
                      </div>
                    </div>
                  </div>
                )}
              {/* Mobile Cards View */}
              <div className="sm:hidden space-y-3 p-4">
                {filteredServices.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Không tìm thấy dịch vụ nào</p>
                  </div>
                ) : (
                  filteredServices.map((service) => (
                    <Card key={service.id} className="p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-500">#{service.id}</span>
                            {service.featured && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="h-2 w-2 mr-1" />
                                Nổi bật
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-medium text-sm line-clamp-2 mb-2">{service.name}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={service.is_active ? "default" : "outline"} className="text-xs">
                              {service.is_active ? "Hoạt động" : "Ẩn"}
                            </Badge>
                            <span className="text-xs text-gray-500">{service.category}</span>
                          </div>
                                                     <div className="flex items-center gap-3 mb-2">
                             <div className="flex items-center gap-1">
                               <Switch
                                 checked={service.is_active}
                                 onCheckedChange={() => handleToggleActive(service)}
                                 disabled={toggleActiveLoading === service.id}
                                 className="data-[state=checked]:bg-green-500 scale-75 disabled:opacity-50"
                               />
                               <span className={`text-xs font-medium ${service.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                                 {service.is_active ? 'Hoạt động' : 'Ẩn'}
                               </span>
                             </div>
                             <div className="flex items-center gap-1">
                               <Switch
                                 checked={service.featured}
                                 onCheckedChange={() => handleToggleFeatured(service)}
                                 disabled={toggleFeaturedLoading === service.id}
                                 className="data-[state=checked]:bg-yellow-500 scale-75 disabled:opacity-50"
                               />
                               <span className={`text-xs font-medium ${service.featured ? 'text-yellow-600' : 'text-gray-500'}`}>
                                 {service.featured ? 'Nổi bật' : 'Thường'}
                               </span>
                             </div>
                           </div>
                          <p className="text-sm font-semibold text-red-600">
                            {service.price.toLocaleString("vi-VN")}đ
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(service)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(service)}>
                              <Activity className={`mr-2 h-4 w-4 ${service.is_active ? 'text-green-500' : 'text-gray-400'}`} />
                              {service.is_active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDeleteDialog(service)} className="text-red-600">
                              <Trash className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Card>
                  ))
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">ID</TableHead>
                      <TableHead className="text-xs sm:text-sm">Tên dịch vụ</TableHead>
                      <TableHead className="text-xs sm:text-sm">Giá</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Danh mục</TableHead>
                      <TableHead className="text-xs sm:text-sm">Kích hoạt</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden md:table-cell">Nổi bật</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredServices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center h-24 text-sm">
                          Không tìm thấy dịch vụ nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredServices.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell className="text-xs sm:text-sm">{service.id}</TableCell>
                          <TableCell className="font-medium text-xs sm:text-sm max-w-48">
                            <div className="line-clamp-2">{service.name}</div>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            {service.price.toLocaleString("vi-VN")}đ
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm hidden lg:table-cell">
                            {service.category}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={service.is_active}
                                onCheckedChange={() => handleToggleActive(service)}
                                disabled={toggleActiveLoading === service.id}
                                className="data-[state=checked]:bg-green-500 disabled:opacity-50"
                              />
                              <span className={`text-xs font-medium ${service.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                                {service.is_active ? 'Hoạt động' : 'Ẩn'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={service.featured}
                                onCheckedChange={() => handleToggleFeatured(service)}
                                disabled={toggleFeaturedLoading === service.id}
                                className="data-[state=checked]:bg-yellow-500 disabled:opacity-50"
                              />
                              <span className={`text-xs font-medium ${service.featured ? 'text-yellow-600' : 'text-gray-500'}`}>
                                {service.featured ? 'Nổi bật' : 'Thường'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditDialog(service)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleActive(service)}>
                                  <Activity className={`mr-2 h-4 w-4 ${service.is_active ? 'text-green-500' : 'text-gray-400'}`} />
                                  {service.is_active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openDeleteDialog(service)} className="text-red-600">
                                  <Trash className="mr-2 h-4 w-4" />
                                  Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Enhanced Responsive Pagination */}
              <div className="flex flex-col gap-4 mt-4 sm:mt-6 pt-4 border-t border-gray-100 px-4 sm:px-0">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs sm:text-sm text-gray-500 flex items-center">
                    <Package className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">
                      Hiển thị <span className="font-medium mx-1 text-red-600">{filteredServices.length}</span> / 
                      <span className="font-medium mx-1 text-gray-900">{pagination.total}</span> dịch vụ
                    </span>
                    <span className="sm:hidden">
                      {filteredServices.length}/{pagination.total} dịch vụ
                    </span>
                    {currentPage > 1 && (
                      <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                        Trang {currentPage}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1 || loading}
                      className="hidden md:flex text-xs"
                    >
                      Đầu
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                      disabled={currentPage === 1 || loading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(3, pagination.totalPages) }, (_, i) => {
                        let pageNum = i + 1
                        if (pagination.totalPages > 3) {
                          if (currentPage > 2) {
                            pageNum = currentPage - 1 + i
                            if (pageNum > pagination.totalPages) {
                              pageNum = pagination.totalPages - 2 + i
                            }
                          }
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            disabled={loading}
                            className={`h-8 w-8 p-0 text-xs ${currentPage === pageNum ? "bg-red-600 hover:bg-red-700" : ""}`}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.min(currentPage + 1, pagination.totalPages))}
                      disabled={currentPage === pagination.totalPages || loading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={currentPage === pagination.totalPages || loading}
                      className="hidden md:flex text-xs"
                    >
                      Cuối
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Responsive Create Service Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Thêm dịch vụ mới</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">Điền thông tin để tạo dịch vụ mới</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm sm:text-base">Tên dịch vụ</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Nhập tên dịch vụ"
                  className="text-sm sm:text-base h-9 sm:h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm sm:text-base">Giá</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="Nhập giá dịch vụ"
                  className="text-sm sm:text-base h-9 sm:h-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm sm:text-base">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Nhập mô tả dịch vụ"
                rows={3}
                className="text-sm sm:text-base"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm sm:text-base">Danh mục</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  placeholder="Nhập danh mục"
                  className="text-sm sm:text-base h-9 sm:h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url" className="text-sm sm:text-base">URL hình ảnh</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => handleInputChange("image_url", e.target.value)}
                  placeholder="Nhập URL hình ảnh"
                  className="text-sm sm:text-base h-9 sm:h-10"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleInputChange("featured", checked)}
                />
                                 <Label htmlFor="featured" className="text-sm sm:text-base">
                   Dịch vụ nổi bật
                 </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                />
                <Label htmlFor="is_active" className="text-sm sm:text-base">Kích hoạt</Label>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="text-sm sm:text-base h-9 sm:h-10">
              Hủy
            </Button>
            <Button onClick={handleCreateService} className="bg-red-600 hover:bg-red-700 text-sm sm:text-base h-9 sm:h-10">
              Tạo dịch vụ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Responsive Edit Service Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Chỉnh sửa dịch vụ</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">Cập nhật thông tin dịch vụ</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm sm:text-base">Tên dịch vụ</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Nhập tên dịch vụ"
                  className="text-sm sm:text-base h-9 sm:h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price" className="text-sm sm:text-base">Giá</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="Nhập giá dịch vụ"
                  className="text-sm sm:text-base h-9 sm:h-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-sm sm:text-base">Mô tả</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Nhập mô tả dịch vụ"
                rows={3}
                className="text-sm sm:text-base"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category" className="text-sm sm:text-base">Danh mục</Label>
                <Input
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  placeholder="Nhập danh mục"
                  className="text-sm sm:text-base h-9 sm:h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-image_url" className="text-sm sm:text-base">URL hình ảnh</Label>
                <Input
                  id="edit-image_url"
                  value={formData.image_url}
                  onChange={(e) => handleInputChange("image_url", e.target.value)}
                  placeholder="Nhập URL hình ảnh"
                  className="text-sm sm:text-base h-9 sm:h-10"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleInputChange("featured", checked)}
                />
                                 <Label htmlFor="edit-featured" className="text-sm sm:text-base">
                   Dịch vụ nổi bật
                 </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                />
                <Label htmlFor="edit-is_active" className="text-sm sm:text-base">Kích hoạt</Label>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="text-sm sm:text-base h-9 sm:h-10">
              Hủy
            </Button>
            <Button onClick={handleUpdateService} className="bg-red-600 hover:bg-red-700 text-sm sm:text-base h-9 sm:h-10">
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Responsive Delete Service Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Xác nhận xóa</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Bạn có chắc chắn muốn xóa dịch vụ "{selectedService?.name}"? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="text-sm sm:text-base h-9 sm:h-10">
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteService} className="text-sm sm:text-base h-9 sm:h-10">
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Printing Images Management */}
      <div className="mt-16">
        <Card className="shadow-xl border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center text-gray-800">
              <ImageIcon className="h-5 w-5 text-red-600 mr-2" />
              Ảnh In Ấn
            </CardTitle>
            <Button onClick={()=>setIsUploadDialogOpen(true)} className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-red-600 hover:to-red-700 text-white">
              <Upload className="h-4 w-4 mr-2" /> Tải ảnh
            </Button>
          </CardHeader>
          <CardContent>
            {imageLoading ? (
              <p className="text-center py-8">Đang tải...</p>
            ) : images.length === 0 ? (
              <p className="text-center py-8 text-gray-500">Chưa có ảnh in ấn</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead><TableHead>Preview</TableHead><TableHead>Alt Text</TableHead><TableHead>Hiển thị</TableHead><TableHead>Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {images.map(img=> (
                      <TableRow key={img.id}>
                        <TableCell>{img.id}</TableCell>
                        <TableCell>
                          <img src={img.full_url} alt="thumb" className="h-12 w-12 object-cover rounded" />
                        </TableCell>
                        <TableCell>{img.alt_text}</TableCell>
                        <TableCell>{img.is_visible ? '✅' : '🚫'}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={()=>{setSelectedImage(img);setIsEditImageDialogOpen(true)}} className="mr-2">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={()=>handleDeleteImage(img)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tải ảnh in ấn</DialogTitle>
            <DialogDescription>Chọn file ảnh (tối đa 10MB) và điền thông tin</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input type="file" accept="image/*" onChange={e=>setUploadFormData({...uploadFormData, file: e.target.files?.[0]||null})} />
            <Input placeholder="Alt text" value={uploadFormData.alt_text} onChange={e=>setUploadFormData({...uploadFormData, alt_text:e.target.value})} />
            <div className="flex items-center space-x-2">
              <Switch id="visible" checked={uploadFormData.is_visible} onCheckedChange={v=>setUploadFormData({...uploadFormData, is_visible:v})} />
              <Label htmlFor="visible">Hiển thị</Label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUploadImage} disabled={!uploadFormData.file}>Tải lên</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Image Dialog */}
      <Dialog open={isEditImageDialogOpen} onOpenChange={setIsEditImageDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Chỉnh sửa ảnh</DialogTitle></DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <img src={selectedImage.full_url} alt="preview" className="w-full h-48 object-cover rounded" />
              <Input value={selectedImage.alt_text||""} onChange={e=>setSelectedImage({...selectedImage, alt_text:e.target.value})} placeholder="Alt text" />
              <div className="flex items-center space-x-2">
                <Switch id="vis" checked={selectedImage.is_visible} onCheckedChange={v=>setSelectedImage({...selectedImage, is_visible:v})} />
                <Label htmlFor="vis">Hiển thị</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateImage}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}
