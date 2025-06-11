"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FaCheck, 
  FaTimes,
  FaPrint, 
  FaImages, 
  FaAddressCard, 
  FaStar,
  FaCalculator,
  FaPhone
} from 'react-icons/fa';

// Mock data bảng giá
const pricingCategories = [
  {
    id: 'offset',
    name: 'In Offset',
    description: 'Phù hợp cho số lượng lớn, chất lượng cao',
    icon: FaPrint,
    packages: [
      {
        name: 'Gói Cơ bản',
        description: 'Cho doanh nghiệp nhỏ',
        price: 500,
        unit: 'VNĐ/tờ',
        minQuantity: 1000,
        features: [
          'Giấy thường 80gsm',
          'In 1 màu',
          'Không gia công',
          'Giao hàng 5-7 ngày'
        ],
        notIncluded: [
          'Thiết kế',
          'Gia công đặc biệt'
        ]
      },
      {
        name: 'Gói Tiêu chuẩn',
        description: 'Phổ biến nhất',
        price: 800,
        unit: 'VNĐ/tờ',
        minQuantity: 500,
        popular: true,
        features: [
          'Giấy Couche 150gsm',
          'In 4 màu CMYK',
          'Cắt gọn cơ bản',
          'Giao hàng 3-5 ngày',
          'Hỗ trợ thiết kế cơ bản'
        ],
        notIncluded: [
          'Gia công đặc biệt'
        ]
      },
      {
        name: 'Gói Cao cấp',
        description: 'Chất lượng tốt nhất',
        price: 1200,
        unit: 'VNĐ/tờ',
        minQuantity: 200,
        features: [
          'Giấy cao cấp 250gsm',
          'In 4 màu + spot color',
          'Gia công đầy đủ',
          'Giao hàng 1-3 ngày',
          'Thiết kế chuyên nghiệp',
          'Bao bì đẹp'
        ],
        notIncluded: []
      }
    ]
  },
  {
    id: 'digital',
    name: 'In Digital',
    description: 'Nhanh chóng, linh hoạt cho số lượng nhỏ',
    icon: FaImages,
    packages: [
      {
        name: 'Gói Tiết kiệm',
        description: 'Cho cá nhân',
        price: 2000,
        unit: 'VNĐ/tờ',
        minQuantity: 50,
        features: [
          'Giấy thường A4/A3',
          'In màu cơ bản',
          'Cắt đơn giản',
          'Giao hàng ngay'
        ],
        notIncluded: [
          'Thiết kế',
          'Gia công phức tạp'
        ]
      },
      {
        name: 'Gói Doanh nghiệp',
        description: 'Cho văn phòng',
        price: 3500,
        unit: 'VNĐ/tờ',
        minQuantity: 20,
        popular: true,
        features: [
          'Đa dạng khổ giấy',
          'In màu chất lượng cao',
          'Gia công cơ bản',
          'Giao hàng trong ngày',
          'Hỗ trợ định dạng file'
        ],
        notIncluded: [
          'Thiết kế phức tạp'
        ]
      },
      {
        name: 'Gói Premium',
        description: 'Chuyên nghiệp',
        price: 5000,
        unit: 'VNĐ/tờ',
        minQuantity: 10,
        features: [
          'Giấy cao cấp đa dạng',
          'In màu sắc chuẩn',
          'Gia công hoàn thiện',
          'Giao hàng ưu tiên',
          'Thiết kế miễn phí',
          'Tư vấn chuyên sâu'
        ],
        notIncluded: []
      }
    ]
  },
  {
    id: 'namecard',
    name: 'Name Card',
    description: 'Danh thiếp chuyên nghiệp',
    icon: FaAddressCard,
    packages: [
      {
        name: 'Name Card Thường',
        description: 'Cơ bản tiết kiệm',
        price: 100000,
        unit: 'VNĐ/hộp (500 thẻ)',
        minQuantity: 1,
        features: [
          'Giấy ivory 250gsm',
          'In 2 mặt',
          'Cắt vuông góc',
          'Thiết kế 1 mẫu'
        ],
        notIncluded: [
          'Gia công đặc biệt',
          'Bo góc'
        ]
      },
      {
        name: 'Name Card Cao cấp',
        description: 'Chuyên nghiệp',
        price: 200000,
        unit: 'VNĐ/hộp (500 thẻ)',
        minQuantity: 1,
        popular: true,
        features: [
          'Giấy duplex 350gsm',
          'In màu sắc nét',
          'Bo góc đẹp',
          'Cán màng bóng/mờ',
          'Thiết kế đa dạng'
        ],
        notIncluded: [
          'Ép kim'
        ]
      },
      {
        name: 'Name Card Luxury',
        description: 'Đẳng cấp cao',
        price: 500000,
        unit: 'VNĐ/hộp (500 thẻ)',
        minQuantity: 1,
        features: [
          'Giấy mỹ thuật cao cấp',
          'Ép kim/ép bạc',
          'Cán màng đặc biệt',
          'Thiết kế độc quyền',
          'Bao bì sang trọng',
          'Tư vấn cá nhân hóa'
        ],
        notIncluded: []
      }
    ]
  }
];

export default function PricingPage() {
  const [selectedCategory, setSelectedCategory] = useState('offset');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const selectedCategoryData = pricingCategories.find(cat => cat.id === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              Bảng giá dịch vụ
            </h1>
            <p className="text-xl text-red-100 max-w-2xl mx-auto">
              Bảng giá chi tiết và minh bạch cho tất cả dịch vụ in ấn của Phú Long
            </p>
          </div>
        </div>
      </section>

      {/* Category Selection */}
      <section className="py-8 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {pricingCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-3 ${
                    selectedCategory === category.id 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {selectedCategoryData && (
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {selectedCategoryData.name}
              </h2>
              <p className="text-gray-600 text-lg">
                {selectedCategoryData.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {selectedCategoryData?.packages.map((pkg, index) => (
              <Card 
                key={index} 
                className={`relative transition-all duration-300 hover:shadow-xl ${
                  pkg.popular ? 'ring-2 ring-red-500 shadow-lg' : ''
                }`}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-1">
                    <FaStar className="w-3 h-3 mr-1" />
                    Phổ biến
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                    {pkg.name}
                  </CardTitle>
                  <p className="text-gray-600 mb-4">{pkg.description}</p>
                  
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-red-600">
                      {formatPrice(pkg.price)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {pkg.unit}
                    </div>
                    <div className="text-sm text-gray-600">
                      Số lượng tối thiểu: {formatPrice(pkg.minQuantity)}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Bao gồm:</h4>
                    <ul className="space-y-2">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <FaCheck className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {pkg.notIncluded && pkg.notIncluded.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Không bao gồm:</h4>
                      <ul className="space-y-2">
                        {pkg.notIncluded.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <FaTimes className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-500 text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-4 space-y-3">
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700"
                      asChild
                    >
                      <Link href={`/orders/create?package=${selectedCategory}-${index}`}>
                        Đặt hàng ngay
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      asChild
                    >
                      <Link href="/contact">
                        Tư vấn chi tiết
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tính toán chi phí
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Sử dụng công cụ tính toán để ước lượng chi phí cho dự án của bạn
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-3">
                  <FaCalculator className="w-6 h-6 text-red-600" />
                  Máy tính chi phí
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-12">
                <div className="space-y-4">
                  <FaCalculator className="w-16 h-16 text-gray-400 mx-auto" />
                  <p className="text-lg font-medium text-gray-600">
                    Công cụ tính toán chi phí
                  </p>
                  <p className="text-gray-500">
                    Tính năng này sẽ được phát triển để giúp bạn ước lượng chi phí dựa trên yêu cầu cụ thể
                  </p>
                  <Button className="bg-red-600 hover:bg-red-700" asChild>
                    <Link href="/contact">
                      Liên hệ báo giá
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Câu hỏi thường gặp về giá
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Giá có bao gồm VAT không?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Tất cả giá niêm yết đã bao gồm VAT 10%. Chúng tôi sẽ xuất hóa đơn GTGT theo yêu cầu.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Có được giảm giá cho số lượng lớn không?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Có, chúng tôi có chính sách giảm giá cho đơn hàng số lượng lớn. Vui lòng liên hệ để được báo giá ưu đãi.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Có phí giao hàng không?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Miễn phí giao hàng trong nội thành với đơn hàng từ 500.000 VNĐ. Phí giao hàng ngoại thành tùy theo khoảng cách.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-red-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Cần báo giá chi tiết?
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Liên hệ ngay với chúng tôi để nhận báo giá chính xác cho dự án của bạn
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-red-600 hover:bg-gray-100 text-lg px-8 py-3"
              asChild
            >
              <Link href="/contact">
                <FaPhone className="w-5 h-5 mr-2" />
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