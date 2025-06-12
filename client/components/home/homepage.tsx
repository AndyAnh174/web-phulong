"use client"

import Hero from "./hero"
import AboutSection from "./about-section"
import FeaturedServices from "./featured-services"
import GalleryPreview from "./gallery-preview"
import LatestBlog from "./latest-blog"
import PartnersLogos from "./partners-logos"
import ContactCTA from "./contact-cta"
import Footer from "../layout/footer"
export default function Homepage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section - Banner lớn với ảnh nổi bật + slogan */}
      <Hero />
      
      {/* About Section - Giới thiệu ngắn về công ty */}
      <AboutSection />
      
      {/* Featured Services - Danh sách dịch vụ in ấn nổi bật */}
      <FeaturedServices />
      
      {/* Gallery Preview - Image gallery với preview mẫu in đẹp */}
      <GalleryPreview />
      
      {/* Latest Blog - Blog mới nhất (2-3 bài) */}
      <LatestBlog />
      
      {/* Partners Logos - Logo đối tác */}
      <PartnersLogos />
      
      {/* Contact CTA - Call to Action với các button chính */}
      <ContactCTA />
      
      
    </main>
  )
} 