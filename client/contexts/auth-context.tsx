"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: number
  username: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  checkAuth: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Kiểm tra token khi component mount - chỉ chạy 1 lần
  useEffect(() => {
    if (!hasCheckedAuth) {
      const storedToken = localStorage.getItem("admin_token")
      if (storedToken) {
        setToken(storedToken)
        checkAuthWithToken(storedToken)
      } else {
        setIsLoading(false)
        setHasCheckedAuth(true)
      }
    }
  }, [hasCheckedAuth])

  // Kiểm tra token có hợp lệ không
  const checkAuthWithToken = async (tokenToCheck: string): Promise<boolean> => {
    try {
      const response = await fetch("http://14.187.180.6:12122/api/users/me", {
        headers: {
          Authorization: `Bearer ${tokenToCheck}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setIsAuthenticated(true)
        setToken(tokenToCheck)
        setIsLoading(false)
        setHasCheckedAuth(true)
        return true
      } else {
        // Token không hợp lệ
        localStorage.removeItem("admin_token")
        setIsAuthenticated(false)
        setUser(null)
        setToken(null)
        setIsLoading(false)
        setHasCheckedAuth(true)
        return false
      }
    } catch (error) {
      console.error("Auth check error:", error)
      localStorage.removeItem("admin_token")
      setIsAuthenticated(false)
      setUser(null)
      setToken(null)
      setIsLoading(false)
      setHasCheckedAuth(true)
      return false
    }
  }

  // Kiểm tra token có hợp lệ không - public method
  const checkAuth = async (): Promise<boolean> => {
    const storedToken = localStorage.getItem("admin_token")
    if (!storedToken) {
      setIsAuthenticated(false)
      setUser(null)
      return false
    }
    return await checkAuthWithToken(storedToken)
  }

  // Đăng nhập
  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await fetch("http://14.187.180.6:12122/api/auth/login-json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("admin_token", data.access_token)
        setToken(data.access_token)

        // Lấy thông tin user
        const userResponse = await fetch("http://14.187.180.6:12122/api/users/me", {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
          },
        })

        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUser(userData)
          setIsAuthenticated(true)
          setHasCheckedAuth(true)
          toast({
            title: "Đăng nhập thành công",
            description: `Xin chào, ${userData.username}!`,
          })
          setIsLoading(false)
          return true
        }
      } else {
        const errorData = await response.json()
        const errorMessage =
          typeof errorData.detail === "string" ? errorData.detail : "Tên đăng nhập hoặc mật khẩu không đúng"

        toast({
          title: "Lỗi đăng nhập",
          description: errorMessage,
          variant: "destructive",
        })
        setIsLoading(false)
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến server",
        variant: "destructive",
      })
      setIsLoading(false)
      return false
    }

    setIsLoading(false)
    return false
  }

  // Đăng xuất
  const logout = () => {
    localStorage.removeItem("admin_token")
    setUser(null)
    setToken(null)
    setIsAuthenticated(false)
    setHasCheckedAuth(true)
    toast({
      title: "Đăng xuất thành công",
      description: "Bạn đã đăng xuất khỏi hệ thống",
    })
    router.push("/admin/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
