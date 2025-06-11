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
import { blogsApi } from '@/lib/api/client';
import { Blog } from '@/lib/types';
import { 
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaCalendar,
  FaFileAlt
} from 'react-icons/fa';

interface BlogFormData {
  title: string;
  content: string;
  image_url: string;
  category: string;
  is_active: boolean;
}

export default function BlogsManagement() {
  const { user, loading } = useRequireAuth('admin');
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    content: '',
    image_url: '',
    category: '',
    is_active: true
  });

  const categories = [
    'Kiến thức in ấn',
    'Mẹo thiết kế',
    'Xu hướng marketing',
    'Công nghệ in',
    'Chất liệu giấy',
    'Tư vấn doanh nghiệp'
  ];

  useEffect(() => {
    if (user) {
      loadBlogs();
    }
  }, [user]);

  const loadBlogs = async () => {
    try {
      setIsLoading(true);
      const response = await blogsApi.getAll({ limit: 100 });
      setBlogs(response.data);
    } catch (error) {
      console.error('Error loading blogs:', error);
      toast.error('Không thể tải danh sách bài viết');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBlog) {
        // Update blog
        await blogsApi.update(editingBlog.id, formData);
        toast.success('Cập nhật bài viết thành công');
      } else {
        // Create blog
        await blogsApi.create(formData);
        toast.success('Thêm bài viết thành công');
      }
      
      setIsDialogOpen(false);
      resetForm();
      loadBlogs();
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error(editingBlog ? 'Không thể cập nhật bài viết' : 'Không thể thêm bài viết');
    }
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content,
      image_url: blog.image_url || '',
      category: blog.category || '',
      is_active: blog.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (blog: Blog) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài viết "${blog.title}"?`)) {
      return;
    }

    try {
      await blogsApi.delete(blog.id);
      toast.success('Xóa bài viết thành công');
      loadBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Không thể xóa bài viết');
    }
  };

  const toggleActive = async (blog: Blog) => {
    try {
      await blogsApi.update(blog.id, {
        is_active: !blog.is_active
      });
      toast.success(`${blog.is_active ? 'Ẩn' : 'Hiện'} bài viết thành công`);
      loadBlogs();
    } catch (error) {
      console.error('Error toggling blog visibility:', error);
      toast.error('Không thể thay đổi trạng thái bài viết');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      image_url: '',
      category: '',
      is_active: true
    });
    setEditingBlog(null);
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Blog</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700" onClick={() => resetForm()}>
              <FaPlus className="w-4 h-4 mr-2" />
              Thêm bài viết
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBlog ? 'Sửa bài viết' : 'Thêm bài viết mới'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Tiêu đề</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="content">Nội dung</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  className="min-h-[200px]"
                  placeholder="Nhập nội dung bài viết..."
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
                  {editingBlog ? 'Cập nhật' : 'Thêm mới'}
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
                  placeholder="Tìm kiếm bài viết..."
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

      {/* Blogs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlogs.map((blog) => (
          <Card key={blog.id} className="overflow-hidden">
            <div className="relative h-48 bg-gray-100">
              {blog.image_url ? (
                <img
                  src={blog.image_url}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`${blog.image_url ? 'hidden' : ''} flex items-center justify-center h-full`}>
                <FaFileAlt className="w-12 h-12 text-gray-400" />
              </div>
              <div className="absolute top-2 right-2">
                <Badge variant={blog.is_active ? "default" : "secondary"}>
                  {blog.is_active ? 'Hiển thị' : 'Ẩn'}
                </Badge>
              </div>
            </div>
            
            <CardHeader>
              <CardTitle className="text-lg line-clamp-2">{blog.title}</CardTitle>
              <div className="flex items-center justify-between">
                <Badge variant="outline">{blog.category}</Badge>
                <div className="flex items-center text-sm text-gray-500">
                  <FaCalendar className="w-3 h-3 mr-1" />
                  {formatDate(blog.created_at)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {blog.content}
              </p>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(blog)}
                  className="flex-1"
                >
                  <FaEdit className="w-3 h-3 mr-1" />
                  Sửa
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleActive(blog)}
                  className={blog.is_active ? 'text-orange-600' : 'text-green-600'}
                >
                  {blog.is_active ? <FaToggleOff className="w-3 h-3" /> : <FaToggleOn className="w-3 h-3" />}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(blog)}
                  className="text-red-600"
                >
                  <FaTrash className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBlogs.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Không tìm thấy bài viết nào</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 