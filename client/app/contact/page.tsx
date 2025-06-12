"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, MessageCircle, Headphones, Award } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { motion } from "framer-motion"

interface Config {
  CONTACT_PHONE: string
  CONTACT_EMAIL: string
  CONTACT_ADDRESS: string
}

export default function ContactPage() {
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await api.config.getPublicEnv()
        setConfig(data)
      } catch (error) {
        console.error("Failed to load config:", error)
      }
    }
    
    fetchConfig()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name?.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập họ tên",
        variant: "destructive",
      })
      return
    }

    if (!formData.email?.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập email",
        variant: "destructive",
      })
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Lỗi",
        description: "Email không hợp lệ",
        variant: "destructive",
      })
      return
    }

    if (!formData.phone?.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập số điện thoại",
        variant: "destructive",
      })
      return
    }

    if (!formData.subject?.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tiêu đề",
        variant: "destructive",
      })
      return
    }

    if (!formData.message?.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập nội dung",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Sử dụng API helper với field 'name'
      const response = await api.contact.submit({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      })

      // Success
      setSubmitted(true)
      toast({
        title: "Thành công",
        description: response.message || "Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể.",
      })

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      })

    } catch (error) {
      console.error("Error submitting contact:", error)
      
      const errorMessage = error instanceof Error ? error.message : "Không thể gửi liên hệ. Vui lòng thử lại sau."
      
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 text-white py-20 overflow-hidden">
        {/* Background Pattern */}
                 <div className="absolute inset-0 opacity-5" style={{
           backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 20 0 L 0 0 0 20' fill='none' stroke='white' strokeWidth='0.5' opacity='0.1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`
         }}></div>
        
        <div className="max-w-6xl mx-auto px-4 lg:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
              <MessageCircle className="h-5 w-5 text-white mr-2" />
              <span className="text-sm font-semibold text-white">
                Liên hệ với chúng tôi
              </span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Sẵn sàng hỗ trợ
              <span className="block text-red-200">mọi lúc mọi nơi</span>
            </h1>
            <p className="text-xl text-red-100 max-w-3xl mx-auto leading-relaxed">
              Đội ngũ chuyên nghiệp của chúng tôi luôn sẵn sàng tư vấn và hỗ trợ bạn 
              <span className="text-white font-semibold"> 24/7</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 relative z-10">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid lg:grid-cols-5 gap-12"
          >
            {/* Contact Information - 2 columns */}
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
              {/* Contact Info Card */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                    <Phone className="h-6 w-6 text-red-600 mr-3" />
                    Thông tin liên hệ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {config?.CONTACT_ADDRESS && (
                    <div className="flex items-start space-x-4 p-4 rounded-xl bg-gray-50/80 hover:bg-red-50/80 transition-colors duration-300">
                      <div className="bg-gradient-to-br from-red-100 to-red-50 p-3 rounded-xl">
                        <MapPin className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Địa chỉ</h3>
                        <p className="text-gray-600 leading-relaxed">{config.CONTACT_ADDRESS}</p>
                      </div>
                    </div>
                  )}

                  {config?.CONTACT_PHONE && (
                    <div className="flex items-start space-x-4 p-4 rounded-xl bg-gray-50/80 hover:bg-red-50/80 transition-colors duration-300">
                      <div className="bg-gradient-to-br from-red-100 to-red-50 p-3 rounded-xl">
                        <Phone className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Điện thoại</h3>
                        <a 
                          href={`tel:${config.CONTACT_PHONE}`}
                          className="text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
                        >
                          {config.CONTACT_PHONE}
                        </a>
                      </div>
                    </div>
                  )}

                  {config?.CONTACT_EMAIL && (
                    <div className="flex items-start space-x-4 p-4 rounded-xl bg-gray-50/80 hover:bg-red-50/80 transition-colors duration-300">
                      <div className="bg-gradient-to-br from-red-100 to-red-50 p-3 rounded-xl">
                        <Mail className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                        <a 
                          href={`mailto:${config.CONTACT_EMAIL}`}
                          className="text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
                        >
                          {config.CONTACT_EMAIL}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start space-x-4 p-4 rounded-xl bg-gray-50/80 hover:bg-red-50/80 transition-colors duration-300">
                    <div className="bg-gradient-to-br from-red-100 to-red-50 p-3 rounded-xl">
                      <Clock className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Giờ làm việc</h3>
                      <div className="text-gray-600 space-y-1 text-sm">
                        <p>Thứ 2 - Thứ 6: 8:00 - 17:30</p>
                        <p>Thứ 7: 8:00 - 12:00</p>
                        <p>Chủ nhật: Nghỉ</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Contact Card */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-white border-red-100">
                <CardHeader>
                  <CardTitle className="text-red-800 flex items-center">
                    <Headphones className="h-5 w-5 mr-2" />
                    Hỗ trợ nhanh
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-red-700">Cần hỗ trợ gấp? Liên hệ ngay với chúng tôi</p>
                  <div className="space-y-3">
                    <Button asChild className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                      <a href={`tel:${config?.CONTACT_PHONE}`} className="flex items-center justify-center">
                        <Phone className="mr-2 h-4 w-4" />
                        {config?.CONTACT_PHONE || "Gọi ngay"}
                      </a>
                    </Button>
                    
                    <Button asChild variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300">
                      <a href={`mailto:${config?.CONTACT_EMAIL}`} className="flex items-center justify-center">
                        <Mail className="mr-2 h-4 w-4" />
                        Gửi email
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Badge */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-50 to-white">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-50 p-3 rounded-xl">
                      <Award className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Cam kết chất lượng</h3>
                      <p className="text-sm text-gray-600">Phản hồi trong 30 phút</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Form - 3 columns */}
            <motion.div variants={itemVariants} className="lg:col-span-3">
              <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-8">
                  <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                    <Send className="h-6 w-6 text-red-600 mr-3" />
                    Gửi tin nhắn cho chúng tôi
                  </CardTitle>
                  <p className="text-gray-600 mt-2">
                    Chúng tôi sẽ phản hồi trong thời gian sớm nhất có thể
                  </p>
                </CardHeader>
                <CardContent>
                  {submitted ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="text-center py-12"
                    >
                      <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-10 w-10 text-red-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Gửi thành công!</h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                        Cảm ơn bạn đã liên hệ với chúng tôi. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
                      </p>
                      <Button 
                        onClick={() => setSubmitted(false)} 
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Gửi tin nhắn khác
                      </Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-gray-700 font-medium">
                            Họ và tên <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            placeholder="Nhập họ và tên"
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500/20"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-gray-700 font-medium">
                            Email <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            placeholder="Nhập email của bạn"
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500/20"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-gray-700 font-medium">
                            Số điện thoại <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            placeholder="Nhập số điện thoại (VD: 0797526990)"
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500/20"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subject" className="text-gray-700 font-medium">
                            Chủ đề <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="subject"
                            value={formData.subject}
                            onChange={(e) => handleInputChange("subject", e.target.value)}
                            placeholder="Nhập chủ đề"
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500/20"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-gray-700 font-medium">
                          Nội dung <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => handleInputChange("message", e.target.value)}
                          placeholder="Nhập nội dung tin nhắn của bạn..."
                          rows={6}
                          className="border-gray-300 focus:border-red-500 focus:ring-red-500/20 resize-none"
                          required
                        />
                      </div>

                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <Send className="mr-3 h-5 w-5" />
                            Gửi tin nhắn
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Vị trí của chúng tôi
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ghé thăm showroom để trải nghiệm trực tiếp các sản phẩm in ấn chất lượng cao
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-gray-100 to-red-50 h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Bản đồ sẽ được hiển thị tại đây</h3>
                <p className="text-sm text-gray-500">Tích hợp Google Maps hoặc dịch vụ bản đồ khác</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
