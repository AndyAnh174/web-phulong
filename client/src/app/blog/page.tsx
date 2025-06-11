"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FaSearch, FaEye, FaComment, FaUser, FaCalendarAlt } from 'react-icons/fa';

// Mock data - thay thế bằng API call thực tế
const mockBlogPosts = [
  {
    id: 1,
    title: 'Xu hướng thiết kế đồ họa năm 2024',
    excerpt: 'Khám phá những xu hướng thiết kế đồ họa mới nhất trong năm 2024 và cách áp dụng chúng vào sản phẩm in ấn.',
    content: '',
    image_url: '/images/blog/design-trends-2024.jpg',
    category: 'Thiết kế',
    author: 'Nguyễn Văn A',
    created_at: '2024-01-15T10:00:00Z',
    views: 1250,
    comments: 24,
    tags: ['thiết kế', 'xu hướng', '2024', 'đồ họa']
  },
  {
    id: 2,
    title: 'So sánh In Offset vs In Digital: Nên chọn loại nào?',
    excerpt: 'Phân tích chi tiết ưu nhược điểm của từng phương pháp in để bạn có thể lựa chọn phù hợp với nhu cầu.',
    content: '',
    image_url: '/images/blog/offset-vs-digital.jpg',
    category: 'In ấn',
    author: 'Trần Thị B',
    created_at: '2024-01-12T14:30:00Z',
    views: 980,
    comments: 18,
    tags: ['in offset', 'in digital', 'so sánh']
  },
  {
    id: 3,
    title: 'Cách chọn giấy phù hợp cho từng loại sản phẩm in',
    excerpt: 'Hướng dẫn chi tiết về các loại giấy và cách lựa chọn giấy phù hợp cho từng mục đích sử dụng.',
    content: '',
    image_url: '/images/blog/paper-types.jpg',
    category: 'Hướng dẫn',
    author: 'Lê Văn C',
    created_at: '2024-01-10T09:15:00Z',
    views: 756,
    comments: 12,
    tags: ['giấy in', 'hướng dẫn', 'chất liệu']
  },
  {
    id: 4,
    title: 'Thiết kế Name Card ấn tượng: 10 Tips hữu ích',
    excerpt: 'Những bí quyết thiết kế name card chuyên nghiệp để tạo ấn tượng tốt với khách hàng và đối tác.',
    content: '',
    image_url: '/images/blog/namecard-design-tips.jpg',
    category: 'Thiết kế',
    author: 'Phạm Thị D',
    created_at: '2024-01-08T16:45:00Z',
    views: 1100,
    comments: 31,
    tags: ['name card', 'thiết kế', 'tips', 'chuyên nghiệp']
  },
  {
    id: 5,
    title: 'In Sticker: Từ A đến Z cho người mới bắt đầu',
    excerpt: 'Hướng dẫn toàn diện về quy trình in sticker, từ thiết kế đến hoàn thiện sản phẩm.',
    content: '',
    image_url: '/images/blog/sticker-guide.jpg',
    category: 'Hướng dẫn',
    author: 'Hoàng Văn E',
    created_at: '2024-01-05T11:20:00Z',
    views: 890,
    comments: 16,
    tags: ['sticker', 'hướng dẫn', 'in ấn']
  },
  {
    id: 6,
    title: 'Màu sắc trong thiết kế: Cách sử dụng hiệu quả',
    excerpt: 'Tìm hiểu về tâm lý học màu sắc và cách vận dụng trong thiết kế để tăng hiệu quả truyền thông.',
    content: '',
    image_url: '/images/blog/color-psychology.jpg',
    category: 'Thiết kế',
    author: 'Nguyễn Thị F',
    created_at: '2024-01-03T13:10:00Z',
    views: 1320,
    comments: 28,
    tags: ['màu sắc', 'tâm lý học', 'thiết kế']
  }
];

const categories = ['Tất cả', 'Thiết kế', 'In ấn', 'Hướng dẫn', 'Tin tức'];

export default function BlogPage() {
  const [filteredPosts, setFilteredPosts] = useState(mockBlogPosts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  // Filter posts based on search term and category
  useEffect(() => {
    let filtered = mockBlogPosts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'Tất cả') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    setFilteredPosts(filtered);
  }, [searchTerm, selectedCategory]);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              Blog Phú Long
            </h1>
            <p className="text-xl text-red-100 max-w-2xl mx-auto">
              Chia sẻ kiến thức, kinh nghiệm và xu hướng mới nhất trong ngành in ấn và thiết kế
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <FaSearch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Không tìm thấy bài viết
              </h3>
              <p className="text-gray-500">
                Thử thay đổi từ khóa tìm kiếm hoặc danh mục
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-gray-600">
                Tìm thấy {filteredPosts.length} bài viết
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 bg-white overflow-hidden">
                    {/* Featured Image */}
                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">Hình ảnh bài viết</span>
                      </div>
                      <Badge className="absolute top-3 left-3 bg-red-600">
                        {post.category}
                      </Badge>
                    </div>

                    <CardHeader>
                      <CardTitle className="text-xl group-hover:text-red-600 transition-colors duration-300 line-clamp-2">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {post.excerpt}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        {/* Meta Info */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <FaUser className="w-3 h-3" />
                              <span>{post.author}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FaCalendarAlt className="w-3 h-3" />
                              <span>{formatDate(post.created_at)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <FaEye className="w-3 h-3" />
                              <span>{post.views}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FaComment className="w-3 h-3" />
                              <span>{post.comments}</span>
                            </div>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {post.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{post.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-colors duration-300"
                          asChild
                        >
                          <Link href={`/blog/${post.id}`} className="flex items-center justify-center gap-2">
                            Đọc thêm
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-red-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Đăng ký nhận tin tức mới nhất
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Nhận các bài viết mới và thông tin khuyến mãi trực tiếp trong email của bạn
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Nhập email của bạn"
              className="bg-white text-gray-900 placeholder-gray-500"
            />
            <Button 
              className="bg-white text-red-600 hover:bg-gray-100 px-8"
            >
              Đăng ký
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
} 