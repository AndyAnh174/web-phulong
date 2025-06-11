"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import { useRequireAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { servicesApi } from '@/lib/api/client';
import { Service } from '@/lib/types';
import { 
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaImage
} from 'react-icons/fa';

interface ServiceFormData {
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_active: boolean;
}

export default function ServicesManagement() {
  const { user, loading } = useRequireAuth('admin');
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    category: '',
    is_active: true
  });

  const categories = ['In Offset', 'In Digital', 'Nhãn Sticker', 'Catalogue', 'Name Card', 'Thiết kế'];

  useEffect(() => {
    if (user) {
      loadServices();
    }
  }, [user]);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      const response = await servicesApi.getAll({ limit: 100 });
      setServices(response.data);
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Không thể tải danh sách dịch vụ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService) {
        // Update service
        await servicesApi.update(editingService.id, formData);
        toast.success('Cập nhật dịch vụ thành công');
      } else {
        // Create service
        await servicesApi.create(formData);
        toast.success('Thêm dịch vụ thành công');
      }
      
      setIsDialogOpen(false);
      resetForm();
      loadServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error(editingService ? 'Không thể cập nhật dịch vụ' : 'Không thể thêm dịch vụ');
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      image_url: service.image_url || '',
      category: service.category || '',
      is_active: service.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (service: Service) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${service.name}"?`)) {
      return;
    }

    try {
      await servicesApi.delete(service.id);
      toast.success('Xóa dịch vụ thành công');
      loadServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Không thể xóa dịch vụ');
    }
  };

  const toggleActive = async (service: Service) => {
    try {
      await servicesApi.update(service.id, {
        is_active: !service.is_active
      });
      toast.success(`${service.is_active ? 'Ẩn' : 'Hiện'} dịch vụ thành công`);
      loadServices();
    } catch (error) {
      console.error('Error toggling service visibility:', error);
      toast.error('Không thể thay đổi trạng thái dịch vụ');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      image_url: '',
      category: '',
      is_active: true
    });
    setEditingService(null);
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Dịch vụ</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700" onClick={() => resetForm()}>
              <FaPlus className="w-4 h-4 mr-2" />
              Thêm dịch vụ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'Sửa dịch vụ' : 'Thêm dịch vụ mới'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Tên dịch vụ</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="price">Giá (VNĐ)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="image_url">URL hình ảnh</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Danh mục</Label>
                <select
                  id="category"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <Label htmlFor="is_active">Hiển thị công khai</Label>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                  {editingService ? 'Cập nhật' : 'Thêm mới'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm dịch vụ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <Card key={service.id} className="overflow-hidden">
            <div className="relative h-48 bg-gray-100">
              {service.image_url ? (
                <img
                  src={service.image_url}
                  alt={service.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`${service.image_url ? 'hidden' : ''} flex items-center justify-center h-full`}>
                <FaImage className="w-12 h-12 text-gray-400" />
              </div>
              <div className="absolute top-2 right-2">
                <Badge variant={service.is_active ? "default" : "secondary"}>
                  {service.is_active ? 'Hiển thị' : 'Ẩn'}
                </Badge>
              </div>
            </div>
            
            <CardHeader>
              <CardTitle className="text-lg">{service.name}</CardTitle>
              <Badge variant="outline">{service.category}</Badge>
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {service.description}
              </p>
              <p className="text-lg font-semibold text-red-600 mb-4">
                {service.price.toLocaleString('vi-VN')} VNĐ
              </p>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(service)}
                  className="flex-1"
                >
                  <FaEdit className="w-3 h-3 mr-1" />
                  Sửa
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleActive(service)}
                  className={service.is_active ? 'text-orange-600' : 'text-green-600'}
                >
                  {service.is_active ? <FaToggleOff className="w-3 h-3" /> : <FaToggleOn className="w-3 h-3" />}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(service)}
                  className="text-red-600"
                >
                  <FaTrash className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Không tìm thấy dịch vụ nào</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 