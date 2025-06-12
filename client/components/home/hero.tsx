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
  FileText
} from "lucide-react"
import { motion } from "framer-motion"

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Enhanced Background with White Gray Red theme */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('https://i.imgur.com/WXSBk46.png')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-gray-50/90 to-red-50/80"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
      </div>

      {/* Simplified Animated Elements with red theme */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 right-20 w-3 h-3 bg-red-500 rounded-full opacity-60"
          animate={{
            y: [0, -15, 0],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 left-20 w-2 h-2 bg-gray-400 rounded-full opacity-50"
          animate={{
            y: [0, 10, 0],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      {/* Decorative Gradient Orbs with white gray red theme */}
      <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-red-100/30 to-transparent opacity-80"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-gray-200/20 to-transparent rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[80vh]">
          {/* Left Content */}
          <motion.div 
            className="text-gray-800 space-y-6 lg:space-y-8 py-8 lg:py-0 max-w-xl"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Premium Badge with red accent */}
            <motion.div 
              className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-red-50 to-red-100 border border-red-200/50 backdrop-blur-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <Sparkles className="h-4 w-4 text-red-600 mr-2" />
              <span className="text-sm font-semibold text-red-700">
                Dịch vụ in ấn hàng đầu Việt Nam
              </span>
              <Star className="h-4 w-4 text-red-500 ml-2" />
            </motion.div>

            {/* Main Heading - White Gray Red theme */}
            <motion.h1 
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <span className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 bg-clip-text text-transparent">
                Phú Long
              </span>
              <br />
              <span className="text-gray-800 text-2xl sm:text-3xl lg:text-4xl xl:text-5xl">
               Dịch vụ in ấn
              </span>
              <br />
              <span className="bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent text-2xl sm:text-3xl lg:text-4xl xl:text-5xl">
                chuyên nghiệp
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p 
              className="text-lg lg:text-xl text-gray-600 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Chúng tôi cung cấp giải pháp in ấn toàn diện với 
              <span className="text-red-600 font-semibold"> công nghệ hiện đại</span>, 
              đảm bảo chất lượng và thời gian giao hàng 
              <span className="text-gray-700 font-semibold"> nhanh chóng</span>.
            </motion.p>

            {/* Action Buttons - Updated with new colors */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-6 text-base lg:text-lg rounded-xl shadow-xl hover:shadow-red-500/25 hover:scale-105 transition-all duration-300 group"
              >
                <Link href="/dat-hang" className="flex items-center justify-center">
                  <Phone className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                  Đặt in ngay
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:text-red-600 hover:border-red-300 px-8 py-6 text-base lg:text-lg rounded-xl shadow-xl hover:scale-105 transition-all duration-300 group"
              >
                <Link href="/pricing" className="flex items-center justify-center">
                  <FileText className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  Xem bảng giá
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
            </motion.div>

            {/* Updated Features Grid with white gray red theme */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              {[
                { icon: CheckCircle, title: "Chất lượng cao", desc: "Độ sắc nét tuyệt đối", color: "from-red-500 to-red-600" },
                { icon: Clock, title: "Giao hàng nhanh", desc: "Đúng hẹn 24h", color: "from-gray-500 to-gray-600" },
                { icon: Shield, title: "Bảo hành uy tín", desc: "Chính sách rõ ràng", color: "from-red-400 to-red-500" },
                { icon: Award, title: "Tư vấn chuyên nghiệp", desc: "Hỗ trợ 24/7", color: "from-gray-600 to-gray-700" }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3 group cursor-pointer p-3 rounded-lg hover:bg-red-50 transition-colors duration-300"
                  whileHover={{ scale: 1.02, x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${feature.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 group-hover:text-red-600 transition-colors duration-300 text-sm lg:text-base">
                      {feature.title}
                    </h3>
                    <p className="text-xs lg:text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Optimized Image with red overlay */}
          <motion.div 
            className="relative hidden lg:block max-w-lg mx-auto"
            initial={{ opacity: 0, x: 30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <div className="relative w-full h-[500px] xl:h-[600px] rounded-2xl overflow-hidden transform hover:scale-105 hover:rotate-1 transition-all duration-700 shadow-2xl group">
              {/* Updated overlay with white gray red theme */}
              <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 via-transparent to-gray-100/10 z-10 group-hover:from-red-900/30 transition-all duration-700"></div>
              
              <Image
                src="/LOGO-MÀU.png"
                alt="Phú Long Logo - Premium Printing Services"
                fill
                className="object-contain transition-all duration-700 group-hover:scale-110 group-hover:rotate-1 animate-pulse"
                priority
                sizes="(max-width: 1024px) 0vw, 50vw"
                onError={(e) => {
                  e.currentTarget.src = "/api/placeholder/600/500"
                }}
              />
              
              {/* Lấp lánh effects */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 rounded-full opacity-70"
                    style={{
                      left: `${20 + i * 15}%`,
                      top: `${15 + i * 12}%`,
                    }}
                    animate={{
                      scale: [0, 1.5, 0],
                      opacity: [0, 1, 0],
                      x: [0, 10, -10, 0],
                      y: [0, -10, 10, 0],
                    }}
                    transition={{
                      duration: 2 + i * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.3,
                    }}
                  />
                ))}
              </div>
              
              {/* Shimmer overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              {/* Floating quality badges with updated colors */}
              <motion.div
                className="absolute top-4 right-4 z-20"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.5 }}
              >
                <Badge className="bg-red-500/90 hover:bg-red-600 text-white px-3 py-1 backdrop-blur-lg text-sm shadow-lg">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Chất lượng cao
                </Badge>
              </motion.div>
              
              <motion.div
                className="absolute bottom-4 left-4 z-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.7 }}
              >
                <Badge className="bg-gray-600/90 hover:bg-gray-700 text-white px-3 py-1 backdrop-blur-lg text-sm shadow-lg">
                  <Clock className="h-3 w-3 mr-1" />
                  Giao nhanh 24h
                </Badge>
              </motion.div>
            </div>

            {/* Updated decorative elements */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-red-200/30 to-red-300/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-gray-200/30 to-gray-300/20 rounded-full blur-xl"></div>
          </motion.div>
        </div>
      </div>

      {/* Wave Divider with white theme */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-16 lg:h-20 text-gray-50" viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path
            fill="currentColor"
            d="M0,40 C150,80 350,0 500,40 C650,80 850,0 1000,40 C1150,80 1350,0 1440,40 L1440,80 L0,80 Z"
          />
        </svg>
      </div>
    </section>
  )
}
