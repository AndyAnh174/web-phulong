import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Toaster } from "@/components/ui/toaster"
import ScrollToTop from "@/components/scroll-to-top"
import ScrollToTopButton from "@/components/scroll-to-top-button"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Phú Long - Dịch vụ in ấn chuyên nghiệp",
    template: "%s | Phú Long"
  },
  description: "Chuyên cung cấp dịch vụ in ấn chất lượng cao với công nghệ hiện đại. In offset, in kỹ thuật số, thiết kế đồ họa, branding chuyên nghiệp tại TP.HCM.",
  keywords: ["in ấn", "in offset", "thiết kế đồ họa", "branding", "in kỹ thuật số", "phú long", "dịch vụ in ấn TPHCM", "in ấn chuyên nghiệp"],
  authors: [{ name: "Phú Long Team" }],
  creator: "Phú Long",
  publisher: "Phú Long",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://inphulong.com'), // Thay bằng domain thực của bạn
  alternates: {
    canonical: '/',
    languages: {
      'vi-VN': '/vi',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://inphulong.com', // Thay bằng domain thực của bạn
    siteName: 'Phú Long - Dịch vụ in ấn chuyên nghiệp',
    title: 'Phú Long - Dịch vụ in ấn chuyên nghiệp',
    description: 'Chuyên cung cấp dịch vụ in ấn chất lượng cao với công nghệ hiện đại. In offset, in kỹ thuật số, thiết kế đồ họa, branding chuyên nghiệp tại TP.HCM.',
    images: [
      {
        url: '/LOGO-MÀU.png',
        width: 1200,
        height: 630,
        alt: 'Phú Long - Dịch vụ in ấn chuyên nghiệp',
      },
      {
        url: '/LOGO NGANG.svg',
        width: 800,
        height: 600,
        alt: 'Logo Phú Long',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Phú Long - Dịch vụ in ấn chuyên nghiệp',
    description: 'Chuyên cung cấp dịch vụ in ấn chất lượng cao với công nghệ hiện đại. In offset, in kỹ thuật số, thiết kế đồ họa, branding chuyên nghiệp.',
    images: ['/LOGO-MÀU.png'],
    creator: '@phulong_printing', // Thay bằng Twitter handle thực của bạn
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#dc2626', // Màu chủ đạo của brand
      },
    ],
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'your-google-verification-code', // Thêm mã xác minh Google Search Console
    // bing: 'your-bing-verification-code', // Thêm mã xác minh Bing Webmaster Tools
  },
  category: 'business',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <head>
        {/* Additional SEO meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#dc2626" />
        <meta name="msapplication-TileColor" content="#dc2626" />
        
        {/* Structured Data for Business */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Phú Long",
              "description": "Chuyên cung cấp dịch vụ in ấn chất lượng cao với công nghệ hiện đại",
              "image": "https://inphulong.com/LOGO-MÀU.png", // Thay bằng domain thực
              "telephone": "+84-xxx-xxx-xxx", // Thêm số điện thoại thực
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Địa chỉ cụ thể", // Thêm địa chỉ thực
                "addressLocality": "TP. Hồ Chí Minh",
                "addressCountry": "VN"
              },
              "url": "https://inphulong.com", // Thay bằng domain thực
              "sameAs": [
                "https://facebook.com/phulong", // Thêm link Facebook thực
                "https://instagram.com/phulong" // Thêm link Instagram thực
              ],
              "openingHours": "Mo-Fr 08:00-17:00, Sa 08:00-12:00",
              "priceRange": "$$",
              "areaServed": "TP. Hồ Chí Minh, Việt Nam"
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <ScrollToTop />
        <Header />
        <main>{children}</main>
        <ScrollToTopButton />
        <Toaster />
      </body>
    </html>
  )
}
