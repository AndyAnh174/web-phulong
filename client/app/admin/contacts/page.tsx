"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, MoreVertical, Eye, Trash, ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface Contact {
  id: number
  fullname: string
  email: string
  phone: string
  subject: string
  message: string
  created_at: string
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

  const { toast } = useToast()
  const { token } = useAuth()
  const itemsPerPage = 10

  useEffect(() => {
    if (token) {
      fetchContacts()
    }
  }, [token, currentPage])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const skip = (currentPage - 1) * itemsPerPage
      const response = await fetch(`http://14.187.180.6:12122/api/contact/list?skip=${skip}&limit=${itemsPerPage}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setContacts(data)

        // Tính tổng số trang
        setTotalPages(Math.ceil(data.length / itemsPerPage) || 1)
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách liên hệ",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching contacts:", error)
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến server",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteContact = async () => {
    if (!selectedContact) return

    try {
      const response = await fetch(`http://14.187.180.6:12122/api/contact/${selectedContact.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Xóa liên hệ thành công",
        })
        setIsDeleteDialogOpen(false)
        fetchContacts()
      } else {
        const errorData = await response.json()
        toast({
          title: "Lỗi",
          description: errorData.detail || "Không thể xóa liên hệ",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting contact:", error)
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến server",
        variant: "destructive",
      })
    }
  }

  const openViewDialog = (contact: Contact) => {
    setSelectedContact(contact)
    setIsViewDialogOpen(true)
  }

  const openDeleteDialog = (contact: Contact) => {
    setSelectedContact(contact)
    setIsDeleteDialogOpen(true)
  }

  const filteredContacts = Array.isArray(contacts)
    ? contacts.filter(
        (contact) =>
          (contact.fullname?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
          (contact.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
          (contact.phone || "").includes(searchTerm) ||
          (contact.subject?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
      )
    : []

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Quản lý liên hệ</h2>
        <p className="text-gray-500">Quản lý danh sách liên hệ từ khách hàng</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Danh sách liên hệ</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm liên hệ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Điện thoại</TableHead>
                      <TableHead>Chủ đề</TableHead>
                      <TableHead>Ngày gửi</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center h-24">
                          Không tìm thấy liên hệ nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredContacts.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell>{contact.id}</TableCell>
                          <TableCell className="font-medium">{contact.fullname}</TableCell>
                          <TableCell>{contact.email}</TableCell>
                          <TableCell>{contact.phone}</TableCell>
                          <TableCell className="truncate max-w-[200px]">{contact.subject}</TableCell>
                          <TableCell>{new Date(contact.created_at).toLocaleDateString("vi-VN")}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openViewDialog(contact)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Xem chi tiết
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openDeleteDialog(contact)} className="text-red-600">
                                  <Trash className="mr-2 h-4 w-4" />
                                  Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Hiển thị {filteredContacts.length} / {contacts.length} liên hệ
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* View Contact Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chi tiết liên hệ #{selectedContact?.id}</DialogTitle>
            <DialogDescription>
              Ngày gửi: {selectedContact && new Date(selectedContact.created_at).toLocaleString("vi-VN")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Thông tin người gửi</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Họ tên:</span> {selectedContact?.fullname}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {selectedContact?.email}
                  </p>
                  <p>
                    <span className="font-medium">Điện thoại:</span> {selectedContact?.phone}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Chủ đề</h3>
                <p className="text-sm">{selectedContact?.subject}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Nội dung</h3>
              <div className="p-4 bg-gray-50 rounded-md text-sm">{selectedContact?.message}</div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Đóng
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setIsViewDialogOpen(false)
                if (selectedContact) openDeleteDialog(selectedContact)
              }}
            >
              Xóa liên hệ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Contact Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa liên hệ từ "{selectedContact?.fullname}"? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteContact}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
