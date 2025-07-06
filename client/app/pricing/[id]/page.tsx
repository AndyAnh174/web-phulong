"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Loader2, 
  ArrowLeft, 
  Clock, 
  Calendar, 
  Printer,
  ExternalLink,
  Download,
  Share2,
  Phone,
  MessageCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import { motion } from "framer-motion"
import Link from "next/link"

export default function PrintingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`http://14.187.207.48:12122/api/printing/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Không tìm thấy bài đăng");
        return res.json();
      })
      .then(setData)
      .catch(e => setError(e.message || "Lỗi không xác định"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-red-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-red-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400/20 to-red-600/20 animate-pulse"></div>
          </div>
          <p className="mt-4 text-gray-600">Đang tải chi tiết...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-red-50/30 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8">
            <Printer className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-700 mb-2">Không tìm thấy</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Lấy danh sách ảnh từ image_urls hoặc images
  const allImages = [
    ...(data.image_urls?.filter((url: string) => url.trim()) || []).map((url: string) => ({
      type: 'url',
      src: url,
      alt: data.title
    })),
    ...(data.images || []).map((img: any) => ({
      type: 'api',
      src: img.image.url.startsWith('http') ? img.image.url : `http://14.187.207.48:12122${img.image.url}`,
      alt: img.image.alt_text || data.title
    }))
  ];

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-red-50/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
      <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-red-50/30 to-transparent"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-gray-200/50 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="hover:bg-red-50 text-gray-700 hover:text-red-700"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Button>
              
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm" className="border-gray-300">
                  <Share2 className="h-4 w-4 mr-2" />
                  Chia sẻ
                </Button>
                <Button 
                  asChild
                  size="sm" 
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                >
                  <Link href="/contact">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Liên hệ
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid lg:grid-cols-3 gap-8"
          >
            {/* Images Section */}
            <div className="lg:col-span-2">
              {allImages.length > 0 ? (
                <div className="space-y-4">
                  {/* Main image */}
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-red-50 to-gray-50 shadow-lg">
                    <img
                      src={allImages[selectedImageIndex]?.src}
                      alt={allImages[selectedImageIndex]?.alt}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg?height=400&width=600';
                      }}
                    />
                    
                    {/* Image navigation */}
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                        
                        {/* Image counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                          <Badge className="bg-black/70 text-white">
                            {selectedImageIndex + 1} / {allImages.length}
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Thumbnail grid */}
                  {allImages.length > 1 && (
                    <div className="grid grid-cols-6 gap-2">
                      {allImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            index === selectedImageIndex 
                              ? 'border-red-500 shadow-lg scale-105' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={image.src}
                            alt={image.alt}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.svg?height=80&width=80';
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video rounded-xl bg-gradient-to-br from-red-100 to-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <Printer className="h-16 w-16 text-red-400 mx-auto mb-4" />
                    <p className="text-gray-600">Chưa có hình ảnh</p>
                  </div>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="shadow-xl border border-gray-200/50 bg-white/90 backdrop-blur-sm sticky top-24">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold text-red-700 mb-3 leading-tight">
                      {data.title}
                    </CardTitle>
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2 text-red-500" />
                        <span className="text-sm">Thời gian: </span>
                        <Badge variant="outline" className="ml-2 border-red-200 text-red-700">
                          {data.time}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-red-500" />
                        <span className="text-sm">
                          Cập nhật: {new Date(data.updated_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>

                      {data.creator && (
                        <div className="flex items-center text-gray-600">
                          <Printer className="h-4 w-4 mr-2 text-red-500" />
                         
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-4">
               
                      
                      <Button 
                        asChild
                        variant="outline" 
                        className="w-full border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Link href="/contact">
                          <Phone className="h-4 w-4 mr-2" />
                          Liên hệ tư vấn
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>

          {/* Content Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12"
          >
            <Card className="shadow-lg border border-gray-200/50 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                  <Printer className="h-5 w-5 text-red-600 mr-2" />
                  Chi tiết dự án
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-lg max-w-none text-gray-800">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1 className="text-2xl font-bold text-red-700 mb-4 border-b border-red-200 pb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-xl font-semibold text-red-600 mb-3 mt-6">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">{children}</h3>,
                      p: ({ children }) => <p className="mb-4 leading-relaxed text-gray-700">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold text-red-700">{children}</strong>,
                      em: ({ children }) => <em className="italic text-gray-600">{children}</em>,
                      ul: ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4 ml-4">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 mb-4 ml-4">{children}</ol>,
                      li: ({ children }) => <li className="text-gray-700">{children}</li>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-red-300 pl-4 py-2 bg-red-50 rounded-r-lg my-4 italic text-gray-700">
                          {children}
                        </blockquote>
                      ),
                      code: ({ children }) => (
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-red-600 border">
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4 border">
                          {children}
                        </pre>
                      ),
                      a: ({ href, children }) => (
                        <a 
                          href={href} 
                          className="text-red-600 hover:text-red-700 underline font-medium"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {children}
                          <ExternalLink className="inline h-3 w-3 ml-1" />
                        </a>
                      ),
                    }}
                  >
                    {data.content}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 