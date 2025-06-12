"use client"

import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Package,
  FileText,
  ShoppingCart,
  Users,
  MessageSquare,
  LogOut,
  Settings,
  User,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Dịch vụ",
    url: "/admin/services",
    icon: Package,
  },
  {
    title: "Bài viết",
    url: "/admin/blogs",
    icon: FileText,
  },
  {
    title: "Đơn hàng",
    url: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Người dùng",
    url: "/admin/users",
    icon: Users,
    adminOnly: true,
  },
  {
    title: "Liên hệ",
    url: "/admin/contacts",
    icon: MessageSquare,
  },

]

export function AdminSidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center space-x-2 px-4 py-2">
          <div className="bg-red-600 text-white px-3 py-2 rounded-lg font-bold text-lg">Phú Long</div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Quản lý</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                // Kiểm tra quyền admin
                if (item.adminOnly && user?.role !== "admin" && user?.role !== "root") {
                  return null
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4 space-y-4">
          {user && (
            <div className="flex items-center space-x-2 px-2 py-1 rounded-md bg-gray-100">
              <div className="bg-red-100 p-2 rounded-full">
                <User className="h-4 w-4 text-red-600" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{user.username}</p>
                <p className="text-xs text-gray-500 truncate">{user.role}</p>
              </div>
            </div>
          )}
          <Button onClick={handleLogout} variant="outline" className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Đăng xuất
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
