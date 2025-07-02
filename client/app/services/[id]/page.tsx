"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import Footer from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Clock, 
  Shield, 
  Award, 
  User,
  CheckCircle,
  Truck,
  Phone,
  MessageCircle,
  Eye,
  Sparkles,
  Zap,
  Download,
  PrinterIcon
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useFavorites } from "@/hooks/use-favorites"
import { motion } from "framer-motion"

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

interface Review {
  id: number
  rating: number
  content: string
  author_name: string
  is_anonymous: boolean
  created_at: string
}

export default function ServiceDetailPage() {
  const params = useParams()
  const [service, setService] = useState<Service | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [suggestedServices, setSuggestedServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [viewCount, setViewCount] = useState(1247)
  const { toast } = useToast()
  const { toggleFavorite, isFavorite } = useFavorites()

  useEffect(() => {
    if (params.id) {
      fetchServiceDetail()
      fetchReviews()
      fetchSuggestedServices()
    }
  }, [params.id])

  const fetchServiceDetail = async () => {
    try {
      const response = await fetch(`http://14.187.180.6:12122/api/services/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setService(data)
      } else {
        toast({
          title: "Lỗi",
          description: "Không tìm thấy dịch vụ",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching service:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin dịch vụ",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://14.187.180.6:12122/api/services/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data)
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    }
  }

  const fetchSuggestedServices = async () => {
    try {
      const response = await fetch(`http://14.187.180.6:12122/api/services/suggested?current_id=${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setSuggestedServices(data)
      }
    } catch (error) {
      console.error("Error fetching suggested services:", error)
    }
  }

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  const handleLike = () => {
    if (!service) return
    
    const isNowFavorite = toggleFavorite({
      id: service.id,
      name: service.name,
      price: service.price,
      image_url: service.image?.url || "",
      category: service.category
    })
    
    toast({
      title: isNowFavorite ? "Đã thêm vào yêu thích" : "Đã bỏ yêu thích",
      description: isNowFavorite ? "Dịch vụ đã được thêm vào danh sách yêu thích" : "Dịch vụ đã được bỏ khỏi danh sách yêu thích",
    })
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "Đã sao chép liên kết",
      description: "Liên kết dịch vụ đã được sao chép vào clipboard",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 lg:py-8">
          <motion.div 
            className="animate-pulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-8 sm:h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-32 sm:w-48 mb-4 sm:mb-6 lg:mb-8"></div>
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
              <div className="h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 rounded-xl"></div>
              <div className="space-y-4 sm:space-y-6">
                <div className="h-8 sm:h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-3/4"></div>
                <div className="h-4 sm:h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-full"></div>
                <div className="h-4 sm:h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-2/3"></div>
                <div className="h-16 sm:h-20 bg-gradient-to-r from-red-100 via-red-200 to-red-100 rounded-xl w-full"></div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <div className="h-10 sm:h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg flex-1"></div>
                  <div className="h-10 sm:h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-full sm:w-32"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
        <motion.div 
          className="text-center bg-white rounded-2xl p-6 sm:p-8 lg:p-12 shadow-2xl border border-gray-100 max-w-sm sm:max-w-md mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Star className="h-8 w-8 sm:h-10 sm:w-10 text-red-500" />
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Không tìm thấy dịch vụ</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed">Dịch vụ bạn tìm kiếm không tồn tại hoặc đã bị xóa</p>
          <Button asChild className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg">
            <Link href="/pricing">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách
            </Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 lg:py-8">
        {/* Enhanced Responsive Breadcrumb */}
        <motion.div 
          className="mb-4 sm:mb-6 lg:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button variant="ghost" asChild className="mb-4 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-300 group p-2 sm:p-3">
            <Link href="/pricing" className="flex items-center text-sm sm:text-base">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="hidden xs:inline">Quay lại danh sách dịch vụ</span>
              <span className="xs:hidden">Quay lại</span>
            </Link>
          </Button>
        </motion.div>

        {/* Enhanced Responsive Service Detail */}
        <motion.div 
          className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Responsive Image Section */}
          <div className="space-y-4 sm:space-y-6">
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl group">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src={service.image?.url 
                  ? (service.image.url.startsWith('http') ? service.image.url : `http://14.187.180.6:12122${service.image.url}`)
                  : "/placeholder.svg?height=500&width=700"}
                  alt={service.name}
                  width={700}
                  height={500}
                  className="w-full h-64 sm:h-80 lg:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Responsive Floating badges */}
                {service.featured && (
                  <motion.div 
                    className="absolute top-3 left-3 sm:top-4 sm:left-4 lg:top-6 lg:left-6"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <Badge className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg sm:shadow-xl backdrop-blur-sm border border-white/20 text-xs sm:text-sm">
                      <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 animate-pulse" />
                      Nổi bật
                    </Badge>
                  </motion.div>
                )}

                {/* Responsive View counter */}
                <motion.div 
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 lg:top-6 lg:right-6"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  
                </motion.div>
              </motion.div>
            </div>

            {/* Responsive Action Buttons Row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLike}
                className={`transition-all duration-300 text-xs sm:text-sm p-2 sm:p-3 ${
                  service && isFavorite(service.id) 
                    ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100" 
                    : "hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                }`}
              >
                <Heart className={`mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 ${service && isFavorite(service.id) ? "fill-current" : ""}`} />
                <span className="hidden sm:inline">{service && isFavorite(service.id) ? "Đã yêu thích" : "Yêu thích"}</span>
                <span className="sm:hidden">❤️</span>
              </Button>
              
            
              
              <Button 
                variant="outline" 
                size="sm"
                className="hover:bg-green-50 hover:border-green-200 hover:text-green-600 transition-all duration-300 text-xs sm:text-sm p-2 sm:p-3"
              >
                <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
               
                <span className="sm:hidden">⬇️</span>
              </Button>
            </div>
          </div>

          {/* Responsive Details Section */}
          <div className="space-y-6 sm:space-y-8">
            <div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Badge variant="outline" className="mb-3 sm:mb-4 bg-red-50 text-red-600 border-red-200 hover:bg-red-100 transition-colors duration-300 text-xs sm:text-sm">
                  <PrinterIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                  {service.category}
                </Badge>
                
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                  {service.name}
                </h1>

                {/* Responsive Rating and Reviews */}
                {reviews.length > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 sm:h-5 sm:w-5 ${
                            i < Math.floor(averageRating) ? "text-yellow-400 fill-current" : "text-gray-300"
                          } transition-colors duration-300`}
                        />
                      ))}
                    </div>
                    <span className="text-base sm:text-lg font-semibold text-gray-800">
                      {averageRating.toFixed(1)}
                    </span>
                    <span className="text-gray-600 bg-gray-100 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                      {reviews.length} đánh giá
                    </span>
                  </div>
                )}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed mb-6 sm:mb-8">{service.description}</p>
            </motion.div>

            {/* Enhanced Responsive Price Card */}
            <motion.div 
              className="bg-gradient-to-br from-red-50 via-white to-red-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-red-100 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
                <div className="text-center sm:text-left">
                  <div className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Giá dịch vụ</div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                    {service.price.toLocaleString("vi-VN")}đ
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <Badge className="bg-green-100 text-green-700 border-green-200 mb-1 sm:mb-2 text-xs sm:text-sm">
                    <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                    Có sẵn
                  </Badge>
                  <div className="text-xs sm:text-sm text-gray-600">Miễn phí tư vấn</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
                  <span>3-5 ngày</span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600">
                  <Truck className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                  <span>Giao miễn phí</span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 flex-shrink-0" />
                  <span>Bảo hành</span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600">
                  <Award className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 flex-shrink-0" />
                  <span>Hỗ trợ 24/7</span>
                </div>
              </div>

              <div className="flex flex-col space-y-2 sm:space-y-3">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 w-full shadow-lg hover:shadow-xl transition-all duration-300 group text-sm sm:text-base h-10 sm:h-12"
                >
                  <Link href={`/order?service_id=${service.id}`} className="flex items-center justify-center">
                    <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform duration-300" />
                    Đặt hàng ngay
                    <Zap className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                  </Link>
                </Button>
                
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
               
                  
                  
                </div>
              </div>
            </motion.div>

            {/* Responsive Service Features */}
            <motion.div 
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h3 className="font-bold text-lg sm:text-xl mb-4 sm:mb-6 flex items-center text-gray-900">
                <Award className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
                Đặc điểm nổi bật
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                {[
                  { icon: CheckCircle, text: "Chất lượng cao, in sắc nét", color: "text-green-500" },
                  { icon: Clock, text: "Giao hàng đúng hạn", color: "text-blue-500" },
                  { icon: Shield, text: "Bảo hành 100% chất lượng", color: "text-purple-500" },
                  { icon: Award, text: "Đội ngũ chuyên nghiệp", color: "text-orange-500" }
                ].map((feature, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                  >
                    <feature.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${feature.color} flex-shrink-0`} />
                    <span className="text-xs sm:text-sm lg:text-base text-gray-700 font-medium">{feature.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Responsive Reviews */}
        {reviews.length > 0 && (
          <motion.div 
            className="mb-8 sm:mb-12 lg:mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 flex items-center">
              <Star className="mr-2 sm:mr-3 h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-yellow-500" />
              <span className="hidden sm:inline">Đánh giá từ khách hàng ({reviews.length})</span>
              <span className="sm:hidden">Đánh giá ({reviews.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                >
                  <Card className="hover:shadow-xl transition-all duration-300 rounded-xl sm:rounded-2xl border-0 bg-white/90 backdrop-blur-sm h-full">
                    <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-xs sm:text-sm lg:text-base">
                              {review.is_anonymous ? "A" : review.author_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base">
                              {review.is_anonymous ? "Khách hàng ẩn danh" : review.author_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(review.created_at).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-0.5 sm:space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 sm:h-4 sm:w-4 ${
                                i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 p-4 sm:p-6">
                      <p className="text-xs sm:text-sm lg:text-base text-gray-700 leading-relaxed">{review.content}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Enhanced Responsive Suggested Services */}
        {suggestedServices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 flex items-center">
              <Sparkles className="mr-2 sm:mr-3 h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-500" />
              <span className="hidden sm:inline">Dịch vụ liên quan</span>
              <span className="sm:hidden">Liên quan</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {suggestedServices.map((suggestedService, index) => (
                <motion.div
                  key={suggestedService.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/90 backdrop-blur-sm h-full">
                    <CardHeader className="p-0">
                      <div className="relative overflow-hidden rounded-t-xl sm:rounded-t-2xl">
                        <Image
                          src={suggestedService.image?.url 
                          ? (suggestedService.image.url.startsWith('http') ? suggestedService.image.url : `http://14.187.180.6:12122${suggestedService.image.url}`)
                          : "/placeholder.svg?height=240&width=400"}
                          alt={suggestedService.name}
                          width={400}
                          height={240}
                          className="w-full h-40 sm:h-48 lg:h-60 object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {suggestedService.featured && (
                          <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
                            <Badge className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg text-xs">
                              <Star className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                              Nổi bật
                            </Badge>
                          </div>
                        )}
                        
                        <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                          <Badge variant="outline" className="bg-white/90 backdrop-blur-sm border-gray-200 text-gray-700 text-xs">
                            {suggestedService.category}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-4 sm:p-6">
                      <CardTitle className="text-base sm:text-lg lg:text-xl font-bold mb-2 sm:mb-3 group-hover:text-red-600 transition-colors duration-300 line-clamp-2">
                        {suggestedService.name}
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 leading-relaxed">{suggestedService.description}</p>
                      
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <span className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                          {suggestedService.price.toLocaleString("vi-VN")}đ
                        </span>
                        <div className="flex items-center space-x-0.5 text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                          ))}
                        </div>
                      </div>
                      
                      <Button asChild className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm h-8 sm:h-10">
                        <Link href={`/services/${suggestedService.id}`} className="flex items-center justify-center">
                          <Eye className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Xem chi tiết</span>
                          <span className="sm:hidden">Xem</span>
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
     
    </div>
  )
}
