"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  User, 
  Eye, 
  ArrowRight,
  Clock,
  MessageCircle,
  BookOpen,
  TrendingUp,
  Sparkles
} from "lucide-react"
import { motion } from "framer-motion"

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  image: string
  author: string
  published_at: string
  views: number
  comments_count: number
  category: string
  reading_time: number
  featured: boolean
}

const mockBlogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Xu hướng thiết kế in ấn 2024: Những điều bạn cần biết",
    slug: "xu-huong-thiet-ke-in-an-2024",
    excerpt: "Khám phá những xu hướng thiết kế in ấn mới nhất năm 2024, từ màu sắc đến typography và layout hiện đại.",
    content: "",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    author: "Nguyễn Văn A",
    published_at: "2024-01-15T10:00:00Z",
    views: 1250,
    comments_count: 24,
    category: "Thiết kế",
    reading_time: 5,
    featured: true
  },
  {
    id: 2,
    title: "5 lỗi thường gặp khi thiết kế name card và cách khắc phục",
    slug: "5-loi-thuong-gap-khi-thiet-ke-name-card",
    excerpt: "Tìm hiểu những lỗi phổ biến trong thiết kế name card và cách tránh chúng để có sản phẩm hoàn hảo.",
    content: "",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    author: "Trần Thị B",
    published_at: "2024-01-10T14:30:00Z",
    views: 890,
    comments_count: 18,
    category: "Hướng dẫn",
    reading_time: 3,
    featured: false
  },
  {
    id: 3,
    title: "Cách chọn giấy in phù hợp cho từng loại sản phẩm",
    slug: "cach-chon-giay-in-phu-hop",
    excerpt: "Hướng dẫn chi tiết về các loại giấy in và cách lựa chọn phù hợp với từng loại sản phẩm in ấn.",
    content: "",
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    author: "Lê Văn C",
    published_at: "2024-01-05T09:15:00Z",
    views: 567,
    comments_count: 12,
    category: "Kỹ thuật",
    reading_time: 4,
    featured: true
  }
]

export default function LatestBlog() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const fetchBlogPosts = async () => {
      try {
        // Simulate loading time
        setTimeout(() => {
          setBlogPosts(mockBlogPosts)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching blog posts:", error)
        setLoading(false)
      }
    }

    fetchBlogPosts()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-red-50/20 relative overflow-hidden">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-16">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto mb-4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse" />
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-red-50/20 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
      <div className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r from-red-50/30 to-transparent"></div>
      <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-gradient-to-tl from-gray-100/30 to-transparent rounded-full blur-3xl"></div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-red-200/50 rounded-full"
            style={{
              left: `${20 + i * 25}%`,
              top: `${25 + i * 20}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.5, 0.9, 0.5],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.7,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Header with Logo */}
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
            className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-gray-100 to-red-100 border border-gray-200/50 mb-6"
          >
            <div className="relative w-5 h-5 mr-2">
              <Image
                src="https://i.imgur.com/WXSBk46.png"
                alt="Phú Long"
                fill
                className="object-contain"
              />
            </div>
            <BookOpen className="h-5 w-5 text-gray-600 mr-2" />
            <span className="text-sm font-semibold bg-gradient-to-r from-gray-700 to-red-700 bg-clip-text text-transparent">
              Kiến thức & Chia sẻ
            </span>
            <Sparkles className="h-5 w-5 text-red-600 ml-2" />
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-red-700 to-gray-800 bg-clip-text text-transparent mb-6">
            Blog mới nhất
            <motion.div 
              className="w-24 h-1.5 bg-gradient-to-r from-red-600 to-gray-500 mx-auto mt-4 rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: 96 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Cập nhật những 
            <span className="text-red-600 font-semibold"> kiến thức mới nhất</span> và 
            <span className="text-gray-700 font-semibold"> xu hướng thiết kế</span> trong ngành in ấn
          </p>
        </motion.div>

        {/* Blog Posts Grid */}
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {blogPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group"
            >
              <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/90 backdrop-blur-sm">
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Logo overlay on hover */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1 }}
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
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-red-600/90 backdrop-blur-sm text-white border-0 hover:bg-red-700/90 transition-colors duration-300">
                      {post.category}
                    </Badge>
                  </div>

                  {/* Featured Badge */}
                  {post.featured && (
                    <div className="absolute top-4 left-20">
                      <Badge className="bg-yellow-500/90 backdrop-blur-sm text-white border-0">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Nổi bật
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <CardHeader className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(post.published_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{post.reading_time} phút đọc</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-red-600 transition-colors duration-300 line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{post.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments_count}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 pt-0">
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg shadow-md hover:scale-105 transition-all duration-300 group"
                  >
                    <Link href={`/blog/${post.slug}`} className="flex items-center justify-center">
                      <BookOpen className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                      Đọc bài viết
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Brand Trust Footer */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center"
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
                  Chia sẻ kiến thức
                </h3>
                <p className="text-gray-600">Cập nhật xu hướng và kinh nghiệm trong ngành in ấn</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2 justify-center">
                <BookOpen className="h-4 w-4 text-red-500" />
                <span>Kiến thức chuyên sâu</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <TrendingUp className="h-4 w-4 text-red-500" />
                <span>Xu hướng mới nhất</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Sparkles className="h-4 w-4 text-red-500" />
                <span>Kinh nghiệm thực tế</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <MessageCircle className="h-4 w-4 text-red-500" />
                <span>Tương tác cộng đồng</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 