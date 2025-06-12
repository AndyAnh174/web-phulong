"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function AdminPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push("/admin/dashboard")
      } else {
        router.push("/admin/login")
      }
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">Đang chuyển hướng...</p>
      </div>
    </div>
  )
}
