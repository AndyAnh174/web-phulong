"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ordersApi, servicesApi } from '@/lib/api/client';
import type { Service } from '@/lib/types';
import { 
  FaPlus,
  FaSearch,
  FaShoppingCart,
  FaPrint,
  FaImages,
  FaTag,
  FaNewspaper,
  FaAddressCard,
  FaPalette,
  FaCloudUploadAlt,
  FaPaperPlane,
  FaEye,
  FaUser,
  FaPhone,
  FaEnvelope
} from 'react-icons/fa';

// Mock orders for tracking
const mockOrders = [
  {
    id: 'PL001',
    customer_name: 'Nguyễn Văn A',
    service_name: 'In Name Card cao cấp',
    quantity: 500,
    total_price: 150000,
    status: 'processing',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'PL002',
    customer_name: 'Trần Thị B',
    service_name: 'In Catalogue',
    quantity: 100,
    total_price: 1500000,
    status: 'completed',
    created_at: '2024-01-12T14:30:00Z'
  }
];

interface OrderFormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_id: number;
  quantity: number;
  size?: string;
  material?: string;
  notes?: string;
  design_file?: File;
}

export default function OrdersPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'create' | 'track'>('create');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  
  const [formData, setFormData] = useState<OrderFormData>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    service_id: 1,
    quantity: 1,
    size: '',
    material: '',
    notes: '',
  });

  // Load services from API
  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await servicesApi.getAll();
        setServices(response.data);
        if (response.data.length > 0) {
          setFormData(prev => ({ ...prev, service_id: response.data[0].id }));
        }
      } catch (error) {
        console.error('Failed to load services:', error);
        toast({
          variant: "destructive",
          title: "Lỗi!",
          description: "Không thể tải danh sách dịch vụ. Vui lòng thử lại.",
        });
      }
    };

    loadServices();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'service_id' || name === 'quantity' ? Number(value) : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        design_file: e.target.files![0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('customer_name', formData.customer_name);
      formDataToSend.append('customer_email', formData.customer_email);
      formDataToSend.append('customer_phone', formData.customer_phone);
      formDataToSend.append('service_id', formData.service_id.toString());
      formDataToSend.append('quantity', formData.quantity.toString());
      
      if (formData.size) formDataToSend.append('size', formData.size);
      if (formData.material) formDataToSend.append('material', formData.material);
      if (formData.notes) formDataToSend.append('notes', formData.notes);
      if (formData.design_file) formDataToSend.append('design_file', formData.design_file);

      const response = await ordersApi.create(formDataToSend);
      
      toast({
        title: "Đặt hàng thành công!",
        description: `Mã đơn hàng: ${response.data.id}. Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.`,
      });

      // Reset form
      setFormData({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        service_id: services.length > 0 ? services[0].id : 1,
        quantity: 1,
        size: '',
        material: '',
        notes: '',
      });
    } catch (error: unknown) {
      console.error('Error submitting order:', error);
      
      let errorMessage = "Có lỗi xảy ra. Vui lòng thử lại sau.";
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string } } };
        errorMessage = axiosError.response?.data?.detail || errorMessage;
      }
      
      toast({
        variant: "destructive",
        title: "Lỗi!",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ xác nhận</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Đang xử lý</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const selectedService = services.find(service => service.id === formData.service_id);
  const estimatedPrice = selectedService ? selectedService.price * formData.quantity : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  // Helper function to get icon for service
  const getServiceIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    if (name.includes('offset')) return FaPrint;
    if (name.includes('digital')) return FaImages;
    if (name.includes('sticker') || name.includes('nhãn')) return FaTag;
    if (name.includes('catalogue')) return FaNewspaper;
    if (name.includes('name card') || name.includes('card')) return FaAddressCard;
    if (name.includes('thiết kế') || name.includes('design')) return FaPalette;
    return FaPrint; // default icon
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              Đặt hàng & Theo dõi
            </h1>
            <p className="text-xl text-red-100 max-w-2xl mx-auto">
              Đặt hàng dễ dàng và theo dõi tiến độ đơn hàng của bạn
            </p>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="py-8 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={activeTab === 'create' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('create')}
                className={`flex items-center gap-2 ${activeTab === 'create' ? 'bg-red-600 hover:bg-red-700' : ''}`}
              >
                <FaPlus className="w-4 h-4" />
                Đặt hàng mới
              </Button>
              <Button
                variant={activeTab === 'track' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('track')}
                className={`flex items-center gap-2 ${activeTab === 'track' ? 'bg-red-600 hover:bg-red-700' : ''}`}
              >
                <FaSearch className="w-4 h-4" />
                Theo dõi đơn hàng
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Create Order Tab */}
      {activeTab === 'create' && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Order Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <FaShoppingCart className="w-6 h-6 text-red-600" />
                      Thông tin đặt hàng
                    </CardTitle>
                    <CardDescription>
                      Vui lòng điền đầy đủ thông tin để chúng tôi có thể tư vấn và báo giá chính xác nhất
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Customer Information */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <FaUser className="w-5 h-5 text-red-600" />
                          Thông tin khách hàng
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Họ và tên *
                            </label>
                            <Input
                              name="customer_name"
                              type="text"
                              required
                              value={formData.customer_name}
                              onChange={handleInputChange}
                              placeholder="Nhập họ và tên"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email *
                            </label>
                            <Input
                              name="customer_email"
                              type="email"
                              required
                              value={formData.customer_email}
                              onChange={handleInputChange}
                              placeholder="Nhập email"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Số điện thoại *
                            </label>
                            <Input
                              name="customer_phone"
                              type="tel"
                              required
                              value={formData.customer_phone}
                              onChange={handleInputChange}
                              placeholder="Nhập số điện thoại"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Service Selection */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <FaPrint className="w-5 h-5 text-red-600" />
                          Chi tiết dịch vụ
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Loại dịch vụ *
                            </label>
                            <select
                              name="service_id"
                              value={formData.service_id}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            >
                              {services.map((service) => (
                                <option key={service.id} value={service.id}>
                                  {service.name} - {formatPrice(service.price)}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số lượng *
                              </label>
                              <Input
                                name="quantity"
                                type="number"
                                min="1"
                                required
                                value={formData.quantity}
                                onChange={handleInputChange}
                                placeholder="Nhập số lượng"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kích thước
                              </label>
                              <Input
                                name="size"
                                type="text"
                                value={formData.size}
                                onChange={handleInputChange}
                                placeholder="VD: A4, A3, 9x5cm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Chất liệu
                              </label>
                              <Input
                                name="material"
                                type="text"
                                value={formData.material}
                                onChange={handleInputChange}
                                placeholder="VD: Couche 300gsm"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Ghi chú thêm
                            </label>
                            <Textarea
                              name="notes"
                              rows={4}
                              value={formData.notes}
                              onChange={handleInputChange}
                              placeholder="Mô tả chi tiết yêu cầu của bạn..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              File thiết kế
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
                              <FaCloudUploadAlt className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                              <div className="text-sm text-gray-600 mb-2">
                                Kéo thả file hoặc click để chọn
                              </div>
                              <input
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf,.png,.jpg,.jpeg,.ai,.psd"
                                className="hidden"
                                id="design-file"
                              />
                              <label
                                htmlFor="design-file"
                                className="cursor-pointer text-red-600 hover:text-red-700"
                              >
                                Chọn file
                              </label>
                              <div className="text-xs text-gray-500 mt-1">
                                Hỗ trợ: PDF, PNG, JPG, AI, PSD (Max: 10MB)
                              </div>
                              {formData.design_file && (
                                <div className="mt-2 text-sm text-green-600">
                                  ✓ {formData.design_file.name}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-red-600 hover:bg-red-700 text-lg py-3"
                      >
                        {isSubmitting ? (
                          "Đang xử lý..."
                        ) : (
                          <>
                            <FaPaperPlane className="w-5 h-5 mr-2" />
                            Gửi đơn đặt hàng
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div>
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle className="text-lg">Tóm tắt đơn hàng</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedService && (
                      <>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          {React.createElement(getServiceIcon(selectedService.name), { 
                            className: "w-8 h-8 text-red-600" 
                          })}
                          <div>
                            <h4 className="font-medium">{selectedService.name}</h4>
                            <p className="text-sm text-gray-600">{selectedService.category || 'Dịch vụ in ấn'}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Đơn giá:</span>
                            <span>{formatPrice(selectedService.price)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Số lượng:</span>
                            <span>{formData.quantity}</span>
                          </div>
                          {formData.size && (
                            <div className="flex justify-between">
                              <span>Kích thước:</span>
                              <span>{formData.size}</span>
                            </div>
                          )}
                          {formData.material && (
                            <div className="flex justify-between">
                              <span>Chất liệu:</span>
                              <span>{formData.material}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="border-t pt-3">
                          <div className="flex justify-between items-center font-semibold text-lg">
                            <span>Tạm tính:</span>
                            <span className="text-red-600">{formatPrice(estimatedPrice)}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            * Giá cuối cùng có thể thay đổi sau khi xác nhận chi tiết
                          </p>
                        </div>
                      </>
                    )}
                    
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaPhone className="w-4 h-4" />
                        <span>Tư vấn: {process.env.NEXT_PUBLIC_CONTACT_PHONE}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaEnvelope className="w-4 h-4" />
                        <span>{process.env.NEXT_PUBLIC_CONTACT_EMAIL}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Track Order Tab */}
      {activeTab === 'track' && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <FaSearch className="w-6 h-6 text-red-600" />
                    Theo dõi đơn hàng
                  </CardTitle>
                  <CardDescription>
                    Nhập mã đơn hàng để kiểm tra trạng thái và tiến độ xử lý
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Search */}
                    <div className="flex gap-4">
                      <Input
                        placeholder="Nhập mã đơn hàng (VD: PL001)"
                        value={trackingCode}
                        onChange={(e) => setTrackingCode(e.target.value)}
                        className="flex-1"
                      />
                      <Button className="bg-red-600 hover:bg-red-700">
                        <FaSearch className="w-4 h-4 mr-2" />
                        Tra cứu
                      </Button>
                    </div>

                    {/* Recent Orders */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Đơn hàng gần đây</h3>
                      <div className="space-y-4">
                        {mockOrders.map((order) => (
                          <Card key={order.id} className="border hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-3">
                                    <span className="font-mono text-lg font-semibold text-red-600">
                                      #{order.id}
                                    </span>
                                    {getStatusBadge(order.status)}
                                  </div>
                                  <h4 className="font-medium">{order.service_name}</h4>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span>{order.customer_name}</span>
                                    <span>SL: {order.quantity}</span>
                                    <span>{formatDate(order.created_at)}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-semibold text-red-600">
                                    {formatPrice(order.total_price)}
                                  </div>
                                  <Button variant="outline" size="sm" className="mt-2">
                                    <FaEye className="w-3 h-3 mr-1" />
                                    Chi tiết
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Quick Services */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Dịch vụ nhanh
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Chọn dịch vụ phổ biến để đặt hàng nhanh chóng
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 6).map((service) => {
              const IconComponent = getServiceIcon(service.name);
              return (
                <Card key={service.id} className="group hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                  setFormData(prev => ({ ...prev, service_id: service.id }));
                  setActiveTab('create');
                }}>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-600 transition-colors">
                      <IconComponent className="w-8 h-8 text-red-600 group-hover:text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
                    <p className="text-red-600 font-semibold">Từ {formatPrice(service.price)}</p>
                    <Button variant="outline" size="sm" className="mt-4 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600">
                      Đặt ngay
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
} 