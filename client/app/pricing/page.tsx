"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle2,
  Phone, 
  Sparkles,
  Award,
  Palette,
  Printer,
  Calculator,
  Send,
  ArrowRight,
  Zap
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Footer from "@/components/layout/footer"
// Interface definitions
interface Service {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  category: string
  is_active: boolean
  featured?: boolean
}

// Bảng giá in ấn (static data)
const printingPricing = [
  {
    category: "In Offset",
    description: "Chất lượng cao, phù hợp số lượng lớn",
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

export default function PricingPage() {
  const router = useRouter()

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

  const services = [
    {
      id: "design",
      name: "Thiết kế",
      subtitle: "Dịch vụ thiết kế chuyên nghiệp",
      description: "Logo, brochure, website và các sản phẩm thiết kế sáng tạo với đội ngũ chuyên gia giàu kinh nghiệm",
      icon: Palette,
      href: "/pricing/thiet-ke",
      gradient: "from-red-500 to-red-600",
      bgGradient: "from-red-50 to-red-100",
      textColor: "text-red-700",
      features: [
        "Thiết kế logo chuyên nghiệp",
        "Brochure & catalog đẹp mắt",
        "Website responsive",
        "Nhận diện thương hiệu",
        "File chất lượng cao",
        "Hỗ trợ tư vấn miễn phí"
      ],
      stats: [
        { label: "Dự án hoàn thành", value: "500+" },
        { label: "Khách hàng hài lòng", value: "98%" },
        { label: "Thời gian trung bình", value: "3-7 ngày" }
      ]
    },
    {
      id: "printing",
      name: "In ấn",
      subtitle: "Dịch vụ in ấn chất lượng cao",
      description: "In offset, in kỹ thuật số và in nhanh với công nghệ hiện đại, chất lượng đảm bảo cho mọi sản phẩm",
      icon: Printer,
      href: "/pricing/in-an",
      gradient: "from-gray-500 to-gray-600",
      bgGradient: "from-gray-50 to-gray-100",
      textColor: "text-gray-700",
      features: [
        "In offset chất lượng cao",
        "In kỹ thuật số nhanh chóng",
        "In nhanh trong ngày",
        "Đa dạng chất liệu",
        "Giá cả cạnh tranh",
        "Giao hàng tận nơi"
      ],
      stats: [
        { label: "Sản phẩm in", value: "10K+" },
        { label: "Chất lượng", value: "99%" },
        { label: "Giao hàng", value: "Đúng hẹn" }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-red-50/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
      <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-red-50/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-gray-100/30 to-transparent rounded-full blur-3xl"></div>

      {/* Header Section */}
      <section className="pt-40 pb-20 relative z-10">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            {/* Logo Phú Long */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6"
            >
              <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-red-50 to-gray-50 rounded-xl border border-red-200/50">
                <img
                  src="https://i.imgur.com/WXSBk46.png"
                  alt="Phú Long"
                  className="h-10 w-auto object-contain"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-red-100 to-gray-100 border border-red-200/50 mb-6"
            >
              <Calculator className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-sm font-semibold bg-gradient-to-r from-red-700 to-gray-700 bg-clip-text text-transparent">
                Bảng giá minh bạch
              </span>
              <Sparkles className="h-5 w-5 text-gray-600 ml-2" />
            </motion.div>

            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-red-700 to-gray-800 bg-clip-text text-transparent mb-6">
              Bảng giá dịch vụ
              <motion.div 
                className="w-32 h-1.5 bg-gradient-to-r from-red-600 to-gray-500 mx-auto mt-4 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: 128 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Giá cả 
              <span className="text-red-600 font-semibold"> minh bạch</span>, chất lượng 
              <span className="text-gray-700 font-semibold"> đảm bảo</span> cho mọi nhu cầu thiết kế và in ấn
            </p>
          </motion.div>

          {/* Services Selection */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Chọn dịch vụ bạn quan tâm
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Khám phá chi tiết về các dịch vụ thiết kế và in ấn của chúng tôi
            </p>
          </motion.div>

          {/* Service Cards */}
          <motion.div 
            className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                custom={index}
                variants={itemVariants}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                className="group cursor-pointer"
                onClick={() => router.push(service.href)}
              >
                <Card className="relative border-0 shadow-lg hover:shadow-2xl transition-all duration-500 h-full bg-white/90 backdrop-blur-sm overflow-hidden">
                  {/* Background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.bgGradient} opacity-30`}></div>
                  
                  {/* Header */}
                  <CardHeader className="relative z-10 text-center pb-6 pt-8">
                    <div className={`w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-gradient-to-br ${service.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <service.icon className="w-10 h-10 text-white" />
                    </div>
                    
                    <CardTitle className={`text-2xl font-bold mb-2 ${service.textColor} group-hover:scale-105 transition-transform duration-300`}>
                      {service.name}
                    </CardTitle>
                    
                    <p className="text-sm text-gray-500 font-medium mb-4">
                      {service.subtitle}
                    </p>
                    
                    <p className="text-gray-600 leading-relaxed">
                      {service.description}
                    </p>
                  </CardHeader>

                  <CardContent className="relative z-10 pt-0 pb-8">
                    {/* Features */}
                    <div className="space-y-3 mb-6">
                      <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                        Dịch vụ bao gồm:
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {service.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center space-x-3">
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-white/50 rounded-xl">
                      {service.stats.map((stat, idx) => (
                        <div key={idx} className="text-center">
                          <div className={`text-lg font-bold ${service.textColor}`}>
                            {stat.value}
                          </div>
                          <div className="text-xs text-gray-500">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <Button
                      asChild
                      className={`w-full transition-all duration-300 font-medium bg-gradient-to-r ${service.gradient} hover:opacity-90 shadow-lg hover:shadow-xl group-hover:scale-105`}
                    >
                      <Link href={service.href} className="flex items-center justify-center">
                        Xem bảng giá {service.name.toLowerCase()}
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
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
                  Tư vấn chuyên nghiệp
                </span>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-red-700 to-gray-800 bg-clip-text text-transparent mb-6">
                Cần tư vấn chi tiết về giá cả?
              </h2>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Liên hệ với chúng tôi để được 
                <span className="text-red-600 font-semibold"> tư vấn miễn phí</span> và nhận 
                <span className="text-gray-700 font-semibold"> báo giá tốt nhất</span> cho dự án của bạn
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
