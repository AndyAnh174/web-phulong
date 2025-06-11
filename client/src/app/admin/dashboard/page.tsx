"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FaUsers, 
  FaShoppingCart, 
  FaDollarSign, 
  FaCog,
  FaEye,
  FaBell,
  FaChartLine,
  FaHome,
  FaSignOutAlt,
  FaBlog,
  FaServicestack,
  FaEnvelope,
  FaSpinner
} from 'react-icons/fa';
import { useRequireAuth } from '@/hooks/useAuth';
import { dashboardApi, ordersApi, contactApi } from '@/lib/api/client';
import type { DashboardSummary, Order, Contact } from '@/lib/types';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, logout } = useRequireAuth('/admin');
  
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentContacts, setRecentContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const [summaryResponse, ordersResponse, contactsResponse] = await Promise.all([
        dashboardApi.getSummary(),
        ordersApi.getAll({ limit: 5 }),
        contactApi.getAll({ limit: 5 })
      ]);

      setDashboardData(summaryResponse.data);
      setRecentOrders(ordersResponse.data.items || []);
      setRecentContacts(contactsResponse.data.items || []);
    } catch (error: unknown) {
      console.error('Failed to load dashboard data:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status: number } };
        if (axiosError.response?.status === 401) {
          logout();
        }
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, logout]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

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

  // Show loading spinner while checking authentication
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <Badge className="bg-red-100 text-red-800">Phú Long In Ấn</Badge>
              {user && (
                <div className="text-sm text-gray-600">
                  Xin chào, <span className="font-medium">{user.username}</span>
                  <Badge className="ml-2" variant="secondary">{user.role}</Badge>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <FaBell className="w-4 h-4 mr-2" />
                Thông báo ({recentContacts.length})
              </Button>
              
              <Button variant="outline" size="sm" onClick={() => router.push('/')}>
                <FaHome className="w-4 h-4 mr-2" />
                Trang chủ
              </Button>
              
              <Button variant="destructive" size="sm" onClick={logout}>
                <FaSignOutAlt className="w-4 h-4 mr-2" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm h-screen sticky top-0">
          <nav className="p-6">
            <div className="space-y-2">
              <Button
                variant={activeTab === 'overview' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('overview')}
                className="w-full justify-start"
              >
                <FaChartLine className="w-4 h-4 mr-2" />
                Tổng quan
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => router.push('/admin/orders')}
                className="w-full justify-start"
              >
                <FaShoppingCart className="w-4 h-4 mr-2" />
                Quản lý Đơn hàng
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => router.push('/admin/services')}
                className="w-full justify-start"
              >
                <FaServicestack className="w-4 h-4 mr-2" />
                Quản lý Dịch vụ
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => router.push('/admin/blogs')}
                className="w-full justify-start"
              >
                <FaBlog className="w-4 h-4 mr-2" />
                Quản lý Blog
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => router.push('/admin/contacts')}
                className="w-full justify-start"
              >
                <FaEnvelope className="w-4 h-4 mr-2" />
                Quản lý Liên hệ
              </Button>
              
              {user?.role === 'root' && (
                <Button
                  variant="ghost"
                  onClick={() => router.push('/admin/users')}
                  className="w-full justify-start"
                >
                  <FaUsers className="w-4 h-4 mr-2" />
                  Quản lý Người dùng
                </Button>
              )}
              
              <div className="border-t pt-4 mt-4">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/admin')}
                  className="w-full justify-start"
                >
                  <FaCog className="w-4 h-4 mr-2" />
                  Cài đặt
                </Button>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {loading ? (
            <div className="text-center py-12">
              <FaSpinner className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
              <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đơn hàng mới</CardTitle>
                        <FaShoppingCart className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{dashboardData?.new_orders || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          Cần xử lý trong tuần này
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Dịch vụ</CardTitle>
                        <FaServicestack className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{dashboardData?.services || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          Tổng số dịch vụ đang hoạt động
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Khách hàng</CardTitle>
                        <FaUsers className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{dashboardData?.customers || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          Tổng số khách hàng đã phục vụ
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
                        <FaDollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatPrice(dashboardData?.revenue || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Doanh thu trong tháng
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Orders */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Đơn hàng gần đây</CardTitle>
                        <Button size="sm">
                          <FaEye className="w-4 h-4 mr-2" />
                          Xem tất cả
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentOrders.length > 0 ? (
                          recentOrders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <h4 className="font-medium">{order.customer_name}</h4>
                                <p className="text-sm text-gray-600">{order.service?.name || 'Dịch vụ không xác định'}</p>
                                <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">{formatPrice(order.total_price)}</div>
                                {getStatusBadge(order.status)}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-4">Chưa có đơn hàng nào</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Contacts */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Liên hệ gần đây</CardTitle>
                        <Button size="sm">
                          <FaEye className="w-4 h-4 mr-2" />
                          Xem tất cả
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentContacts.length > 0 ? (
                          recentContacts.map((contact) => (
                            <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <h4 className="font-medium">{contact.name}</h4>
                                <p className="text-sm text-gray-600">{contact.subject}</p>
                                <p className="text-xs text-gray-500">{contact.email}</p>
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(contact.created_at)}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-4">Chưa có liên hệ nào</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'orders' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Quản lý đơn hàng</CardTitle>
                    <CardDescription>
                      Tính năng quản lý đơn hàng sẽ được phát triển trong phiên bản tiếp theo
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}

              {activeTab === 'services' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Quản lý dịch vụ</CardTitle>
                    <CardDescription>
                      Tính năng quản lý dịch vụ sẽ được phát triển trong phiên bản tiếp theo
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}

              {activeTab === 'customers' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Quản lý khách hàng</CardTitle>
                    <CardDescription>
                      Tính năng quản lý khách hàng sẽ được phát triển trong phiên bản tiếp theo
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}

              {activeTab === 'blogs' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Quản lý blog</CardTitle>
                    <CardDescription>
                      Tính năng quản lý blog sẽ được phát triển trong phiên bản tiếp theo
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}

              {activeTab === 'contacts' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Quản lý liên hệ</CardTitle>
                    <CardDescription>
                      Tính năng quản lý liên hệ sẽ được phát triển trong phiên bản tiếp theo
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}

              {activeTab === 'settings' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Cài đặt hệ thống</CardTitle>
                    <CardDescription>
                      Tính năng cài đặt sẽ được phát triển trong phiên bản tiếp theo
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
} 