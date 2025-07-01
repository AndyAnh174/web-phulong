"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Search, MoreVertical, Edit, Trash, ChevronLeft, ChevronRight, User, Shield, Crown, Loader2, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { motion, AnimatePresence } from "framer-motion"

interface User {
  id: number
  username: string
  email: string
  role: string
  is_active: boolean
  created_at: string
}

interface FormData {
  username: string
  email: string
  password: string
  role: 'admin' | 'root'
  is_active: boolean
}

interface FormErrors {
  username?: string
  email?: string
  password?: string
  role?: string
}

const API_BASE_URL =  'http://14.187.180.6:12122/api'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    role: "admin",
    is_active: true,
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const { toast } = useToast()
  const { token, user: currentUser } = useAuth()
  const itemsPerPage = 10

  useEffect(() => {
    if (token) {
      fetchUsers()
    }
  }, [token, currentPage])

  const validateForm = (): boolean => {
    const errors: FormErrors = {}

    // Username validation
    if (!formData.username.trim()) {
      errors.username = "Tên đăng nhập là bắt buộc"
    } else if (formData.username.length < 3) {
      errors.username = "Tên đăng nhập phải có ít nhất 3 ký tự"
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới"
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email là bắt buộc"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Email không hợp lệ"
    }

    // Password validation (only for create, or when editing and password is provided)
    if (!selectedUser || formData.password) {
      if (!formData.password) {
        errors.password = "Mật khẩu là bắt buộc"
      } else if (formData.password.length < 6) {
        errors.password = "Mật khẩu phải có ít nhất 6 ký tự"
      }
    }

    // Role validation
    if (!['admin', 'root'].includes(formData.role)) {
      errors.role = "Vai trò không hợp lệ"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const skip = (currentPage - 1) * itemsPerPage
      const response = await fetch(`${API_BASE_URL}/users?skip=${skip}&limit=${itemsPerPage}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(Array.isArray(data) ? data : [])
        
        // Calculate total pages based on actual data
        const totalUsers = data.length || 0
        setTotalPages(Math.ceil(totalUsers / itemsPerPage) || 1)
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast({
          title: "Lỗi",
          description: errorData.detail || "Không thể tải danh sách người dùng",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối đến server. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    if (!validateForm()) return

    try {
      setSubmitting(true)
      const requestBody = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      }

      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        const newUser = await response.json()
        toast({
          title: "Thành công",
          description: `Tạo người dùng "${newUser.username}" thành công`,
        })
        setIsCreateDialogOpen(false)
        resetForm()
        fetchUsers()
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast({
          title: "Lỗi tạo người dùng",
          description: errorData.detail || "Không thể tạo người dùng. Vui lòng kiểm tra lại thông tin.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating user:", error)
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối đến server. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser || !validateForm()) return

    try {
      setSubmitting(true)
      const requestBody: any = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        role: formData.role,
        is_active: formData.is_active,
      }

      // Only include password if it's provided
      if (formData.password) {
        requestBody.password = formData.password
      }

      const response = await fetch(`${API_BASE_URL}/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        toast({
          title: "Thành công",
          description: `Cập nhật người dùng "${updatedUser.username}" thành công`,
        })
        setIsEditDialogOpen(false)
        resetForm()
        fetchUsers()
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast({
          title: "Lỗi cập nhật",
          description: errorData.detail || "Không thể cập nhật người dùng. Vui lòng kiểm tra lại thông tin.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối đến server. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      setSubmitting(true)
      const response = await fetch(`${API_BASE_URL}/users/${selectedUser.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Thành công",
          description: `Xóa người dùng "${selectedUser.username}" thành công`,
        })
        setIsDeleteDialogOpen(false)
        fetchUsers()
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast({
          title: "Lỗi xóa người dùng",
          description: errorData.detail || "Không thể xóa người dùng này.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối đến server. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      password: "", // Don't show password
      role: user.role as 'admin' | 'root',
      is_active: user.is_active,
    })
    setFormErrors({})
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      role: "admin",
      is_active: true,
    })
    setFormErrors({})
    setSelectedUser(null)
    setShowPassword(false)
  }

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (field in formErrors && formErrors[field as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [field as keyof FormErrors]: undefined }))
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'root':
        return <Crown className="w-4 h-4" />
      case 'admin':
        return <Shield className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'root':
        return 'destructive'
      case 'admin':
        return 'default'
      default:
        return 'secondary'
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Check ROOT permission
  const isRoot = currentUser?.role === "root"
  if (!isRoot) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 bg-white rounded-lg shadow-lg border"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không có quyền truy cập</h2>
          <p className="text-gray-600 mb-6">Chỉ ROOT mới có quyền truy cập vào trang quản lý người dùng.</p>
          <Button asChild className="bg-red-600 hover:bg-red-700">
            <a href="/admin/dashboard">Quay lại Dashboard</a>
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:justify-between md:items-center gap-4"
      >
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Quản lý người dùng
          </h2>
          <p className="text-gray-500 mt-1">Quản lý danh sách người dùng hệ thống (Chỉ Admin & Root)</p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)} 
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg"
          disabled={loading}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm người dùng
        </Button>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="text-xl font-semibold text-gray-800">
                Danh sách người dùng ({filteredUsers.length})
              </CardTitle>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tên, email hoặc vai trò..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-red-500 focus:ring-red-500"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
                  <p className="text-gray-500">Đang tải danh sách người dùng...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50">
                        <TableHead className="w-16">ID</TableHead>
                        <TableHead>Tên đăng nhập</TableHead>
                        <TableHead className="hidden md:table-cell">Email</TableHead>
                        <TableHead>Vai trò</TableHead>
                        <TableHead className="hidden sm:table-cell">Trạng thái</TableHead>
                        <TableHead className="hidden lg:table-cell">Ngày tạo</TableHead>
                        <TableHead className="text-right w-20">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filteredUsers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center h-32">
                              <div className="flex flex-col items-center justify-center">
                                <User className="h-12 w-12 text-gray-300 mb-2" />
                                <p className="text-gray-500">Không tìm thấy người dùng nào</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredUsers.map((user, index) => (
                            <motion.tr
                              key={user.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-gray-50/50 transition-colors"
                            >
                              <TableCell className="font-mono text-sm">{user.id}</TableCell>
                              <TableCell>
                                <div className="font-medium text-gray-900">{user.username}</div>
                                <div className="md:hidden text-sm text-gray-500 truncate max-w-32">
                                  {user.email}
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-gray-600">
                                {user.email}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={getRoleBadgeVariant(user.role)}
                                  className="flex items-center gap-1 w-fit"
                                >
                                  {getRoleIcon(user.role)}
                                  {user.role.toUpperCase()}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                <Badge variant={user.is_active ? "default" : "secondary"}>
                                  {user.is_active ? "Hoạt động" : "Vô hiệu"}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell text-gray-600">
                                {new Date(user.created_at).toLocaleDateString("vi-VN")}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Chỉnh sửa
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => openDeleteDialog(user)} 
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <Trash className="mr-2 h-4 w-4" />
                                      Xóa
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </motion.tr>
                          ))
                        )}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {filteredUsers.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t bg-gray-50/50">
                    <div className="text-sm text-gray-500 mb-2 sm:mb-0">
                      Hiển thị {filteredUsers.length} / {users.length} người dùng
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="h-8"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm px-2">
                        Trang {currentPage} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="h-8"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Thêm người dùng mới</DialogTitle>
            <DialogDescription>
              Tạo tài khoản mới với vai trò Admin hoặc Root
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Tên đăng nhập <span className="text-red-500">*</span>
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                placeholder="Nhập tên đăng nhập (chỉ chữ, số, _)"
                className={formErrors.username ? "border-red-500 focus:border-red-500" : ""}
              />
              {formErrors.username && (
                <p className="text-xs text-red-500">{formErrors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Nhập địa chỉ email"
                className={formErrors.email ? "border-red-500 focus:border-red-500" : ""}
              />
              {formErrors.email && (
                <p className="text-xs text-red-500">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Mật khẩu <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  className={formErrors.password ? "border-red-500 focus:border-red-500 pr-10" : "pr-10"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {formErrors.password && (
                <p className="text-xs text-red-500">{formErrors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">
                Vai trò <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.role} 
                onValueChange={(value: 'admin' | 'root') => handleInputChange("role", value)}
              >
                <SelectTrigger className={formErrors.role ? "border-red-500" : ""}>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Admin - Quản lý nội dung
                    </div>
                  </SelectItem>
                  <SelectItem value="root">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      Root - Toàn quyền hệ thống
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {formErrors.role && (
                <p className="text-xs text-red-500">{formErrors.role}</p>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange("is_active", checked)}
              />
              <Label htmlFor="is_active" className="text-sm">
                Kích hoạt tài khoản ngay
              </Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreateDialogOpen(false)
                resetForm()
              }}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button 
              onClick={handleCreateUser} 
              className="bg-red-600 hover:bg-red-700"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                "Tạo người dùng"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Chỉnh sửa người dùng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cho "{selectedUser?.username}"
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username" className="text-sm font-medium">
                Tên đăng nhập <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                placeholder="Nhập tên đăng nhập"
                className={formErrors.username ? "border-red-500 focus:border-red-500" : ""}
              />
              {formErrors.username && (
                <p className="text-xs text-red-500">{formErrors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email" className="text-sm font-medium">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Nhập email"
                className={formErrors.email ? "border-red-500 focus:border-red-500" : ""}
              />
              {formErrors.email && (
                <p className="text-xs text-red-500">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-password" className="text-sm font-medium">
                Mật khẩu mới (để trống nếu không thay đổi)
              </Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  className={formErrors.password ? "border-red-500 focus:border-red-500 pr-10" : "pr-10"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {formErrors.password && (
                <p className="text-xs text-red-500">{formErrors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-role" className="text-sm font-medium">
                Vai trò <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.role} 
                onValueChange={(value: 'admin' | 'root') => handleInputChange("role", value)}
              >
                <SelectTrigger className={formErrors.role ? "border-red-500" : ""}>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Admin - Quản lý nội dung
                    </div>
                  </SelectItem>
                  <SelectItem value="root">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      Root - Toàn quyền hệ thống
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {formErrors.role && (
                <p className="text-xs text-red-500">{formErrors.role}</p>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="edit-is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange("is_active", checked)}
              />
              <Label htmlFor="edit-is_active" className="text-sm">
                Tài khoản hoạt động
              </Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditDialogOpen(false)
                resetForm()
              }}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button 
              onClick={handleUpdateUser} 
              className="bg-red-600 hover:bg-red-700"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                "Cập nhật"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-red-600">Xác nhận xóa người dùng</DialogTitle>
            <DialogDescription className="pt-2">
              Bạn có chắc chắn muốn xóa người dùng <strong>"{selectedUser?.username}"</strong>?
              <br />
              <span className="text-red-600 font-medium">Hành động này không thể hoàn tác!</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteUser}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa người dùng"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
