"use client";

import React from 'react';
import Link from 'next/link';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram, FaYoutube, FaLinkedin } from 'react-icons/fa';
import { HiPrinter } from 'react-icons/hi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const services = [
    'In offset',
    'In digital',
    'In nhãn sticker',
    'In canvas/poster',
    'In catalogue',
    'In name card',
  ];

  const quickLinks = [
    { label: 'Về chúng tôi', href: '/about' },
    { label: 'Dịch vụ', href: '/services' },
    { label: 'Bảng giá', href: '/pricing' },
    { label: 'Blog', href: '/blog' },
    { label: 'Liên hệ', href: '/contact' },
    { label: 'Chính sách bảo mật', href: '/privacy' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 brand-red rounded-lg flex items-center justify-center">
                <HiPrinter className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Phú Long</h3>
                <p className="text-sm text-gray-400">Dịch vụ in ấn chuyên nghiệp</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Với hơn 10 năm kinh nghiệm trong ngành in ấn, Phú Long cam kết mang đến 
              cho khách hàng những sản phẩm chất lượng cao với giá cả hợp lý.
            </p>
            
            {/* Social media */}
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                aria-label="Facebook"
              >
                <FaFacebook className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                aria-label="Instagram"
              >
                <FaInstagram className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                aria-label="YouTube"
              >
                <FaYoutube className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Dịch vụ chính</h4>
            <ul className="space-y-2">
              {services.map((service, index) => (
                <li key={index}>
                  <Link 
                    href="/services" 
                    className="text-gray-300 hover:text-white text-sm transition-colors duration-200"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Liên kết nhanh</h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href} 
                    className="text-gray-300 hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Thông tin liên hệ</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <FaMapMarkerAlt className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
                <p className="text-gray-300 text-sm">
                  123 Đường ABC, Phường XYZ<br />
                  Quận 1, TP. Hồ Chí Minh
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <FaPhone className="w-4 h-4 text-red-400" />
                <a 
                  href="tel:0123456789" 
                  className="text-gray-300 hover:text-white text-sm transition-colors duration-200"
                >
                  0123 456 789
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <FaEnvelope className="w-4 h-4 text-red-400" />
                <a 
                  href="mailto:info@phulong.com" 
                  className="text-gray-300 hover:text-white text-sm transition-colors duration-200"
                >
                  info@phulong.com
                </a>
              </div>
            </div>

            {/* Working hours */}
            <div className="pt-4 border-t border-gray-800">
              <h5 className="text-sm font-semibold text-white mb-2">Giờ làm việc</h5>
              <div className="text-gray-300 text-sm space-y-1">
                <p>Thứ 2 - Thứ 6: 8:00 - 17:30</p>
                <p>Thứ 7: 8:00 - 12:00</p>
                <p>Chủ nhật: Nghỉ</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom footer */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} Phú Long. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors duration-200">
                Điều khoản sử dụng
              </Link>
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors duration-200">
                Chính sách bảo mật
              </Link>
              <Link href="/sitemap" className="text-gray-400 hover:text-white transition-colors duration-200">
                Sơ đồ trang web
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 