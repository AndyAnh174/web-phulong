"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface Config {
  SITE_NAME: string
  CONTACT_PHONE: string
  CONTACT_EMAIL: string
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [config, setConfig] = useState<Config | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    fetch("http://14.187.180.6:12122/api/config/env")
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch(console.error)
  }, [])

  const navigation = [
    { name: "Trang chủ", href: "/" },
   
    { name: "Bảng giá", href: "/pricing" },
    { name: "Blog", href: "/blog" },
    { name: "Đặt hàng", href: "/order" },
    { name: "Liên hệ", href: "/contact" },
  ]

  return (
    <header className="bg-white shadow border-b sticky top-0 z-50">
      {/* Top bar */}
     

      {/* Main nav */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between py-3 relative">
          {/* Logo bên trái */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <Image
                src="https://i.imgur.com/WXSBk46.png"
                alt={config?.SITE_NAME || "Phú Long"}
                width={40}
                height={20}
                className="object-contain"
              />
              <span className="text-lg font-semibold ml-2 text-gray-800 hidden sm:block">
                {config?.SITE_NAME || "Phú Long"}
              </span>
            </Link>
          </div>

          {/* Desktop menu giữa */}
          <nav className="hidden md:flex items-center gap-6 mx-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  pathname === item.href ? "text-red-600" : "text-gray-700 hover:text-red-600"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Mobile menu toggle bên phải */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-red-50 hover:text-red-600 h-9 w-9"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMenuOpen && (
          <div className="md:hidden px-4 pb-3 space-y-1 border-t">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "block py-2 px-3 rounded-md text-sm font-medium",
                  pathname === item.href ? "bg-red-100 text-red-600" : "text-gray-700 hover:bg-red-50"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
