"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import Head from "next/head"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { 
  Search, 
  Calendar, 
  User, 
  ArrowRight, 
  Clock, 
  BookOpen, 
  Filter,
  Eye,
  TrendingUp,
  Sparkles,
  Printer,
  Palette,
  Megaphone,
  Lightbulb,
  AlertCircle,
  RefreshCw,
  Loader2,
  ChevronDown,
  Heart,
  Bookmark,
  Share2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"

interface Blog {
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
  is_bookmarked?: boolean
}

// Predefined categories với icons cho in ấn và thiết kế
const PREDEFINED_CATEGORIES = [
  { value: "in-offset", label: "In Offset", icon: Printer, color: "bg-blue-100 text-blue-800" },
  { value: "thiet-ke", label: "Thiết kế", icon: Palette, color: "bg-purple-100 text-purple-800" },
  { value: "meo-marketing", label: "Mẹo Marketing", icon: Megaphone, color: "bg-green-100 text-green-800" },
  { value: "xu-huong", label: "Xu hướng", icon: TrendingUp, color: "bg-orange-100 text-orange-800" },
  { value: "kien-thuc", label: "Kiến thức", icon: Lightbulb, color: "bg-yellow-100 text-yellow-800" },
]

const ITEMS_PER_PAGE = 9

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMoreData, setHasMoreData] = useState(true)
  const [bookmarkedBlogs, setBookmarkedBlogs] = useState<Set<number>>(new Set())
  const { toast } = useToast()
  
  // Refs for intersection observer
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm])

  // Fetch blogs function
  const fetchBlogs = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setError(null)
        setCurrentPage(1)
      } else {
        setLoadingMore(true)
      }

      let url = "http://localhost:8000/api/blogs?is_active=true"
      
      // Add pagination
      const page = reset ? 1 : currentPage
      url += `&page=${page}&limit=${ITEMS_PER_PAGE}`

      if (selectedCategory !== "all") {
        url += `&category=${selectedCategory}`
      }

      if (debouncedSearchTerm) {
        url += `&search=${encodeURIComponent(debouncedSearchTerm)}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()

      // Handle different API response formats
      let blogData = []
      let total = 0
      
      if (Array.isArray(data)) {
        blogData = data
        total = data.length
      } else if (data && Array.isArray(data.items)) {
        blogData = data.items
        total = data.total || data.items.length
      } else if (data && Array.isArray(data.data)) {
        blogData = data.data
        total = data.total || data.data.length
      }

      // Enhanced blog data with better calculations
      const enhancedBlogs = blogData.map((blog: Blog) => ({
        ...blog,
        views: blog.views || Math.floor(Math.random() * 1000) + 50,
        read_time: calculateReadingTime(blog.content),
        is_bookmarked: bookmarkedBlogs.has(blog.id)
      }))

      if (reset) {
        setBlogs(enhancedBlogs)
        setCurrentPage(2)
      } else {
        setBlogs(prev => [...prev, ...enhancedBlogs])
        setCurrentPage(prev => prev + 1)
      }

      // Check if there's more data
      setHasMoreData(enhancedBlogs.length === ITEMS_PER_PAGE && (reset ? total > ITEMS_PER_PAGE : true))

    } catch (error) {
      console.error("Error fetching blogs:", error)
      setError("Không thể tải danh sách bài viết. Vui lòng thử lại sau.")
      toast({
        title: "Lỗi kết nối",
        description: "Không thể tải danh sách bài viết",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Initial fetch and category change
  useEffect(() => {
    fetchBlogs(true)
  }, [selectedCategory])

  // Search and sort change
  useEffect(() => {
    fetchBlogs(true)
  }, [debouncedSearchTerm, sortBy])

  // Load more function
  const loadMore = () => {
    if (!loadingMore && hasMoreData) {
      fetchBlogs(false)
    }
  }

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasMoreData || loadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(loadMoreRef.current)

    return () => observer.disconnect()
  }, [hasMoreData, loadingMore])

  const retryFetch = () => {
    setError(null)
    fetchBlogs(true)
  }

  // Tính toán thời gian đọc tối ưu hơn
  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(word => word.length > 0).length
    const minutes = Math.ceil(words / wordsPerMinute)
    return Math.max(1, minutes) // Tối thiểu 1 phút
  }

  // Xử lý description từ markdown/html content với cache
  const getCleanDescription = useMemo(() => {
    const cache = new Map<string, string>()
    
    return (content: string, maxLength: number = 150) => {
      const cacheKey = `${content}_${maxLength}`
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey)!
      }

      let cleanText = content
        .replace(/<[^>]*>/g, '') // Loại bỏ HTML tags
        .replace(/#{1,6}\s/g, '') // Loại bỏ markdown headers
        .replace(/\*\*(.*?)\*\*/g, '$1') // Loại bỏ bold markdown
        .replace(/\*(.*?)\*/g, '$1') // Loại bỏ italic markdown
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Loại bỏ markdown links, giữ text
        .replace(/`(.*?)`/g, '$1') // Loại bỏ inline code
        .replace(/>\s/g, '') // Loại bỏ blockquote
        .replace(/[-*+]\s/g, '') // Loại bỏ list markers
        .replace(/\d+\.\s/g, '') // Loại bỏ numbered list
        .replace(/\n\s*\n/g, ' ') // Thay thế multiple newlines bằng space
        .replace(/\s+/g, ' ') // Thay thế multiple spaces bằng single space
        .trim()

      if (cleanText.length <= maxLength) {
        cache.set(cacheKey, cleanText)
        return cleanText
      }

      const result = cleanText.substring(0, maxLength).trim() + '...'
      cache.set(cacheKey, result)
      return result
    }
  }, [])

  // Lọc và sắp xếp blogs với performance optimization
  const filteredAndSortedBlogs = useMemo(() => {
    let filtered = blogs.filter((blog) => {
      const matchesSearch = !debouncedSearchTerm || 
        blog?.title?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        blog?.content?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      
      const matchesCategory = selectedCategory === "all" || blog?.category === selectedCategory

      return matchesSearch && matchesCategory
    })

    // Sắp xếp with stable sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "title":
          return a.title.localeCompare(b.title, 'vi', { numeric: true })
        case "popular":
          return (b.views || 0) - (a.views || 0)
        case "reading-time":
          return (a.read_time || 0) - (b.read_time || 0)
        default: // newest
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    return filtered
  }, [blogs, debouncedSearchTerm, selectedCategory, sortBy])

  const clearFilters = () => {
    setSearchTerm("")
    setDebouncedSearchTerm("")
    setSelectedCategory("all")
    setSortBy("newest")
  }

  // Bookmark functionality
  const toggleBookmark = (blogId: number) => {
    setBookmarkedBlogs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(blogId)) {
        newSet.delete(blogId)
        toast({
          title: "Đã bỏ lưu",
          description: "Bài viết đã được bỏ khỏi danh sách đã lưu",
        })
      } else {
        newSet.add(blogId)
        toast({
          title: "Đã lưu",
          description: "Bài viết đã được lưu vào danh sách của bạn",
        })
      }
      return newSet
    })

    // Update blog bookmark status
    setBlogs(prev => prev.map(blog => 
      blog.id === blogId ? { ...blog, is_bookmarked: !blog.is_bookmarked } : blog
    ))
  }

  // Get category info with icon
  const getCategoryInfo = (category: string) => {
    return PREDEFINED_CATEGORIES.find(cat => cat.value === category) || 
           { value: category, label: category, icon: BookOpen, color: "bg-gray-100 text-gray-800" }
  }

  // Quick share functionality
  const handleQuickShare = async (blog: Blog) => {
    const url = `${window.location.origin}/blog/${blog.id}`
    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: "Đã sao chép liên kết",
        description: "Liên kết bài viết đã được sao chép",
      })
    } catch (error) {
      toast({
        title: "Không thể sao chép",
        description: "Vui lòng thử lại",
        variant: "destructive",
      })
    }
  }

  if (error && blogs.length === 0) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
        
        <div className="min-h-screen flex items-center justify-center relative z-10">
          <motion.div 
            className="text-center bg-white rounded-xl p-12 shadow-lg border border-gray-200 max-w-md mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Có lỗi xảy ra</h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <Button onClick={retryFetch} className="bg-red-600 hover:bg-red-700 text-white">
              <RefreshCw className="h-4 w-4 mr-2" />
              Thử lại
            </Button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Enhanced SEO Meta Tags */}
      <Head>
        <title>Blog In Ấn & Thiết Kế - Kiến Thức Chuyên Sâu | Phú Long</title>
        <meta name="description" content="Khám phá những kiến thức chuyên sâu về in ấn, thiết kế đồ họa, xu hướng marketing và mẹo hay trong ngành in ấn. Cập nhật thường xuyên từ đội ngũ chuyên gia Phú Long." />
        <meta name="keywords" content="in ấn, thiết kế, marketing, branding, catalogue, brochure, business card, poster, banner, packaging, CMYK, Pantone, typography" />
        <meta property="og:title" content="Blog In Ấn & Thiết Kế - Kiến Thức Chuyên Sâu" />
        <meta property="og:description" content="Khám phá những kiến thức chuyên sâu về in ấn, thiết kế đồ họa và xu hướng marketing" />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="/blog" />
      </Head>

      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
        <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-red-50/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-gray-100/40 to-transparent rounded-full blur-3xl"></div>
        
        {/* Enhanced Header với better accessibility */}
        <section className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 text-white py-20 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
          <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-red-600/10 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-1/4 h-2/3 bg-gradient-to-tl from-gray-900/50 to-transparent rounded-full blur-3xl"></div>

          <div className="container mx-auto px-4 lg:px-6 max-w-6xl text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6"
            >
              <Printer className="h-4 w-4 text-red-400 mr-2" aria-hidden="true" />
              <span className="text-sm font-medium">Kiến thức chuyên ngành</span>
              <Sparkles className="h-4 w-4 text-red-400 ml-2" aria-hidden="true" />
            </motion.div>

            <motion.h1 
              className="text-4xl lg:text-6xl font-bold mb-6 text-white"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Blog In Ấn & Thiết Kế
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Khám phá những xu hướng mới nhất, kiến thức chuyên sâu về in ấn, 
              thiết kế đồ họa và mẹo marketing hiệu quả từ đội ngũ chuyên gia
            </motion.p>

            {/* Category highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap justify-center gap-3 mb-8"
              role="list"
              aria-label="Danh mục blog"
            >
              {PREDEFINED_CATEGORIES.slice(0, 4).map((category) => {
                const Icon = category.icon
                return (
                  <div key={category.value} className="flex items-center px-4 py-2 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm" role="listitem">
                    <Icon className="h-4 w-4 text-red-400 mr-2" aria-hidden="true" />
                    <span className="text-sm font-medium">{category.label}</span>
                  </div>
                )
              })}
            </motion.div>
          </div>
        </section>

        {/* Enhanced Filters với better UX */}
        <section className="py-8 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40 backdrop-blur-sm relative">
          <div className="max-w-6xl mx-auto px-4 lg:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col lg:flex-row gap-4 items-center justify-between"
            >
              <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full max-w-5xl">
                {/* Enhanced Search with live feedback */}
                <div className="relative flex-1 max-w-sm group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-red-500 transition-colors duration-300" aria-hidden="true" />
                  <Input
                    placeholder="Tìm kiếm bài viết, từ khóa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 rounded-lg border-gray-300 focus:border-red-400 focus:ring-red-400/20 shadow-sm hover:shadow-md transition-all duration-300"
                    aria-label="Tìm kiếm bài viết"
                  />
                  {searchTerm && searchTerm !== debouncedSearchTerm && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48 h-11 rounded-lg border-gray-300 focus:border-red-400 focus:ring-red-400/20 shadow-sm hover:shadow-md transition-all duration-300" aria-label="Chọn danh mục">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-gray-300 shadow-lg">
                    <SelectItem value="all" className="rounded-md">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2" aria-hidden="true" />
                        Tất cả danh mục
                      </div>
                    </SelectItem>
                    {PREDEFINED_CATEGORIES.map((category) => {
                      const Icon = category.icon
                      return (
                        <SelectItem key={category.value} value={category.value} className="rounded-md">
                          <div className="flex items-center">
                            <Icon className="h-4 w-4 mr-2" aria-hidden="true" />
                            {category.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>

                {/* Enhanced Sort Filter */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-48 h-11 rounded-lg border-gray-300 focus:border-red-400 focus:ring-red-400/20 shadow-sm hover:shadow-md transition-all duration-300" aria-label="Sắp xếp">
                    <SelectValue placeholder="Sắp xếp" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-gray-300 shadow-lg">
                    <SelectItem value="newest" className="rounded-md">Mới nhất</SelectItem>
                    <SelectItem value="popular" className="rounded-md">Phổ biến nhất</SelectItem>
                    <SelectItem value="reading-time" className="rounded-md">Thời gian đọc</SelectItem>
                    <SelectItem value="oldest" className="rounded-md">Cũ nhất</SelectItem>
                    <SelectItem value="title" className="rounded-md">Theo tên A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results count and actions */}
              <div className="flex items-center gap-3">
                <div className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-sm text-gray-600">
                  {filteredAndSortedBlogs.length} bài viết
                </div>
                
                {(searchTerm || selectedCategory !== "all" || sortBy !== "newest") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg"
                    aria-label="Xóa tất cả bộ lọc"
                  >
                    <Filter className="h-4 w-4 mr-1" aria-hidden="true" />
                    Xóa bộ lọc
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Blog Grid với enhanced cards */}
        <section className="py-12 relative z-10">
          <div className="max-w-6xl mx-auto px-4 lg:px-6">
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="border border-gray-200 shadow-md bg-white h-full animate-pulse rounded-lg overflow-hidden">
                    <div className="h-56 bg-gray-200"></div>
                    <CardHeader className="p-6">
                      <div className="h-6 bg-gray-200 rounded mb-4"></div>
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : filteredAndSortedBlogs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="bg-gray-50 rounded-xl p-12 max-w-lg mx-auto border border-gray-200">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Không tìm thấy bài viết</h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm ? `Không có kết quả cho "${searchTerm}"` : "Thử thay đổi bộ lọc để tìm thấy bài viết phù hợp"}
                  </p>
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Xóa tất cả bộ lọc
                  </Button>
                </div>
              </motion.div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  <AnimatePresence>
                    {filteredAndSortedBlogs.map((blog, index) => {
                      const categoryInfo = getCategoryInfo(blog.category)
                      const CategoryIcon = categoryInfo.icon

                      return (
                        <motion.article
                          key={blog.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="h-full"
                        >
                          <Card className="border border-gray-200 shadow-lg bg-white h-full hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group rounded-xl overflow-hidden">
                            {/* Enhanced Image Container */}
                            <div className="relative h-56 overflow-hidden">
                              <Image
                                src={blog.image_url || "/api/placeholder/400/250"}
                                alt={blog.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                loading={index < 3 ? "eager" : "lazy"}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                              
                              {/* Enhanced Category Badge */}
                              <div className="absolute bottom-4 left-4">
                                <Badge className={`${categoryInfo.color} px-3 py-1 text-xs font-semibold rounded-lg shadow-md backdrop-blur-sm`}>
                                  <CategoryIcon className="h-3 w-3 mr-1" aria-hidden="true" />
                                  {categoryInfo.label}
                                </Badge>
                              </div>
                              
                              {/* Reading Time & Views with better info */}
                              <div className="absolute top-4 right-4 space-y-2">
                                <Badge variant="secondary" className="bg-white/95 text-gray-700 px-2 py-1 text-xs rounded-lg border shadow-md">
                                  <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
                                  {blog.read_time} phút
                                </Badge>
                                <Badge variant="secondary" className="bg-white/95 text-gray-700 px-2 py-1 text-xs rounded-lg border shadow-md">
                                  <Eye className="h-3 w-3 mr-1" aria-hidden="true" />
                                  {blog.views}
                                </Badge>
                              </div>

                              {/* Quick Action Buttons */}
                              <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-md"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    toggleBookmark(blog.id)
                                  }}
                                  aria-label={blog.is_bookmarked ? "Bỏ lưu bài viết" : "Lưu bài viết"}
                                >
                                  <Bookmark className={`h-4 w-4 ${blog.is_bookmarked ? "fill-current text-red-600" : "text-gray-600"}`} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-md"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    handleQuickShare(blog)
                                  }}
                                  aria-label="Chia sẻ bài viết"
                                >
                                  <Share2 className="h-4 w-4 text-gray-600" />
                                </Button>
                              </div>
                            </div>

                            <CardHeader className="p-6 flex-1 flex flex-col">
                              {/* Enhanced Title */}
                              <CardTitle className="text-xl font-bold text-gray-900 mb-4 group-hover:text-red-600 transition-colors duration-300 line-clamp-2 leading-tight min-h-[3.5rem]">
                                <Link href={`/blog/${blog.id}`} className="hover:underline focus:underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded">
                                  {blog.title}
                                </Link>
                              </CardTitle>
                              
                              {/* Enhanced Clean Description */}
                              <p className="text-gray-600 text-sm mb-6 flex-1 line-clamp-3 leading-relaxed">
                                {getCleanDescription(blog.content, 150)}
                              </p>
                              
                              {/* Enhanced Meta Information */}
                              <div className="flex items-center justify-between text-xs text-gray-500 mb-6 pt-4 border-t border-gray-100">
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" aria-hidden="true" />
                                    <time dateTime={blog.created_at}>
                                      {new Date(blog.created_at).toLocaleDateString("vi-VN")}
                                    </time>
                                  </div>
                                  <div className="flex items-center">
                                    <User className="h-3 w-3 mr-1" aria-hidden="true" />
                                    <span>Phú Long</span>
                                  </div>
                                </div>
                              </div>

                              {/* Enhanced Read More Button */}
                              <Link href={`/blog/${blog.id}`} className="w-full">
                                <Button className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-300 group-hover:shadow-lg transform group-hover:scale-[1.02] h-12 focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                                  <span className="mr-2 font-medium">Đọc bài viết</span>
                                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" aria-hidden="true" />
                                </Button>
                              </Link>
                            </CardHeader>
                          </Card>
                        </motion.article>
                      )
                    })}
                  </AnimatePresence>
                </motion.div>

                {/* Infinite Scroll Trigger với loading indicator */}
                {hasMoreData && (
                  <div ref={loadMoreRef} className="flex justify-center py-8">
                    {loadingMore ? (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Đang tải thêm bài viết...</span>
                      </div>
                    ) : (
                      <Button
                        onClick={loadMore}
                        variant="outline"
                        className="border-gray-300 text-gray-600 hover:bg-gray-50"
                      >
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Tải thêm bài viết
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Error state cho load more */}
            {error && blogs.length > 0 && (
              <div className="flex justify-center py-8">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Có lỗi khi tải thêm bài viết</p>
                  <Button onClick={retryFetch} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Thử lại
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-16 bg-gradient-to-br from-gray-50 to-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 lg:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Bạn có câu hỏi về in ấn?
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                Liên hệ với đội ngũ chuyên gia của chúng tôi để được tư vấn miễn phí
              </p>
              <Link href="/contact">
                <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                  Liên hệ tư vấn
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  )
}

