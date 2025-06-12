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
  image_url: string
  category: string
  featured: boolean
  is_active: boolean
}

export default function FeaturedServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/services?featured=true&limit=6")
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
        duration: 0.6,
        ease: "easeOut"
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
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-red-100 to-gray-100 border border-red-200/50 mb-6"
          >
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
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              onHoverStart={() => setHoveredCard(service.id)}
              onHoverEnd={() => setHoveredCard(null)}
              className="group"
            >
              <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/90 backdrop-blur-sm hover:bg-white h-full">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-gray-500/0 group-hover:from-red-500/5 group-hover:to-gray-500/5 transition-all duration-500 z-10" />
                
                <CardHeader className="p-0 relative">
                  <div className="relative overflow-hidden">
                    <div className="relative h-64 bg-gray-100">
                      <Image
                        src={service.image_url || "/placeholder.svg?height=256&width=400"}
                        alt={service.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Floating badges */}
                      <div className="absolute top-4 left-4 z-20">
                        <Badge className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg">
                          <Star className="h-3 w-3 mr-1" />
                          Nổi bật
                        </Badge>
                      </div>
                      
                      <motion.div
                        className="absolute top-4 right-4 z-20"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ 
                          opacity: hoveredCard === service.id ? 1 : 0,
                          scale: hoveredCard === service.id ? 1 : 0
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <Badge className="bg-gray-600 hover:bg-gray-700 text-white shadow-lg">
                          <Check className="h-3 w-3 mr-1" />
                          Chất lượng
                        </Badge>
                      </motion.div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <CardTitle className="text-xl font-bold text-gray-800 mb-3 group-hover:text-red-600 transition-colors duration-300">
                    {service.name}
                  </CardTitle>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-red-600">
                      {service.price?.toLocaleString('vi-VN')}đ
                    </div>
                    <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50">
                      {service.category}
                    </Badge>
                  </div>
                </CardContent>

                <CardFooter className="p-6 pt-0">
                  <div className="flex space-x-3 w-full">
                    <Button
                      asChild
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white group-hover:scale-105 transition-all duration-300"
                    >
                      <Link href="/dat-hang" className="flex items-center justify-center">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Đặt ngay
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </Button>
                    
                    <Button
                      asChild
                      variant="outline"
                      className="border-gray-300 text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-red-600 group-hover:scale-105 transition-all duration-300"
                    >
                      <Link href={`/services/${service.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Services Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-10 py-6 text-lg rounded-xl shadow-xl hover:scale-105 transition-all duration-300 group"
          >
            <Link href="/services" className="flex items-center">
              <Zap className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
              Xem tất cả dịch vụ
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}