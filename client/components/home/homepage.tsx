"use client"

import { Suspense } from "react"
import Hero from "./hero"
import AboutSection from "./about-section"
import FeaturedServices from "./featured-services"
import FeaturedBlogServices from "./featured-blog-services"
import PartnersLogos from "./partners-logos"
import ContactCTA from "./contact-cta"
import { Skeleton } from "@/components/ui/skeleton"
import Footer from "@/components/layout/footer"

export default function Homepage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Banner lớn với ảnh nổi bật + slogan */}
      <Hero />
      
      {/* Dịch vụ nổi bật - Từ blog API */}
      <Suspense fallback={<ServicesSkeleton />}>
        <FeaturedBlogServices />
      </Suspense>
      
      {/* Bảng giá dịch vụ - Danh sách dịch vụ in ấn */}
      <Suspense fallback={<ServicesSkeleton />}>
        <FeaturedServices />
      </Suspense>
      
      {/* Về chúng tôi - Giới thiệu ngắn về công ty */}
      <AboutSection />
      
      {/* Đối tác thường xuyên - Thanh chạy logo */}
    
      
      {/* Liên hệ chúng tôi - Call to Action với các button chính */}
      <ContactCTA />
      <PartnersLogos />
      <Footer />
    </div>
  )
}

function ServicesSkeleton() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Skeleton className="h-8 w-64 mx-auto mb-4" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6">
              <Skeleton className="h-48 w-full mb-4 rounded" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 