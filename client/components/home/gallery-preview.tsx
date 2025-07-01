"use client"

import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Eye, 
  Heart, 
  Share2, 
  Download,
  Star,
  ArrowRight,
  Sparkles,
  Palette
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

const galleryItems = [
  {
    id: 1,
    title: "Catalog cao cấp",
    category: "Catalog",
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    description: "Thiết kế catalog chuyên nghiệp cho doanh nghiệp",
    likes: 128,
    featured: true
  },
  {
    id: 2,
    title: "Brochure sáng tạo",
    category: "Brochure",
    image: "https://images.unsplash.com/photo-1542744094-3a31f272c490?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    description: "Brochure 3 tấm với thiết kế hiện đại",
    likes: 95,
    featured: false
  },
  {
    id: 3,
    title: "Menu nhà hàng",
    category: "Menu",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    description: "Menu nhà hàng phong cách luxury",
    likes: 167,
    featured: true
  },
  {
    id: 4,
    title: "Poster sự kiện",
    category: "Poster",
    image: "https://images.unsplash.com/photo-1528716321680-815a8cdb8cbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    description: "Poster sự kiện với typography ấn tượng",
    likes: 203,
    featured: false
  },
  {
    id: 5,
    title: "Name card doanh nhân",
    category: "Name Card",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    description: "Name card với hiệu ứng nhũ vàng",
    likes: 89,
    featured: true
  },
  {
    id: 6,
    title: "Flyer quảng cáo",
    category: "Flyer",
    image: "https://images.unsplash.com/photo-1493612276216-ee3925520721?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    description: "Flyer A5 với màu sắc bắt mắt",
    likes: 142,
    featured: false
  }
]

const categories = ["Tất cả", "Catalog", "Brochure", "Menu", "Poster", "Name Card", "Flyer"]

export default function GalleryPreview() {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả")
  const [likedItems, setLikedItems] = useState<number[]>([])

  const filteredItems = selectedCategory === "Tất cả" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === selectedCategory)

  const handleLike = (id: number) => {
    setLikedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    )
  }

  return (
    <section className="py-20 bg-gradient-to-br from-white via-gray-50 to-red-50/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
      <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-red-50/50 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-gray-100/30 to-transparent rounded-full blur-3xl"></div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-red-300/40 rounded-full"
            style={{
              left: `${25 + i * 20}%`,
              top: `${30 + i * 15}%`,
            }}
            animate={{
              y: [0, -25, 0],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.8,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Header with Logo */}
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
            className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-red-100 to-gray-100 border border-red-200/50 mb-6"
          >
            <div className="relative w-5 h-5 mr-2">
              <Image
                src="https://i.imgur.com/WXSBk46.png"
                alt="Phú Long"
                fill
                className="object-contain"
              />
            </div>
            <Palette className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-sm font-semibold bg-gradient-to-r from-red-700 to-gray-700 bg-clip-text text-transparent">
              Thư viện mẫu thiết kế
            </span>
            <Sparkles className="h-5 w-5 text-gray-600 ml-2" />
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-red-700 to-gray-800 bg-clip-text text-transparent mb-6">
            Mẫu in ấn đẹp
            <motion.div 
              className="w-24 h-1.5 bg-gradient-to-r from-red-600 to-gray-500 mx-auto mt-4 rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: 96 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Khám phá bộ sưu tập thiết kế 
            <span className="text-red-600 font-semibold"> chuyên nghiệp</span> và 
            <span className="text-gray-700 font-semibold"> sáng tạo</span> của chúng tôi
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === category
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25"
                  : "bg-white text-gray-600 hover:bg-red-50 hover:text-red-600 border border-gray-200 hover:border-red-200"
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Gallery Grid */}
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group"
            >
              <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/90 backdrop-blur-sm">
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Logo overlay on hover */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg"
                  >
                    <div className="relative w-8 h-8">
                      <Image
                        src="https://i.imgur.com/WXSBk46.png"
                        alt="Phú Long"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </motion.div>

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-red-600/90 backdrop-blur-sm text-white border-0 hover:bg-red-700/90 transition-colors duration-300">
                      {item.category}
                    </Badge>
                  </div>

                  {/* Featured Badge */}
                  {item.featured && (
                    <div className="absolute top-4 left-20">
                      <Badge className="bg-yellow-500/90 backdrop-blur-sm text-white border-0">
                        <Star className="h-3 w-3 mr-1" />
                        Nổi bật
                      </Badge>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white hover:text-red-600 rounded-lg shadow-lg"
                      onClick={() => handleLike(item.id)}
                    >
                      <Heart className={`h-4 w-4 ${likedItems.includes(item.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white hover:text-red-600 rounded-lg shadow-lg"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white hover:text-red-600 rounded-lg shadow-lg"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-red-600 transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Heart className="h-4 w-4" />
                      <span>{item.likes} lượt thích</span>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg shadow-md hover:scale-105 transition-all duration-300"
                    >
                      <Link href={`/services?category=${item.category}`} className="flex items-center">
                        <Eye className="mr-2 h-4 w-4" />
                        Xem thêm
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Brand Trust Footer */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-red-50 to-gray-50 rounded-2xl p-8 border border-red-200/50 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="relative w-16 h-16 bg-white rounded-xl shadow-lg p-3 border border-red-200/50">
                <Image
                  src="https://i.imgur.com/WXSBk46.png"
                  alt="Phú Long"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-red-700 to-gray-700 bg-clip-text text-transparent">
                  Thiết kế chuyên nghiệp
                </h3>
                <p className="text-gray-600">Đội ngũ thiết kế giàu kinh nghiệm và sáng tạo</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2 justify-center">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Thiết kế độc quyền</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Palette className="h-4 w-4 text-red-500" />
                <span>Màu sắc chính xác</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Eye className="h-4 w-4 text-red-500" />
                <span>Chất lượng cao</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Sparkles className="h-4 w-4 text-red-500" />
                <span>Sáng tạo không giới hạn</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 