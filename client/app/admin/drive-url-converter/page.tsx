"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Copy, Check, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function DriveUrlConverter() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState<{ file_id: string; converted_url: string } | null>(null)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState("")
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [isConverting, setIsConverting] = useState(false)

  function extractFileId(url: string): string | null {
    const match = url.match(/\/d\/([\w-]+)/)
    return match ? match[1] : null
  }

  const handleConvert = async () => {
    setIsConverting(true)
    setError("")
    setResult(null)
    
    // Simulate loading for better UX
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const fileId = extractFileId(input.trim())
    if (!fileId) {
      setError("URL không hợp lệ hoặc không tìm thấy fileId!")
      setIsConverting(false)
      return
    }
    setResult({
      file_id: fileId,
      converted_url: `https://lh3.googleusercontent.com/d/${fileId}`
    })
    setIsConverting(false)
  }

  const handleCopy = async (text: string, type: string) => {
    try {
      // Try using the modern Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea")
        textArea.value = text
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        textArea.style.top = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        textArea.remove()
      }
      
      setCopied(type)
      setAlertMessage(`Đã copy ${type === 'file_id' ? 'File ID' : 'URL'} thành công!`)
      setShowAlert(true)
      
      // Hide alert after 2 seconds
      setTimeout(() => {
        setShowAlert(false)
        setCopied("")
      }, 2000)

      // Also show toast for additional feedback
      toast({ 
        title: "✅ Thành công!", 
        description: `${type === 'file_id' ? 'File ID' : 'URL'} đã được copy vào clipboard`,
      })

    } catch (err) {
      console.error('Failed to copy text: ', err)
      setAlertMessage("Lỗi khi copy! Vui lòng thử lại.")
      setShowAlert(true)
      
      setTimeout(() => {
        setShowAlert(false)
      }, 2000)

      toast({ 
        title: "❌ Lỗi!", 
        description: "Không thể copy vào clipboard. Vui lòng thử lại.",
        variant: "destructive"
      })
    }
  }

  // Custom Alert Component
  const CustomAlert = () => (
    <AnimatePresence>
      {showAlert && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            onClick={() => setShowAlert(false)}
          >
            {/* Alert Box */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 500 }}
              className="bg-white rounded-lg p-6 mx-4 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {alertMessage.includes("thành công") ? (
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-6 h-6 text-green-600" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {alertMessage.includes("thành công") ? "Thành công!" : "Có lỗi xảy ra!"}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {alertMessage}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => setShowAlert(false)}
                  variant="outline"
                  size="sm"
                  className="px-4"
                >
                  Đóng
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <div className="max-w-xl mx-auto py-12">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">📦 Google Drive URL Converter</h2>
            <p className="text-gray-600 text-sm">Nhập link Google Drive, nhận link ảnh trực tiếp.</p>
          </CardHeader>
          <CardContent>
            <Label htmlFor="drive-url">Google Drive URL</Label>
            <Input
              id="drive-url"
              placeholder="https://drive.google.com/file/d/your-file-id/view"
              value={input}
              onChange={e => setInput(e.target.value)}
              className="mt-2 mb-4"
              autoFocus
              disabled={isConverting}
            />
            <Button 
              onClick={handleConvert} 
              className="w-full mb-2" 
              disabled={!input.trim() || isConverting}
            >
              {isConverting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Đang chuyển đổi...
                </>
              ) : (
                "Chuyển đổi"
              )}
            </Button>
            
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-2 p-3 bg-red-50 rounded-lg border border-red-200"
              >
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
            
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 space-y-4 p-4 bg-green-50 rounded-lg border border-green-200"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-green-800">File ID:</span>
                  <span className="bg-white px-3 py-1 rounded-md text-sm font-mono border flex-1">
                    {result.file_id}
                  </span>
                  <Button 
                    size="sm" 
                    variant={copied === 'file_id' ? "default" : "outline"}
                    onClick={() => handleCopy(result.file_id, 'file_id')}
                    className="ml-2 transition-all duration-200"
                  >
                    {copied === 'file_id' ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-green-800 mt-2">URL:</span>
                  <div className="flex-1">
                    <a
                      href={result.converted_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline break-all text-sm hover:text-blue-800 transition-colors"
                    >
                      {result.converted_url}
                    </a>
                  </div>
                  <Button 
                    size="sm" 
                    variant={copied === 'url' ? "default" : "outline"}
                    onClick={() => handleCopy(result.converted_url, 'url')}
                    className="ml-2 transition-all duration-200"
                  >
                    {copied === 'url' ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
          <CardFooter>
            <div className="text-xs text-gray-500">
              Chỉ hỗ trợ link dạng <code className="bg-gray-100 px-1 py-0.5 rounded">https://drive.google.com/file/d/&lt;fileId&gt;/view</code>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Custom Alert Modal */}
      <CustomAlert />
    </>
  )
} 