"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Upload, 
  ShoppingCart, 
  CheckCircle, 
  User, 
  Mail, 
  Phone, 
  Package, 
  FileText, 
  Calculator,
  Star,
  TrendingUp,
  Clock,
  Shield,
  Award,
  ArrowRight,
  X,
  Check,
  AlertCircle,
  Info,
  Zap,
  Gift,
  MessageCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import Footer from "@/components/layout/footer"

interface Service {
  id: number
  name: string
  price: number
  category: string
  description?: string
  features?: string[]
}

export default function OrderPage() {
  const searchParams = useSearchParams()
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    service_id: "",
    quantity: "1",
    size: "",
    material: "",
    notes: "",
  })

  const [designFile, setDesignFile] = useState<File | null>(null)

  useEffect(() => {
    fetchServices()

    // Pre-select service if provided in URL
    const serviceId = searchParams.get("service_id")
    if (serviceId) {
      setSelectedService(serviceId)
      setFormData((prev) => ({ ...prev, service_id: serviceId }))
    }
  }, [searchParams])

  const fetchServices = async () => {
    try {
      const response = await fetch("http://14.187.207.48:12122/api/services?is_active=true")
      const data = await response.json()
      setServices(data)
    } catch (error) {
      console.error("Error fetching services:", error)
    }
  }

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'customer_name':
        return value.length < 2 ? 'Tên phải có ít nhất 2 ký tự' : ''
      case 'customer_email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return !emailRegex.test(value) ? 'Email không hợp lệ' : ''
      case 'customer_phone':
        const phoneRegex = /^[0-9]{10,11}$/
        return !phoneRegex.test(value.replace(/\s/g, '')) ? 'Số điện thoại không hợp lệ' : ''
      case 'service_id':
        return !value ? 'Vui lòng chọn dịch vụ' : ''
      case 'quantity':
        const qty = parseInt(value)
        return qty < 1 ? 'Số lượng phải lớn hơn 0' : ''
      default:
        return ''
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      const newErrors = { ...errors }
      delete newErrors[field]
      setErrors(newErrors)
    }

    // Real-time validation
    const error = validateField(field, value)
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Lỗi",
          description: "File không được vượt quá 10MB",
          variant: "destructive",
        })
        return
      }
      setDesignFile(file)
      toast({
        title: "Thành công",
        description: `Đã tải file ${file.name}`,
      })
    }
  }

  const validateForm = (): boolean => {
    const requiredFields = ['customer_name', 'customer_email', 'customer_phone', 'service_id']
    const newErrors: Record<string, string> = {}

    requiredFields.forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData])
      if (error) {
        newErrors[field] = error
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng kiểm tra lại thông tin",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const submitData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value)
      })

      if (designFile) {
        submitData.append("design_file", designFile)
      }

      const response = await fetch("http://14.187.207.48:12122/api/orders", {
        method: "POST",
        body: submitData,
      })

      if (response.ok) {
        setSubmitted(true)
        toast({
          title: "Thành công",
          description: "Đơn hàng đã được gửi thành công!",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Lỗi",
          description: errorData.detail || "Có lỗi xảy ra khi gửi đơn hàng",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting order:", error)
      toast({
        title: "Lỗi",
        description: "Không thể gửi đơn hàng. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedServiceData = services.find((s) => s.id.toString() === selectedService)

  // Calculate form completion progress
  const formProgress = useMemo(() => {
    const fields = ['customer_name', 'customer_email', 'customer_phone', 'service_id']
    const completed = fields.filter(field => formData[field as keyof typeof formData]).length
    return (completed / fields.length) * 100
  }, [formData])

  // Success page with enhanced design
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <motion.div 
          className="flex items-center justify-center min-h-screen py-8 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="max-w-lg w-full shadow-2xl border border-gray-200 bg-white">
            <CardContent className="text-center p-8 lg:p-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="h-10 w-10 text-white" />
              </motion.div>

              <motion.h2 
                className="text-3xl font-bold text-gray-900 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Đặt hàng thành công! 🎉
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mb-8"
              >
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi. Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.
                </p>
                
                <div className="bg-gradient-to-r from-gray-50 to-red-50 p-4 rounded-xl border border-gray-200 mb-6">
                  <div className="flex items-center space-x-3 text-gray-800">
                    <Clock className="h-5 w-5 text-red-500" />
                    <span className="font-medium">Thời gian phản hồi: 15-30 phút</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-red-500" />
                    <span>Hotline: 1900-xxxx</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-600" />
                    <span>Email hỗ trợ</span>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <Button asChild className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <a href="/">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Về trang chủ
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full border-gray-300 text-gray-700 hover:border-red-400 hover:text-red-600 transition-all duration-300">
                  <a href="/services">Xem thêm dịch vụ</a>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Header với white-gray-red theme */}
      <section className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 text-white py-20 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-red-600/10 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-1/4 h-2/3 bg-gradient-to-tl from-gray-900/50 to-transparent rounded-full blur-3xl"></div>

        <div className="max-w-6xl mx-auto px-4 lg:px-6 text-center relative z-10">
          {/* Logo Phú Long */}
         

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6"
          >
            <ShoppingCart className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-sm font-semibold">Đặt hàng dễ dàng</span>
            <Zap className="h-4 w-4 text-red-400 ml-2" />
          </motion.div>

          <motion.h1 
            className="text-4xl lg:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Đặt hàng ngay
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Điền thông tin để đặt hàng và nhận báo giá chi tiết từ đội ngũ chuyên gia
          </motion.p>

          {/* Trust indicators */}
          <motion.div 
            className="flex flex-wrap justify-center gap-6 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-400" />
              <span className="text-sm">Bảo mật thông tin</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gray-300" />
              <span className="text-sm">Phản hồi nhanh</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-red-400" />
              <span className="text-sm">Chất lượng cao</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Progress Bar */}
      <motion.div 
        className="bg-white border-b border-gray-200 py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
              <span>Tiến độ hoàn thành</span>
              <span className="font-medium">{Math.round(formProgress)}%</span>
            </div>
            <Progress value={formProgress} className="h-2" />
          </div>
        </div>
      </motion.div>

      {/* Enhanced Order Form */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.form 
              onSubmit={handleSubmit} 
              className="grid lg:grid-cols-3 gap-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              {/* Enhanced Form Fields */}
              <div className="lg:col-span-2 space-y-8">
                {/* Customer Information Card */}
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <span className="text-xl">Thông tin khách hàng</span>
                        <p className="text-sm text-gray-500 font-normal">Vui lòng điền đầy đủ thông tin liên hệ</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="customer_name" className="text-sm font-medium flex items-center">
                          Họ và tên *
                          {errors.customer_name && <AlertCircle className="h-4 w-4 text-red-500 ml-1" />}
                        </Label>
                        <Input
                          id="customer_name"
                          value={formData.customer_name}
                          onChange={(e) => handleInputChange("customer_name", e.target.value)}
                          placeholder="Nhập họ và tên đầy đủ"
                          className={`h-12 transition-all duration-300 ${errors.customer_name ? 'border-red-400 focus:border-red-500' : 'focus:border-blue-400'}`}
                          required
                        />
                        {errors.customer_name && (
                          <p className="text-xs text-red-500 flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.customer_name}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customer_email" className="text-sm font-medium flex items-center">
                          Email *
                          {errors.customer_email && <AlertCircle className="h-4 w-4 text-red-500 ml-1" />}
                        </Label>
                        <Input
                          id="customer_email"
                          type="email"
                          value={formData.customer_email}
                          onChange={(e) => handleInputChange("customer_email", e.target.value)}
                          placeholder="example@email.com"
                          className={`h-12 transition-all duration-300 ${errors.customer_email ? 'border-red-400 focus:border-red-500' : 'focus:border-blue-400'}`}
                          required
                        />
                        {errors.customer_email && (
                          <p className="text-xs text-red-500 flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.customer_email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customer_phone" className="text-sm font-medium flex items-center">
                        Số điện thoại *
                        {errors.customer_phone && <AlertCircle className="h-4 w-4 text-red-500 ml-1" />}
                      </Label>
                      <Input
                        id="customer_phone"
                        value={formData.customer_phone}
                        onChange={(e) => handleInputChange("customer_phone", e.target.value)}
                        placeholder="0901 234 567"
                        className={`h-12 transition-all duration-300 ${errors.customer_phone ? 'border-red-400 focus:border-red-500' : 'focus:border-blue-400'}`}
                        required
                      />
                      {errors.customer_phone && (
                        <p className="text-xs text-red-500 flex items-center mt-1">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.customer_phone}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Service Selection Card */}
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <span className="text-xl">Chọn thiết kế</span>
                        <p className="text-sm text-gray-500 font-normal">Lựa thiết kế phù hợp với nhu cầu</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="service_id" className="text-sm font-medium flex items-center">
                        Dịch vụ *
                        {errors.service_id && <AlertCircle className="h-4 w-4 text-red-500 ml-1" />}
                      </Label>
                      <Select
                        value={selectedService}
                        onValueChange={(value) => {
                          setSelectedService(value)
                          handleInputChange("service_id", value)
                        }}
                      >
                        <SelectTrigger className={`h-12 transition-all duration-300 ${errors.service_id ? 'border-red-400 focus:border-red-500' : 'focus:border-blue-400'}`}>
                          <SelectValue placeholder="Chọn thiết kế" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.id.toString()}>
                              <div className="flex items-center justify-between w-full">
                                <span>{service.name}</span>
                                <Badge variant="outline" className="ml-2">
                                  {service.price.toLocaleString("vi-VN")}đ
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.service_id && (
                        <p className="text-xs text-red-500 flex items-center mt-1">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.service_id}
                        </p>
                      )}
                    </div>

                    {/* Order Details */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantity" className="text-sm font-medium">Số lượng</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={formData.quantity}
                          onChange={(e) => handleInputChange("quantity", e.target.value)}
                          placeholder="1"
                          className="h-12 focus:border-blue-400 transition-all duration-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="size" className="text-sm font-medium">Kích thước</Label>
                        <Input
                          id="size"
                          value={formData.size}
                          onChange={(e) => handleInputChange("size", e.target.value)}
                          placeholder="VD: A4, A3, 210x297mm"
                          className="h-12 focus:border-blue-400 transition-all duration-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="material" className="text-sm font-medium">Chất liệu</Label>
                        <Input
                          id="material"
                          value={formData.material}
                          onChange={(e) => handleInputChange("material", e.target.value)}
                          placeholder="VD: Giấy couche, Canvas"
                          className="h-12 focus:border-blue-400 transition-all duration-300"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* File Upload & Notes Card */}
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <span className="text-xl">File thiết kế & Ghi chú</span>
                        <p className="text-sm text-gray-500 font-normal">Tải lên file và thêm yêu cầu đặc biệt</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Enhanced File Upload */}
                    <div>
                      <Label htmlFor="design_file" className="text-sm font-medium mb-3 block">File thiết kế</Label>
                      <div className="relative">
                        <label className={`group flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
                          designFile 
                            ? 'border-green-400 bg-green-50' 
                            : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
                        }`}>
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {designFile ? (
                              <>
                                <CheckCircle className="w-10 h-10 mb-3 text-green-500" />
                                <p className="text-sm text-green-700 font-medium mb-1">File đã tải lên thành công!</p>
                                <p className="text-xs text-green-600">{designFile.name}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {(designFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </>
                            ) : (
                              <>
                                <Upload className="w-10 h-10 mb-3 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" />
                                <p className="mb-2 text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                                  <span className="font-semibold">Click để tải file</span> hoặc kéo thả file vào đây
                                </p>
                                <p className="text-xs text-gray-500">PNG, JPG, PDF, AI, PSD (Tối đa 10MB)</p>
                              </>
                            )}
                          </div>
                          <input
                            id="design_file"
                            type="file"
                            className="hidden"
                            accept=".png,.jpg,.jpeg,.pdf,.ai,.psd"
                            onChange={handleFileChange}
                          />
                        </label>
                        {designFile && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDesignFile(null)}
                            className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-red-50 hover:border-red-300"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-sm font-medium">Ghi chú & Yêu cầu đặc biệt</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        placeholder="VD: In màu, lưu ý gấp gọn, thời gian giao hàng..."
                        rows={4}
                        className="resize-none focus:border-blue-400 transition-all duration-300"
                      />
                      <div className="text-xs text-gray-500 flex items-center">
                        <Info className="h-3 w-3 mr-1" />
                        Thông tin chi tiết sẽ giúp chúng tôi phục vụ bạn tốt hơn
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Order Summary */}
              <div className="space-y-6">
                <Card className="sticky top-4 border-0 shadow-xl bg-white/95 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    {/* Logo Phú Long */}
                    <div className="flex items-center justify-center mb-4">
                      <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-red-50 to-gray-50 rounded-xl border border-red-200/50">
                        <img
                          src="https://i.imgur.com/WXSBk46.png"
                          alt="Phú Long"
                          className="h-8 w-auto object-contain"
                        />
                      </div>
                    </div>
                    
                    <CardTitle className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                        <Calculator className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-xl">Tóm tắt đơn hàng</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {selectedServiceData ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200 mb-4">
                          <h4 className="font-bold text-lg text-gray-900">{selectedServiceData.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{selectedServiceData.category}</p>
                          <Badge className="mt-2 bg-gradient-to-r from-blue-600 to-purple-600">
                            <Star className="h-3 w-3 mr-1" />
                            Dịch vụ phổ biến
                          </Badge>
                        </div>

                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Đơn giá:</span>
                            <span className="font-semibold text-gray-900">
                              {selectedServiceData.price.toLocaleString("vi-VN")}đ
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Số lượng:</span>
                            <span className="font-medium">{formData.quantity}</span>
                          </div>

                          {formData.size && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-gray-600">Kích thước:</span>
                              <span className="font-medium">{formData.size}</span>
                            </div>
                          )}

                          {formData.material && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-gray-600">Chất liệu:</span>
                              <span className="font-medium">{formData.material}</span>
                            </div>
                          )}
                        </div>

                        <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border border-red-200 mt-4">
                          <div className="flex justify-between items-center text-lg font-bold">
                            <span className="text-gray-900">Tổng cộng:</span>
                            <span className="text-red-600">
                              {(selectedServiceData.price * Number.parseInt(formData.quantity || "1")).toLocaleString("vi-VN")}đ
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2 flex items-center">
                            <Info className="h-3 w-3 mr-1" />
                            Giá cuối cùng có thể thay đổi tùy theo yêu cầu cụ thể
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Chọn dịch vụ để xem tóm tắt</p>
                      </div>
                    )}

                    {/* Enhanced Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full h-14 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-300 text-lg font-semibold group" 
                      disabled={loading || Object.keys(errors).length > 0}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3" />
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                          Gửi đơn hàng
                          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </>
                      )}
                    </Button>

                    {/* Trust Indicators */}
                    <div className="text-center space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center justify-center space-x-2 bg-green-50 p-3 rounded-lg border border-green-200">
                          <Shield className="h-4 w-4 text-green-600" />
                          <span className="text-green-800 font-medium">Bảo mật</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-800 font-medium">Nhanh chóng</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 leading-relaxed">
                        Bằng cách gửi đơn hàng, bạn đồng ý với{" "}
                        <a href="/terms" className="text-red-600 hover:underline">điều khoản dịch vụ</a>{" "}
                        của chúng tôi
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Support Card */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Cần hỗ trợ?</h3>
                    <p className="text-sm text-gray-600 mb-4">Liên hệ ngay với đội ngũ tư vấn</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-center space-x-2">
                        <Phone className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Hotline: 0977007763</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <Mail className="h-4 w-4 text-blue-600" />
                        <span>inphulong@gmail.com</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.form>
          </div>
        </div>
      </section>
      <Footer />
      
    </div>
  )
}
