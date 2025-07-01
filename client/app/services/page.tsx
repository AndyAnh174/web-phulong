"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ArrowRight, 
  Search, 
  Filter, 
  Star, 
  TrendingUp, 
  Award, 
  Grid3X3, 
  List, 
  Sparkles,
  Clock,
  Shield,
  Eye,
  Heart,
  Zap,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
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

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showFeatured, setShowFeatured] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentPage, setCurrentPage] = useState(1)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const itemsPerPage = 9
  const { toast } = useToast()

  useEffect(() => {
    fetchServices()
  }, [selectedCategory, showFeatured])

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true)
      let url = "http://14.187.180.6:12122/api/services?"

      if (selectedCategory !== "all") {
        url += `category=${selectedCategory}&`
      }
      if (showFeatured === "featured") {
        url += "featured=true&"
      }

      const response = await fetch(url)
      const data = await response.json()
      setServices(data)
      setCurrentPage(1)
    } catch (error) {
      console.error("Error fetching services:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách dịch vụ",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, showFeatured, toast])

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentServices = filteredServices.slice(startIndex, startIndex + itemsPerPage)
  
  const categories = [...new Set(services.map((service) => service.category))]

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
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Enhanced Header */}
      <section className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white py-20 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-orange-600/20 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-2/3 bg-gradient-to-tl from-red-900/30 to-transparent rounded-full blur-3xl"></div>
        
        {/* Floating elements */}
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
            <Sparkles className="h-5 w-5 text-yellow-400 mr-2 animate-pulse" />
            <span className="text-sm font-semibold text-white">
              Hơn 50+ dịch vụ in ấn chuyên nghiệp
            </span>
            <Award className="h-5 w-5 text-yellow-400 ml-2" />
          </motion.div>

          <motion.h1 
            className="text-4xl lg:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Dịch vụ in ấn
            <motion.div 
              className="w-32 h-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 mx-auto mt-4 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 128 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            />
          </motion.h1>
          
          <motion.p 
            className="text-xl text-red-100 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Khám phá đầy đủ các dịch vụ in ấn chuyên nghiệp với 
            <span className="text-yellow-300 font-semibold"> công nghệ hiện đại</span> và 
            <span className="text-yellow-300 font-semibold"> chất lượng hàng đầu</span>
          </motion.p>
        </div>
      </section>

      {/* Enhanced Filters */}
      <section className="py-8 bg-white border-b border-gray-100 shadow-lg relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
        <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-blue-50/50 to-transparent"></div>
        
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row gap-6 items-center justify-between"
          >
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
              <div className="relative flex-1 max-w-md group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-red-500 transition-colors duration-300" />
                <Input
                  placeholder="Tìm kiếm dịch vụ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 rounded-xl border-gray-200 focus:border-red-400 focus:ring-red-400/20 shadow-sm hover:shadow-md transition-all duration-300"
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-56 h-12 rounded-xl border-gray-200 focus:border-red-400 focus:ring-red-400/20 shadow-sm hover:shadow-md transition-all duration-300">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-200 shadow-lg">
                  <SelectItem value="all" className="rounded-lg">Tất cả danh mục</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="rounded-lg">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={showFeatured} onValueChange={setShowFeatured}>
                <SelectTrigger className="w-full sm:w-48 h-12 rounded-xl border-gray-200 focus:border-red-400 focus:ring-red-400/20 shadow-sm hover:shadow-md transition-all duration-300">
                  <SelectValue placeholder="Lọc theo" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-200 shadow-lg">
                  <SelectItem value="all" className="rounded-lg">Tất cả</SelectItem>
                  <SelectItem value="featured" className="rounded-lg">Nổi bật</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={`rounded-md ${viewMode === "grid" ? "bg-red-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={`rounded-md ${viewMode === "list" ? "bg-red-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Results Counter */}
              <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-xl border border-blue-200">
                <Filter className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">{filteredServices.length} dịch vụ</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Services Grid/List */}
      <section className="py-16 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
        <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-red-50/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-blue-50/50 to-transparent rounded-full blur-3xl"></div>

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          {loading ? (
            <motion.div 
              className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-6"}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {[...Array(6)].map((_, i) => (
                <motion.div key={i} variants={itemVariants}>
                  <Card className="animate-pulse rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="h-56 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200"></div>
                    <CardHeader className="p-6">
                      <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-3/4 mb-3"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-full mb-2"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-2/3"></div>
                    </CardHeader>
                    <CardFooter className="p-6 pt-0">
                      <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-full"></div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : filteredServices.length === 0 ? (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-8">
                <Search className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-700 mb-4">Không tìm thấy dịch vụ nào</h3>
              <p className="text-gray-500 text-lg mb-8">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
              <Button 
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("all")
                  setShowFeatured("all")
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Xóa bộ lọc
              </Button>
            </motion.div>
          ) : (
            <>
              <motion.div 
                className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12" : "space-y-6 mb-12"}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {currentServices.map((service, index) => (
                  <motion.div
                    key={service.id}
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    onHoverStart={() => setHoveredCard(service.id)}
                    onHoverEnd={() => setHoveredCard(null)}
                    className="group"
                  >
                    {viewMode === "grid" ? (
                      <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/90 backdrop-blur-sm hover:bg-white h-full">
                        {/* Gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-blue-500/0 group-hover:from-red-500/5 group-hover:to-blue-500/5 transition-all duration-500 z-10" />
                        
                        <CardHeader className="p-0 relative">
                          <div className="relative overflow-hidden rounded-t-xl">
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
                              {service.featured && (
                                <div className="absolute top-4 left-4 z-20">
                                  <Badge className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg">
                                    <Star className="h-3 w-3 mr-1" />
                                    Nổi bật
                                  </Badge>
                                </div>
                              )}
                              
                              <div className="absolute top-4 right-4 z-20">
                                <Badge variant="outline" className="bg-white/90 backdrop-blur-sm border-gray-200 text-gray-700 group-hover:border-red-400 group-hover:text-red-600 transition-colors duration-300">
                                  {service.category}
                                </Badge>
                              </div>

                              {/* Action buttons overlay */}
                              <motion.div 
                                className="absolute inset-0 flex items-center justify-center z-20"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: hoveredCard === service.id ? 1 : 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="flex space-x-3">
                                  <Button 
                                    size="sm" 
                                    variant="secondary"
                                    className="bg-white/90 hover:bg-white text-gray-800 shadow-lg backdrop-blur-sm"
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Xem
                                  </Button>
                                  <Button 
                                    size="sm"
                                    className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
                                  >
                                    <Heart className="h-4 w-4 mr-1" />
                                    Yêu thích
                                  </Button>
                                </div>
                              </motion.div>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="p-6 flex-1 relative z-20">
                          <CardTitle className="text-xl font-bold group-hover:text-red-600 transition-colors duration-300 line-clamp-2 mb-3">
                            {service.name}
                          </CardTitle>
                          
                          <p className="text-gray-600 mb-4 line-clamp-2 group-hover:text-gray-700 transition-colors duration-300 leading-relaxed">
                            {service.description}
                          </p>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <div className="text-sm text-gray-500 mb-1">Giá từ</div>
                              <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                                {service.price.toLocaleString("vi-VN")}đ
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 text-yellow-500">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-current" />
                              ))}
                              <span className="text-sm text-gray-600 ml-2">(4.9)</span>
                            </div>
                          </div>

                          {/* Feature highlights */}
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-4 w-4 text-blue-500 mr-2" />
                              <span>Giao hàng nhanh 24h</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Shield className="h-4 w-4 text-green-500 mr-2" />
                              <span>Bảo hành chất lượng</span>
                            </div>
                          </div>
                        </CardContent>

                        <CardFooter className="p-6 pt-0 relative z-20">
                          <Button
                            asChild
                            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transform group-hover:scale-105 transition-all duration-300"
                          >
                            <Link href={`/services/${service.id}`} className="flex items-center justify-center">
                              <Zap className="mr-2 h-4 w-4" />
                              Xem chi tiết 
                              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ) : (
                      // List View
                      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm hover:bg-white">
                        <div className="flex items-center p-6">
                          <div className="relative w-32 h-32 rounded-lg overflow-hidden mr-6 shrink-0">
                            <Image
                              src={service.image_url || "/placeholder.svg?height=128&width=128"}
                              alt={service.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-xl font-bold group-hover:text-red-600 transition-colors duration-300">
                                  {service.name}
                                </h3>
                                <Badge variant="outline" className="mt-2">
                                  {service.category}
                                </Badge>
                              </div>
                              {service.featured && (
                                <Badge className="bg-red-600 text-white">
                                  <Star className="h-3 w-3 mr-1" />
                                  Nổi bật
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-gray-600 line-clamp-2">
                              {service.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-red-600">
                                {service.price.toLocaleString("vi-VN")}đ
                              </span>
                              
                              <Button asChild className="bg-red-600 hover:bg-red-700">
                                <Link href={`/services/${service.id}`}>
                                  Xem chi tiết
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}
                  </motion.div>
                ))}
              </motion.div>

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <motion.div 
                  className="flex justify-center items-center space-x-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border-gray-300 hover:border-red-400 hover:text-red-600 transition-colors duration-300"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1
                    const isActive = currentPage === pageNumber
                    
                    return (
                      <Button
                        key={pageNumber}
                        variant={isActive ? "default" : "outline"}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`w-10 h-10 rounded-lg ${
                          isActive 
                            ? "bg-red-600 text-white hover:bg-red-700" 
                            : "border-gray-300 hover:border-red-400 hover:text-red-600"
                        } transition-colors duration-300`}
                      >
                        {pageNumber}
                      </Button>
                    )
                  })}
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border-gray-300 hover:border-red-400 hover:text-red-600 transition-colors duration-300"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
