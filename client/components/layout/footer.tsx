"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Phone, Mail, MapPin, Clock, ArrowRight, Star, CheckCircle, Award, Shield } from "lucide-react"
import { motion } from "framer-motion"

interface Config {
  SITE_NAME: string
  CONTACT_PHONE: string
  CONTACT_EMAIL: string
  ADDRESS: string
  WORKING_HOURS: string
  FACEBOOK_URL: string
  INSTAGRAM_URL: string
}

export default function Footer() {
  const [config, setConfig] = useState<Config | null>(null)

  useEffect(() => {
    fetch("http://14.187.180.6:12122/api/config/env")
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch(console.error)
  }, [])

  const footerLinks = {
    services: [
      { name: "In ấn quảng cáo", href: "/" },
      { name: "In ấn văn phòng", href: "/" },
      { name: "In ấn sự kiện", href: "/" },
      { name: "Thiết kế đồ họa", href: "/" },
    ],
    company: [
      { name: "Về chúng tôi", href: "/" },
      { name: "Chính sách bảo mật", href: "/" },
      { name: "Điều khoản sử dụng", href: "/" },
      { name: "Chính sách vận chuyển", href: "/" },
    ],
    support: [
      { name: "Trung tâm hỗ trợ", href: "/" },
      { name: "Hướng dẫn đặt hàng", href: "/" },
      { name: "Chính sách đổi trả", href: "/" },
      { name: "FAQ", href: "/" },
    ],
  }

  const features = [
    { icon: Shield, text: "Bảo hành uy tín", color: "text-blue-400" },
    { icon: Star, text: "Dịch vụ 5 sao", color: "text-red-400" },
  ]

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
      <div className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r from-red-900/20 to-transparent"></div>
      <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-gradient-to-tl from-gray-800/30 to-transparent rounded-full blur-3xl"></div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-red-400/30 rounded-full"
            style={{
              left: `${20 + i * 20}%`,
              top: `${30 + i * 15}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
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

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3"
            >
              <div className="relative w-12 h-12 bg-white rounded-xl shadow-lg p-2">
                <Image
                  src="https://i.imgur.com/WXSBk46.png"
                  alt={config?.SITE_NAME || "Phú Long"}
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
                  {config?.SITE_NAME || "Phú Long"}
                </h3>
                <p className="text-sm text-gray-400">Dịch vụ in ấn chuyên nghiệp</p>
              </div>
            </motion.div>
            
            <motion.p 
              className="text-sm text-gray-400 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Chuyên cung cấp dịch vụ in ấn chất lượng cao với công nghệ hiện đại. 
              Cam kết mang đến sản phẩm hoàn hảo và dịch vụ tận tâm cho mọi khách hàng.
            </motion.p>

            {/* Features */}
            <motion.div 
              className="grid grid-cols-2 gap-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-2 text-sm"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                >
                  <feature.icon className={`h-4 w-4 ${feature.color}`} />
                  <span className="text-gray-400">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Social Links */}
            <motion.div 
              className="flex space-x-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              {config?.FACEBOOK_URL && (
                <a
                  href={config.FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg shadow-lg hover:scale-110 transition-all duration-300"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {config?.INSTAGRAM_URL && (
                <a
                  href={config.INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg shadow-lg hover:scale-110 transition-all duration-300"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
            </motion.div>
          </div>

          {/* Services Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-white font-semibold mb-6 text-lg">Dịch vụ</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-red-400 transition-colors text-sm flex items-center group"
                  >
                    <ArrowRight className="h-3 w-3 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-white font-semibold mb-6 text-lg">Công ty</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-red-400 transition-colors text-sm flex items-center group"
                  >
                    <ArrowRight className="h-3 w-3 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h3 className="text-white font-semibold mb-6 text-lg">Liên hệ</h3>
            <ul className="space-y-4">
              {config?.CONTACT_PHONE && (
                <li className="flex items-start space-x-3">
                  <div className="p-2 bg-gradient-to-r from-red-600 to-red-700 rounded-lg">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Điện thoại</p>
                    <p className="text-white font-medium">0977007763</p>
                  </div>
                </li>
              )}
              {config?.CONTACT_EMAIL && (
                <li className="flex items-start space-x-3">
                  <div className="p-2 bg-gradient-to-r from-red-600 to-red-700 rounded-lg">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white font-medium">{config.CONTACT_EMAIL}</p>
                  </div>
                </li>
              )}
              {config?.ADDRESS && (
                <li className="flex items-start space-x-3">
                  <div className="p-2 bg-gradient-to-r from-red-600 to-red-700 rounded-lg">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Địa chỉ</p>
                    <p className="text-white font-medium text-sm">{config.ADDRESS}</p>
                  </div>
                </li>
              )}
              {config?.WORKING_HOURS && (
                <li className="flex items-start space-x-3">
                  <div className="p-2 bg-gradient-to-r from-red-600 to-red-700 rounded-lg">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Giờ làm việc</p>
                    <p className="text-white font-medium text-sm">{config.WORKING_HOURS}</p>
                  </div>
                </li>
              )}
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 relative z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <motion.p 
              className="text-sm text-gray-400"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              © {new Date().getFullYear()} {config?.SITE_NAME || "Phú Long"}. Tất cả quyền được bảo lưu.
            </motion.p>
            <motion.div 
              className="flex space-x-6"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link href="/" className="text-sm text-gray-400 hover:text-red-400 transition-colors">
                Chính sách bảo mật
              </Link>
              <Link href="/" className="text-sm text-gray-400 hover:text-red-400 transition-colors">
                Điều khoản sử dụng
              </Link>
              <Link href="/" className="text-sm text-gray-400 hover:text-red-400 transition-colors">
                Sitemap
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  )
}
