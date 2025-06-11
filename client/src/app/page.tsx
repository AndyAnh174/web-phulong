"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FaPrint, 
  FaImages, 
  FaTag, 
  FaNewspaper, 
  FaAddressCard, 
  FaPalette,
  FaCheckCircle,
  FaStar,
  FaQuoteLeft,
  FaArrowRight
} from 'react-icons/fa';
import { HiPrinter } from 'react-icons/hi';

export default function HomePage() {
  const featuredServices = [
    {
      id: 1,
      name: 'In Offset chất lượng cao',
      description: 'Dịch vụ in offset chuyên nghiệp cho số lượng lớn với chất lượng tuyệt vời',
      price: 'Từ 500đ/tờ',
      icon: FaPrint,
      category: 'In Offset',
      featured: true
    },
    {
      id: 2,
      name: 'In Digital nhanh chóng',
      description: 'In digital chất lượng cao, giao hàng nhanh cho số lượng nhỏ',
      price: 'Từ 2,000đ/tờ',
      icon: FaImages,
      category: 'In Digital',
      featured: true
    },
    {
      id: 3,
      name: 'In nhãn Sticker',
      description: 'In nhãn sticker đa dạng kích thước và chất liệu',
      price: 'Từ 1,500đ/tờ',
      icon: FaTag,
      category: 'Nhãn Sticker',
      featured: true
    },
    {
      id: 4,
      name: 'In Catalogue',
      description: 'Thiết kế và in catalogue chuyên nghiệp',
      price: 'Từ 15,000đ/cuốn',
      icon: FaNewspaper,
      category: 'Catalogue',
      featured: true
    },
    {
      id: 5,
      name: 'In Name Card',
      description: 'Thiết kế và in name card cao cấp',
      price: 'Từ 100,000đ/hộp',
      icon: FaAddressCard,
      category: 'Name Card',
      featured: true
    },
    {
      id: 6,
      name: 'Thiết kế đồ họa',
      description: 'Dịch vụ thiết kế đồ họa chuyên nghiệp',
      price: 'Từ 200,000đ/design',
      icon: FaPalette,
      category: 'Thiết kế',
      featured: true
    }
  ];

  const advantages = [
    {
      icon: FaCheckCircle,
      title: 'Chất lượng đảm bảo',
      description: 'Sử dụng máy móc hiện đại và nguyên liệu cao cấp'
    },
    {
      icon: FaCheckCircle,
      title: 'Giao hàng nhanh',
      description: 'Cam kết giao hàng đúng thời gian theo yêu cầu'
    },
    {
      icon: FaCheckCircle,
      title: 'Giá cả hợp lý',
      description: 'Báo giá cạnh tranh, phù hợp với mọi ngân sách'
    },
    {
      icon: FaCheckCircle,
      title: 'Hỗ trợ 24/7',
      description: 'Đội ngũ tư vấn chuyên nghiệp, hỗ trợ mọi lúc'
    }
  ];

  const testimonials = [
    {
      name: 'Nguyễn Văn A',
      company: 'Công ty ABC',
      content: 'Dịch vụ in ấn của Phú Long rất chuyên nghiệp, chất lượng tốt và giao hàng đúng hẹn.',
      rating: 5
    },
    {
      name: 'Trần Thị B',
      company: 'Shop XYZ',
      content: 'Tôi đã sử dụng dịch vụ in nhãn sticker nhiều lần, rất hài lòng về chất lượng.',
      rating: 5
    },
    {
      name: "Lê Thị C",
      content: "Nhân viên Phú Long rất nhiệt tình, tư vấn chi tiết. Sản phẩm đúng như mong đợi!",
      rating: 5,
      company: "Công ty TNHH DEF"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white py-20 hero-pattern">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <Badge className="bg-white/20 text-white border-white/30">
                Dịch vụ in ấn chuyên nghiệp
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Phú Long
                <span className="block text-red-100">In Ấn Chất Lượng</span>
              </h1>
              <p className="text-xl text-red-100 leading-relaxed">
                Với hơn 10 năm kinh nghiệm, chúng tôi cam kết mang đến cho bạn 
                những sản phẩm in ấn chất lượng cao với giá cả hợp lý và dịch vụ tốt nhất.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-red-600 hover:bg-gray-100 text-lg px-8 py-3"
                  asChild
                >
                  <Link href="/orders/create">
                    Đặt hàng ngay
                    <FaArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white text-white hover:bg-white hover:text-red-600 text-lg px-8 py-3"
                  asChild
                >
                  <Link href="/services">
                    Xem dịch vụ
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="relative animate-slide-up">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto">
                    <HiPrinter className="w-10 h-10 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold">Báo giá miễn phí</h3>
                  <p className="text-red-100">
                    Liên hệ ngay để nhận báo giá tốt nhất cho dự án của bạn
                  </p>
                  <Button 
                    className="bg-white text-red-600 hover:bg-gray-100 w-full"
                    asChild
                  >
                    <Link href="/contact">
                      Liên hệ ngay
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Dịch vụ nổi bật
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Những dịch vụ in ấn chuyên nghiệp được khách hàng tin tưởng và lựa chọn nhiều nhất
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.map((service) => {
              const IconComponent = service.icon;
              return (
                <Card key={service.id} className="group hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-600 transition-colors duration-300">
                      <IconComponent className="w-6 h-6 text-red-600 group-hover:text-white" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-red-600 transition-colors duration-300">
                      {service.name}
                    </CardTitle>
                    <Badge variant="secondary" className="w-fit">
                      {service.category}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 mb-4">
                      {service.description}
                    </CardDescription>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-red-600">
                        {service.price}
                      </span>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/services/${service.id}`}>
                          Xem chi tiết
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/services">
                Xem tất cả dịch vụ
                <FaArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tại sao chọn Phú Long?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Những ưu điểm vượt trội khiến khách hàng tin tưởng và gắn bó với chúng tôi
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {advantages.map((advantage, index) => {
              const IconComponent = advantage.icon;
              return (
                <div key={index} className="text-center space-y-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <IconComponent className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {advantage.title}
                  </h3>
                  <p className="text-gray-600">
                    {advantage.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Khách hàng nói gì về chúng tôi
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Những phản hồi tích cực từ khách hàng đã sử dụng dịch vụ của Phú Long
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <FaQuoteLeft className="w-6 h-6 text-red-600" />
                    <p className="text-gray-700 italic">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {testimonial.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {testimonial.company}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <FaStar key={i} className="w-4 h-4 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-red-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Bạn có dự án in ấn cần thực hiện?
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Liên hệ với chúng tôi ngay hôm nay để được tư vấn và báo giá miễn phí
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-red-600 hover:bg-gray-100 text-lg px-8 py-3"
              asChild
            >
              <Link href="/contact">
                Liên hệ ngay
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-red-600 text-lg px-8 py-3"
              asChild
            >
              <Link href="/orders/create">
                Đặt hàng online
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
