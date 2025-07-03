"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle2,
  Star, 
  ShoppingCart, 
  Phone, 
  MessageCircle, 
  Sparkles,
  Award,
  Palette,
  Calculator,
  Send,
  FileText,
  ArrowRight,
  Zap,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import Footer from "@/components/layout/footer"

// Interface definitions
interface Service {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  category: string
  is_active: boolean
  featured?: boolean
}

export default function DesignPricingPage() {
  const [allServices, setAllServices] = useState<Service[]>([])
  const [displayedServices, setDisplayedServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [visibleCount, setVisibleCount] = useState(6)
  const { toast } = useToast()

  const ITEMS_PER_PAGE = 6

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  // Fetch all services from API once
  useEffect(() => {
    fetchAllServices()
  }, [])

  const fetchAllServices = async () => {
    try {
      setLoading(true)
      const API_BASE_URL = 'http://14.187.180.6:12122/api'
      
      const response = await fetch(`${API_BASE_URL}/services?is_active=true&limit=1000`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("API Response:", data)

      let services: Service[] = []
      
      if (data.items && Array.isArray(data.items)) {
        services = data.items
      } else if (Array.isArray(data)) {
        services = data
      } else if (data.data && Array.isArray(data.data)) {
        services = data.data
      }

      const allAvailableServices = services.filter((service: Service) => service.is_active)
      
      setAllServices(allAvailableServices)
      setDisplayedServices(allAvailableServices.slice(0, visibleCount))

    } catch (error) {
      console.error('Error fetching services:', error)
      toast({
        title: "Lỗi tải dữ liệu",
        description: "Không thể tải danh sách dịch vụ thiết kế. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const allAvailableServices = allServices.filter(service => service.is_active)
  const hasMoreServices = displayedServices.length < allAvailableServices.length

  const loadMoreServices = () => {
    if (loadingMore || !hasMoreServices) return
    
    setLoadingMore(true)
    
    setTimeout(() => {
      const nextCount = visibleCount + ITEMS_PER_PAGE
      const newDisplayedServices = allAvailableServices.slice(0, nextCount)
      
      setDisplayedServices(newDisplayedServices)
      setVisibleCount(nextCount)
      setLoadingMore(false)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-red-50/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
      <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-red-50/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-gray-100/30 to-transparent rounded-full blur-3xl"></div>

      {/* Navigation breadcrumb - Separate section */}
      <section className="pt-20 pb-4 relative z-40">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center"
          >
            <div className="inline-flex items-center space-x-2 text-sm text-gray-500 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm">
              <Link href="/pricing" className="hover:text-red-600 transition-colors">Bảng giá</Link>
              <span>/</span>
              <span className="text-red-600 font-medium">Thiết kế</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Header Section */}
      <section className="pt-4 pb-20 relative z-10">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            {/* Logo Phú Long */}
          

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-red-100 to-gray-100 border border-red-200/50 mb-6"
            >
              <Palette className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-sm font-semibold bg-gradient-to-r from-red-700 to-gray-700 bg-clip-text text-transparent">
                Dịch vụ thiết kế chuyên nghiệp
              </span>
              <Sparkles className="h-5 w-5 text-gray-600 ml-2" />
            </motion.div>

            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-red-700 to-gray-800 bg-clip-text text-transparent mb-6">
              BẢNG GIÁ THIẾT KẾ
              <motion.div 
                className="w-32 h-1.5 bg-gradient-to-r from-red-600 to-gray-500 mx-auto mt-4 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: 128 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Thiết kế 
              <span className="text-red-600 font-semibold"> chuyên nghiệp</span> với đội ngũ sáng tạo 
              <span className="text-gray-700 font-semibold"> giàu kinh nghiệm</span> cho mọi nhu cầu của bạn
            </p>
          </motion.div>



          {/* Services Grid */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Dịch vụ thiết kế của chúng tôi
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Từ logo, brochure đến website, chúng tôi tạo ra những thiết kế ấn tượng và chuyên nghiệp
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-red-600 mx-auto"></div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400/20 to-red-600/20 animate-pulse"></div>
                </div>
                <p className="mt-4 text-gray-600">Đang tải dữ liệu thiết kế...</p>
              </div>
            </div>
          ) : (
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              key={displayedServices.length}
            >
              {displayedServices.length > 0 ? displayedServices.map((service: Service, index: number) => (
                <motion.div
                  key={service.id}
                  custom={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ 
                    y: -5, 
                    scale: service.featured ? 1.03 : 1.02,
                    transition: { duration: 0.3 }
                  }}
                  className="group"
                >
                  <Card className={`relative border-0 shadow-lg hover:shadow-xl transition-all duration-500 h-full ${
                    service.featured 
                      ? "ring-2 ring-yellow-400 ring-offset-2 bg-gradient-to-br from-yellow-50 to-white shadow-yellow-200/50 hover:shadow-yellow-300/60" 
                      : "bg-white/90 backdrop-blur-sm hover:bg-white"
                  }`}>
                    {service.featured && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center">
                          <Star className="h-4 w-4 mr-2 fill-current" />
                          <span className="text-sm font-semibold">Sản phẩm nổi bật</span>
                          <Sparkles className="h-4 w-4 ml-2 fill-current" />
                        </div>
                      </div>
                    )}

                    <CardHeader className="text-center pb-6 pt-8">
                      {service.image_url ? (
                        <div className="w-16 h-16 rounded-xl mx-auto mb-4 overflow-hidden group-hover:scale-110 transition-transform duration-300 shadow-md">
                          <img 
                            src={service.image_url} 
                            alt={service.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <div className="fallback-icon w-full h-full bg-gradient-to-br from-red-100 to-red-50 rounded-xl flex items-center justify-center" style={{display: 'none'}}>
                            <Palette className="w-8 h-8 text-red-600" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-50 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                          <Palette className="w-8 h-8 text-red-600" />
                        </div>
                      )}
                      <CardTitle className={`text-xl font-bold mb-3 transition-colors duration-300 ${
                        service.featured 
                          ? "text-amber-700 group-hover:text-yellow-600" 
                          : "group-hover:text-red-600"
                      }`}>
                        {service.name}
                      </CardTitle>
                      
                      <div className="space-y-2">
                        <div className="text-sm text-gray-500">Giá từ</div>
                        <div className={`text-3xl font-bold bg-clip-text text-transparent ${
                          service.featured 
                            ? "bg-gradient-to-r from-yellow-600 to-amber-600" 
                            : "bg-gradient-to-r from-red-600 to-red-700"
                        }`}>
                          {service.price && service.price > 0 
                            ? `${service.price.toLocaleString('vi-VN')}đ` 
                            : 'Liên hệ báo giá'
                          }
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mt-4 leading-relaxed">
                        {service.description}
                      </p>
                    </CardHeader>

                    <CardContent className="pt-0 pb-8">
                      <div className="space-y-3 mb-8">
                        <div className="flex items-center space-x-3">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700">Thiết kế chuyên nghiệp</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700">File chất lượng cao</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700">Hỗ trợ tư vấn miễn phí</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700">Chỉnh sửa theo yêu cầu</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Button
                          asChild
                          variant="outline"
                          className="w-full border-2 border-gray-200 hover:border-red-300 text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-300 font-medium"
                        >
                          <Link href={`/services/${service.id}`} className="flex items-center justify-center">
                            <FileText className="h-4 w-4 mr-2" />
                            Xem chi tiết
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                          </Link>
                        </Button>
                        
                        <Button
                          asChild
                          className={`w-full transition-all duration-300 font-medium ${
                            service.featured 
                              ? "bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 shadow-lg hover:shadow-xl" 
                              : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                          }`}
                        >
                          <Link href="/order" className="flex items-center justify-center">
                            <Send className="h-4 w-4 mr-2" />
                            Gửi yêu cầu báo giá
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )) : (
                <motion.div 
                  variants={itemVariants}
                  className="col-span-full text-center py-12"
                >
                  <div className="text-gray-500">
                    <Palette className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold mb-2">Chưa có dịch vụ thiết kế</h3>
                    <p className="text-gray-400">Vui lòng quay lại sau hoặc liên hệ để được tư vấn</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Load More Button */}
          {displayedServices.length > 0 && hasMoreServices && (
            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button
                onClick={loadMoreServices}
                disabled={loadingMore}
                size="lg"
                variant="outline"
                className="bg-white hover:bg-red-50 border-2 border-red-200 text-red-600 hover:text-red-700 hover:border-red-300 px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Đang tải thêm...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                    Xem thêm 6 dịch vụ ({allAvailableServices.length - displayedServices.length} còn lại)
                    <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-100 to-red-50/50 relative z-10">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-red-100 to-gray-100 border border-red-200/50 mb-8">
                <Award className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-sm font-semibold bg-gradient-to-r from-red-700 to-gray-700 bg-clip-text text-transparent">
                  Tư vấn thiết kế chuyên nghiệp
                </span>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-red-700 to-gray-800 bg-clip-text text-transparent mb-6">
                Cần tư vấn về dịch vụ thiết kế?
              </h2>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Liên hệ với chúng tôi để được 
                <span className="text-red-600 font-semibold"> tư vấn miễn phí</span> và nhận 
                <span className="text-gray-700 font-semibold"> báo giá tốt nhất</span> cho dự án thiết kế của bạn
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-10 py-6 text-lg rounded-xl shadow-xl hover:scale-105 transition-all duration-300 group"
                >
                  <Link href="/order" className="flex items-center">
                    <Send className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                    Gửi yêu cầu báo giá
                    <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
                  </Link>
                </Button>
                
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-gray-300 text-gray-700 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-300 px-10 py-6 text-lg rounded-xl shadow-xl hover:scale-105 transition-all duration-300 group"
                >
                  <Link href="/contact" className="flex items-center">
                    <Phone className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                    Liên hệ tư vấn
                  </Link>
                </Button>
              </div>

              {/* Features */}
              <div className="grid sm:grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
                {[
                  { icon: Zap, title: "Báo giá nhanh", desc: "Phản hồi trong 30 phút" },
                  { icon: CheckCircle2, title: "Giá cả minh bạch", desc: "Không phát sinh chi phí" },
                  { icon: Award, title: "Chất lượng đảm bảo", desc: "Cam kết 100% hài lòng" }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg mx-auto w-16 h-16 flex items-center justify-center mb-4">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h4>
                    <p className="text-gray-600">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
} 