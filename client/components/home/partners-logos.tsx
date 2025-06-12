"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Award, 
  Clock, 
  Star,
  Handshake,
  TrendingUp,
  Shield,
  CheckCircle
} from "lucide-react"
import { motion } from "framer-motion"

const stats = [
  {
    icon: Users,
    number: "50+",
    label: "Đối tác tin cậy",
    color: "from-red-500 to-red-600"
  },
  {
    icon: TrendingUp,
    number: "1000+",
    label: "Khách hàng hài lòng",
    color: "from-gray-500 to-gray-600"
  },
  {
    icon: Clock,
    number: "5+",
    label: "Năm hợp tác",
    color: "from-red-400 to-red-500"
  },
  {
    icon: Star,
    number: "100%",
    label: "Chất lượng cam kết",
    color: "from-gray-600 to-gray-700"
  }
]

const partners = [
  {
    id: 1,
    name: "FPT Corporation",
    logo: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    category: "Công nghệ",
    description: "Đối tác chiến lược trong lĩnh vực công nghệ"
  },
  {
    id: 2,
    name: "Vingroup",
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    category: "Tập đoàn",
    description: "Hợp tác dài hạn trong các dự án lớn"
  },
  {
    id: 3,
    name: "Vietcombank",
    logo: "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    category: "Ngân hàng",
    description: "Đối tác tài chính đáng tin cậy"
  },
  {
    id: 4,
    name: "Samsung Vietnam",
    logo: "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    category: "Điện tử",
    description: "Cung cấp giải pháp in ấn chuyên nghiệp"
  },
  {
    id: 5,
    name: "Grab Vietnam",
    logo: "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    category: "Công nghệ",
    description: "Đồng hành trong chiến dịch marketing"
  },
  {
    id: 6,
    name: "Unilever Vietnam",
    logo: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    category: "FMCG",
    description: "Hỗ trợ in ấn cho các sản phẩm tiêu dùng"
  }
]

const trustBadges = [
  {
    title: "ISO 9001:2015",
    subtitle: "Chứng nhận chất lượng quốc tế",
    icon: Shield,
    color: "from-red-600 to-red-700"
  },
  {
    title: "Top Choice 2024",
    subtitle: "Lựa chọn hàng đầu năm 2024",
    icon: Award,
    color: "from-gray-600 to-gray-700"
  },
  {
    title: "Trusted Partner",
    subtitle: "Đối tác đáng tin cậy",
    icon: CheckCircle,
    color: "from-red-500 to-red-600"
  }
]

export default function PartnersLogos() {
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
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  return (
    <section className="py-20 bg-gradient-to-br from-white via-gray-50 to-red-50/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
      <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-red-50/40 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-gray-100/30 to-transparent rounded-full blur-3xl"></div>

      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-red-200/40 rounded-full"
            style={{
              left: `${15 + i * 20}%`,
              top: `${20 + i * 15}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-gray-100 to-red-100 border border-gray-200/50 mb-8"
          >
            <Handshake className="h-5 w-5 text-gray-600 mr-2" />
            <span className="text-sm font-semibold bg-gradient-to-r from-gray-700 to-red-700 bg-clip-text text-transparent">
              Đối tác & Thành tựu
            </span>
            <TrendingUp className="h-5 w-5 text-red-600 ml-2" />
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group"
              >
                <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm text-center">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} mx-auto w-16 h-16 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Partners Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-red-700 to-gray-800 bg-clip-text text-transparent mb-6">
            Đối tác tin cậy
            <motion.div 
              className="w-24 h-1.5 bg-gradient-to-r from-gray-500 to-red-600 mx-auto mt-4 rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: 96 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Chúng tôi tự hào được 
            <span className="text-red-600 font-semibold"> đồng hành</span> cùng những 
            <span className="text-gray-700 font-semibold"> thương hiệu hàng đầu</span> Việt Nam
          </p>
        </motion.div>

        {/* Partners Grid */}
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {partners.map((partner, index) => (
            <motion.div
              key={partner.id}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group"
            >
              <Card className="relative p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-white/90 backdrop-blur-sm text-center group-hover:bg-white">
                {/* Company logo */}
                <div className="relative w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-2xl overflow-hidden group-hover:scale-110 transition-transform duration-300">
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    fill
                    className="object-contain p-4"
                  />
                </div>

                {/* Company info */}
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-red-600 transition-colors duration-300">
                  {partner.name}
                </h3>
                
                <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 mb-3">
                  {partner.category}
                </Badge>
                
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  {partner.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center"
        >
          <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-8">
            Chứng nhận & Giải thưởng
          </h3>
          
          <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
            {trustBadges.map((badge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group"
              >
                <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm min-w-[200px]">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${badge.color} mx-auto w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <badge.icon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2 group-hover:text-red-600 transition-colors duration-300">
                    {badge.title}
                  </h4>
                  <p className="text-sm text-gray-600">{badge.subtitle}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
} 