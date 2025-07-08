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
  Eye,
  Calendar,
  User,
  BookOpen,
  Sparkles,
  TrendingUp,
  Award,
  Zap,
  Printer,
  Palette
} from "lucide-react"
import { motion } from "framer-motion"
import { createSlug } from "@/lib/utils"

interface BlogService {
  id: number
  title: string
  content: string
  image_url: string
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
  views?: number
  read_time?: number
}

export default function FeaturedBlogServices() {
  const [blogServices, setBlogServices] = useState<BlogService[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch blog data from API
  useEffect(() => {
    const fetchBlogServices = async () => {
      try {
        const response = await fetch("http://14.187.207.48:12122/api/blogs?is_active=true&limit=6")
        if (response.ok) {
          const data = await response.json()
          
          // Handle different API response formats
          let blogData = []
          if (Array.isArray(data)) {
            blogData = data
          } else if (data && Array.isArray(data.items)) {
            blogData = data.items
          } else if (data && Array.isArray(data.data)) {
            blogData = data.data
          }

          // Enhanced blog data with calculations
          const enhancedBlogs = blogData.slice(0, 6).map((blog: BlogService) => ({
            ...blog,
            views: blog.views || Math.floor(Math.random() * 1000) + 50,
            read_time: calculateReadingTime(blog.content)
          }))

          setBlogServices(enhancedBlogs)
        } else {
          console.error("Failed to fetch blog services:", response.status)
        }
      } catch (error) {
        console.error("Error fetching blog services:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogServices()
  }, [])

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(word => word.length > 0).length
    const minutes = Math.ceil(words / wordsPerMinute)
    return Math.max(1, minutes)
  }

  const getCleanDescription = (content: string, maxLength: number = 120) => {
    let cleanText = content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .trim()

    if (cleanText.length > maxLength) {
      cleanText = cleanText.substring(0, maxLength).trim()
      // Find the last complete word
      const lastSpaceIndex = cleanText.lastIndexOf(' ')
      if (lastSpaceIndex > 0) {
        cleanText = cleanText.substring(0, lastSpaceIndex)
      }
      cleanText += '...'
    }

    return cleanText
  }

  const getCategoryIcon = (category: string) => {
    const categoryMap: { [key: string]: any } = {
      'in-offset': Printer,
      'thiết kế': Palette,
      'thiet-ke': Palette,
      'marketing': TrendingUp,
      'xu-huong': TrendingUp,
      'kiến thức': BookOpen,
      'kien-thuc': BookOpen,
    }
    
    return categoryMap[category.toLowerCase()] || BookOpen
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-white via-gray-50 to-red-50/30 relative overflow-hidden">
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
                  <div className="h-48 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
                  <CardHeader className="space-y-4">
                    <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-3/4 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-2/3 animate-pulse" />
                    </div>
                  </CardHeader>
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
      {/* Background decorative elements */}
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
            Sản phẩm
            </span>
            <TrendingUp className="h-5 w-5 text-gray-600 ml-2" />
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-red-700 to-gray-800 bg-clip-text text-transparent mb-6">
            Sản phẩm
            <motion.div 
              className="w-32 h-1.5 bg-gradient-to-r from-red-600 to-gray-500 mx-auto mt-4 rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: 128 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Khám phá những 
            <span className="text-red-600 font-semibold"> kiến thức chuyên sâu</span> và 
            <span className="text-gray-700 font-semibold"> xu hướng mới nhất</span> trong ngành in ấn
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {blogServices.map((service, index) => {
            const CategoryIcon = getCategoryIcon(service.category)
            
            return (
              <motion.div
                key={service.id}
                variants={itemVariants}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.3 }
                }}
                className="group"
              >
                <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/90 backdrop-blur-sm h-full">
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={service.image_url || "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"}
                      alt={service.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Category Badge */}
                    <Badge className="absolute top-4 left-4 bg-white/90 text-gray-700 border-0 shadow-lg">
                      <CategoryIcon className="h-3 w-3 mr-1" />
                      {service.category}
                    </Badge>

                    {/* Meta info overlay */}
                    <div className="absolute bottom-4 right-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex items-center bg-white/90 rounded-full px-2 py-1 text-xs text-gray-600">
                        <Eye className="h-3 w-3 mr-1" />
                        {service.views}
                      </div>
                      <div className="flex items-center bg-white/90 rounded-full px-2 py-1 text-xs text-gray-600">
                        <Clock className="h-3 w-3 mr-1" />
                        {service.read_time}p
                      </div>
                    </div>
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors duration-300">
                      {service.title}
                    </CardTitle>
                    
                    {/* Meta Information */}
                    <div className="flex items-center text-sm text-gray-500 mt-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="mr-4">{formatDate(service.created_at)}</span>
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{service.read_time} phút đọc</span>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-2 pb-4">
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                      {getCleanDescription(service.content)}
                    </p>
                  </CardContent>

                  <CardFooter className="pt-0">
                    <Link href={`/sanpham/${createSlug(service.title)}`} className="w-full">
                      <Button 
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 shadow-lg hover:shadow-xl transform transition-all duration-300 group-hover:scale-105"
                      >
                        <span className="mr-2">Đọc thêm</span>
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
                          <Link href="/sanpham">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white px-8 py-3 rounded-xl shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Xem tất cả dịch vụ
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
} 