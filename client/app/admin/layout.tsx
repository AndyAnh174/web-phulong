"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { AuthProvider, useAuth } from "@/contexts/auth-context"

// Wrapper component để sử dụng useAuth hook
function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading } = useAuth()
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === "/admin/login") {
      return
    }

    // Chỉ redirect khi đã load xong và chưa authenticated
    if (!isLoading && !isAuthenticated && !hasRedirected) {
      setHasRedirected(true)
      router.push("/admin/login")
    }
  }, [pathname, isAuthenticated, isLoading, router, hasRedirected])

  // Show loading for non-login pages
  if (isLoading && pathname !== "/admin/login") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  // Show login page without sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  // Show admin pages with sidebar only if authenticated
  if (isAuthenticated) {
    return (
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center space-x-2">
              <div className="bg-red-600 text-white px-2 py-1 rounded font-bold text-sm">Phú Long</div>
              <span className="text-gray-600">Quản trị</span>
            </div>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang chuyển hướng...</p>
      </div>
    </div>
  )
}

// Main layout component
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  )
}
