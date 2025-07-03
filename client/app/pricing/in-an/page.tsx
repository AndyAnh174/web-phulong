"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle2,
  Star, 
  ShoppingCart, 
  Phone, 
  MessageCircle, 
  Sparkles,
  Award,
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
import { useRouter } from "next/navigation"
import ReactMarkdown from "react-markdown"
import Footer from "@/components/layout/footer"

export default function PrintingPricingPage() {
  const [printingPosts, setPrintingPosts] = useState<any[]>([])
  const [printingLoading, setPrintingLoading] = useState(false)
  const [printingError, setPrintingError] = useState("")
  const [printingPage, setPrintingPage] = useState(1)
  const PRINTING_LIMIT = 6
  const [printingTotal, setPrintingTotal] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

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

  useEffect(() => {
    fetchPrintingPosts()
  }, [printingPage])

  const fetchPrintingPosts = async () => {
    try {
      setPrintingLoading(true)
      setPrintingError("")
      const API_BASE_URL = 'http://14.187.180.6:12122'
      
      const res = await fetch(`${API_BASE_URL}/api/printing?is_visible=true&skip=${(printingPage-1)*PRINTING_LIMIT}&limit=${PRINTING_LIMIT}`)
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const data = await res.json()
      console.log("Printing API Response:", data)
      
      if (data.items && Array.isArray(data.items)) {
        setPrintingPosts(data.items)
        setPrintingTotal(data.total || data.items.length)
      } else if (Array.isArray(data)) {
        setPrintingPosts(data)
        setPrintingTotal(data.length)
      } else {
        throw new Error("Invalid data format")
      }
      
    } catch (error) {
      console.error('Error fetching printing posts:', error)
      setPrintingError("Không thể tải dữ liệu in ấn")
      toast({
        title: "Lỗi tải dữ liệu",
        description: "Không thể tải danh sách in ấn. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setPrintingLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-red-50/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
      <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-red-50/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-gray-100/30 to-transparent rounded-full blur-3xl"></div>

      {/* Navigation breadcrumb - Separate section */}
      <section className="pt-20 pb-4 relative z-40">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center"
          >
            <div className="inline-flex items-center space-x-2 text-sm text-gray-500 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm">
              <Link href="/pricing" className="hover:text-red-600 transition-colors">Bảng giá</Link>
              <span>/</span>
              <span className="text-red-600 font-medium">In ấn</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Header Section */}
      <section className="pt-4 pb-20 relative z-10">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            {/* Logo Phú Long */}
          

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-gray-100 to-red-100 border border-gray-200/50 mb-6"
            >
              <Printer className="h-5 w-5 text-gray-600 mr-2" />
              <span className="text-sm font-semibold bg-gradient-to-r from-gray-700 to-red-700 bg-clip-text text-transparent">
                Dịch vụ in ấn chất lượng cao
              </span>
              <Sparkles className="h-5 w-5 text-red-600 ml-2" />
            </motion.div>

            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-red-700 to-gray-800 bg-clip-text text-transparent mb-6">
              BẢNG GIÁ IN ẤN
              <motion.div 
                className="w-32 h-1.5 bg-gradient-to-r from-gray-500 to-red-600 mx-auto mt-4 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: 128 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Tham khảo các mẫu in ấn 
              <span className="text-red-600 font-semibold"> chất lượng cao</span> mà chúng tôi đã 
              <span className="text-gray-700 font-semibold"> thực hiện</span> cho khách hàng
            </p>
          </motion.div>



          {/* Content */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Các mẫu in ấn đã thực hiện
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Khám phá các sản phẩm in ấn chất lượng cao với công nghệ hiện đại
            </p>
          </motion.div>

          {printingLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-red-600 mx-auto"></div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400/20 to-red-600/20 animate-pulse"></div>
                </div>
                <p className="mt-4 text-gray-600">Đang tải dữ liệu in ấn...</p>
              </div>
            </div>
          ) : printingError ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="max-w-md mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <Printer className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-red-700 mb-2">Lỗi tải dữ liệu</h3>
                  <p className="text-red-600">{printingError}</p>
                  <Button 
                    onClick={fetchPrintingPosts}
                    variant="outline" 
                    className="mt-4 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Thử lại
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : printingPosts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="max-w-md mx-auto">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
                  <Printer className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có mẫu in ấn</h3>
                  <p className="text-gray-500 mb-4">Chúng tôi đang cập nhật thêm các mẫu in ấn mới</p>
                  <Button 
                    asChild
                    variant="outline" 
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Link href="/contact">Liên hệ tư vấn</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {printingPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  custom={index}
                  variants={itemVariants}
                  whileHover={{ 
                    y: -8, 
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                  className="group cursor-pointer"
                  onClick={() => router.push(`/pricing/${post.id}`)}
                >
                  <Card className="overflow-hidden shadow-lg hover:shadow-2xl border-0 bg-white/90 backdrop-blur-sm transition-all duration-500 h-full">
                    {/* Ảnh đại diện */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-red-50 to-gray-50">
                      {/* Hiển thị ảnh từ image_urls hoặc images */}
                      {post.image_urls && post.image_urls.length > 0 && post.image_urls[0].trim() ? (
                        <img
                          src={post.image_urls[0]}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.parentElement?.querySelector('.fallback-printer') as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : post.images && post.images.length > 0 ? (
                        <img
                          src={post.images[0].image.url.startsWith('http') ? post.images[0].image.url : `http://14.187.180.6:12122${post.images[0].image.url}`}
                          alt={post.images[0].image.alt_text || post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.parentElement?.querySelector('.fallback-printer') as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      
                      {/* Fallback icon */}
                      <div className="fallback-printer absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-100 to-gray-100" style={{display: (!post.image_urls?.length && !post.images?.length) ? 'flex' : 'none'}}>
                        <Printer className="w-16 h-16 text-red-400" />
                      </div>
                      
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Thời gian badge */}
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-white/90 text-red-700 shadow-md">
                          {post.time}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-bold text-red-700 mb-2 group-hover:text-red-900 transition-colors duration-300 line-clamp-2">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {/* Markdown content preview */}
                      <div className="prose prose-sm max-w-none text-gray-700 mb-4">
                        <div className="line-clamp-3 text-sm leading-relaxed">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              h1: ({ children }) => <span className="font-semibold text-base">{children}</span>,
                              h2: ({ children }) => <span className="font-semibold text-sm">{children}</span>,
                              h3: ({ children }) => <span className="font-medium text-sm">{children}</span>,
                              strong: ({ children }) => <span className="font-semibold text-red-700">{children}</span>,
                              em: ({ children }) => <span className="italic text-gray-600">{children}</span>,
                              ul: ({ children }) => <ul className="list-disc list-inside space-y-1">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal list-inside space-y-1">{children}</ol>,
                              li: ({ children }) => <li className="text-sm">{children}</li>,
                              code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{children}</code>,
                            }}
                          >
                            {post.content?.length > 150 ? post.content.slice(0, 150) + "..." : post.content || ""}
                          </ReactMarkdown>
                        </div>
                      </div>

                      {/* Thêm ảnh nhỏ nếu có nhiều ảnh */}
                      {((post.image_urls && post.image_urls.length > 1) || (post.images && post.images.length > 1)) && (
                        <div className="flex gap-2 mb-4 overflow-hidden">
                          {post.image_urls && post.image_urls.length > 1 ? (
                            post.image_urls.slice(1, 4).map((url: string, idx: number) => (
                              url.trim() && (
                                <div key={idx} className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                  <img
                                    src={url}
                                    alt={`${post.title} ${idx + 2}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                </div>
                              )
                            ))
                          ) : (
                            post.images?.slice(1, 4).map((img: any, idx: number) => (
                              <div key={img.id} className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={img.image.url.startsWith('http') ? img.image.url : `http://14.187.180.6:12122${img.image.url}`}
                                  alt={img.image.alt_text || `${post.title} ${idx + 2}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              </div>
                            ))
                          )}
                          {/* Hiển thị số ảnh còn lại */}
                          {((post.image_urls?.length || 0) + (post.images?.length || 0)) > 4 && (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-medium text-gray-600">
                                +{((post.image_urls?.length || 0) + (post.images?.length || 0)) - 4}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-400">
                          {new Date(post.updated_at).toLocaleDateString('vi-VN')}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {printingTotal > PRINTING_LIMIT && (
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({length: Math.ceil(printingTotal/PRINTING_LIMIT)}).map((_,i)=>(
                <Button key={i} size="sm" variant={printingPage===i+1?"default":"outline"} onClick={()=>setPrintingPage(i+1)}>{i+1}</Button>
              ))}
            </div>
          )}
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
                  Tư vấn in ấn chuyên nghiệp
                </span>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-red-700 to-gray-800 bg-clip-text text-transparent mb-6">
                Cần tư vấn về dịch vụ in ấn?
              </h2>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Liên hệ với chúng tôi để được 
                <span className="text-red-600 font-semibold"> tư vấn miễn phí</span> và nhận 
                <span className="text-gray-700 font-semibold"> báo giá tốt nhất</span> cho dự án in ấn của bạn
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-10 py-6 text-lg rounded-xl shadow-xl hover:scale-105 transition-all duration-300 group"
                >
                  <Link href="/order" className="flex items-center">
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

      <Footer />
    </div>
  )
} 