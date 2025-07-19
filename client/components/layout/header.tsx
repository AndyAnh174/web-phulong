"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Phone, Mail, ChevronDown, Palette, Printer } from "lucide-react"
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
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    fetch("http://14.187.218.183:12122/api/config/env")
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch(console.error)
  }, [])

  const navigation = [
    { name: "TRANG CHỦ", href: "/" },
    { 
      name: "BẢNG GIÁ", 
      href: "/pricing",
      hasDropdown: true,
      dropdownItems: [
        { name: "THIẾT KẾ", href: "/pricing/thiet-ke", icon: Palette },
        { name: "IN ẤN", href: "/pricing/in-an", icon: Printer },
      ]
    },
    { name: "SẢN PHẨM", href: "/sanpham" },
    { name: "ĐẶT HÀNG", href: "/order" },
    { name: "LIÊN HỆ", href: "/contact" },
  ]

  const handleMouseEnter = (itemName: string) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setHoveredDropdown(itemName)
  }

  const handleMouseLeave = () => {
    // Set timeout to hide dropdown after 1.5 seconds
    timeoutRef.current = setTimeout(() => {
      setHoveredDropdown(null)
      timeoutRef.current = null
    }, 500)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

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
            {navigation.map((item) => {
              if (item.hasDropdown && item.dropdownItems) {
                const isActive = pathname === item.href || item.dropdownItems.some(subItem => pathname === subItem.href)
                const isHovered = hoveredDropdown === item.name
                
                return (
                  <div 
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(item.name)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      className={cn(
                        "flex items-center gap-1 text-sm font-medium transition-colors hover:text-red-600",
                        isActive ? "text-red-600" : "text-gray-700"
                      )}
                    >
                      {item.name}
                      <ChevronDown className={cn(
                        "h-3 w-3 transition-transform duration-200",
                        isHovered ? "rotate-180" : ""
                      )} />
                    </button>
                    
                    {/* Dropdown menu */}
                    {isHovered && (
                      <div 
                        className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                        onMouseEnter={() => handleMouseEnter(item.name)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="py-1">
                          {item.dropdownItems.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm hover:bg-red-50 hover:text-red-600 transition-colors",
                                pathname === subItem.href ? "text-red-600 bg-red-50" : "text-gray-700"
                              )}
                            >
                              <subItem.icon className="h-4 w-4" />
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              }
              
              return (
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
              )
            })}
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
            {navigation.map((item) => {
              if (item.hasDropdown && item.dropdownItems) {
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="py-2 px-3 text-sm font-medium text-gray-700">
                      {item.name}
                    </div>
                    {item.dropdownItems.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={cn(
                          "flex items-center gap-2 py-2 px-6 rounded-md text-sm font-medium",
                          pathname === subItem.href ? "bg-red-100 text-red-600" : "text-gray-600 hover:bg-red-50"
                        )}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <subItem.icon className="h-4 w-4" />
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )
              }
              
              return (
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
              )
            })}
          </div>
        )}
      </div>
    </header>
  )
}
