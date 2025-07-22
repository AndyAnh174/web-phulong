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
        const response = await fetch('http://14.187.198.210:12122/api/banners?is_active=true')
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
            const fallbackResponse = await fetch('http://14.187.198.210:12122/api/banners')
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

  // Debug: Check banner state
  console.log('🔍 Banner state:', { loading, count: banners.length, currentIndex: currentBannerIndex })

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Banner Background Images */}
      <div className="absolute inset-0">
        {loading ? (
          // Loading background
          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-600 animate-pulse"></div>
        ) : banners.length > 0 ? (
          // Banner Image Backgrounds
          banners.map((banner, index) => {
            const isActive = index === currentBannerIndex
            const imageUrl = banner.image?.url?.startsWith('http') 
              ? banner.image.url 
              : `http://14.187.198.210:12122${banner.image?.url}`
            
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
                transition={{ duration: 1.2, ease: "easeInOut" }}
              >
                <Image
                  src={imageUrl}
                  alt={banner.image.alt_text || banner.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="100vw"
                  onError={(e) => {
                    console.log('🚨 Banner image failed to load:', imageUrl)
                    e.currentTarget.src = "/phulong/Banner1-1136x900px.png"
                  }}
                />
              </motion.div>
            )
          })
        ) : (
          // Fallback background image
          <div className="absolute inset-0">
            <Image
              src="/phulong/Banner1-1136x900px.png"
              alt="Phú Long - Dịch vụ in ấn chuyên nghiệp"
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          </div>
        )}
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50 z-20"></div>
      </div>

      {/* Navigation buttons for banners */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevBanner}
            className="absolute left-8 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all duration-300"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={nextBanner}
            className="absolute right-8 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all duration-300"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
          
          {/* Dots indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-3">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBannerIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentBannerIndex 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Text Overlay Content - Center positioned */}
      <div className="relative z-30 text-center text-white px-6 max-w-4xl mx-auto">
        <motion.div 
          className="space-y-6 lg:space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Subtitle */}
          <motion.div 
            className="text-sm lg:text-base font-medium tracking-wider uppercase opacity-90"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Dịch vụ in ấn hàng đầu Việt Nam
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <span className="block mb-2">PHÚ LONG</span>
            <span className="block text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-semibold">
              DỊCH VỤ IN ẤN CHUYÊN NGHIỆP
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p 
            className="text-lg lg:text-xl leading-relaxed opacity-90 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Chuyên cung cấp dịch vụ in ấn chất lượng cao với công nghệ hiện đại. 
            In offset, in kỹ thuật số, thiết kế đồ họa chuyên nghiệp tại TP.HCM.
          </motion.p>

          {/* Action Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Button
              asChild
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-base lg:text-lg rounded-xl shadow-xl hover:shadow-red-500/25 hover:scale-105 transition-all duration-300 group"
            >
              <Link href="/order" className="flex items-center justify-center">
                <Phone className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                Đặt in ngay
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-white text-white bg-white/10 hover:bg-white hover:text-gray-900 backdrop-blur-sm px-8 py-6 text-base lg:text-lg rounded-xl shadow-xl hover:scale-105 transition-all duration-300 group"
            >
              <Link href="/pricing" className="flex items-center justify-center">
                <FileText className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                Xem bảng giá
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Button>
          </motion.div>

          {/* Features badges */}
          <motion.div 
            className="flex flex-wrap justify-center gap-4 pt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            {[
              { icon: CheckCircle, title: "Chất lượng cao" },
              { icon: Clock, title: "Giao hàng nhanh" },
              { icon: Shield, title: "Bảo hành uy tín" },
              { icon: Award, title: "Tư vấn 24/7" }
            ].map((feature, index) => (
              <Badge 
                key={index}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 px-4 py-2 backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                <feature.icon className="h-4 w-4 mr-2" />
                {feature.title}
              </Badge>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
