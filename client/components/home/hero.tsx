"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Clock, 
  Shield, 
  Award,
  Users,
  Play,
  Sparkles,
  TrendingUp,
  Zap,
  Phone,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

interface Banner {
  id: number
  title: string
  description?: string
  url?: string
  is_active?: boolean
  image: {
    id: number
    url: string
    alt_text: string
    width: number
    height: number
  }
}

export default function Hero() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  // Test banner data nếu API không có data
  const testBanners: Banner[] = [
    {
      id: 1,
      title: "Banner Test 1",
      description: "Đây là banner test để kiểm tra hiển thị",
      url: "",
      is_active: true,
      image: {
        id: 1,
        url: "/LOGO-MÀU.png",
        alt_text: "Test Banner 1",
        width: 1920,
        height: 600
      }
    }
  ]

  // Fetch banners từ API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        console.log('🔄 Fetching banners from API...')
        // Sử dụng domain gốc
        const response = await fetch('https://demoapi.andyanh.id.vn/api/banners?is_active=true')
        console.log('📡 Response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ Banners fetched successfully:', data)
          console.log('📊 Number of banners:', data.length)
          
          // Debug chi tiết từng banner
          data.forEach((banner: Banner, index: number) => {
            console.log(`🎨 Banner ${index + 1}:`, {
              id: banner.id,
              title: banner.title,
              imageUrl: banner.image?.url,
              isActive: banner.is_active
            })
          })
          
          if (data && data.length > 0) {
            setBanners(data)
            console.log('🎯 Set banners to state:', data.length, 'banners')
          } else {
            console.log('⚠️ No banners from API, using test banner')
            setBanners(testBanners)
          }
        } else {
          console.error('❌ Failed to fetch banners:', response.status, response.statusText)
          // Fallback: thử endpoint không có filter
          try {
            const fallbackResponse = await fetch('https://demoapi.andyanh.id.vn/api/banners')
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json()
              console.log('🔄 Fallback data:', fallbackData)
              // Filter chỉ lấy banner active
              const activeBanners = fallbackData.filter((banner: Banner) => banner.is_active !== false)
              console.log('✅ Active banners:', activeBanners)
              
              if (activeBanners.length > 0) {
                setBanners(activeBanners)
              } else {
                console.log('⚠️ No active banners, using test banner')
                setBanners(testBanners)
              }
            } else {
              console.log('⚠️ Fallback failed, using test banner')
              setBanners(testBanners)
            }
          } catch (fallbackError) {
            console.error('❌ Fallback also failed:', fallbackError)
            console.log('⚠️ Using test banner as final fallback')
            setBanners(testBanners)
          }
        }
      } catch (error) {
        console.error('❌ Error fetching banners:', error)
        console.log('⚠️ Using test banner due to network error')
        setBanners(testBanners)
      } finally {
        setLoading(false)
      }
    }

    fetchBanners()
  }, [])

  // Auto slide banners
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev: number) => (prev + 1) % banners.length)
      }, 5000) // 5 seconds
      return () => clearInterval(interval)
    }
  }, [banners.length])

  const nextBanner = () => {
    setCurrentBannerIndex((prev: number) => (prev + 1) % banners.length)
  }

  const prevBanner = () => {
    setCurrentBannerIndex((prev: number) => (prev - 1 + banners.length) % banners.length)
  }

  // Debug log trước khi render
  console.log('🔍 Hero render:', { 
    loading, 
    bannersCount: banners.length, 
    currentIndex: currentBannerIndex,
    banners: banners.map((b: Banner) => ({ id: b.id, title: b.title, imageUrl: b.image?.url }))
  })

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Enhanced Background with White Gray Red theme */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('https://i.imgur.com/WXSBk46.png')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-gray-50/90 to-red-50/80"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
      </div>

      {/* Simplified Animated Elements with red theme */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 right-20 w-3 h-3 bg-red-500 rounded-full opacity-60"
          animate={{
            y: [0, -15, 0],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 left-20 w-2 h-2 bg-gray-400 rounded-full opacity-50"
          animate={{
            y: [0, 10, 0],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      {/* Decorative Gradient Orbs with white gray red theme */}
      <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-red-100/30 to-transparent opacity-80"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-gray-200/20 to-transparent rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[80vh]">
          {/* Left Content */}
          <motion.div 
            className="text-gray-800 space-y-6 lg:space-y-8 py-8 lg:py-0 order-2 lg:order-1"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Premium Badge with red accent */}
            <motion.div 
              className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-red-50 to-red-100 border border-red-200/50 backdrop-blur-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <Sparkles className="h-4 w-4 text-red-600 mr-2" />
              <span className="text-sm font-semibold text-red-700">
                Dịch vụ in ấn hàng đầu Việt Nam
              </span>
              <Star className="h-4 w-4 text-red-500 ml-2" />
            </motion.div>

            {/* Main Heading - White Gray Red theme */}
            <motion.h1 
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <span className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 bg-clip-text text-transparent">
                Phú Long
              </span>
              <br />
              <span className="text-gray-800 text-2xl sm:text-3xl lg:text-4xl xl:text-5xl">
               Dịch vụ in ấn
              </span>
              <br />
              <span className="bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent text-2xl sm:text-3xl lg:text-4xl xl:text-5xl">
                chuyên nghiệp
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p 
              className="text-lg lg:text-xl text-gray-600 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Thành lập từ <span className="text-red-600 font-semibold">2016</span>, <span className="text-red-700 font-semibold">Phú Long</span> đã phục vụ hơn <span className="text-red-600 font-semibold">1000 khách hàng</span> trên toàn quốc với phương châm <span className="text-red-700 font-semibold">trách nhiệm</span>, <span className="text-red-700 font-semibold">uy tín</span> và <span className="text-red-700 font-semibold">tận tâm</span>. Sở hữu <span className="text-red-600 font-semibold">3 phân xưởng hiện đại</span>, chúng tôi đáp ứng <span className="text-red-700 font-semibold">đa dạng</span> và <span className="text-red-700 font-semibold">nhanh chóng</span> mọi nhu cầu in ấn trên giấy, từ thiết kế đến thành phẩm.
            </motion.p>

            {/* Action Buttons - Updated with new colors */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-6 text-base lg:text-lg rounded-xl shadow-xl hover:shadow-red-500/25 hover:scale-105 transition-all duration-300 group"
              >
                <Link href="/pricing" className="flex items-center justify-center">
                  <Phone className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                  Đặt in ngay
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:text-red-600 hover:border-red-300 px-8 py-6 text-base lg:text-lg rounded-xl shadow-xl hover:scale-105 transition-all duration-300 group"
              >
                <Link href="/pricing" className="flex items-center justify-center">
                  <FileText className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  Xem bảng giá
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
            </motion.div>

            {/* Updated Features Grid with white gray red theme */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              {[
                { icon: CheckCircle, title: "Chất lượng cao", desc: "Độ sắc nét tuyệt đối", color: "from-red-500 to-red-600" },
                { icon: Clock, title: "Giao hàng nhanh", desc: "Đúng hẹn 24h", color: "from-gray-500 to-gray-600" },
                { icon: Shield, title: "Bảo hành uy tín", desc: "Chính sách rõ ràng", color: "from-red-400 to-red-500" },
                { icon: Award, title: "Tư vấn chuyên nghiệp", desc: "Hỗ trợ 24/7", color: "from-gray-600 to-gray-700" }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3 group cursor-pointer p-3 rounded-lg hover:bg-red-50 transition-colors duration-300"
                  whileHover={{ scale: 1.02, x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${feature.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 group-hover:text-red-600 transition-colors duration-300 text-sm lg:text-base">
                      {feature.title}
                    </h3>
                    <p className="text-xs lg:text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Dynamic Banner Slider */}
          <motion.div 
            className="relative w-full max-w-lg mx-auto order-1 lg:order-2"
            initial={{ opacity: 0, x: 30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <div className="relative w-full h-[320px] md:h-[400px] lg:h-[480px] rounded-2xl overflow-hidden shadow-2xl group">
              {loading ? (
                // Loading skeleton
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
                  <div className="text-gray-500">Đang tải...</div>
                </div>
              ) : banners.length > 0 ? (
                // Banner Slider
                <div className="relative w-full h-full">
                  {banners.map((banner, index) => {
                    const isActive = index === currentBannerIndex
                    const imageUrl = banner.image?.url?.startsWith('http') 
                      ? banner.image.url 
                      : `https://demoapi.andyanh.id.vn${banner.image?.url}`
                    
                    // Debug log cho banner hiện tại
                    if (isActive) {
                      console.log(`🎯 Active banner ${index + 1}:`, {
                        title: banner.title,
                        imageUrl: imageUrl,
                        isActive: isActive
                      })
                    }
                    
                    return (
                      <motion.div
                        key={banner.id}
                        className={`absolute inset-0 transition-all duration-1000 ${
                          isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                        initial={false}
                        animate={{
                          opacity: isActive ? 1 : 0,
                          scale: isActive ? 1 : 1.1,
                        }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                      >
                        {/* Banner Image */}
                        <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-700">
                          {/* Image overlay for better text readability */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10"></div>
                          
                          {banner.url ? (
                            <a 
                              href={banner.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block w-full h-full"
                            >
                              <Image
                                src={imageUrl}
                                alt={banner.image.alt_text || banner.title}
                                fill
                                className="object-cover transition-all duration-700 group-hover:scale-110"
                                priority={index === 0}
                                sizes="(max-width: 1024px) 0vw, 50vw"
                                onError={(e) => {
                                  console.log('🚨 Banner image failed to load:', imageUrl)
                                  e.currentTarget.src = "/LOGO-MÀU.png"
                                }}
                              />
                            </a>
                          ) : (
                            <Image
                              src={imageUrl}
                              alt={banner.image.alt_text || banner.title}
                              fill
                              className="object-cover transition-all duration-700 group-hover:scale-110"
                              priority={index === 0}
                              sizes="(max-width: 1024px) 0vw, 50vw"
                              onError={(e) => {
                                console.log('🚨 Banner image failed to load (no URL):', imageUrl)
                                e.currentTarget.src = "/LOGO-MÀU.png"
                              }}
                            />
                          )}
                          
                          {/* Banner content overlay */}
                          {(banner.title || banner.description) && (
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-20">
                              {banner.title && (
                                <h3 className="text-xl font-bold mb-2 drop-shadow-lg">
                                  {banner.title}
                                </h3>
                              )}
                              {banner.description && (
                                <p className="text-sm opacity-90 drop-shadow-md">
                                  {banner.description}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                  
                  {/* Navigation buttons */}
                  {banners.length > 1 && (
                    <>
                      <button
                        onClick={prevBanner}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-300 group-hover:opacity-100 opacity-60"
                      >
                        <ChevronLeft className="h-6 w-6 text-white" />
                      </button>
                      <button
                        onClick={nextBanner}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-300 group-hover:opacity-100 opacity-60"
                      >
                        <ChevronRight className="h-6 w-6 text-white" />
                      </button>
                    </>
                  )}
                  
                  {/* Dots indicator */}
                  {banners.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
                      {banners.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentBannerIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === currentBannerIndex 
                              ? 'bg-white scale-125' 
                              : 'bg-white/50 hover:bg-white/70'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Fallback to logo when no banners
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 via-transparent to-gray-100/10 z-10"></div>
                  <Image
                    src="/LOGO-MÀU.png"
                    alt="Phú Long Logo - Premium Printing Services"
                    fill
                    className="object-contain transition-all duration-700 group-hover:scale-110 animate-pulse"
                    priority
                    sizes="(max-width: 1024px) 0vw, 50vw"
                  />
                  
                  {/* Floating quality badges */}
                  <motion.div
                    className="absolute top-4 right-4 z-20"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.5 }}
                  >
                    <Badge className="bg-red-500/90 hover:bg-red-600 text-white px-3 py-1 backdrop-blur-lg text-sm shadow-lg">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Chất lượng cao
                    </Badge>
                  </motion.div>
                  
                  <motion.div
                    className="absolute bottom-4 left-4 z-20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.7 }}
                  >
                    <Badge className="bg-gray-600/90 hover:bg-gray-700 text-white px-3 py-1 backdrop-blur-lg text-sm shadow-lg">
                      <Clock className="h-3 w-3 mr-1" />
                      Giao nhanh 24h
                    </Badge>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-red-200/30 to-red-300/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-gray-200/30 to-gray-300/20 rounded-full blur-xl"></div>
          </motion.div>
        </div>
      </div>

      {/* Wave Divider with white theme */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-16 lg:h-20 text-gray-50" viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path
            fill="currentColor"
            d="M0,40 C150,80 350,0 500,40 C650,80 850,0 1000,40 C1150,80 1350,0 1440,40 L1440,80 L0,80 Z"
          />
        </svg>
      </div>
    </section>
  )
}
