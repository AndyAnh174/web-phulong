import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Phú Long In Ấn - Dịch vụ in ấn chuyên nghiệp",
    template: "%s | Phú Long In Ấn"
  },
  description: "Phú Long In Ấn - Công ty in ấn chuyên nghiệp hàng đầu với hơn 20 năm kinh nghiệm. Cung cấp đầy đủ dịch vụ in offset, in digital, name card, catalogue, sticker và thiết kế đồ họa với chất lượng cao, giá cả cạnh tranh.",
  keywords: [
    "in ấn",
    "in offset",
    "in digital", 
    "name card",
    "catalogue",
    "sticker",
    "thiết kế đồ họa",
    "Phú Long",
    "in ấn chuyên nghiệp",
    "in ấn TP.HCM",
    "công ty in ấn",
    "dịch vụ in ấn",
    "in brochure",
    "in poster",
    "in banner"
  ],
  authors: [{ name: "Phú Long In Ấn" }],
  creator: "Phú Long In Ấn",
  publisher: "Phú Long In Ấn",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://phulong.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://phulong.com',
    siteName: "Phú Long In Ấn",
    title: "Phú Long In Ấn - Dịch vụ in ấn chuyên nghiệp",
    description: "Công ty in ấn chuyên nghiệp với hơn 20 năm kinh nghiệm. Dịch vụ in offset, digital, name card, catalogue, sticker và thiết kế đồ họa chất lượng cao.",
    images: [
      {
        url: '/logo/LOGO-MÀU.png',
        width: 1200,
        height: 630,
        alt: 'Phú Long In Ấn Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Phú Long In Ấn - Dịch vụ in ấn chuyên nghiệp",
    description: "Công ty in ấn chuyên nghiệp với hơn 20 năm kinh nghiệm",
    images: ['/logo/LOGO-MÀU.png'],
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
  verification: {
    google: 'your-google-verification-code',
    // Thêm các verification code khác nếu cần
  },
  category: 'business',
  classification: 'Printing Services',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="canonical" href={process.env.NEXT_PUBLIC_SITE_URL} />
        <meta name="theme-color" content="#dc2626" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Phú Long In Ấn" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Phú Long In Ấn" />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Phú Long In Ấn",
              "description": "Công ty in ấn chuyên nghiệp với hơn 20 năm kinh nghiệm",
              "image": `${process.env.NEXT_PUBLIC_SITE_URL}/logo/LOGO-MÀU.png`,
              "address": {
                "@type": "PostalAddress",
                "streetAddress": process.env.NEXT_PUBLIC_CONTACT_ADDRESS || "123 Đường ABC",
                "addressLocality": "TP. Hồ Chí Minh",
                "addressCountry": "VN"
              },
              "telephone": process.env.NEXT_PUBLIC_CONTACT_PHONE || "+84 123 456 789",
              "email": process.env.NEXT_PUBLIC_CONTACT_EMAIL || "info@phulong.com",
              "url": process.env.NEXT_PUBLIC_SITE_URL,
              "sameAs": [
                process.env.NEXT_PUBLIC_FACEBOOK_URL,
                process.env.NEXT_PUBLIC_INSTAGRAM_URL,
                process.env.NEXT_PUBLIC_YOUTUBE_URL
              ].filter(Boolean),
              "openingHours": [
                "Mo-Fr 08:00-17:30",
                "Sa 08:00-12:00"
              ],
              "priceRange": "$$",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "150"
              },
              "service": [
                {
                  "@type": "Service",
                  "name": "In Offset",
                  "description": "Dịch vụ in offset chất lượng cao cho số lượng lớn"
                },
                {
                  "@type": "Service",
                  "name": "In Digital",
                  "description": "In digital nhanh chóng cho số lượng nhỏ"
                },
                {
                  "@type": "Service",
                  "name": "Name Card",
                  "description": "In name card cao cấp với nhiều chất liệu"
                },
                {
                  "@type": "Service", 
                  "name": "Thiết kế đồ họa",
                  "description": "Dịch vụ thiết kế đồ họa chuyên nghiệp"
                }
              ]
            })
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
