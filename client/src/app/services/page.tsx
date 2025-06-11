"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FaPrint,
  FaImages,
  FaTag,
  FaNewspaper,
  FaAddressCard,
  FaPalette,
  FaSearch,
  FaFilter,
  FaStar,
  FaCheckCircle,
  FaClock,
  FaShoppingCart,
  FaPhone,
  FaQuoteLeft
} from 'react-icons/fa';

// Mock services data
const mockServices = [
  {
    id: 1,
    name: 'In Offset chất lượng cao',
    description: 'Dịch vụ in offset với chất lượng màu sắc xuất sắc, phù hợp cho in số lượng lớn',
    price: 500,
    icon: FaPrint,
    category: 'In Offset',
    rating: 4.8,
    reviews: 156,
    delivery_time: '3-5 ngày',
    features: ['Chất lượng màu sắc cao', 'Giá tốt cho số lượng lớn', 'Nhiều loại giấy', 'Độ bền cao'],
    image_url: '/images/services/offset-printing.jpg',
    popular: true
  },
  {
    id: 2,
    name: 'In Digital nhanh chóng',
    description: 'In digital nhanh, tiện lợi cho số lượng nhỏ với thời gian giao hàng nhanh',
    price: 2000,
    icon: FaImages,
    category: 'In Digital',
    rating: 4.6,
    reviews: 89,
    delivery_time: '1-2 ngày',
    features: ['Thời gian nhanh', 'In theo yêu cầu', 'Chất lượng tốt', 'Linh hoạt số lượng'],
    image_url: '/images/services/digital-printing.jpg',
    popular: false
  },
  {
    id: 3,
    name: 'In nhãn Sticker chuyên nghiệp',
    description: 'In nhãn dán, sticker với nhiều chất liệu và kích thước khác nhau',
    price: 1500,
    icon: FaTag,
    category: 'Nhãn Sticker',
    rating: 4.7,
    reviews: 234,
    delivery_time: '2-3 ngày',
    features: ['Chống nước', 'Nhiều chất liệu', 'Cắt theo form', 'Bền màu'],
    image_url: '/images/services/sticker-printing.jpg',
    popular: true
  },
  {
    id: 4,
    name: 'In Catalogue cao cấp',
    description: 'In catalogue, brochure với thiết kế đẹp mắt và chất lượng in ấn tuyệt vời',
    price: 15000,
    icon: FaNewspaper,
    category: 'Catalogue',
    rating: 4.9,
    reviews: 67,
    delivery_time: '5-7 ngày',
    features: ['Thiết kế chuyên nghiệp', 'Giấy cao cấp', 'Gia công hoàn thiện', 'Màu sắc sống động'],
    image_url: '/images/services/catalogue-printing.jpg',
    popular: false
  },
  {
    id: 5,
    name: 'In Name Card sang trọng',
    description: 'In name card, danh thiếp với nhiều chất liệu cao cấp và hiệu ứng đặc biệt',
    price: 100000,
    icon: FaAddressCard,
    category: 'Name Card',
    rating: 4.8,
    reviews: 445,
    delivery_time: '3-4 ngày',
    features: ['Chất liệu cao cấp', 'Hiệu ứng đặc biệt', 'Thiết kế độc quyền', 'Gia công tinh xảo'],
    image_url: '/images/services/namecard-printing.jpg',
    popular: true
  },
  {
    id: 6,
    name: 'Thiết kế đồ họa sáng tạo',
    description: 'Dịch vụ thiết kế đồ họa chuyên nghiệp cho mọi nhu cầu marketing',
    price: 200000,
    icon: FaPalette,
    category: 'Thiết kế',
    rating: 4.9,
    reviews: 123,
    delivery_time: '2-5 ngày',
    features: ['Thiết kế theo yêu cầu', 'Sáng tạo độc đáo', 'File chuẩn in', 'Tư vấn chuyên nghiệp'],
    image_url: '/images/services/graphic-design.jpg',
    popular: false
  }
];

const categories = ['Tất cả', 'In Offset', 'In Digital', 'Nhãn Sticker', 'Catalogue', 'Name Card', 'Thiết kế'];

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [filteredServices, setFilteredServices] = useState(mockServices);

  // Filter services based on search and category
  React.useEffect(() => {
    let filtered = mockServices;

    if (selectedCategory !== 'Tất cả') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  }, [searchTerm, selectedCategory]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating) 
            ? 'text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              Dịch vụ In ấn Chuyên nghiệp
            </h1>
            <p className="text-xl text-red-100 max-w-3xl mx-auto">
              Cung cấp đầy đủ các dịch vụ in ấn với chất lượng cao và giá cả cạnh tranh nhất thị trường
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Tìm kiếm dịch vụ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  className={`${
                    selectedCategory === category 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'text-gray-600 hover:text-red-600 border-gray-300'
                  }`}
                >
                  <FaFilter className="w-4 h-4 mr-2" />
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Results Info */}
          <div className="mb-8">
            <p className="text-gray-600">
              Hiển thị {filteredServices.length} dịch vụ
              {selectedCategory !== 'Tất cả' && ` trong danh mục "${selectedCategory}"`}
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => {
              const IconComponent = service.icon;
              return (
                <Card key={service.id} className="group hover:shadow-xl transition-shadow duration-300 border-gray-200 overflow-hidden">
                  {/* Service Image */}
                  <div className="relative h-48 bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center">
                    <IconComponent className="w-20 h-20 text-red-600 group-hover:scale-110 transition-transform duration-300" />
                    {service.popular && (
                      <Badge className="absolute top-4 right-4 bg-red-600 text-white">
                        Phổ biến
                      </Badge>
                    )}
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 group-hover:text-red-600 transition-colors">
                          {service.name}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {service.category}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="text-sm line-clamp-2">
                      {service.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Rating */}
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex">
                        {renderStars(service.rating)}
                      </div>
                      <span className="font-medium">{service.rating}</span>
                      <span className="text-gray-500">({service.reviews} đánh giá)</span>
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-700">Tính năng nổi bật:</h4>
                      <div className="space-y-1">
                        {service.features.slice(0, 2).map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <FaCheckCircle className="w-3 h-3 text-green-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price and Delivery */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div>
                        <div className="text-lg font-bold text-red-600">
                          Từ {formatPrice(service.price)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <FaClock className="w-3 h-3" />
                          <span>{service.delivery_time}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Link href={`/orders?service=${service.id}`}>
                          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                            <FaShoppingCart className="w-3 h-3 mr-1" />
                            Đặt ngay
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline" className="w-full text-xs">
                          Chi tiết
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* No Results */}
          {filteredServices.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaSearch className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không tìm thấy dịch vụ nào
              </h3>
              <p className="text-gray-600 mb-4">
                Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc danh mục
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('Tất cả');
                }}
                variant="outline"
              >
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tại sao chọn dịch vụ của chúng tôi?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Với nhiều năm kinh nghiệm và đội ngũ chuyên nghiệp, chúng tôi cam kết mang đến dịch vụ tốt nhất
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: FaCheckCircle,
                title: 'Chất lượng đảm bảo',
                description: 'Sản phẩm được kiểm tra kỹ lưỡng trước khi giao'
              },
              {
                icon: FaClock,
                title: 'Giao hàng đúng hẹn',
                description: 'Cam kết giao hàng đúng thời gian đã hẹn'
              },
              {
                icon: FaStar,
                title: 'Dịch vụ 5 sao',
                description: 'Đội ngũ hỗ trợ khách hàng 24/7'
              },
              {
                icon: FaPalette,
                title: 'Thiết kế miễn phí',
                description: 'Hỗ trợ thiết kế miễn phí cho đơn hàng lớn'
              }
            ].map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Khách hàng nói gì về chúng tôi
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Nguyễn Văn A',
                company: 'ABC Company',
                text: 'Chất lượng in ấn rất tốt, màu sắc sống động và nhân viên hỗ trợ nhiệt tình.',
                rating: 5
              },
              {
                name: 'Trần Thị B',
                company: 'XYZ Corporation',
                text: 'Giao hàng đúng hẹn, giá cả hợp lý. Tôi sẽ tiếp tục sử dụng dịch vụ.',
                rating: 5
              },
              {
                name: 'Lê Minh C',
                company: 'DEF Store',
                text: 'Dịch vụ thiết kế rất chuyên nghiệp, sáng tạo và phù hợp với thương hiệu.',
                rating: 4
              }
            ].map((testimonial, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {renderStars(testimonial.rating)}
                  </div>
                  <div className="relative mb-4">
                    <FaQuoteLeft className="absolute -top-2 -left-2 w-8 h-8 text-red-100" />
                    <p className="text-gray-600 italic pl-6">&ldquo;{testimonial.text}&rdquo;</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.company}</p>
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
          <h2 className="text-3xl font-bold mb-4">
            Bạn cần tư vấn dịch vụ in ấn?
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Liên hệ với chúng tôi ngay để nhận báo giá chi tiết và tư vấn miễn phí
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" variant="outline" className="bg-white text-red-600 hover:bg-gray-100">
                <FaPhone className="w-5 h-5 mr-2" />
                Liên hệ tư vấn
              </Button>
            </Link>
            <Link href="/orders">
              <Button size="lg" className="bg-red-700 hover:bg-red-800 text-white">
                <FaShoppingCart className="w-5 h-5 mr-2" />
                Đặt hàng ngay
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 