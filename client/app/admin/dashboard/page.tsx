"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Package,
  Users,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Calendar,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Clock,
  Award,
  Activity,
  RefreshCw,
  BarChart3,
  PieChart,
  TrendingDown,
  Zap,
  Target,
  Timer,
  Bell,
  Settings,
  Download,
  Filter,
  Search,
  ChevronRight,
  Info,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

interface DashboardSummary {
  new_orders: number
  services: number
  customers: number
  revenue: number
  total_orders?: number
  pending_orders?: number
  completed_orders?: number
  total_services?: number
  active_services?: number
  total_customers?: number
  total_revenue?: number
  monthly_revenue?: number
  revenue_growth?: number
  order_growth?: number
  customer_growth?: number
  service_growth?: number
}

interface RecentOrder {
  id: number
  customer_name: string
  service_name: string
  total_price: number
  status: string
  created_at: string
  priority?: string
}

interface PopularService {
  id: number
  name: string
  order_count: number
  total_revenue: number
  growth_rate?: number
}

interface DashboardStats {
  daily_orders: number
  weekly_revenue: number
  conversion_rate: number
  avg_order_value: number
  customer_satisfaction: number
  processing_time: number
}

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [popularServices, setPopularServices] = useState<PopularService[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(false)
  const { toast } = useToast()
  const { token } = useAuth()

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      }

      // Fetch all data in parallel for better performance
      const [summaryResponse, ordersResponse, servicesResponse] = await Promise.all([
        fetch(`${API_URL}/api/dashboard/summary`, { headers }),
        fetch(`${API_URL}/api/dashboard/recent-orders?limit=5`, { headers }),
        fetch(`${API_URL}/api/dashboard/popular-services?limit=5`, { headers })
      ])

      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json()
        setSummary(summaryData)
      }

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setRecentOrders(Array.isArray(ordersData) ? ordersData : [])
      }

      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json()
        setPopularServices(Array.isArray(servicesData) ? servicesData : [])
      }

      // Mock additional stats (in real app, these would come from API)
      setStats({
        daily_orders: Math.floor(Math.random() * 50) + 20,
        weekly_revenue: Math.floor(Math.random() * 1000000) + 500000,
        conversion_rate: Math.floor(Math.random() * 30) + 60,
        avg_order_value: Math.floor(Math.random() * 500000) + 200000,
        customer_satisfaction: Math.floor(Math.random() * 20) + 80,
        processing_time: Math.floor(Math.random() * 20) + 10
      })

      setLastUpdated(new Date())
      
      if (isRefresh) {
        toast({
          title: "Cập nhật thành công",
          description: "Dữ liệu dashboard đã được làm mới",
        })
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu dashboard",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [token, toast, API_URL])

  useEffect(() => {
    if (token) {
      fetchDashboardData()
    }
  }, [token, fetchDashboardData])

  // Auto refresh every 5 minutes if enabled
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchDashboardData(true)
      }, 5 * 60 * 1000) // 5 minutes

      return () => clearInterval(interval)
    }
  }, [autoRefresh, fetchDashboardData])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        bg: "bg-amber-100", 
        text: "text-amber-800", 
        hover: "hover:bg-amber-200",
        icon: Timer,
        label: "Chờ xử lý"
      },
      processing: { 
        bg: "bg-blue-100", 
        text: "text-blue-800", 
        hover: "hover:bg-blue-200",
        icon: Zap,
        label: "Đang xử lý"
      },
      completed: { 
        bg: "bg-green-100", 
        text: "text-green-800", 
        hover: "hover:bg-green-200",
        icon: Target,
        label: "Hoàn thành"
      },
      cancelled: { 
        bg: "bg-red-100", 
        text: "text-red-800", 
        hover: "hover:bg-red-200",
        icon: TrendingDown,
        label: "Đã hủy"
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      hover: "hover:bg-gray-200",
      icon: Info,
      label: "Không xác định"
    }

    const Icon = config.icon

    return (
      <Badge className={`${config.bg} ${config.text} ${config.hover} flex items-center gap-1 transition-colors`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive" className="text-xs">Cao</Badge>
      case "medium":
        return <Badge variant="default" className="text-xs bg-yellow-500">Trung bình</Badge>
      case "low":
        return <Badge variant="secondary" className="text-xs">Thấp</Badge>
      default:
        return null
    }
  }

  const formatLastUpdated = () => {
    const now = new Date()
    const diff = now.getTime() - lastUpdated.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return "Vừa xong"
    if (minutes < 60) return `${minutes} phút trước`
    
    const hours = Math.floor(minutes / 60)
    return `${hours} giờ trước`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
        {/* Enhanced Background */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-50/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-blue-50/30 to-transparent rounded-full blur-3xl"></div>
        
        <div className="flex items-center justify-center h-full relative z-10">
          <div className="text-center">
            <div className="relative mb-8">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-red-200 border-t-red-600 mx-auto"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400/20 to-red-600/20 animate-pulse"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Đang tải Dashboard</h3>
            <p className="text-gray-600">Vui lòng đợi trong giây lát...</p>
            <div className="mt-4 w-64 mx-auto">
              <Progress value={33} className="animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-50/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-blue-50/30 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-r from-red-200/20 to-red-300/20 rounded-full blur-2xl animate-pulse"></div>

      <div className="space-y-4 sm:space-y-6 relative z-10 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pb-8">
        {/* Enhanced Responsive Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent mb-2 sm:mb-3">
                  Dashboard Quản Trị
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-600">
                  <span className="flex items-center">
                    <Activity className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
                    <span className="hidden sm:inline">Phú Long Print Solutions</span>
                    <span className="sm:hidden">Phú Long</span>
                  </span>
                  <span className="flex items-center">
                    <Clock className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
                    <span className="hidden sm:inline">Cập nhật lần cuối: {formatLastUpdated()}</span>
                    <span className="sm:hidden">{formatLastUpdated()}</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => fetchDashboardData(true)}
                  disabled={refreshing}
                  className="border-gray-300 flex-1 sm:flex-none text-xs sm:text-sm"
                >
                  <RefreshCw className={`mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{refreshing ? 'Đang làm mới...' : 'Làm mới'}</span>
                  <span className="sm:hidden">Làm mới</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Responsive Summary Cards */}
        <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-2 lg:grid-cols-4">
          {/* Đơn hàng mới */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-red-100 to-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-200/30 to-transparent rounded-bl-3xl"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-700">Đơn hàng mới</CardTitle>
              <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <ShoppingCart className="h-6 w-6 text-red-700" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-red-700 transition-colors">
                {summary?.new_orders || summary?.total_orders || 0}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 flex items-center">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  {summary?.pending_orders || 0} chờ xử lý
                </p>
                {summary?.order_growth && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    +{summary.order_growth}%
                  </Badge>
                )}
              </div>
              <Progress 
                value={(summary?.pending_orders || 0) / (summary?.new_orders || 1) * 100} 
                className="mt-3 h-2"
              />
            </CardContent>
          </Card>

          {/* Dịch vụ */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-200/30 to-transparent rounded-bl-3xl"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-700">Dịch vụ</CardTitle>
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <Package className="h-6 w-6 text-blue-700" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                {summary?.services || summary?.total_services || 0}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 flex items-center">
                  <Activity className="mr-1 h-3 w-3 text-blue-500" />
                  {summary?.active_services || 0} hoạt động
                </p>
                {summary?.service_growth && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    +{summary.service_growth}%
                  </Badge>
                )}
              </div>
              <Progress 
                value={(summary?.active_services || 0) / (summary?.services || 1) * 100} 
                className="mt-3 h-2"
              />
            </CardContent>
          </Card>

          {/* Khách hàng */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-green-100 to-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-200/30 to-transparent rounded-bl-3xl"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-700">Khách hàng</CardTitle>
              <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <Users className="h-6 w-6 text-green-700" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                {summary?.customers || summary?.total_customers || 0}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Tổng số khách hàng</p>
                {summary?.customer_growth && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    +{summary.customer_growth}%
                  </Badge>
                )}
              </div>
              <div className="mt-3 text-xs text-gray-500">
                {stats?.daily_orders || 0} khách hàng mới hôm nay
              </div>
            </CardContent>
          </Card>

          {/* Doanh thu */}
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-200/30 to-transparent rounded-bl-3xl"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-700">Doanh thu</CardTitle>
              <div className="p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <DollarSign className="h-6 w-6 text-yellow-700" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent mb-2">
                {(summary?.revenue || summary?.monthly_revenue || 0).toLocaleString("vi-VN")}đ
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm">
                  {summary?.revenue_growth && summary.revenue_growth > 0 ? (
                    <>
                      <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                      <span className="text-green-600 font-medium">+{summary.revenue_growth}%</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
                      <span className="text-red-600 font-medium">{summary?.revenue_growth || 0}%</span>
                    </>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">Tháng này</Badge>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Trung bình: {(stats?.avg_order_value || 0).toLocaleString("vi-VN")}đ/đơn
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Analytics Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-purple-800">Tỷ lệ chuyển đổi</CardTitle>
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900 mb-2">
                {stats?.conversion_rate || 0}%
              </div>
              <Progress value={stats?.conversion_rate || 0} className="h-2" />
              <p className="text-xs text-purple-700 mt-2">Từ lượt xem thành đơn hàng</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-indigo-800">Hài lòng khách hàng</CardTitle>
              <Star className="h-5 w-5 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-900 mb-2">
                {stats?.customer_satisfaction || 0}%
              </div>
              <Progress value={stats?.customer_satisfaction || 0} className="h-2" />
              <p className="text-xs text-indigo-700 mt-2">Đánh giá tích cực</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-teal-800">Thời gian xử lý</CardTitle>
              <Timer className="h-5 w-5 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-900 mb-2">
                {stats?.processing_time || 0}h
              </div>
              <Progress value={100 - (stats?.processing_time || 0) * 3} className="h-2" />
              <p className="text-xs text-teal-700 mt-2">Trung bình mỗi đơn hàng</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Enhanced Recent Orders */}
         
          {/* Enhanced Popular Services */}
        
        </div>

        {/* Enhanced Quick Actions */}
        <Card className="border border-gray-200 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 rounded-t-lg">
            <CardTitle className="flex items-center text-gray-900">
              <TrendingUp className="mr-3 h-5 w-5 text-gray-600" />
              Thao tác nhanh
              <Badge variant="outline" className="ml-3 bg-white">
                4 tính năng
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button asChild className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 group h-auto p-6 flex-col">
                <Link href="/admin/services">
                  <Package className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-medium">Quản lý dịch vụ</span>
                  <span className="text-xs opacity-90 mt-1">{summary?.services || 0} dịch vụ</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="group border-blue-300 text-blue-600 hover:bg-blue-50 h-auto p-6 flex-col">
                <Link href="/admin/orders">
                  <ShoppingCart className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-medium">Đơn hàng</span>
                  <span className="text-xs opacity-70 mt-1">{summary?.new_orders || 0} đơn mới</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="group border-green-300 text-green-600 hover:bg-green-50 h-auto p-6 flex-col">
                <Link href="/admin/users">
                  <Users className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-medium">Khách hàng</span>
                  <span className="text-xs opacity-70 mt-1">{summary?.customers || 0} khách hàng</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="group border-yellow-300 text-yellow-600 hover:bg-yellow-50 h-auto p-6 flex-col">
                <Link href="/admin/contacts">
                  <Calendar className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-medium">Liên hệ</span>
                  <span className="text-xs opacity-70 mt-1">Phản hồi</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
