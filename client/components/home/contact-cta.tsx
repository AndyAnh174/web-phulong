"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  ArrowRight,
  Star,
  CheckCircle,
  Users,
  Award,
  Sparkles,
  Headphones,
  MessageCircle,
  Send
} from "lucide-react"
import { motion } from "framer-motion"

const contactMethods = [
  {
    icon: Phone,
    title: "Gọi điện tư vấn",
    content: "0977007763",
    description: "Tư vấn miễn phí 24/7",
    action: "Gọi ngay",
    href: "tel:0977007763",
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50"
  },
  {
    icon: Mail,
    title: "Email hỗ trợ",
    content: "inphulong@gmail.com",
    description: "Phản hồi trong 30 phút",
    action: "Gửi email",
    href: "mailto:inphulong@gmail.com",
    color: "from-gray-500 to-gray-600",
    bgColor: "bg-gray-50"
  },
  {
    icon: MessageCircle,
    title: "Chat trực tuyến",
    content: "Zalo / Facebook",
    description: "Hỗ trợ tức thì",
    action: "Chat ngay",
    href: "#",
    color: "from-red-400 to-red-500",
    bgColor: "bg-red-50"
  }
]

const features = [
  "Tư vấn thiết kế miễn phí",
  "Giao hàng nhanh toàn quốc", 
  "Bảo hành sản phẩm uy tín",
  "Hỗ trợ 24/7 chuyên nghiệp"
]

const stats = [
  {
    icon: Users,
    number: "15K+",
    label: "Khách hàng hài lòng"
  },
  {
    icon: CheckCircle,
    number: "5K+",
    label: "Đơn hàng hoàn thành"
  },
  {
    icon: Award,
    number: "99%",
    label: "Đánh giá tích cực"
  }
]

export default function ContactCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-red-50/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
      <div className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r from-red-50/40 to-transparent"></div>
      <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-gradient-to-tl from-gray-100/30 to-transparent rounded-full blur-3xl"></div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-red-200/30 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${25 + i * 12}%`,
            }}
            animate={{
              y: [0, -25, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.8,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-xl"
          >
            {/* Header */}
            <div className="mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-red-100 to-gray-100 border border-red-200/50 mb-6"
              >
                <Headphones className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-sm font-semibold bg-gradient-to-r from-red-700 to-gray-700 bg-clip-text text-transparent">
                  Liên hệ ngay
                </span>
              </motion.div>

              <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-red-700 to-gray-800 bg-clip-text text-transparent mb-6">
                Bắt đầu dự án
                <br />
                <span className="text-3xl lg:text-4xl">cùng chúng tôi</span>
                <motion.div 
                  className="w-24 h-1.5 bg-gradient-to-r from-red-600 to-gray-500 mt-4 rounded-full"
                  initial={{ width: 0 }}
                  whileInView={{ width: 96 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
              </h2>

              <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
                Nhận 
                <span className="text-red-600 font-semibold"> tư vấn miễn phí</span> và 
                <span className="text-gray-700 font-semibold"> báo giá chi tiết</span> cho dự án in ấn của bạn
              </p>
            </div>

            {/* Features List */}
            <motion.div 
              className="grid sm:grid-cols-2 gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3 group"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                >
                  <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium group-hover:text-red-600 transition-colors duration-300">
                    {feature}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-6 text-base lg:text-lg rounded-xl shadow-xl hover:scale-105 transition-all duration-300 group"
              >
                <Link href="/dat-hang" className="flex items-center justify-center">
                  <Send className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                  Đặt in ngay
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
              
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-gray-300 text-gray-700 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-300 px-8 py-6 text-base lg:text-lg rounded-xl shadow-xl hover:scale-105 transition-all duration-300 group"
              >
                <Link href="/contact" className="flex items-center justify-center">
                  <Phone className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                  Tư vấn miễn phí
                </Link>
              </Button>
            </motion.div>

            {/* Premium Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 1 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-red-50 to-red-100 border border-red-200/50 shadow-lg"
            >
              <Sparkles className="h-4 w-4 text-red-600 mr-2 animate-pulse" />
              <span className="text-sm font-semibold text-red-700">
                Ưu đãi đặc biệt cho khách hàng mới
              </span>
              <Star className="h-4 w-4 text-red-500 ml-2" />
            </motion.div>
          </motion.div>

          {/* Right Content - Contact Methods */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-lg mx-auto"
          >
            <div className="space-y-6">
              {contactMethods.map((method, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.2 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="group"
                >
                  <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-white/90 backdrop-blur-sm group-hover:bg-white">
                    <div className="flex items-center space-x-4">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${method.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <method.icon className="h-6 w-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-red-600 transition-colors duration-300">
                          {method.title}
                        </h3>
                        <p className="text-lg font-semibold text-red-600 mb-1">
                          {method.content}
                        </p>
                        <p className="text-sm text-gray-600 mb-3">
                          {method.description}
                        </p>
                        
                        <Button
                          asChild
                          size="sm"
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white group-hover:scale-105 transition-all duration-300"
                        >
                          <Link href={method.href} className="flex items-center">
                            {method.action}
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 pt-12 border-t border-gray-200"
        >
          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <div className="flex flex-col items-center">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-red-700 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="text-center mt-8"
          >
            <p className="text-gray-600 max-w-2xl mx-auto">
              <span className="text-red-600 font-semibold">Phú Long</span> - 
              Đối tác đáng tin cậy cho mọi nhu cầu in ấn của bạn. 
              Liên hệ ngay để nhận tư vấn và báo giá tốt nhất!
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
