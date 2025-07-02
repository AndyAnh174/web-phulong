"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Star, 
  ShoppingCart, 
  Phone, 
  Sparkles,
  Palette,
  Calculator,
  Send,
  Loader2,
  Eye
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface Service {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  category: string
  is_active: boolean
  featured?: boolean
  image?: {
    id: number
    filename: string
    url: string
    alt_text: string | null
    width: number
    height: number
  }
}

export default function DesignPage() {
  const [designServices, setDesignServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [visibleCount, setVisibleCount] = useState(6)
  const { toast } = useToast()
  const router = useRouter()

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

  // Fetch design services from API
  useEffect(() => {
    fetchDesignServices()
  }, [])

  const fetchDesignServices = async () => {
    try {
      setLoading(true)
      const API_BASE_URL = 'http://14.187.180.6:12122/api'
      
      // Fetch services with design categories
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
      
      // Filter design-related services based on category
      const designCategories = ['thiết kế', 'design', 'logo', 'brand', 'nhận diện thương hiệu', 'branding']
      const filteredDesignServices = Array.isArray(data) ? data.filter((service: Service) => 
        designCategories.some(cat => 
          service.category.toLowerCase().includes(cat) ||
          service.name.toLowerCase().includes(cat) ||
          service.description.toLowerCase().includes(cat)
        )
      ) : []

      setDesignServices(filteredDesignServices)
    } catch (error) {
      console.error("Error fetching design services:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách dịch vụ thiết kế",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadMoreServices = () => {
    setLoadingMore(true)
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, designServices.length))
      setLoadingMore(false)
    }, 500)
  }

  const handleOrderService = (service: Service) => {
    router.push(`/order?service=${encodeURIComponent(service.name)}&price=${service.price}`)
  }

  const displayedServices = designServices.slice(0, visibleCount)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-blue-800 text-white py-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-purple-600/20 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-2/3 bg-gradient-to-tl from-blue-900/30 to-transparent rounded-full blur-3xl"></div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${20 + i * 20}%`,
                top: `${30 + i * 10}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 border border-white/20 backdrop-blur-lg shadow-xl mb-8"
          >
            <Palette className="h-5 w-5 text-yellow-400 mr-2 animate-pulse" />
            <span className="text-sm font-semibold text-white">
              Dịch vụ thiết kế chuyên nghiệp
            </span>
            <Sparkles className="h-5 w-5 text-yellow-400 ml-2" />
          </motion.div>

          <motion.h1 
            className="text-4xl lg:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Dịch vụ thiết kế
            <motion.div 
              className="w-32 h-1.5 bg-gradient-to-r from-yellow-400 to-purple-400 mx-auto mt-4 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 128 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            />
          </motion.h1>
          
          <motion.p 
            className="text-xl text-purple-100 max-w-3xl mx-auto leading-relaxed mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Từ logo, branding đến thiết kế marketing materials - 
            <span className="text-yellow-300 font-semibold"> sáng tạo không giới hạn</span> với 
            <span className="text-yellow-300 font-semibold"> chất lượng hàng đầu</span>
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold px-8 py-4 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-200"
              onClick={() => document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Calculator className="mr-2 h-5 w-5" />
              Xem bảng giá
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-purple-700 px-8 py-4 rounded-xl backdrop-blur-sm border-2 font-semibold transform hover:scale-105 transition-all duration-200"
              asChild
            >
              <Link href="/order">
                <Send className="mr-2 h-5 w-5" />
                Đặt thiết kế ngay
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services-section" className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Dịch vụ thiết kế của chúng tôi
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Đội ngũ designer chuyên nghiệp với kinh nghiệm nhiều năm sẽ biến ý tưởng của bạn thành hiện thực
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
                <p className="text-gray-600">Đang tải dịch vụ thiết kế...</p>
              </div>
            </div>
          ) : displayedServices.length === 0 ? (
            <div className="text-center py-20">
              <Palette className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có dịch vụ thiết kế</h3>
              <p className="text-gray-500">Các dịch vụ thiết kế sẽ được cập nhật sớm</p>
            </div>
          ) : (
            <>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {displayedServices.map((service) => (
                  <motion.div key={service.id} variants={itemVariants}>
                    <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white overflow-hidden h-full">
                      <div className="relative overflow-hidden">
                        {service.image?.url || service.image_url ? (
                          <Image
                            src={service.image?.url?.startsWith('http') ? service.image.url : `http://14.187.180.6:12122${service.image?.url}` || service.image_url}
                            alt={service.image?.alt_text || service.name}
                            width={400}
                            height={240}
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.jpg'
                            }}
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                            <Palette className="h-16 w-16 text-purple-400" />
                          </div>
                        )}
                        
                        {service.featured && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold shadow-lg">
                              <Star className="mr-1 h-3 w-3 fill-current" />
                              Nổi bật
                            </Badge>
                          </div>
                        )}
                        
                        <div className="absolute top-3 right-3">
                          <Badge variant="secondary" className="bg-white/90 text-purple-700 font-semibold shadow-lg">
                            {service.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <CardContent className="p-6 flex flex-col h-full">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-purple-600 transition-colors line-clamp-2">
                            {service.name}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                            {service.description}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <div className="text-2xl font-bold text-purple-600">
                            {service.price > 0 ? `${service.price.toLocaleString("vi-VN")}đ` : "Liên hệ"}
                          </div>
                          <Button 
                            size="sm"
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg transform hover:scale-105 transition-all duration-200"
                            onClick={() => handleOrderService(service)}
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Đặt ngay
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* Load More Button */}
              {visibleCount < designServices.length && (
                <div className="text-center mt-12">
                  <Button
                    onClick={loadMoreServices}
                    disabled={loadingMore}
                    size="lg"
                    variant="outline"
                    className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-3 font-semibold"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Đang tải...
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-5 w-5" />
                        Xem thêm dịch vụ ({designServices.length - visibleCount} còn lại)
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Bạn có ý tưởng thiết kế?
            </h2>
            <p className="text-purple-100 text-lg mb-8 max-w-2xl mx-auto">
              Liên hệ ngay với chúng tôi để được tư vấn và báo giá miễn phí cho dự án thiết kế của bạn
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-purple-700 hover:bg-gray-100 px-8 py-4 font-semibold rounded-xl shadow-xl"
                asChild
              >
                <Link href="/order">
                  <Send className="mr-2 h-5 w-5" />
                  Đặt thiết kế ngay
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-purple-700 px-8 py-4 font-semibold rounded-xl"
                asChild
              >
                <Link href="/contact">
                  <Phone className="mr-2 h-5 w-5" />
                  Liên hệ tư vấn
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
