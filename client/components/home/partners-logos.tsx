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
    number: "100+",
    label: "Khách hàng",
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

// Logo đối tác thực tế từ thư mục Logo-doitac
const partners = [
  {
    id: 1,
    name: "Agribank",
    logo: "/Logo-doitac/Argibank_logo.svg.png",
    category: "Ngân hàng",
  },
  {
    id: 2,
    name: "AvaKid",
    logo: "/Logo-doitac/avakid.png",
    category: "Giáo dục",
  },
  {
    id: 3,
    name: "BILCO",
    logo: "/Logo-doitac/BILCO.jpg",
    category: "Xây dựng",
  },
  {
    id: 4,
    name: "Datalogic",
    logo: "/Logo-doitac/datalogic.png",
    category: "Công nghệ",
  },
  {
    id: 5,
    name: "KoreMart",
    logo: "/Logo-doitac/koremart.png",
    category: "Bán lẻ",
  },
  {
    id: 6,
    name: "LILAMA",
    logo: "/Logo-doitac/LILAMA.png",
    category: "Xây dựng",
  },
  {
    id: 7,
    name: "HCMUTE",
    logo: "/Logo-doitac/Logo HCMUTE_Stroke white.png",
    category: "Giáo dục",
  },
  {
    id: 8,
    name: "Mobile World",
    logo: "/Logo-doitac/MWG.png",
    category: "Bán lẻ",
  },
  {
    id: 9,
    name: "TATU School",
    logo: "/Logo-doitac/TATU.png",
    category: "Giáo dục",
  },
  {
    id: 10,
    name: "TCI",
    logo: "/Logo-doitac/tci.png",
    category: "Công nghệ",
  },
  {
    id: 11,
    name: "ThinkSmart",
    logo: "/Logo-doitac/thinksmart.png",
    category: "Công nghệ",
  },
  {
    id: 12,
    name: "TOHIN",
    logo: "/Logo-doitac/TOHIN.png",
    category: "Xây dựng",
  },
  {
    id: 13,
    name: "ĐH Y Dược TP.HCM",
    logo: "/Logo-doitac/download.jpeg",
    category: "Giáo dục",
  },
  {
    id: 14,
    name: "R.E.P Biotech",
    logo: "/Logo-doitac/REP-03.png",
    category: "Công nghệ",
  },
  {
    id: 15,
    name: "R.E.P Trade ",
    logo: "/Logo-doitac/REP-04.png",
    category: "Công nghệ",
  },
  {
    id: 16,
    name: "Plus",
    logo: "/Logo-doitac/REP-05.png",
    category: "Đổi mới",
  },
  {
    id: 17,
    name: "R.E.P Aqua ",
    logo: "/Logo-doitac/REP-06.png",
    category: "Số hóa",
  },
 
  {
    id: 19,
    name: "Thú Y Cún Con",
    logo: "/Logo-doitac/THU Y CUN CON.png",
    category: "Thú y",
  },
];

const trustBadges = [
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
        duration: 0.6
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
        {/* Header */}
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
            className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-gray-100 to-red-100 border border-gray-200/50 mb-8"
          >
            <Handshake className="h-5 w-5 text-gray-600 mr-2" />
            <span className="text-sm font-semibold bg-gradient-to-r from-gray-700 to-red-700 bg-clip-text text-transparent">
              Đối tác
            </span>
            <TrendingUp className="h-5 w-5 text-red-600 ml-2" />
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-red-700 to-gray-800 bg-clip-text text-transparent mb-6">
            ĐỐI TÁC THƯỜNG XUYÊN
            <motion.div 
              className="w-32 h-1.5 bg-gradient-to-r from-gray-500 to-red-600 mx-auto mt-4 rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: 128 }}
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

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
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

        {/* Thanh chạy logo - Scrolling Partners Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8 overflow-hidden">
            {/* Gradient overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white/90 to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white/90 to-transparent z-10"></div>
            
            {/* Scrolling container */}
            <div className="overflow-hidden">
              <motion.div
                className="flex space-x-12 items-center"
                animate={{
                  x: [0, -1920],
                }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 30,
                    ease: "linear",
                  },
                }}
              >
                {/* Duplicate partners array for seamless loop */}
                {[...partners, ...partners].map((partner, index) => (
                  <div
                    key={`${partner.id}-${index}`}
                    className="flex-shrink-0 w-52 h-28 relative group"
                  >
                    <div className="w-full h-full bg-gray-50 rounded-xl p-4 flex items-center justify-center group-hover:bg-white group-hover:scale-110 transition-all duration-300 shadow-sm group-hover:shadow-lg">
                      <Image
                        src={partner.logo}
                        alt={partner.name}
                        fill
                        className="object-contain p-2 transition-all duration-300 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-logo.png';
                        }}
                      />
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Partners Grid */}
       

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center"
        >
         
          
          
        </motion.div>
      </div>
    </section>
  )
} 