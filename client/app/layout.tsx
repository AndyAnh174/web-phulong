import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Phú Long - Dịch vụ in ấn chuyên nghiệp",
  description: "Chuyên cung cấp dịch vụ in ấn chất lượng cao với công nghệ hiện đại",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
              <Toaster />
      </body>
    </html>
  )
}
