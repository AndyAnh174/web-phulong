"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CheckCircle2,
  Star, 
  ShoppingCart, 
  Phone, 
  MessageCircle, 
  Sparkles,
  Award,
  Palette,
  Printer,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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

// Bảng giá in ấn (static data)
const printingPricing = [
  {
    category: "In Offset",
    description: "Chất lượng cao, phù hợp số lượng lớn",
    services: [
      {
        name: "Name Card (300gsm)",
        prices: [
          { quantity: "100 cái", price: "150,000đ" },
          { quantity: "500 cái", price: "400,000đ" },
          { quantity: "1000 cái", price: "650,000đ" }
        ]
      },
      {
        name: "Brochure A4 (250gsm)",
        prices: [
          { quantity: "100 tờ", price: "300,000đ" },
          { quantity: "500 tờ", price: "1,200,000đ" },
          { quantity: "1000 tờ", price: "2,000,000đ" }
        ]
      },
      {
        name: "Catalog A4 (200gsm)",
        prices: [
          { quantity: "50 bộ", price: "800,000đ" },
          { quantity: "200 bộ", price: "2,500,000đ" },
          { quantity: "500 bộ", price: "5,500,000đ" }
        ]
      }
    ]
  },
  {
    category: "In Kỹ Thuật Số",
    description: "Nhanh chóng, linh hoạt, phù hợp số lượng nhỏ",
    services: [
      {
        name: "Poster A3 (200gsm)",
        prices: [
          { quantity: "1 tờ", price: "25,000đ" },
          { quantity: "10 tờ", price: "200,000đ" },
          { quantity: "50 tờ", price: "800,000đ" }
        ]
      },
      {
        name: "Banner 1.2x0.8m",
        prices: [
          { quantity: "1 cái", price: "180,000đ" },
          { quantity: "5 cái", price: "800,000đ" },
          { quantity: "10 cái", price: "1,500,000đ" }
        ]
      },
      {
        name: "Sticker A4 (Decal)",
        prices: [
          { quantity: "10 tờ", price: "150,000đ" },
          { quantity: "50 tờ", price: "600,000đ" },
          { quantity: "100 tờ", price: "1,000,000đ" }
        ]
      }
    ]
  },
  {
    category: "In Nhanh",
    description: "Thời gian gấp, giao trong ngày",
    services: [
      {
        name: "A4 đen trắng",
        prices: [
          { quantity: "100 tờ", price: "50,000đ" },
          { quantity: "500 tờ", price: "200,000đ" },
          { quantity: "1000 tờ", price: "350,000đ" }
        ]
      },
      {
        name: "A4 màu",
        prices: [
          { quantity: "100 tờ", price: "150,000đ" },
          { quantity: "500 tờ", price: "600,000đ" },
          { quantity: "1000 tờ", price: "1,000,000đ" }
        ]
      },
      {
        name: "A3 màu",
        prices: [
          { quantity: "50 tờ", price: "200,000đ" },
          { quantity: "200 tờ", price: "700,000đ" },
          { quantity: "500 tờ", price: "1,500,000đ" }
        ]
      }
    ]
  }
]

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState("design")
  const [allServices, setAllServices] = useState<Service[]>([]) // All services from API
  const [displayedServices, setDisplayedServices] = useState<Service[]>([]) // Currently displayed services
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [visibleCount, setVisibleCount] = useState(6) // Number of services currently visible
  const { toast } = useToast()
  const [printingImages, setPrintingImages] = useState<any[]>([])
  const [visibleImageCount, setVisibleImageCount] = useState(3)
  const [previewImage, setPreviewImage] = useState<any | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const ITEMS_PER_PAGE = 6

  // Fetch all services from API once
  useEffect(() => {
    fetchAllServices()
  }, [])

  const fetchAllServices = async () => {
    try {
      setLoading(true)
      // Get all active services at once with proper API parameters
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
      
      // Fetch a large number to get all services (or implement proper pagination)
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
      console.log('API Response:', data)
      
      // Handle different response formats
      const services = Array.isArray(data) ? data : []
      setAllServices(services)
      
      // Show ALL services instead of filtering for design only
      // You can uncomment the filter below if you want design-only filtering later
      /*
      const designServices = services.filter(service => 
        ['Thiết kế', 'Design', 'Logo', 'Branding', 'Graphic', 'UI', 'UX'].some(category => 
          service.category?.toLowerCase().includes(category.toLowerCase()) ||
          service.name?.toLowerCase().includes(category.toLowerCase())
        )
      )
      */
      
      // Use all services for now
      const allActiveServices = services
      
      // Always show first 6 services initially
      setDisplayedServices(allActiveServices.slice(0, 6))
      setVisibleCount(6)
      
      console.log(`Total services: ${services.length}, Active services: ${allActiveServices.length}, Initially showing: ${Math.min(6, allActiveServices.length)}`)
      console.log('All services categories:', services.map(s => s.category))

    } catch (error) {
      console.error("Error fetching services:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu dịch vụ. Vui lòng thử lại sau.",
        variant: "destructive",
      })
      
      // Set empty arrays on error to avoid undefined issues
      setAllServices([])
      setDisplayedServices([])
    } finally {
      setLoading(false)
    }
  }

  const loadMoreServices = () => {
    if (loadingMore) return

    setLoadingMore(true)
    
    // Use all services instead of filtering
    const allActiveServices = allServices

    const currentDisplayedCount = displayedServices.length
    const newVisibleCount = currentDisplayedCount + 6 // Always add 6 more
    const newDisplayedServices = allActiveServices.slice(0, newVisibleCount)
    
    setDisplayedServices(newDisplayedServices)
    setVisibleCount(newVisibleCount)

    console.log(`Loading more: ${currentDisplayedCount} -> ${newDisplayedServices.length} (added 6 services)`)

    // Smooth scroll to new content after a delay
    setTimeout(() => {
      const allServiceCards = document.querySelectorAll('[data-service-card]')
      if (allServiceCards.length > currentDisplayedCount) {
        const firstNewCard = allServiceCards[currentDisplayedCount]
        if (firstNewCard) {
          firstNewCard.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          })
        }
      }
      setLoadingMore(false)
    }, 300)
  }

  // Use all services instead of filtering for design only
  const allAvailableServices = allServices

  // Check if there are more services to load
  const hasMoreServices = displayedServices.length < allAvailableServices.length

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
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: index * 0.1
      }
    })
  }

  // Fetch printing images
  useEffect(() => {
    fetchPrintingImages()
  }, [])

  const fetchPrintingImages = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
      const IMAGE_BASE_URL = API_BASE_URL.replace(/\/api$/, '')
      const response = await fetch(`${API_BASE_URL}/images?is_visible=true&category=printing&limit=100`)
      if (!response.ok) throw new Error('Failed to fetch images')
      const data = await response.json()
      setPrintingImages(Array.isArray(data) ? data.map((img:any)=>({
        ...img,
        full_url: img.file_path ? `${IMAGE_BASE_URL}/${img.file_path}` : img.filename ? `${IMAGE_BASE_URL}/uploads/${img.filename}` : img.url
      })) : [])
    } catch (error) {
      console.error('Error fetching images:', error)
      toast({ title: 'Lỗi', description: 'Không thể tải ảnh in ấn', variant: 'destructive' })
    }
  }

  const handleLoadMoreImages = () => {
    setVisibleImageCount((prev) => prev + 3)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-red-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-red-50/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
      <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-red-50/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-gray-100/30 to-transparent rounded-full blur-3xl"></div>

      {/* Header Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-red-100 to-gray-100 border border-red-200/50 mb-6"
            >
              <Calculator className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-sm font-semibold bg-gradient-to-r from-red-700 to-gray-700 bg-clip-text text-transparent">
                Bảng giá minh bạch
              </span>
              <Sparkles className="h-5 w-5 text-gray-600 ml-2" />
            </motion.div>

            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-red-700 to-gray-800 bg-clip-text text-transparent mb-6">
              Bảng giá dịch vụ
              <motion.div 
                className="w-32 h-1.5 bg-gradient-to-r from-red-600 to-gray-500 mx-auto mt-4 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: 128 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Giá cả 
              <span className="text-red-600 font-semibold"> minh bạch</span>, chất lượng 
              <span className="text-gray-700 font-semibold"> đảm bảo</span> cho mọi nhu cầu thiết kế và in ấn
            </p>
          </motion.div>

          {/* Main Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-16"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white shadow-lg border border-gray-200 p-2 rounded-2xl">
                <TabsTrigger 
                  value="design" 
                  className="text-base font-semibold rounded-xl py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-700 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <Palette className="h-5 w-5 mr-2" />
                  Thiết kế
                </TabsTrigger>
                <TabsTrigger 
                  value="printing" 
                  className="text-base font-semibold rounded-xl py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-600 data-[state=active]:to-gray-700 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <Printer className="h-5 w-5 mr-2" />
                  In ấn
                </TabsTrigger>
              </TabsList>

              {/* Design Pricing Tab */}
              <TabsContent value="design" className="mt-12" data-tab-content="design">
                <motion.div
                  className="text-center mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    Bảng giá thiết kế
               
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Thiết kế chuyên nghiệp với đội ngũ sáng tạo giàu kinh nghiệm
                  </p>
                  
                  {/* Debug info - remove in production */}
             
                </motion.div>

                <motion.div 
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                                      key={displayedServices.length} // Re-trigger animation when new items load
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
                      data-service-card
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
                              <Link href="/dat-hang" className="flex items-center justify-center">
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
                </TabsContent>

              {/* Printing Pricing Tab */}
              <TabsContent value="printing" className="mt-12">
                <motion.div
                  className="text-center mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    Bảng giá in ấn
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Tham khảo các mẫu in ấn chất lượng cao mà chúng tôi đã thực hiện
                  </p>
                </motion.div>

                {/* Images Grid */}
                {printingImages.length > 0 ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                      className="max-w-3xl mx-auto overflow-hidden rounded-2xl shadow-xl border border-gray-200 bg-white"
                    >
                      <img
                        src={printingImages[currentImageIndex].full_url}
                        alt={printingImages[currentImageIndex].alt_text || 'Printing image'}
                        className="w-full h-auto object-contain cursor-pointer"
                        onClick={()=>{setPreviewImage(printingImages[currentImageIndex]);setIsPreviewOpen(true)}}
                      />
                    </motion.div>

                    {printingImages.length > 1 && (
                      <div className="flex justify-center mt-8">
                        <Button onClick={()=> setCurrentImageIndex((currentImageIndex+1)%printingImages.length)} variant="outline" className="border-gray-300 text-gray-700 hover:border-red-400 hover:text-red-600">
                          <ArrowRight className="h-4 w-4 mr-2"/> Xem ảnh khác
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-center text-gray-500">Chưa có hình ảnh.</p>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
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
                  Tư vấn chuyên nghiệp
                </span>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-red-700 to-gray-800 bg-clip-text text-transparent mb-6">
                Cần tư vấn chi tiết về giá cả?
              </h2>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Liên hệ với chúng tôi để được 
                <span className="text-red-600 font-semibold"> tư vấn miễn phí</span> và nhận 
                <span className="text-gray-700 font-semibold"> báo giá tốt nhất</span> cho dự án của bạn
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-10 py-6 text-lg rounded-xl shadow-xl hover:scale-105 transition-all duration-300 group"
                >
                  <Link href="/dat-hang" className="flex items-center">
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

      {/* Bottom images section removed */}

      <Footer />

      {/* Image Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="sr-only">Xem ảnh in ấn</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <img src={previewImage.full_url} alt={previewImage.alt_text || 'Printing image'} className="w-full h-auto object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
