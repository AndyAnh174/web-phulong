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
import { 
  Search, 
  MoreVertical, 
  Eye, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Filter,
  RefreshCw,
  Grid3X3,
  List,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  FileText,
  Ruler,
  Layers,
  DollarSign,
  TrendingUp,
  Activity,
  Edit,
  Star,
  ExternalLink
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface Order {
  id: number
  customer_name: string
  customer_email: string
  customer_phone: string
  service_id: number
  service_name: string
  quantity: number
  size: string
  material: string
  notes: string
  status: "pending" | "processing" | "completed" | "cancelled"
  created_at: string
  total_price: number
  design_file?: string
  updated_at?: string
}

interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface OrderStats {
  totalOrders: number
  pendingOrders: number
  processingOrders: number
  completedOrders: number
  cancelledOrders: number
  totalRevenue: number
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [serviceFilter, setServiceFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1
  })
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0
  })
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState<string>("")
  const [services, setServices] = useState<{ id: number; name: string }[]>([])

  const { toast } = useToast()
  const { token } = useAuth()
  const itemsPerPage = 12

  // Status configuration
  const statusConfig = {
    pending: { label: "Chờ xử lý", variant: "outline" as const, icon: Clock, color: "text-yellow-600" },
    processing: { label: "Đang xử lý", variant: "default" as const, icon: Activity, color: "text-blue-600" },
    completed: { label: "Hoàn thành", variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
    cancelled: { label: "Đã hủy", variant: "destructive" as const, icon: XCircle, color: "text-red-600" }
  }

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch orders with filters
  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (!token) return
    
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      
      const skip = (currentPage - 1) * itemsPerPage
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: itemsPerPage.toString()
      })

      if (debouncedSearchTerm) params.append('customer_name', debouncedSearchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (serviceFilter !== 'all') params.append('service_id', serviceFilter)

      const response = await fetch(`http://14.187.180.6:12122/api/orders?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const ordersData = Array.isArray(data.items) ? data.items : []
        setOrders(ordersData)

        // Update pagination
        setPagination({
          total: data.total || 0,
          page: currentPage,
          limit: itemsPerPage,
          totalPages: Math.ceil((data.total || 0) / itemsPerPage) || 1
        })

        // Calculate stats
        calculateStats(ordersData)
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách đơn hàng",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến server",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [token, currentPage, itemsPerPage, debouncedSearchTerm, statusFilter, serviceFilter, toast])

  // Fetch services for filter
  const fetchServices = useCallback(async () => {
    if (!token) return
    
    try {
      const response = await fetch('http://14.187.180.6:12122/api/services?limit=100', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setServices(data.map((service: any) => ({ id: service.id, name: service.name })))
      }
    } catch (error) {
      console.error("Error fetching services:", error)
    }
  }, [token])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  // Calculate statistics
  const calculateStats = (ordersData: Order[]) => {
    const stats = ordersData.reduce((acc, order) => {
      acc.totalOrders++
      acc.totalRevenue += order.total_price || 0
      
      switch (order.status) {
        case 'pending':
          acc.pendingOrders++
          break
        case 'processing':
          acc.processingOrders++
          break
        case 'completed':
          acc.completedOrders++
          break
        case 'cancelled':
          acc.cancelledOrders++
          break
      }
      
      return acc
    }, {
      totalOrders: 0,
      pendingOrders: 0,
      processingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      totalRevenue: 0
    })

    setStats(stats)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return

    try {
      const response = await fetch(`http://14.187.180.6:12122/api/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Cập nhật trạng thái đơn hàng thành công",
        })
        setIsStatusDialogOpen(false)
        fetchOrders()
      } else {
        const errorData = await response.json()
        toast({
          title: "Lỗi",
          description: errorData.detail || "Không thể cập nhật trạng thái đơn hàng",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến server",
        variant: "destructive",
      })
    }
  }

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams()
      if (debouncedSearchTerm) params.append('customer_name', debouncedSearchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (serviceFilter !== 'all') params.append('service_id', serviceFilter)
      params.append('token', token!)

      const response = await fetch(`http://14.187.180.6:12122/api/orders/export/csv?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `orders-export-${new Date().toISOString().slice(0, 10)}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Thành công",
          description: "Xuất file CSV thành công",
        })
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể xuất file CSV",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error exporting CSV:", error)
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến server",
        variant: "destructive",
      })
    }
  }

  const openViewDialog = (order: Order) => {
    setSelectedOrder(order)
    setIsViewDialogOpen(true)
  }

  const openStatusDialog = (order: Order) => {
    setSelectedOrder(order)
    setNewStatus(order.status)
    setIsStatusDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return <Badge variant="outline">{status}</Badge>
    
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  // Filter orders for display
  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== "all" && order.status !== statusFilter) return false
    if (serviceFilter !== "all" && order.service_id.toString() !== serviceFilter) return false
    return true
  })

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    const totalPages = pagination.totalPages
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  // Order Card Component for Grid View
  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border border-gray-100 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-lg">#{order.id}</span>
          </div>
          {getStatusBadge(order.status)}
        </div>
        <div className="text-sm text-gray-600">
          {new Date(order.created_at).toLocaleDateString("vi-VN")}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <User className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{order.customer_name}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Mail className="h-4 w-4 text-gray-400" />
            <span>{order.customer_email}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Phone className="h-4 w-4 text-gray-400" />
            <span>{order.customer_phone}</span>
          </div>
        </div>

        <div className="border-t pt-3">
          <div className="text-sm font-medium text-gray-900 mb-2">{order.service_name}</div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <span>SL:</span>
              <span className="font-medium">{order.quantity}</span>
            </div>
            {order.size && (
              <div className="flex items-center space-x-1">
                <Ruler className="h-3 w-3" />
                <span>{order.size}</span>
              </div>
            )}
          </div>
          {order.material && (
            <div className="flex items-center space-x-1 text-xs text-gray-600 mt-1">
              <Layers className="h-3 w-3" />
              <span>{order.material}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="text-lg font-bold text-green-600">
            {order.total_price?.toLocaleString('vi-VN')} đ
          </div>
          <div className="flex space-x-1">
            <Button variant="outline" size="sm" onClick={() => openViewDialog(order)}>
              <Eye className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => openStatusDialog(order)}>
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-green-50/30 to-transparent rounded-full blur-3xl"></div>

      <div className="space-y-4 sm:space-y-6 relative z-10 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pb-8">
        {/* Enhanced Responsive Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent mb-2 sm:mb-3">
                  Quản lý Đơn hàng
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-600">
                  <span className="flex items-center">
                    <Package className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
                    <span className="hidden sm:inline">Phú Long Order Management</span>
                    <span className="sm:hidden">Quản lý đơn hàng</span>
                  </span>
                  <span className="flex items-center">
                    <TrendingUp className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                    {pagination.total} đơn hàng
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setRefreshing(true)
                    fetchOrders()
                  }}
                  disabled={refreshing}
                  className="border-gray-300 flex-1 sm:flex-none"
                >
                  <RefreshCw className={`mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{refreshing ? 'Đang làm mới...' : 'Làm mới'}</span>
                  <span className="sm:hidden">Làm mới</span>
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  className="border-gray-300 flex-1 sm:flex-none"
                >
                  <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Xuất CSV</span>
                  <span className="sm:hidden">CSV</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs sm:text-sm">Tổng đơn hàng</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.totalOrders}</p>
                </div>
                <Package className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-xs sm:text-sm">Chờ xử lý</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.pendingOrders}</p>
                </div>
                <Clock className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs sm:text-sm">Đang xử lý</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.processingOrders}</p>
                </div>
                <Activity className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs sm:text-sm">Hoàn thành</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.completedOrders}</p>
                </div>
                <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-xs sm:text-sm">Đã hủy</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.cancelledOrders}</p>
                </div>
                <XCircle className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-xs sm:text-sm">Doanh thu</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.totalRevenue.toLocaleString('vi-VN')}đ</p>
                </div>
                <DollarSign className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Responsive Filters Card */}
        <Card className="border border-gray-100 shadow-sm bg-white/90 backdrop-blur-sm">
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
                    {filteredOrders.length} kết quả
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
                  placeholder="Tìm theo tên khách hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 sm:pl-10 h-9 sm:h-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 sm:h-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="processing">Đang xử lý</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>

              {/* Service Filter */}
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="h-9 sm:h-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Dịch vụ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả dịch vụ</SelectItem>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Quick Actions */}
              <div className="flex space-x-2 sm:col-span-2 lg:col-span-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                    setServiceFilter("all")
                  }}
                  className="flex-1 h-9 sm:h-10 text-xs sm:text-sm border-gray-300"
                >
                  <span className="hidden sm:inline">Xóa bộ lọc</span>
                  <span className="sm:hidden">Xóa lọc</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Card */}
        <Card className="border border-gray-100 shadow-sm bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
            <CardTitle className="flex items-center text-gray-900">
              <Package className="mr-2 h-5 w-5 text-blue-600" />
              Danh sách đơn hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-500">Đang tải đơn hàng...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Package className="h-16 w-16 text-gray-300" />
                <p className="text-gray-500 text-lg">Không tìm thấy đơn hàng nào</p>
              </div>
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {filteredOrders.map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Mobile Cards View */}
                    <div className="sm:hidden space-y-3">
                      {filteredOrders.map((order) => (
                        <Card key={order.id} className="p-4 border border-gray-200">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="font-medium text-sm">#{order.id}</div>
                              <div className="font-semibold text-base line-clamp-1">{order.customer_name}</div>
                              <div className="text-xs text-gray-500 line-clamp-1">{order.customer_email}</div>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="line-clamp-1">{order.service_name}</div>
                            <div className="flex justify-between">
                              <span>SL: {order.quantity}</span>
                              <span className="font-medium text-green-600">
                                {order.total_price?.toLocaleString('vi-VN')} đ
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                {new Date(order.created_at).toLocaleDateString("vi-VN")}
                              </span>
                              <div className="flex space-x-1">
                                <Button variant="outline" size="sm" onClick={() => openViewDialog(order)}>
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => openStatusDialog(order)}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden sm:block rounded-lg border border-gray-200 overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="font-semibold">ID</TableHead>
                            <TableHead className="font-semibold">Khách hàng</TableHead>
                            <TableHead className="font-semibold hidden lg:table-cell">Dịch vụ</TableHead>
                            <TableHead className="font-semibold">SL</TableHead>
                            <TableHead className="font-semibold">Trạng thái</TableHead>
                            <TableHead className="font-semibold">Tổng tiền</TableHead>
                            <TableHead className="font-semibold hidden lg:table-cell">Ngày tạo</TableHead>
                            <TableHead className="text-right font-semibold">Thao tác</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredOrders.map((order) => (
                            <TableRow key={order.id} className="hover:bg-gray-50/50">
                              <TableCell className="font-medium">#{order.id}</TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium line-clamp-1">{order.customer_name}</div>
                                  <div className="text-sm text-gray-500 line-clamp-1">{order.customer_email}</div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell line-clamp-2">{order.service_name}</TableCell>
                              <TableCell>{order.quantity}</TableCell>
                              <TableCell>{getStatusBadge(order.status)}</TableCell>
                              <TableCell className="font-medium text-green-600">
                                {order.total_price?.toLocaleString('vi-VN')} đ
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">{new Date(order.created_at).toLocaleDateString("vi-VN")}</TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openViewDialog(order)}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      Xem chi tiết
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openStatusDialog(order)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Cập nhật trạng thái
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}

                {/* Enhanced Responsive Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 sm:mt-8 gap-4">
                  <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                    <span className="hidden sm:inline">Hiển thị </span>
                    <span className="font-medium">{filteredOrders.length}</span>
                    <span className="hidden sm:inline"> / </span>
                    <span className="sm:hidden">/</span>
                    <span className="font-medium">{pagination.total}</span>
                    <span className="hidden sm:inline"> đơn hàng</span>
                  </div>
                  
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        className="border-gray-300 h-8 sm:h-9"
                      >
                        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-0 sm:mr-1" />
                        <span className="hidden sm:inline">Trước</span>
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {getPageNumbers().slice(0, window.innerWidth < 640 ? 3 : undefined).map((page, index) => (
                          page === '...' ? (
                            <span key={index} className="px-1 sm:px-2 py-1 text-gray-400 text-xs sm:text-sm">...</span>
                          ) : (
                            <Button
                              key={index}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page as number)}
                              className={`w-7 h-7 sm:w-8 sm:h-8 p-0 text-xs sm:text-sm ${currentPage === page ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-300'}`}
                            >
                              {page}
                            </Button>
                          )
                        ))}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(Math.min(currentPage + 1, pagination.totalPages))}
                        disabled={currentPage === pagination.totalPages}
                        className="border-gray-300 h-8 sm:h-9"
                      >
                        <span className="hidden sm:inline">Sau</span>
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-0 sm:ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Responsive View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="mx-4 sm:mx-0 sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-sm sm:text-base">
              <Eye className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
              Chi tiết đơn hàng #{selectedOrder?.id}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Thông tin chi tiết đơn hàng và khách hàng
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="grid gap-6 py-4">
              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center">
                  <User className="mr-2 h-5 w-5 text-blue-600" />
                  Thông tin khách hàng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Tên khách hàng</label>
                    <p className="text-sm text-gray-900">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{selectedOrder.customer_email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
                    <p className="text-sm text-gray-900">{selectedOrder.customer_phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Trạng thái</label>
                    <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                  </div>
                </div>
              </div>

              {/* Order Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center">
                  <Package className="mr-2 h-5 w-5 text-green-600" />
                  Thông tin đơn hàng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Dịch vụ</label>
                    <p className="text-sm text-gray-900">{selectedOrder.service_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Số lượng</label>
                    <p className="text-sm text-gray-900">{selectedOrder.quantity}</p>
                  </div>
                  {selectedOrder.size && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Kích thước</label>
                      <p className="text-sm text-gray-900">{selectedOrder.size}</p>
                    </div>
                  )}
                  {selectedOrder.material && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Chất liệu</label>
                      <p className="text-sm text-gray-900">{selectedOrder.material}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Tổng tiền</label>
                    <p className="text-lg font-bold text-green-600">
                      {selectedOrder.total_price?.toLocaleString('vi-VN')} đ
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Ngày tạo</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedOrder.created_at).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-orange-600" />
                    Ghi chú
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-900">{selectedOrder.notes}</p>
                  </div>
                </div>
              )}

              {/* Design File */}
              {selectedOrder.design_file && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-purple-600" />
                    File thiết kế
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <a 
                      href={selectedOrder.design_file} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Xem file thiết kế
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Đóng
            </Button>
            <Button onClick={() => {
              setIsViewDialogOpen(false)
              openStatusDialog(selectedOrder!)
            }} className="bg-blue-600 hover:bg-blue-700">
              <Edit className="mr-2 h-4 w-4" />
              Cập nhật trạng thái
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="mr-2 h-5 w-5 text-orange-600" />
              Cập nhật trạng thái đơn hàng
            </DialogTitle>
            <DialogDescription>
              Cập nhật trạng thái cho đơn hàng #{selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Trạng thái mới</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="processing">Đang xử lý</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateStatus} className="bg-orange-600 hover:bg-orange-700">
              <Edit className="mr-2 h-4 w-4" />
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}