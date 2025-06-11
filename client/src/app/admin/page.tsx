"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FaUser, FaLock, FaHome, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'sonner';
import { authService, type LoginCredentials } from '@/lib/auth';

export default function AdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginCredentials>({
    username: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const user = await authService.login(formData);
      
      toast.success(`Đăng nhập thành công! Chào mừng ${user.username}`);
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 1000);
    } catch (error: unknown) {
      console.error('Login failed:', error);
      
      let errorMessage = "Sai tên đăng nhập hoặc mật khẩu";
      
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      {/* Pattern background */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ef4444' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      ></div>
      
      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-red-100 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/logo/LOGO-MÀU.png"
                alt="Phú Long Logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="text-xl font-bold text-gray-900">Phú Long In Ấn</span>
            </Link>
            
            <Button variant="outline" onClick={() => router.push('/')}>
              <FaHome className="w-4 h-4 mr-2" />
              Về trang chủ
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
        <div className="w-full max-w-md">
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border border-red-100">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <FaUser className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Đăng nhập Admin
              </CardTitle>
              <CardDescription className="text-gray-600">
                Truy cập vào bảng điều khiển quản trị
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                    Tên đăng nhập
                  </Label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className="pl-10 border-gray-300 focus:border-red-500 focus:ring-red-500"
                      placeholder="Nhập tên đăng nhập"
                      value={formData.username}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Mật khẩu
                  </Label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="pl-10 pr-10 border-gray-300 focus:border-red-500 focus:ring-red-500"
                      placeholder="Nhập mật khẩu"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 text-base font-medium"
                >
                  {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>
              </form>

              {/* API Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">
                  Thông tin API:
                </h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Endpoint:</strong> POST /api/auth/login-json</p>
                  <p><strong>Kết nối:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              © 2024 Phú Long In Ấn. Bảo lưu mọi quyền.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 