"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaPaperPlane, FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';
import { contactApi } from '@/lib/api/client';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  subject: string;
  message: string;
  service_type: string;
}

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    service_type: 'general'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const contactData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message
      };

      // Call real API
      await contactApi.submit(contactData);
      
      toast.success("Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong vòng 24h.");
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: '',
        service_type: 'general'
      });
    } catch (error: unknown) {
      console.error('Contact submission failed:', error);
      
      let errorMessage = "Có lỗi xảy ra! Vui lòng thử lại.";
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string } } };
        errorMessage = axiosError.response?.data?.detail || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              Liên hệ với chúng tôi
            </h1>
            <p className="text-xl text-red-100 max-w-2xl mx-auto">
              Hãy để lại thông tin để chúng tôi tư vấn dịch vụ in ấn phù hợp nhất cho bạn
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Thông tin liên hệ
                </h2>
                
                <div className="space-y-6">
                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaMapMarkerAlt className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Địa chỉ</h3>
                      <p className="text-gray-600">
                        123 Đường ABC, Phường XYZ<br />
                        Quận 1, TP. Hồ Chí Minh
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaPhone className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Điện thoại</h3>
                      <p className="text-gray-600">
                        Hotline: (028) 1234 5678<br />
                        Di động: 0901 234 567
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaEnvelope className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                      <p className="text-gray-600">
                        info@phulong.com<br />
                        sales@phulong.com
                      </p>
                    </div>
                  </div>

                  {/* Working Hours */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaClock className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Giờ làm việc</h3>
                      <p className="text-gray-600">
                        Thứ 2 - Thứ 6: 8:00 - 18:00<br />
                        Thứ 7: 8:00 - 12:00<br />
                        Chủ nhật: Nghỉ
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Kết nối với chúng tôi
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <a 
                    href="#" 
                    className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center text-white transition-colors"
                  >
                    <FaFacebook className="w-6 h-6" />
                  </a>
                  <a 
                    href="#" 
                    className="w-12 h-12 bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center text-white transition-colors"
                  >
                    <FaPhone className="w-6 h-6" />
                  </a>
                  <a 
                    href="#" 
                    className="w-12 h-12 bg-blue-400 hover:bg-blue-500 rounded-lg flex items-center justify-center text-white transition-colors"
                  >
                    <FaEnvelope className="w-6 h-6" />
                  </a>
                  <a 
                    href="#" 
                    className="w-12 h-12 bg-pink-600 hover:bg-pink-700 rounded-lg flex items-center justify-center text-white transition-colors"
                  >
                    <FaInstagram className="w-6 h-6" />
                  </a>
                  <a 
                    href="#" 
                    className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center text-white transition-colors"
                  >
                    <FaYoutube className="w-6 h-6" />
                  </a>
                  <a 
                    href="#" 
                    className="w-12 h-12 bg-sky-400 hover:bg-sky-500 rounded-lg flex items-center justify-center text-white transition-colors"
                  >
                    <FaMapMarkerAlt className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <FaPaperPlane className="w-6 h-6 text-red-600" />
                    Gửi tin nhắn cho chúng tôi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Họ và tên *
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Nhập họ và tên của bạn"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Nhập địa chỉ email"
                        />
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Số điện thoại *
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Nhập số điện thoại"
                        />
                      </div>

                      <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                          Công ty
                        </label>
                        <Input
                          id="company"
                          name="company"
                          type="text"
                          value={formData.company}
                          onChange={handleInputChange}
                          placeholder="Tên công ty (nếu có)"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="service_type" className="block text-sm font-medium text-gray-700 mb-2">
                        Loại dịch vụ quan tâm
                      </label>
                      <select
                        id="service_type"
                        name="service_type"
                        value={formData.service_type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="general">Tư vấn chung</option>
                        <option value="offset">In Offset</option>
                        <option value="digital">In Digital</option>
                        <option value="sticker">Nhãn Sticker</option>
                        <option value="catalogue">Catalogue</option>
                        <option value="namecard">Name Card</option>
                        <option value="design">Thiết kế đồ họa</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Chủ đề *
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Nhập chủ đề tin nhắn"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Nội dung *
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Mô tả chi tiết nhu cầu của bạn..."
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-red-600 hover:bg-red-700 text-lg py-3"
                    >
                      {isSubmitting ? (
                        "Đang gửi..."
                      ) : (
                        <>
                          <FaPaperPlane className="w-5 h-5 mr-2" />
                          Gửi tin nhắn
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Vị trí cửa hàng
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hãy ghé thăm cửa hàng của chúng tôi để xem trực tiếp các sản phẩm mẫu và được tư vấn chi tiết
            </p>
          </div>
          
          <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <FaMapMarkerAlt className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg font-medium">Bản đồ Google Maps</p>
              <p className="text-sm">Tích hợp bản đồ sẽ được thêm vào sau</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 