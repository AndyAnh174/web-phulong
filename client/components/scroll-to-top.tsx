"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export default function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    // Small delay to ensure page has loaded, then scroll to top
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' // Instant scroll for better UX on route change
      })
    }

    // Use setTimeout to ensure DOM is ready
    const timeoutId = setTimeout(scrollToTop, 0)

    return () => clearTimeout(timeoutId)
  }, [pathname])

  return null
} 