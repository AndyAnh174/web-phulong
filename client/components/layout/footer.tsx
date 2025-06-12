"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Phone, Mail, MapPin, Clock } from "lucide-react"

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
    fetch("http://localhost:8000/api/config/env")
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch(console.error)
  }, [])

  const footerLinks = {
    company: [
      { name: "Về chúng tôi", href: "/about" },
      { name: "Chính sách bảo mật", href: "/privacy" },
      { name: "Điều khoản sử dụng", href: "/terms" },
      { name: "Chính sách vận chuyển", href: "/shipping" },
    ],
    support: [
      { name: "Trung tâm hỗ trợ", href: "/support" },
      { name: "Hướng dẫn mua hàng", href: "/guide" },
      { name: "Chính sách đổi trả", href: "/return" },
      { name: "FAQ", href: "/faq" },
    ],
    categories: [
      { name: "Sản phẩm mới", href: "/new" },
      { name: "Sản phẩm bán chạy", href: "/best-sellers" },
      { name: "Khuyến mãi", href: "/promotions" },
      { name: "Sản phẩm nổi bật", href: "/featured" },
    ],
  }

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="https://i.imgur.com/lqVWRpM.png"
                alt={config?.SITE_NAME || "Phú Long"}
                width={120}
                height={40}
                className="object-contain"
              />
            </Link>
            <p className="text-sm text-gray-400 mt-4">
              Chuyên cung cấp các sản phẩm chất lượng cao với giá cả hợp lý. Cam kết mang đến trải nghiệm mua sắm tốt nhất cho khách hàng.
            </p>
            <div className="flex space-x-4">
              {config?.FACEBOOK_URL && (
                <a
                  href={config.FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {config?.INSTAGRAM_URL && (
                <a
                  href={config.INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Công ty</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-3">
              {config?.CONTACT_PHONE && (
                <li className="flex items-start space-x-2">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <span className="text-gray-400 text-sm">{config.CONTACT_PHONE}</span>
                </li>
              )}
              {config?.CONTACT_EMAIL && (
                <li className="flex items-start space-x-2">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <span className="text-gray-400 text-sm">{config.CONTACT_EMAIL}</span>
                </li>
              )}
              {config?.ADDRESS && (
                <li className="flex items-start space-x-2">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <span className="text-gray-400 text-sm">{config.ADDRESS}</span>
                </li>
              )}
              {config?.WORKING_HOURS && (
                <li className="flex items-start space-x-2">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                  <span className="text-gray-400 text-sm">{config.WORKING_HOURS}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} {config?.SITE_NAME || "Phú Long"}. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex space-x-4">
              <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                Chính sách bảo mật
              </Link>
              <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                Điều khoản sử dụng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
