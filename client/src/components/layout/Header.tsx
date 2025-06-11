"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { FaPhone, FaEnvelope, FaBars } from 'react-icons/fa';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const navigationItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Dịch vụ', href: '/services' },
    { label: 'Bảng giá', href: '/pricing' },
    { label: 'Blog', href: '/blog' },
    { label: 'Đặt hàng', href: '/orders' },
    { label: 'Liên hệ', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
      {/* Top bar with contact info */}
      <div className="bg-gray-800 text-white py-2 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <FaPhone className="w-3 h-3" />
                <span>{process.env.NEXT_PUBLIC_CONTACT_PHONE}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaEnvelope className="w-3 h-3" />
                <span>{process.env.NEXT_PUBLIC_CONTACT_EMAIL}</span>
              </div>
            </div>
            <div className="text-sm">
              Thời gian làm việc: 8:00 - 17:30 (T2-T7)
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 relative">
              <Image
                src="/logo/LOGO-MÀU.png"
                alt="Phú Long Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Phú Long</h1>
              <p className="text-xs text-gray-600">Dịch vụ in ấn chuyên nghiệp</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-red-600 font-medium transition-colors duration-200 relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Action buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/admin')}
              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
            >
              Quản trị
            </Button>
            <Button
              onClick={() => router.push('/orders')}
              className="brand-red text-white hover:opacity-90"
            >
              Đặt hàng ngay
            </Button>
          </div>

          {/* Mobile menu button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <FaBars className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-8">
                {/* Logo in mobile menu */}
                <div className="flex items-center space-x-3 pb-4 border-b">
                  <div className="w-10 h-10 relative">
                    <Image
                      src="/logo/LOGO-MÀU.png"
                      alt="Phú Long Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Phú Long</h2>
                    <p className="text-xs text-gray-600">Dịch vụ in ấn</p>
                  </div>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex flex-col space-y-4">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="text-gray-700 hover:text-red-600 font-medium py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                {/* Mobile action buttons */}
                <div className="flex flex-col space-y-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsOpen(false);
                      router.push('/admin');
                    }}
                    className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    Quản trị
                  </Button>
                  <Button
                    onClick={() => {
                      setIsOpen(false);
                      router.push('/orders');
                    }}
                    className="brand-red text-white hover:opacity-90"
                  >
                    Đặt hàng ngay
                  </Button>
                </div>

                {/* Contact info in mobile */}
                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FaPhone className="w-3 h-3" />
                    <span>{process.env.NEXT_PUBLIC_CONTACT_PHONE}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FaEnvelope className="w-3 h-3" />
                    <span>{process.env.NEXT_PUBLIC_CONTACT_EMAIL}</span>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header; 