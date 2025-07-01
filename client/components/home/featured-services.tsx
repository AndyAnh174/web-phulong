"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, 
  Star, 
  Clock, 
  Shield, 
  Eye,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Award,
  Check,
  Zap,
  Heart
} from "lucide-react"
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
  image?: {
    id: number
    filename: string
    url: string
    alt_text: string | null
    width: number
    height: number
  }
}

export default function FeaturedServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("http://14.187.180.6:12122/api/services?featured=true&limit=6")
        const data = await response.json()
        setServices(data)
      } catch (error) {
        console.error("Error fetching services:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-white via-gray-50 to-red-50/30 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
        <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-red-50/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-gray-100/30 to-transparent rounded-full blur-3xl"></div>

        <div className="container mx-auto px-6 lg:px-8 max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <motion.div 
              className="h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-2xl w-80 mx-auto mb-6 animate-pulse"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div 
              className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-xl w-96 mx-auto animate-pulse"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <div className="h-64 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
                  <CardHeader className="space-y-4">
                    <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-3/4 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-2/3 animate-pulse" />
                    </div>
                  </CardHeader>
                  <CardFooter className="space-y-4">
                    <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-32 animate-pulse" />
                    <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-full animate-pulse" />
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    )
  }

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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  }

  return (
    <section className="py-20 bg-gradient-to-br from-white via-gray-50 to-red-50/30 relative overflow-hidden">
      {/* Enhanced background decorative elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
      <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-red-50/50 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-gray-100/30 to-transparent rounded-full blur-3xl"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-red-300/30 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
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

      <div className="container mx-auto px-6 lg:px-8 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          {/* Logo and Header Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-red-100 to-gray-100 border border-red-200/50 mb-6"
          >
            <div className="relative w-6 h-6 mr-2">
              <Image
                src="https://i.imgur.com/WXSBk46.png"
                alt="Phú Long"
                fill
                className="object-contain"
              />
            </div>
            <Sparkles className="h-5 w-5 text-red-600 mr-2 animate-pulse" />
            <span className="text-sm font-semibold bg-gradient-to-r from-red-700 to-gray-700 bg-clip-text text-transparent">
              Dịch vụ được lựa chọn nhiều nhất
            </span>
            <TrendingUp className="h-5 w-5 text-gray-600 ml-2" />
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-red-700 to-gray-800 bg-clip-text text-transparent mb-6">
            Dịch vụ nổi bật
            <motion.div 
              className="w-24 h-1.5 bg-gradient-to-r from-red-600 to-gray-500 mx-auto mt-4 rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: 96 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Khám phá các dịch vụ in ấn chất lượng cao được 
            <span className="text-red-600 font-semibold"> hàng ngàn khách hàng</span> tin tưởng và lựa chọn
          </p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              onHoverStart={() => setHoveredCard(service.id)}
              onHoverEnd={() => setHoveredCard(null)}
              className="group"
            >
              <Card className="flex flex-col h-full overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/90 backdrop-blur-sm">
                {/* Service Image */}
                <div className="relative h-56 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {service.image?.url ? (
                    <Image
                      src={service.image.url.startsWith('http') ? service.image.url : `http://14.187.180.6:12122${service.image.url}`}
                      alt={service.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <Image
                      src="https://i.imgur.com/WXSBk46.png"
                      alt="Phú Long"
                      width={80}
                      height={80}
                      className="object-contain opacity-60"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Logo overlay on hover */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: hoveredCard === service.id ? 1 : 0,
                      scale: hoveredCard === service.id ? 1 : 0.8
                    }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg"
                  >
                    <div className="relative w-8 h-8">
                      <Image
                        src="https://i.imgur.com/WXSBk46.png"
                        alt="Phú Long"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </motion.div>

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <Badge className="bg-red-600/90 backdrop-blur-sm text-white border-0 hover:bg-red-700/90 transition-colors duration-300 text-xs px-2 py-1">
                      {service.category}
                    </Badge>
                  </div>
                  
                  {/* Featured Badge */}
                  {service.featured && (
                    <div className="absolute top-12 left-4 z-10">
                      <Badge className="bg-yellow-500/90 backdrop-blur-sm text-white border-0 text-xs px-2 py-1">
                        <Star className="h-3 w-3 mr-1" />
                        Nổi bật
                      </Badge>
                    </div>
                  )}
                </div>

                <CardHeader className="flex-1 space-y-2">
                  <CardTitle className="text-lg font-bold min-h-[2.5rem]">{service.name}</CardTitle>
                  <p className="text-gray-600 text-sm min-h-[3.5rem] line-clamp-3">{service.description}</p>
                </CardHeader>

                <CardFooter className="mt-auto pt-2">
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                      {service.price.toLocaleString('vi-VN')}đ
                    </div>
                 
                  </div>
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl shadow-lg mt-1"
                  >
                    <Link href={`/services/${service.id}`} className="flex items-center justify-center">
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Đặt hàng ngay
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Brand Trust Footer */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-red-50 to-gray-50 rounded-2xl p-8 border border-red-200/50 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="relative w-16 h-16 bg-white rounded-xl shadow-lg p-3 border border-red-200/50">
                <Image
                  src="https://i.imgur.com/WXSBk46.png"
                  alt="Phú Long"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-red-700 to-gray-700 bg-clip-text text-transparent">
                  CÔNG TY TNHH THIẾT KẾ VÀ IN ẤN PHÚ LONG
                </h3>
                <p className="text-gray-600">In cả trái tim lên từng sản phẩm</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2 justify-center">
                <Check className="h-4 w-4 text-red-500" />
                <span>Chất lượng ISO</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Shield className="h-4 w-4 text-red-500" />
                <span>Bảo hành uy tín</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Clock className="h-4 w-4 text-red-500" />
                <span>Giao hàng nhanh</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Award className="h-4 w-4 text-red-500" />
                <span>Dịch vụ 5 sao</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}