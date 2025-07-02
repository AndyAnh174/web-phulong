"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Star, 
  ShoppingCart, 
  Phone, 
  Sparkles,
  Award,
  Printer,
  Calculator,
  Send,
  Zap,
  Loader2,
  Eye,
  Package,
  Clock
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import ReactMarkdown from "react-markdown"

// Bảng giá in ấn (static data)
const printingPricing = [
  {
    category: "In Offset",
    description: "Chất lượng cao, phù hợp số lượng lớn",
    icon: <Award className="h-8 w-8" />,
    color: "from-blue-600 to-blue-700",
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
    icon: <Zap className="h-8 w-8" />,
    color: "from-green-600 to-green-700",
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
    icon: <Clock className="h-8 w-8" />,
    color: "from-orange-600 to-orange-700",
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

interface PrintingPost {
  id: number;
  title: string;
  time: string;
  content: string;
  is_visible: boolean;
  created_at: string;
  images?: any[];
}

export default function PrintingPage() {
  const [printingPosts, setPrintingPosts] = useState<PrintingPost[]>([]);
  const [printingLoading, setPrintingLoading] = useState(false);
  const [visibleImageCount, setVisibleImageCount] = useState(3);
  const { toast } = useToast()
  const router = useRouter();

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

  // Fetch printing posts from API
  useEffect(() => {
    fetchPrintingPosts()
  }, [])

  const fetchPrintingPosts = async () => {
    try {
      setPrintingLoading(true);
      
      const API_BASE_URL = 'http://14.187.180.6:12122/api'
      
      const response = await fetch(`${API_BASE_URL}/printing?limit=6&is_visible=true`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && Array.isArray(data.items)) {
        setPrintingPosts(data.items);
      } else {
        console.warn('Unexpected API response format:', data);
      }
    } catch (error) {
      console.error("Error fetching printing posts:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách sản phẩm in",
        variant: "destructive",
      });
    } finally {
      setPrintingLoading(false);
    }
  };

  const handleLoadMoreImages = () => {
    setVisibleImageCount(prev => prev + 3);
  };

  const handleOrderService = (serviceName: string, quantity: string, price: string) => {
    const cleanPrice = price.replace(/[^\d]/g, '');
    router.push(`/order?service=${encodeURIComponent(`${serviceName} - ${quantity}`)}&price=${cleanPrice}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-600 via-red-700 to-orange-800 text-white py-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-red-600/20 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-2/3 bg-gradient-to-tl from-orange-900/30 to-transparent rounded-full blur-3xl"></div>
        
        {/* Floating Elements */}
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
            <Printer className="h-5 w-5 text-yellow-400 mr-2 animate-pulse" />
            <span className="text-sm font-semibold text-white">
              Sản phẩm in chất lượng cao
            </span>
            <Sparkles className="h-5 w-5 text-yellow-400 ml-2" />
          </motion.div>

          <motion.h1 
            className="text-4xl lg:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Sản phẩm in
            <motion.div 
              className="w-32 h-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 mx-auto mt-4 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 128 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            />
          </motion.h1>
          
          <motion.p 
            className="text-xl text-red-100 max-w-3xl mx-auto leading-relaxed mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Từ name card, brochure đến banner, poster - 
            <span className="text-yellow-300 font-semibold"> công nghệ in hiện đại</span> với 
            <span className="text-yellow-300 font-semibold"> giá cả cạnh tranh</span>
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold px-8 py-4 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-200"
              onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Calculator className="mr-2 h-5 w-5" />
              Xem bảng giá
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-red-700 px-8 py-4 rounded-xl backdrop-blur-sm border-2 font-semibold transform hover:scale-105 transition-all duration-200"
              asChild
            >
              <Link href="/order">
                <Send className="mr-2 h-5 w-5" />
                Đặt in ngay
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing-section" className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Bảng giá in ấn
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Giá cả cạnh tranh, chất lượng đảm bảo với nhiều lựa chọn phù hợp mọi nhu cầu
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {printingPricing.map((category, categoryIndex) => (
              <motion.div key={categoryIndex} variants={itemVariants}>
                <Card className="h-full border-0 shadow-xl overflow-hidden">
                  <CardHeader className={`bg-gradient-to-r ${category.color} text-white p-6`}>
                    <div className="flex items-center justify-center mb-4">
                      <div className="p-3 bg-white/20 rounded-full">
                        {category.icon}
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">
                      {category.category}
                    </CardTitle>
                    <p className="text-center text-gray-100 mt-2">
                      {category.description}
                    </p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {category.services.map((service, serviceIndex) => (
                        <div key={serviceIndex} className="border-b border-gray-100 pb-4 last:border-b-0">
                          <h4 className="font-semibold text-gray-800 mb-3">
                            {service.name}
                          </h4>
                          <div className="space-y-2">
                            {service.prices.map((priceItem, priceIndex) => (
                              <div key={priceIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <span className="text-sm text-gray-600">
                                  {priceItem.quantity}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-red-600">
                                    {priceItem.price}
                                  </span>
                                  <Button 
                                    size="sm"
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs"
                                    onClick={() => handleOrderService(service.name, priceItem.quantity, priceItem.price)}
                                  >
                                    Đặt
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Contact CTA */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-8">
              <Package className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Không tìm thấy sản phẩm phù hợp?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Liên hệ trực tiếp để được tư vấn và báo giá cho các sản phẩm in đặc biệt theo yêu cầu
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
                  asChild
                >
                  <Link href="/contact">
                    <Phone className="mr-2 h-5 w-5" />
                    Liên hệ tư vấn
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-8 py-3"
                  asChild
                >
                  <Link href="/order">
                    <Send className="mr-2 h-5 w-5" />
                    Đặt hàng tùy chỉnh
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Printing Posts Section */}
      {printingPosts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                Sản phẩm in mẫu
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Khám phá các mẫu sản phẩm in đẹp đã thực hiện cho khách hàng
              </p>
            </motion.div>

            {printingLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
                  <p className="text-gray-600">Đang tải sản phẩm in mẫu...</p>
                </div>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {printingPosts.slice(0, visibleImageCount).map((post) => (
                  <motion.div key={post.id} variants={itemVariants}>
                    <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white overflow-hidden h-full">
                      <div className="relative overflow-hidden">
                        {post.images && post.images.length > 0 ? (
                          <img
                            src={post.images[0].image.url.startsWith('http') ? post.images[0].image.url : `http://14.187.180.6:12122${post.images[0].image.url}`}
                            alt={post.images[0].image.alt_text || post.title}
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.jpg'
                            }}
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
                            <Printer className="h-16 w-16 text-red-400" />
                          </div>
                        )}
                        
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-red-600 text-white font-semibold shadow-lg">
                            <Clock className="mr-1 h-3 w-3" />
                            {post.time}
                          </Badge>
                        </div>
                      </div>
                      
                      <CardContent className="p-6 flex flex-col h-full">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-red-600 transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <div className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                            <ReactMarkdown>{post.content}</ReactMarkdown>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t">
                          <span className="text-sm text-gray-500">
                            {new Date(post.created_at).toLocaleDateString("vi-VN")}
                          </span>
                          <Button 
                            size="sm"
                            variant="outline"
                            className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                            asChild
                          >
                            <Link href="/order">
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              Đặt in tương tự
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Load More Button */}
            {visibleImageCount < printingPosts.length && (
              <div className="text-center mt-12">
                <Button
                  onClick={handleLoadMoreImages}
                  size="lg"
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-8 py-3 font-semibold"
                >
                  <Eye className="mr-2 h-5 w-5" />
                  Xem thêm mẫu in ({printingPosts.length - visibleImageCount} còn lại)
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Final CTA Section */}
      <section className="bg-gradient-to-r from-red-600 to-orange-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Sẵn sàng in ấn sản phẩm của bạn?
            </h2>
            <p className="text-red-100 text-lg mb-8 max-w-2xl mx-auto">
              Liên hệ ngay để được tư vấn, báo giá và nhận ưu đãi đặc biệt cho đơn hàng đầu tiên
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-red-700 hover:bg-gray-100 px-8 py-4 font-semibold rounded-xl shadow-xl"
                asChild
              >
                <Link href="/order">
                  <Send className="mr-2 h-5 w-5" />
                  Đặt in ngay
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-red-700 px-8 py-4 font-semibold rounded-xl"
                asChild
              >
                <Link href="/contact">
                  <Phone className="mr-2 h-5 w-5" />
                  Liên hệ tư vấn
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
