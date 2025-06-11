"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { useRequireAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { usersApi } from '@/lib/api/client';
import { User } from '@/lib/types';
import { 
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaUser,
  FaShieldAlt,
  FaToggleOn,
  FaToggleOff,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';

interface UserFormData {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'root';
  is_active: boolean;
}

export default function UsersManagement() {
  const { user, loading } = useRequireAuth('root'); // Chỉ ROOT mới được truy cập
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    password: '',
    role: 'admin',
    is_active: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const roleOptions = [
    { value: 'admin', label: 'Admin', color: 'bg-blue-500', icon: FaUser },
    { value: 'root', label: 'Root', color: 'bg-red-500', icon: FaShieldAlt }
  ];

  useEffect(() => {
    if (user && user.role === 'root') {
      loadUsers();
    }
  }, [user, pagination.page]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const params = {
        skip: (pagination.page - 1) * pagination.limit,
        limit: pagination.limit
      };
      
      const response = await usersApi.getAll(params);
      // Giả sử response trả về danh sách user trực tiếp
      if (Array.isArray(response.data)) {
        setUsers(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.length,
          totalPages: 1
        }));
      } else {
        // Nếu có pagination
        setUsers(response.data.items || response.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.total || response.data.length,
          totalPages: Math.ceil((response.data.total || response.data.length) / prev.limit)
        }));
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, {
          username: formData.username,
          email: formData.email,
          role: formData.role,
          is_active: formData.is_active,
          ...(formData.password && { password: formData.password })
        });
        toast.success('Cập nhật người dùng thành công');
      } else {
        await usersApi.create(formData);
        toast.success('Tạo người dùng thành công');
      }
      
      setIsDialogOpen(false);
      resetForm();
      loadUsers();
    } catch (error: unknown) {
      console.error('Error saving user:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error.response as { data?: { detail?: string } })?.data?.detail 
        : 'Không thể lưu người dùng';
      toast.error(errorMessage || 'Không thể lưu người dùng');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      is_active: user.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.username}"?`)) return;
    
    try {
      await usersApi.delete(user.id);
      toast.success('Xóa người dùng thành công');
      loadUsers();
    } catch (error: unknown) {
      console.error('Error deleting user:', error);
      toast.error('Không thể xóa người dùng');
    }
  };

  const toggleUserStatus = async (user: User) => {
    try {
      await usersApi.update(user.id, { is_active: !user.is_active });
      toast.success(`${!user.is_active ? 'Kích hoạt' : 'Vô hiệu hóa'} người dùng thành công`);
      loadUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Không thể cập nhật trạng thái người dùng');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'admin',
      is_active: true
    });
    setEditingUser(null);
    setShowPassword(false);
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

  const getRoleBadge = (role: string) => {
    const roleObj = roleOptions.find(r => r.value === role);
    const Icon = roleObj?.icon || FaUser;
    
    return (
      <Badge 
        className={`${roleObj?.color} text-white flex items-center gap-1`}
        variant="outline"
      >
        <Icon className="w-3 h-3" />
        {roleObj?.label || role}
      </Badge>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Chỉ ROOT mới được truy cập
  if (user?.role !== 'root') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <FaShieldAlt className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Truy cập bị từ chối</h1>
            <p className="text-gray-600">Chỉ người dùng ROOT mới có thể truy cập trang này.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Người dùng</h1>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-red-600 hover:bg-red-700">
          <FaPlus className="w-4 h-4 mr-2" />
          Thêm người dùng
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <FaShieldAlt className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Root Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'root').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaUser className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Admin Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaToggleOn className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.is_active).length}
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
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="all">Tất cả vai trò</option>
                {roleOptions.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
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
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <FaUser className="w-5 h-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        className={user.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}
                        variant="outline"
                      >
                        {user.is_active ? 'Hoạt động' : 'Tạm khóa'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(user)}
                        >
                          <FaEdit className="w-3 h-3 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleUserStatus(user)}
                          className={user.is_active ? "text-yellow-600 hover:text-yellow-700" : "text-green-600 hover:text-green-700"}
                        >
                          {user.is_active ? <FaToggleOff className="w-3 h-3 mr-1" /> : <FaToggleOn className="w-3 h-3 mr-1" />}
                          {user.is_active ? 'Khóa' : 'Kích hoạt'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(user)}
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

      {/* Add/Edit User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                required
                disabled={!!editingUser} // Không cho sửa username
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">
                {editingUser ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required={!editingUser}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="role">Vai trò</Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'root' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                {roleOptions.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              />
              <Label htmlFor="is_active">Kích hoạt tài khoản</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}>
                Hủy
              </Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700">
                {editingUser ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {filteredUsers.length === 0 && !isLoading && (
        <Card className="mt-6">
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Không tìm thấy người dùng nào</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 