"use client"

import { Award, Users, Clock, Shield, CheckCircle, TrendingUp, Star, Zap } from "lucide-react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AboutSection() {
  const stats = [
    {
      icon: Users,
      number: "1000+",
      label: "Khách hàng tin tưởng",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      description: "Phục vụ hàng ngàn khách hàng trên toàn quốc"
    },
    {
      icon: Award,
      number: "10+",
      label: "Năm kinh nghiệm",
      color: "from-gray-500 to-gray-600",
      bgColor: "bg-gray-50",
      description: "Hơn một thập kỷ trong ngành in ấn"
    },
    {
      icon: Clock,
      number: "24/7",
      label: "Hỗ trợ khách hàng",
      color: "from-red-400 to-red-500",
      bgColor: "bg-red-50",
      description: "Luôn sẵn sàng hỗ trợ mọi lúc mọi nơi"
    },
    {
      icon: Shield,
      number: "100%",
      label: "Cam kết chất lượng",
      color: "from-gray-600 to-gray-700",
      bgColor: "bg-gray-50",
      description: "Đảm bảo chất lượng sản phẩm tuyệt đối"
    },
  ]

  const features = [
    {
      title: "Chất lượng",
      description: "Sản phẩm đạt tiêu chuẩn quốc tế với công nghệ hiện đại",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      icon: CheckCircle
    },
    {
      title: "Công nghệ",
      description: "Máy móc hiện đại nhập khẩu từ Nhật Bản và Đức",
      color: "from-gray-500 to-gray-600",
      bgColor: "bg-gray-50",
      icon: Zap
    },
    {
      title: "Dịch vụ",
      description: "Tư vấn chuyên nghiệp và hỗ trợ tận tình 24/7",
      color: "from-red-400 to-red-500",
      bgColor: "bg-red-50",
      icon: Star
    },
    {
      title: "Giao hàng",
      description: "Nhanh chóng, đúng hẹn và an toàn trên toàn quốc",
      color: "from-gray-600 to-gray-700",
      bgColor: "bg-gray-50",
      icon: TrendingUp
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
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
      <div className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r from-red-50/30 to-transparent"></div>
      <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-gradient-to-tl from-gray-100/30 to-transparent rounded-full blur-3xl"></div>

      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-gradient-to-r from-red-300 to-gray-300 rounded-full opacity-20"
            style={{
              left: `${30 + i * 25}%`,
              top: `${20 + i * 15}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.5,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 lg:px-8 max-w-7xl relative z-10">
        <motion.div
          className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Left Content */}
          <motion.div variants={itemVariants} className="max-w-xl">
            <div className="space-y-8">
              {/* Header */}
              <div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-red-100 to-gray-100 border border-red-200/50 mb-6"
                >
                  <Award className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-sm font-semibold bg-gradient-to-r from-red-700 to-gray-700 bg-clip-text text-transparent">
                    Về Chúng Tôi
                  </span>
                </motion.div>

                <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-red-700 to-gray-800 bg-clip-text text-transparent mb-6">
                  Đội ngũ chuyên nghiệp
                  <motion.div 
                    className="w-20 h-1.5 bg-gradient-to-r from-red-600 to-gray-500 mt-4 rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: 80 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />
                </h2>
              </div>

              {/* Description */}
              <div className="space-y-6">
                <p className="text-lg text-gray-600 leading-relaxed">
                  <span className="text-red-600 font-semibold">Phú Long</span> là công ty hàng đầu trong lĩnh vực in ấn tại Việt Nam với 
                  <span className="text-gray-700 font-semibold"> hơn 10 năm kinh nghiệm</span>. Chúng tôi cam kết mang đến cho khách hàng những 
                  sản phẩm in ấn chất lượng cao nhất với công nghệ hiện đại và dịch vụ chuyên nghiệp.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Với đội ngũ nhân viên giàu kinh nghiệm và hệ thống máy móc hiện đại, chúng tôi tự tin đáp ứng mọi nhu cầu
                  in ấn từ cá nhân đến doanh nghiệp lớn với 
                  <span className="text-red-600 font-semibold"> chất lượng vượt trội</span> và 
                  <span className="text-gray-700 font-semibold"> dịch vụ hoàn hảo</span>.
                </p>
              </div>

              {/* Stats Grid */}
              <motion.div 
                className="grid sm:grid-cols-2 gap-6"
                variants={containerVariants}
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="group"
                  >
                    <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <stat.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                            {stat.number}
                          </div>
                          <div className="text-gray-900 font-semibold mb-1">{stat.label}</div>
                          <div className="text-sm text-gray-600">{stat.description}</div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* Trust badges */}
              <motion.div 
                className="flex flex-wrap gap-3"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <Badge className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 shadow-lg">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  ISO 9001:2015
                </Badge>
                <Badge className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 shadow-lg">
                  <Star className="h-4 w-4 mr-2" />
                  Top Choice 2024
                </Badge>
                <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 shadow-lg">
                  <Award className="h-4 w-4 mr-2" />
                  Trusted Partner
                </Badge>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Content - Enhanced Features Grid */}
          <motion.div 
            className="relative max-w-lg mx-auto"
            variants={itemVariants}
          >
            <div className="grid grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className={`${index % 2 === 1 ? 'mt-8' : ''}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.05 }}
                >
                  <Card className="p-6 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/90 backdrop-blur-sm group">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg mx-auto w-16 h-16 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 mb-3 text-center group-hover:text-red-600 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 text-center leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-red-200/20 to-red-300/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-12 h-12 bg-gradient-to-br from-gray-200/20 to-gray-300/10 rounded-full blur-xl"></div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
