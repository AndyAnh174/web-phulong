"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { useRequireAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ordersApi } from '@/lib/api/client';
import { Order } from '@/lib/types';
import { 
  FaSearch,
  FaDownload,
  FaEye,
  FaCalendar,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaBoxes,
  FaFileAlt
} from 'react-icons/fa';

export default function OrdersManagement() {
  const { user, loading } = useRequireAuth('admin');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const statusOptions = [
    { value: 'pending', label: 'Chờ xử lý', color: 'bg-yellow-500' },
    { value: 'processing', label: 'Đang xử lý', color: 'bg-blue-500' },
    { value: 'completed', label: 'Hoàn thành', color: 'bg-green-500' },
    { value: 'cancelled', label: 'Đã hủy', color: 'bg-red-500' }
  ];

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user, pagination.page]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const params = {
        skip: (pagination.page - 1) * pagination.limit,
        limit: pagination.limit,
        ...(searchTerm && { customer_name: searchTerm }),
        ...(selectedStatus !== 'all' && { status: selectedStatus })
      };
      
      const response = await ordersApi.getAll(params);
      setOrders(response.data.items);
      setPagination(prev => ({
        ...prev,
        total: response.data.total,
        totalPages: Math.ceil(response.data.total / prev.limit)
      }));
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (order: Order, newStatus: string) => {
    try {
      await ordersApi.updateStatus(order.id, newStatus as Order['status']);
      toast.success('Cập nhật trạng thái thành công');
      loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Không thể cập nhật trạng thái đơn hàng');
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = {
        ...(searchTerm && { customer_name: searchTerm }),
        ...(selectedStatus !== 'all' && { status: selectedStatus })
      };
      
      const response = await ordersApi.exportCSV(params);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `don-hang-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Xuất file CSV thành công');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Không thể xuất file CSV');
    }
  };

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' VNĐ';
  };

  const getStatusBadge = (status: string) => {
    const statusObj = statusOptions.find(s => s.value === status);
    return (
      <Badge 
        className={`${statusObj?.color} text-white`}
        variant="outline"
      >
        {statusObj?.label || status}
      </Badge>
    );
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Đơn hàng</h1>
        <Button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700">
          <FaDownload className="w-4 h-4 mr-2" />
          Xuất CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tên khách hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && loadOrders()}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
            <Button onClick={loadOrders} variant="outline">
              Tìm kiếm
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã đơn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dịch vụ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.customer_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customer_email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.service?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Số lượng: {order.quantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(order.total_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        {statusOptions.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetail(order)}
                      >
                        <FaEye className="w-3 h-3 mr-1" />
                        Xem
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <Button
            variant="outline"
            disabled={pagination.page <= 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Trước
          </Button>
          
          <span className="flex items-center px-4 py-2 text-sm text-gray-700">
            Trang {pagination.page} / {pagination.totalPages}
          </span>
          
          <Button
            variant="outline"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Sau
          </Button>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <FaUser className="w-4 h-4 mr-2" />
                    Thông tin khách hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center">
                    <FaUser className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium mr-2">Họ tên:</span>
                    <span>{selectedOrder.customer_name}</span>
                  </div>
                  <div className="flex items-center">
                    <FaEnvelope className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium mr-2">Email:</span>
                    <span>{selectedOrder.customer_email}</span>
                  </div>
                  <div className="flex items-center">
                    <FaPhone className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium mr-2">Điện thoại:</span>
                    <span>{selectedOrder.customer_phone}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Order Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <FaBoxes className="w-4 h-4 mr-2" />
                    Thông tin đơn hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="font-medium mr-2">Dịch vụ:</span>
                    <span>{selectedOrder.service?.name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-medium mr-2">Số lượng:</span>
                    <span>{selectedOrder.quantity}</span>
                  </div>
                  {selectedOrder.size && (
                    <div>
                      <span className="font-medium mr-2">Kích thước:</span>
                      <span>{selectedOrder.size}</span>
                    </div>
                  )}
                  {selectedOrder.material && (
                    <div>
                      <span className="font-medium mr-2">Chất liệu:</span>
                      <span>{selectedOrder.material}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium mr-2">Tổng tiền:</span>
                    <span className="text-red-600 font-semibold">
                      {formatPrice(selectedOrder.total_price)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium mr-2">Trạng thái:</span>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <div className="flex items-center">
                    <FaCalendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium mr-2">Ngày tạo:</span>
                    <span>{formatDate(selectedOrder.created_at)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {selectedOrder.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <FaFileAlt className="w-4 h-4 mr-2" />
                      Ghi chú
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{selectedOrder.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Design File */}
              {selectedOrder.design_file_url && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">File thiết kế</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      onClick={() => window.open(selectedOrder.design_file_url, '_blank')}
                    >
                      <FaDownload className="w-4 h-4 mr-2" />
                      Tải file thiết kế
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {orders.length === 0 && !isLoading && (
        <Card className="mt-6">
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Không tìm thấy đơn hàng nào</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 