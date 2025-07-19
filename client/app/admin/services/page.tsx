"use client"

import React, { useState, useEffect, useCallback } from "react"
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
  Upload,
  Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"
import ReactMarkdown from "react-markdown"
import dynamic from "next/dynamic"
import { createSlug } from "@/lib/utils"

interface Service {
  id: number
  name: string
  description: string
  price: number
  image_id?: number | null
  category: string
  featured: boolean
  is_active: boolean
  created_at: string
  image?: {
    id: number
    filename: string
    url: string
    alt_text: string | null
    width: number
    height: number
  }
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

interface PrintingPost {
  id: number;
  title: string;
  time: string;
  content: string;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  image_urls?: string[];
  creator?: {
    username: string;
    email: string;
    role: string;
    id: number;
    is_active: boolean;
    created_at: string;
  };
  images?: {
    id: number;
    printing_id: number;
    image_id: number;
    order: number;
    created_at: string;
    image: {
      id: number;
      filename: string;
      url: string;
      alt_text: string;
      width: number;
      height: number;
      is_visible: boolean;
      category: string;
    };
  }[];
}

interface PrintingImage {
  id: number
  filename: string
  alt_text?: string
  is_visible: boolean
  full_url: string
}

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

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
    category: "",
    featured: false,
    is_active: true,
  })
  
  // State cho upload ảnh
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false)

  const [posts, setPosts] = useState<PrintingPost[]>([])
  const [imageLoading, setImageLoading] = useState(true)

  const [printingForm, setPrintingForm] = useState({
    id: null as number | null,
    title: '',
    time: '',
    content: '',
    is_visible: true,
    images: [] as File[],
    keep_existing_images: true, // Cho edit mode
  });
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create'|'edit'>('create');
  const [existingImages, setExistingImages] = useState<any[]>([]); // Lưu ảnh hiện có khi edit

  const [submitLoading, setSubmitLoading] = useState(false);
  const [toggleActiveLoading, setToggleActiveLoading] = useState<number | null>(null)
  const [toggleFeaturedLoading, setToggleFeaturedLoading] = useState<number | null>(null)

  // State cho Image Uploader
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

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
      let url = `http://14.187.218.183:12122/api/services?skip=${skip}&limit=${itemsPerPage}`
      
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

  const fetchPosts = async () => {
    try {
      setImageLoading(true)
      const API_BASE = 'http://14.187.218.183:12122'
      const res = await fetch(`${API_BASE}/api/printing?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setPosts(Array.isArray(data.items) ? data.items : [])
      } else {
        toast({ title: "Lỗi", description: "Không thể tải danh sách bài đăng", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error fetch posts", error)
    } finally {
      setImageLoading(false)
    }
  }



  // Main effect for fetching data when page or filters change
  useEffect(() => {
    if (token) {
      fetchServices()
    fetchPosts()
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
      // Tạo FormData để upload ảnh
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('price', formData.price)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('is_active', formData.is_active.toString())
      formDataToSend.append('featured', formData.featured.toString())
      
      // Thêm ảnh nếu có
      if (selectedImage) {
        formDataToSend.append('image', selectedImage)
      }
      
      console.log('Creating service with FormData')
      
      const response = await fetch("http://14.187.218.183:12122/api/services/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
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
      // Tạo FormData để upload ảnh
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('price', formData.price)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('is_active', formData.is_active.toString())
      formDataToSend.append('featured', formData.featured.toString())
      
      // Thêm ảnh mới nếu có
      if (selectedImage) {
        formDataToSend.append('image', selectedImage)
      }
      
      // Xóa ảnh hiện tại nếu được yêu cầu
      if (removeCurrentImage) {
        formDataToSend.append('remove_image', 'true')
      }
      
      console.log('Updating service with FormData')
      
      const response = await fetch(`http://14.187.218.183:12122/api/services/${selectedService.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      if (response.ok) {
        const responseData = await response.json()
        console.log('Update response:', responseData)
        
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
      const slug = createSlug(selectedService.name)
      const response = await fetch(`http://14.187.218.183:12122/api/services/${slug}`, {
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
      category: service.category,
      featured: service.featured,
      is_active: service.is_active,
    })
    // Set ảnh preview nếu có
    setImagePreview(service.image?.url || "")
    setSelectedImage(null)
    setRemoveCurrentImage(false)
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
      category: "",
      featured: false,
      is_active: true,
    })
    setSelectedImage(null)
    setImagePreview("")
    setRemoveCurrentImage(false)
    setSelectedService(null)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: typeof formData) => ({ ...prev, [field]: value }))
  }

  // Handle image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
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

      setSelectedImage(file)
      // Tạo preview URL
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
      setRemoveCurrentImage(false)
    }
  }

  // Remove selected image
  const removeSelectedImage = () => {
    setSelectedImage(null)
    setImagePreview("")
    setRemoveCurrentImage(false)
  }

  // Toggle remove current image (for edit mode)
  const toggleRemoveCurrentImage = () => {
    setRemoveCurrentImage(!removeCurrentImage)
    if (!removeCurrentImage) {
      setSelectedImage(null)
      setImagePreview("")
    }
  }

  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page)
      // fetchServices will be called automatically by useEffect
    }
  }

  const filteredServices = services.filter((service: Service) => {
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

  

  // Function để toggle is_active status
  const handleToggleActive = async (service: Service) => {
    if (toggleActiveLoading === service.id) return // Prevent double clicks
    
    try {
      setToggleActiveLoading(service.id)
      const newActiveStatus = !service.is_active
      
      console.log(`Toggling is_active for service ${service.id}: ${service.is_active} -> ${newActiveStatus}`)
      
      // Cập nhật optimistic UI - update local state trước  
      setServices((prevServices: Service[]) => 
        prevServices.map(s => 
          s.id === service.id ? { ...s, is_active: newActiveStatus } : s
        )
      )
      
      // Call API với PUT và full data + is_active
      const response = await fetch(`http://14.187.218.183:12122/api/services/${service.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: service.name,
          description: service.description,
          price: service.price,
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
        setServices((prevServices: Service[]) => 
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
      setServices((prevServices: Service[]) => 
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
      setServices((prevServices: Service[]) => 
        prevServices.map(s => 
          s.id === service.id ? { ...s, featured: newFeaturedStatus } : s
        )
      )
      
      // Thử call API với PATCH method trước
      let response = await fetch(`http://14.187.218.183:12122/api/services/${service.id}`, {
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
        response = await fetch(`http://14.187.218.183:12122/api/services/${service.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: service.name,
            description: service.description,
            price: service.price,
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
        setServices((prevServices: Service[]) => 
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
      setServices((prevServices: Service[]) => 
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



  const openCreateForm = () => {
    setPrintingForm({ 
      id: null, 
      title: '', 
      time: '', 
      content: '', 
      is_visible: true, 
      images: [],
      keep_existing_images: true 
    });
    setExistingImages([]);
    setFormMode('create');
    setShowForm(true);
  };

  const openEditForm = (post: PrintingPost) => {
    setPrintingForm({
      id: post.id,
      title: post.title,
      time: post.time || '',
      content: post.content,
      is_visible: post.is_visible,
      images: [],
      keep_existing_images: true,
    });
    // Lưu ảnh hiện có để hiển thị
    setExistingImages(post.images || []);
    setFormMode('edit');
    setShowForm(true);
  };

  const handleSubmitPrinting = async () => {
    // Validation
    if (!printingForm.title.trim()) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập tiêu đề', variant: 'destructive' });
      return;
    }
    if (!printingForm.content.trim()) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập nội dung', variant: 'destructive' });
      return;
    }

    setSubmitLoading(true);
    try {
      // Tạo FormData theo đúng format API
      const formData = new FormData();
      formData.append('title', printingForm.title.trim());
      formData.append('time', printingForm.time.trim());
      formData.append('content', printingForm.content.trim());
      formData.append('is_visible', printingForm.is_visible.toString());

      // Thêm files vào FormData
      printingForm.images.forEach((file, index) => {
        formData.append('images', file);
      });

      // Nếu là edit mode, thêm keep_existing_images
      if (printingForm.id) {
        formData.append('keep_existing_images', printingForm.keep_existing_images.toString());
      }

      console.log('Submitting printing post with FormData');
      console.log('Form data contents:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(key, 'File:', value.name, value.size, 'bytes');
        } else {
          console.log(key, value);
        }
      }
      
      const url = printingForm.id ? `http://14.187.218.183:12122/api/printing/${createSlug(printingForm.title)}` : 'http://14.187.218.183:12122/api/printing';
      const method = printingForm.id ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          Authorization: `Bearer ${token}` 
          // Không set Content-Type, để browser tự động set cho multipart/form-data
        },
        body: formData,
      });
      
      const responseData = await res.json();
      console.log('API Response:', responseData);
      
      if (res.ok) {
        toast({ title: 'Thành công', description: printingForm.id ? 'Đã cập nhật bài đăng' : 'Đã tạo bài đăng' });
        setShowForm(false);
        fetchPosts();
      } else {
        console.error('API Error:', responseData);
        toast({ title: 'Lỗi', description: responseData.detail || 'Không thể lưu bài đăng', variant: 'destructive' });
      }
    } catch (error) {
      console.error("Error submitting printing post:", error);
      toast({ title: 'Lỗi', description: 'Không thể lưu bài đăng', variant: 'destructive' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeletePrinting = async (post: PrintingPost) => {
    if (!confirm('Xoá bài đăng này?')) return;
    try {
      const slug = createSlug(post.title)
      const res = await fetch(`http://14.187.218.183:12122/api/printing/${slug}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast({ title: 'Đã xoá bài đăng' });
        fetchPosts();
      } else {
        toast({ title: 'Lỗi', description: 'Không thể xoá', variant: 'destructive' });
      }
    } catch (error) {
      console.error("Error deleting printing post:", error);
      toast({ title: 'Lỗi', description: 'Không thể xoá', variant: 'destructive' });
    }
  };

  const handleToggleVisible = async (post: PrintingPost) => {
    try {
      const slug = createSlug(post.title);
      const res = await fetch(`http://14.187.218.183:12122/api/printing/${slug}/visibility`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchPosts();
      } else {
        toast({ title: 'Lỗi', description: 'Không thể thay đổi trạng thái', variant: 'destructive' });
      }
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast({ title: 'Lỗi', description: 'Không thể thay đổi trạng thái', variant: 'destructive' });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Kiểm tra số lượng file (tối đa 3)
    const currentCount = printingForm.images.length;
    const remainingSlots = 3 - currentCount;
    
    if (files.length > remainingSlots) {
      toast({ 
        title: 'Cảnh báo', 
        description: `Chỉ có thể thêm tối đa ${remainingSlots} ảnh nữa`, 
        variant: 'destructive' 
      });
      return;
    }

    // Kiểm tra định dạng file
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const invalidFiles = files.filter(file => !validFormats.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast({ 
        title: 'Lỗi', 
        description: 'Chỉ chấp nhận file ảnh (JPEG, PNG, GIF)', 
        variant: 'destructive' 
      });
      return;
    }

    // Kiểm tra kích thước file (tối đa 5MB mỗi file)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast({ 
        title: 'Lỗi', 
        description: 'Kích thước file không được vượt quá 5MB', 
        variant: 'destructive' 
      });
      return;
    }

    setPrintingForm(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));

    // Reset input để có thể chọn lại cùng file
    event.target.value = '';
  };

  const removeImage = (index: number) => {
    setPrintingForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeExistingImage = (imageId: number) => {
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
    // Khi xóa ảnh hiện có, set keep_existing_images = false
    setPrintingForm(prev => ({
      ...prev,
      keep_existing_images: false
    }));
  };

  // Upload ảnh và lấy URL
  const handleImageUpload = async (file: File, altText: string = '', category: string = 'blog') => {
    try {
      setImageUploadLoading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alt_text', altText);
      formData.append('category', category);
      formData.append('is_visible', 'true');

      const response = await fetch('http://14.187.218.183:12122/api/images/upload', {
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

  // Copy URL to clipboard - đơn giản chỉ select text
  const copyUrlToClipboard = (url: string) => {
    // Tìm input element chứa URL và select text
    const inputElement = document.querySelector(`input[value="${url}"]`) as HTMLInputElement;
    if (inputElement) {
      inputElement.select();
      inputElement.setSelectionRange(0, 99999); // For mobile devices
      toast({
        title: 'Đã chọn URL',
        description: 'Nhấn Ctrl+C để copy URL',
      });
    }
  };



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
                  filteredServices.map((service: Service) => (
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
                      filteredServices.map((service: Service) => (
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
                <Label htmlFor="image" className="text-sm sm:text-base">Hình ảnh dịch vụ</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-red-400 transition-colors">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <label 
                    htmlFor="image-upload" 
                    className="cursor-pointer flex flex-col items-center space-y-2 text-gray-600 hover:text-red-600"
                  >
                    <Upload className="h-8 w-8" />
                    <span className="text-sm font-medium">
                      Chọn ảnh hoặc kéo thả vào đây
                    </span>
                    <span className="text-xs text-gray-500">
                      Hỗ trợ: JPG, PNG, GIF, WEBP, BMP (tối đa 10MB)
                    </span>
                  </label>
                </div>
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative mt-2">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="h-32 w-32 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                      onClick={removeSelectedImage}
                    >
                      ×
                    </Button>
                  </div>
                )}
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
                <Label htmlFor="edit-image" className="text-sm sm:text-base">Hình ảnh dịch vụ</Label>
                
                {/* Ảnh hiện tại */}
                {selectedService?.image && !removeCurrentImage && !selectedImage && (
                  <div className="relative">
                    <img 
                      src={selectedService.image.url.startsWith('http') ? selectedService.image.url : `http://14.187.218.183:12122${selectedService.image.url}`}
                      alt={selectedService.image.alt_text || 'Current image'} 
                      className="h-32 w-32 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                      onClick={toggleRemoveCurrentImage}
                    >
                      ×
                    </Button>
                    <div className="mt-1 text-xs text-gray-600">
                      Ảnh hiện tại (click × để xóa)
                    </div>
                  </div>
                )}
                
                {/* Checkbox để xóa ảnh hiện tại */}
                {selectedService?.image && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remove-current-image"
                      checked={removeCurrentImage}
                      onChange={toggleRemoveCurrentImage}
                      className="rounded"
                    />
                    <Label htmlFor="remove-current-image" className="text-sm">
                      Xóa ảnh hiện tại
                    </Label>
                  </div>
                )}
                
                {/* Upload ảnh mới */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-red-400 transition-colors">
                  <input
                    type="file"
                    id="edit-image-upload"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <label 
                    htmlFor="edit-image-upload" 
                    className="cursor-pointer flex flex-col items-center space-y-2 text-gray-600 hover:text-red-600"
                  >
                    <Upload className="h-8 w-8" />
                    <span className="text-sm font-medium">
                      {selectedService?.image ? 'Thay đổi ảnh' : 'Chọn ảnh mới'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Hỗ trợ: JPG, PNG, GIF, WEBP, BMP (tối đa 10MB)
                    </span>
                  </label>
                </div>
                
                {/* Preview ảnh mới */}
                {imagePreview && selectedImage && (
                  <div className="relative mt-2">
                    <img 
                      src={imagePreview} 
                      alt="New image preview" 
                      className="h-32 w-32 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                      onClick={removeSelectedImage}
                    >
                      ×
                    </Button>
                    <div className="mt-1 text-xs text-green-600">
                      Ảnh mới được chọn
                    </div>
                  </div>
                )}
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

      {/* Dialog thêm/sửa bài đăng In ấn */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{formMode === 'create' ? 'Thêm bài đăng In ấn' : 'Chỉnh sửa bài đăng In ấn'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Tiêu đề</Label>
                <Input 
                  id="title" 
                  value={printingForm.title} 
                  onChange={e => setPrintingForm({ ...printingForm, title: e.target.value })} 
                  placeholder="Nhập tiêu đề bài đăng"
                />
              </div>
              <div>
                <Label htmlFor="time">Thời gian</Label>
                <Input 
                  id="time" 
                  value={printingForm.time} 
                  onChange={e => setPrintingForm({ ...printingForm, time: e.target.value })} 
                  placeholder="VD: 1-2 ngày"
                />
              </div>
              <div>
                <Label htmlFor="content">Nội dung (Markdown)</Label>
                <MDEditor
                  value={printingForm.content}
                  onChange={val => setPrintingForm({ ...printingForm, content: val || "" })}
                  height={300}
                  data-color-mode="light"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="is_visible" 
                  checked={printingForm.is_visible} 
                  onCheckedChange={checked => setPrintingForm({ ...printingForm, is_visible: checked })} 
                />
                <Label htmlFor="is_visible">Hiển thị công khai</Label>
              </div>
              <div>
                <Label>Hình ảnh </Label>
                <div className="space-y-4">
                  {/* Image Uploader - Upload lên server và lấy URL */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <Label className="text-sm font-medium text-blue-800 mb-2 block">
                      🌟 Upload ảnh lên server (lấy URL)
                    </Label>
                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        id="url-image-upload"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              await handleImageUpload(file, 'Blog image', 'blog');
                            } catch (error) {
                              // Error handled in function
                            }
                          }
                          e.target.value = ''; // Reset input
                        }}
                        className="hidden"
                        disabled={imageUploadLoading}
                      />
                      <label htmlFor="url-image-upload" className="cursor-pointer flex flex-col items-center space-y-2 text-blue-600 hover:text-blue-700">
                        {imageUploadLoading ? (
                          <>
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <span className="text-sm font-medium">Đang upload...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-8 w-8" />
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
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          👆 Copy URL này để dán vào các input khác
                        </p>
                      </div>
                    )}
                  </div>

                  {/* File Input cho attachment */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-red-400 transition-colors">
                    <input
                      type="file"
                      id="image-upload"
                      multiple
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={printingForm.images.length >= 3}
                    />
                    <label 
                      htmlFor="image-upload" 
                      className={`cursor-pointer flex flex-col items-center space-y-2 ${printingForm.images.length >= 3 ? 'text-gray-400' : 'text-gray-600 hover:text-red-600'}`}
                    >
                      <Upload className="h-8 w-8" />
                      <span className="text-sm font-medium">
                        {printingForm.images.length >= 3 
                          ? 'Đã đạt giới hạn 3 ảnh' 
                          : 'Hoặc chọn ảnh đính kèm bài đăng'
                        }
                      </span>
                      <span className="text-xs text-gray-500">
                        Hỗ trợ: JPEG, PNG, GIF (tối đa 5MB mỗi file)
                      </span>
                    </label>
                  </div>

                  {/* Ảnh hiện có (khi edit) */}
                  {formMode === 'edit' && existingImages.length > 0 && (
                    <div>
                      <Label className="text-sm text-gray-600">Ảnh hiện có:</Label>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {existingImages.map((img) => (
                          <div key={img.id} className="relative group">
                            <img 
                              src={img.image?.url?.startsWith('http') ? img.image.url : `http://14.187.218.183:12122${img.image?.url}`}
                              alt={img.image?.alt_text || 'Existing image'} 
                              className="h-16 w-16 object-cover rounded border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeExistingImage(img.id)}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Switch 
                          id="keep_existing" 
                          checked={printingForm.keep_existing_images} 
                          onCheckedChange={checked => setPrintingForm({ ...printingForm, keep_existing_images: checked })} 
                        />
                        <Label htmlFor="keep_existing" className="text-sm">Giữ lại ảnh hiện có</Label>
                      </div>
                    </div>
                  )}

                  {/* Ảnh mới được chọn */}
                  {printingForm.images.length > 0 && (
                    <div>
                      <Label className="text-sm text-gray-600">Ảnh mới ({printingForm.images.length}/3):</Label>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {printingForm.images.map((file, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={`New image ${index + 1}`} 
                              className="h-16 w-16 object-cover rounded border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index)}
                            >
                              ×
                            </Button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate rounded-b">
                              {file.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div>
              <Label>Preview</Label>
              <div className="prose border rounded-md p-4 h-[400px] overflow-y-auto bg-gray-50">
                <h3>{printingForm.title || 'Tiêu đề'}</h3>
                {printingForm.time && <p className="text-sm text-gray-600">Thời gian: {printingForm.time}</p>}
                <ReactMarkdown>{printingForm.content || 'Nội dung sẽ hiển thị ở đây...'}</ReactMarkdown>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)} disabled={submitLoading}>Hủy</Button>
            <Button onClick={handleSubmitPrinting} disabled={submitLoading}>
              {submitLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {formMode === 'create' ? 'Đang tạo...' : 'Đang lưu...'}
                </>
              ) : (
                formMode === 'create' ? 'Tạo bài đăng' : 'Lưu thay đổi'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* === UI danh sách bài đăng In ấn === */}
      <Card className="shadow-xl border border-gray-200 mt-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center text-gray-800">
              <ImageIcon className="h-5 w-5 text-red-600 mr-2" />
            Danh sách bài đăng In ấn
            </CardTitle>
          <Button onClick={openCreateForm} className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white">
            <Plus className="h-4 w-4 mr-2" /> Thêm bài đăng
            </Button>
          </CardHeader>
          <CardContent>
            {imageLoading ? (
              <p className="text-center py-8">Đang tải...</p>
          ) : (Array.isArray(posts) ? posts : []).length === 0 ? (
            <p className="text-center py-8 text-gray-500">Chưa có bài đăng in ấn</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Người tạo</TableHead>
                    <TableHead>Ảnh</TableHead>
                    <TableHead>Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {(Array.isArray(posts) ? posts : []).map((post: any) => (
                    <TableRow key={post.id}>
                      <TableCell>{post.id}</TableCell>
                      <TableCell>{post.title}</TableCell>
                      <TableCell>{post.time}</TableCell>
                        <TableCell>
                        <Switch checked={post.is_visible} onCheckedChange={() => handleToggleVisible(post)} />
                        </TableCell>
                      <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{post.creator?.username || ''}</TableCell>
                        <TableCell>
                        {/* Hiển thị ảnh từ images array hoặc image_urls backup */}
                        {post.images && post.images.length > 0 ? (
                          <img 
                            src={post.images[0].image.url.startsWith('http') ? post.images[0].image.url : `http://14.187.218.183:12122${post.images[0].image.url}`}
                            alt={post.images[0].image.alt_text || "thumb"} 
                            className="h-10 w-16 object-cover rounded" 
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&q=80';
                            }}
                          />
                        ) : post.image_urls && post.image_urls.length > 0 && post.image_urls[0].trim() ? (
                          <img 
                            src={post.image_urls[0]} 
                            alt="thumb" 
                            className="h-10 w-16 object-cover rounded" 
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&q=80';
                            }}
                          />
                        ) : (
                          <span className="text-gray-400">Không có</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => openEditForm(post)} className="mr-2">
                            <Edit className="h-4 w-4" />
                          </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeletePrinting(post)}>
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
    </div>
  )
}
