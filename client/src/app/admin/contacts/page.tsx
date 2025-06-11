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
import { contactApi } from '@/lib/api/client';
import { Contact } from '@/lib/types';
import { 
  FaSearch,
  FaDownload,
  FaEye,
  FaTrash,
  FaCalendar,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaFileAlt,
  FaCheckCircle,
  FaClock
} from 'react-icons/fa';

export default function ContactsManagement() {
  const { user, loading } = useRequireAuth('admin');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const statusOptions = [
    { value: 'new', label: 'Mới', color: 'bg-blue-500', icon: FaClock },
    { value: 'read', label: 'Đã đọc', color: 'bg-green-500', icon: FaCheckCircle }
  ];

  useEffect(() => {
    if (user) {
      loadContacts();
    }
  }, [user, pagination.page]);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const params = {
        skip: (pagination.page - 1) * pagination.limit,
        limit: pagination.limit,
        ...(searchTerm && { name: searchTerm }),
        ...(selectedStatus !== 'all' && { status: selectedStatus })
      };
      
      const response = await contactApi.getAll(params);
      setContacts(response.data.items);
      setPagination(prev => ({
        ...prev,
        total: response.data.total,
        totalPages: Math.ceil(response.data.total / prev.limit)
      }));
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast.error('Không thể tải danh sách liên hệ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (contact: Contact) => {
    try {
      await contactApi.markAsRead(contact.id);
      toast.success('Đã đánh dấu đã đọc');
      loadContacts();
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Không thể đánh dấu đã đọc');
    }
  };

  const handleDelete = async (contact: Contact) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tin nhắn này?')) return;
    
    try {
      await contactApi.delete(contact.id);
      toast.success('Xóa tin nhắn thành công');
      loadContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Không thể xóa tin nhắn');
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = {
        ...(searchTerm && { name: searchTerm }),
        ...(selectedStatus !== 'all' && { status: selectedStatus })
      };
      
      const response = await contactApi.exportCSV(params);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `lien-he-${new Date().toISOString().split('T')[0]}.csv`;
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

  const handleViewDetail = async (contact: Contact) => {
    setSelectedContact(contact);
    setIsDetailOpen(true);
    
    // Mark as read when viewing
    if (contact.status === 'new') {
      await handleMarkAsRead(contact);
    }
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

  const getStatusBadge = (status: string) => {
    const statusObj = statusOptions.find(s => s.value === status);
    const Icon = statusObj?.icon || FaClock;
    
    return (
      <Badge 
        className={`${statusObj?.color} text-white flex items-center gap-1`}
        variant="outline"
      >
        <Icon className="w-3 h-3" />
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
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Liên hệ</h1>
        <Button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700">
          <FaDownload className="w-4 h-4 mr-2" />
          Xuất CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaClock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tin nhắn mới</p>
                <p className="text-2xl font-bold text-gray-900">
                  {contacts.filter(c => c.status === 'new').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaCheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đã đọc</p>
                <p className="text-2xl font-bold text-gray-900">
                  {contacts.filter(c => c.status === 'read').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaEnvelope className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng cộng</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pagination.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && loadContacts()}
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
            <Button onClick={loadContacts} variant="outline">
              Tìm kiếm
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thông tin liên hệ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tin nhắn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày gửi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <tr 
                    key={contact.id} 
                    className={`hover:bg-gray-50 ${contact.status === 'new' ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {contact.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        <div className="flex items-center mt-1">
                          <FaEnvelope className="w-3 h-3 mr-1" />
                          {contact.email}
                        </div>
                        {contact.phone && (
                          <div className="flex items-center mt-1">
                            <FaPhone className="w-3 h-3 mr-1" />
                            {contact.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        <div className="font-medium">{contact.subject}</div>
                        <div className="text-gray-500 truncate mt-1">
                          {contact.message}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(contact.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(contact.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetail(contact)}
                        >
                          <FaEye className="w-3 h-3 mr-1" />
                          Xem
                        </Button>
                        {contact.status === 'new' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAsRead(contact)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <FaCheckCircle className="w-3 h-3 mr-1" />
                            Đánh dấu đã đọc
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(contact)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FaTrash className="w-3 h-3 mr-1" />
                          Xóa
                        </Button>
                      </div>
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

      {/* Contact Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết tin nhắn liên hệ</DialogTitle>
          </DialogHeader>
          
          {selectedContact && (
            <div className="space-y-6">
              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <FaUser className="w-4 h-4 mr-2" />
                    Thông tin liên hệ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center">
                    <FaUser className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium mr-2">Họ tên:</span>
                    <span>{selectedContact.name}</span>
                  </div>
                  <div className="flex items-center">
                    <FaEnvelope className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium mr-2">Email:</span>
                    <span>{selectedContact.email}</span>
                  </div>
                  {selectedContact.phone && (
                    <div className="flex items-center">
                      <FaPhone className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="font-medium mr-2">Điện thoại:</span>
                      <span>{selectedContact.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <FaCalendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium mr-2">Ngày gửi:</span>
                    <span>{formatDate(selectedContact.created_at)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Trạng thái:</span>
                    {getStatusBadge(selectedContact.status)}
                  </div>
                </CardContent>
              </Card>

              {/* Message Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <FaFileAlt className="w-4 h-4 mr-2" />
                    Nội dung tin nhắn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Chủ đề:</span>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        {selectedContact.subject}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Tin nhắn:</span>
                      <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {selectedContact.message}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <div className="flex space-x-2">
              {selectedContact?.status === 'new' && (
                <Button
                  variant="outline"
                  onClick={() => selectedContact && handleMarkAsRead(selectedContact)}
                  className="text-green-600 hover:text-green-700"
                >
                  <FaCheckCircle className="w-4 h-4 mr-2" />
                  Đánh dấu đã đọc
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => selectedContact && handleDelete(selectedContact)}
                className="text-red-600 hover:text-red-700"
              >
                <FaTrash className="w-4 h-4 mr-2" />
                Xóa tin nhắn
              </Button>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Đóng
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {contacts.length === 0 && !isLoading && (
        <Card className="mt-6">
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Không tìm thấy tin nhắn liên hệ nào</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 