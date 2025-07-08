"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import Head from "next/head"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Share2, 
  Facebook, 
  Twitter, 
  Clock,
  Eye,
  Heart,
  MessageCircle,
  BookOpen,
  ChevronUp,
  Copy,
  Check,
  Sparkles,
  List,
  Hash,
  Code,
  Quote,
  Table as TableIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Bookmark,
  Send,
  ArrowRight,
  Tag,
  TrendingUp,
  Printer,
  Palette,
  Megaphone,
  Lightbulb,
  Menu,
  X,
  Coffee,
  ZapIcon,
  Award,
  Star
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import { createSlug } from "@/lib/utils"

interface Blog {
  id: number
  title: string
  content: string
  image_url: string
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
  views?: number
  read_time?: number
  author?: string
  tags?: string[]
}

interface TocItem {
  id: string
  title: string
  level: number
}

interface RelatedBlog {
  id: number
  title: string
  image_url: string
  category: string
  created_at: string
  read_time?: number
}

// Predefined categories với icons
const CATEGORIES = {
  "in-offset": { label: "In Offset", icon: Printer, color: "bg-blue-100 text-blue-800" },
  "thiet-ke": { label: "Thiết kế", icon: Palette, color: "bg-purple-100 text-purple-800" },
  "meo-marketing": { label: "Mẹo Marketing", icon: Megaphone, color: "bg-green-100 text-green-800" },
  "xu-huong": { label: "Xu hướng", icon: TrendingUp, color: "bg-orange-100 text-orange-800" },
  "kien-thuc": { label: "Kiến thức", icon: Lightbulb, color: "bg-yellow-100 text-yellow-800" },
}

export default function BlogDetailPage() {
  const params = useParams()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [relatedBlogs, setRelatedBlogs] = useState<RelatedBlog[]>([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 100) + 20)
  const [bookmarkCount, setBookmarkCount] = useState(Math.floor(Math.random() * 50) + 10)
  const [readingProgress, setReadingProgress] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [showToc, setShowToc] = useState(false)
  const [estimatedReadTime, setEstimatedReadTime] = useState(0)
  const [startReadTime, setStartReadTime] = useState<Date | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (params.slug) {
      fetchBlogDetail()
      setStartReadTime(new Date())
    }
  }, [params.slug])

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrollTop / docHeight) * 100
      setReadingProgress(progress)
      setShowScrollTop(scrollTop > 500)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchBlogDetail = async () => {
    try {
      const response = await fetch(`http://14.187.207.48:12122/api/blogs/${params.slug}`)
      if (response.ok) {
        const data = await response.json()
        const enhancedBlog = {
          ...data,
          views: data.views || Math.floor(Math.random() * 2000) + 500,
          author: data.author || "PL team",
          tags: data.tags || ["in ấn", "thiết kế", "marketing"]
        }
        setBlog(enhancedBlog)
        setEstimatedReadTime(calculateReadingTime(enhancedBlog.content))
        
        // Fetch related blogs
        fetchRelatedBlogs(enhancedBlog.category)
      } else {
        toast({
          title: "Lỗi",
          description: "Không tìm thấy bài viết",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching blog:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải bài viết",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedBlogs = async (category: string) => {
    try {
      const response = await fetch(`http://14.187.207.48:12122/api/blogs?category=${category}&limit=4`)
      if (response.ok) {
        const data = await response.json()
        const blogData = Array.isArray(data) ? data : data.items || data.data || []
        // Import createSlug function for comparison
        const { createSlug } = await import('@/lib/utils')
        const currentSlug = params.slug as string
        
        const filtered = blogData
          .filter((b: any) => createSlug(b.title) !== currentSlug)
          .slice(0, 3)
          .map((b: any) => ({
            ...b,
            read_time: calculateReadingTime(b.content)
          }))
        setRelatedBlogs(filtered)
      }
    } catch (error) {
      console.error("Error fetching related blogs:", error)
    }
  }

  // Extract table of contents from markdown
  const tableOfContents = useMemo((): TocItem[] => {
    if (!blog?.content) return []
    
    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    const toc: TocItem[] = []
    let match

    while ((match = headingRegex.exec(blog.content)) !== null) {
      const level = match[1].length
      const title = match[2].trim()
      const id = title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()
      
      toc.push({ id, title, level })
    }
    
    return toc
  }, [blog?.content])

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length
    const minutes = Math.ceil(words / wordsPerMinute)
    return minutes
  }

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(prev => liked ? prev - 1 : prev + 1)
    toast({
      title: liked ? "Đã bỏ yêu thích" : "Đã thêm vào yêu thích",
      description: liked ? "Bài viết đã được bỏ khỏi danh sách yêu thích" : "Bài viết đã được thêm vào danh sách yêu thích",
    })
  }

  const handleBookmark = () => {
    setBookmarked(!bookmarked)
    setBookmarkCount(prev => bookmarked ? prev - 1 : prev + 1)
    toast({
      title: bookmarked ? "Đã bỏ lưu" : "Đã lưu bài viết",
      description: bookmarked ? "Bài viết đã được bỏ khỏi danh sách đã lưu" : "Bài viết đã được lưu để đọc sau",
    })
  }

  // Get category info
  const getCategoryInfo = (category: string) => {
    return CATEGORIES[category as keyof typeof CATEGORIES] || 
           { label: category, icon: BookOpen, color: "bg-gray-100 text-gray-800" }
  }

  const handleShare = async (platform?: string) => {
    const url = window.location.href
    const title = blog?.title || "Bài viết hay"

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast({
          title: "Đã sao chép liên kết",
          description: "Liên kết bài viết đã được sao chép vào clipboard",
        })
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Không thể sao chép liên kết",
          variant: "destructive",
        })
      }
      return
    }

    let shareUrl = ""
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
        break
      default:
        if (navigator.share) {
          try {
            await navigator.share({ title, url })
          } catch (error) {
            console.log('Share cancelled')
          }
        }
        return
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const copyCodeToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
      toast({
        title: "Đã sao chép",
        description: "Code đã được sao chép vào clipboard",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể sao chép code",
        variant: "destructive",
      })
    }
  }

  // Custom components for ReactMarkdown
  const components = {
    h1: ({node, children, ...props}: any) => {
      const text = children?.toString() || ''
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim()
      return (
        <h1 
          id={id}
          className="text-3xl font-bold text-red-700 mt-12 mb-8 pb-4 border-b-4 border-red-300 break-words scroll-mt-24 group"
          {...props}
        >
          <a href={`#${id}`} className="flex items-center group-hover:text-red-600 transition-colors">
            {children}
            <Hash className="ml-2 h-6 w-6 opacity-0 group-hover:opacity-50 transition-opacity" />
          </a>
        </h1>
      )
    },
    h2: ({node, children, ...props}: any) => {
      const text = children?.toString() || ''
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim()
      return (
        <h2 
          id={id}
          className="text-2xl font-bold text-gray-900 mt-10 mb-6 pb-3 border-b-2 border-red-200 break-words scroll-mt-24 group"
          {...props}
        >
          <a href={`#${id}`} className="flex items-center group-hover:text-red-600 transition-colors">
            {children}
            <Hash className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-50 transition-opacity" />
          </a>
        </h2>
      )
    },
    h3: ({node, children, ...props}: any) => {
      const text = children?.toString() || ''
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim()
      return (
        <h3 
          id={id}
          className="text-xl font-bold text-gray-800 mt-8 mb-4 pb-2 border-b border-gray-200 break-words scroll-mt-24 group"
          {...props}
        >
          <a href={`#${id}`} className="flex items-center group-hover:text-red-600 transition-colors">
            {children}
            <Hash className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
          </a>
        </h3>
      )
    },
    h4: ({node, children, ...props}: any) => {
      const text = children?.toString() || ''
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim()
      return (
        <h4 
          id={id}
          className="text-lg font-bold text-gray-800 mt-6 mb-3 break-words scroll-mt-24 group"
          {...props}
        >
          <a href={`#${id}`} className="flex items-center group-hover:text-red-600 transition-colors">
            {children}
            <Hash className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
          </a>
        </h4>
      )
    },
    h5: ({node, children, ...props}: any) => {
      const text = children?.toString() || ''
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim()
      return (
        <h5 
          id={id}
          className="text-base font-bold text-gray-800 mt-4 mb-2 break-words scroll-mt-24 group"
          {...props}
        >
          <a href={`#${id}`} className="flex items-center group-hover:text-red-600 transition-colors">
            {children}
            <Hash className="ml-2 h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
          </a>
        </h5>
      )
    },
    h6: ({node, children, ...props}: any) => {
      const text = children?.toString() || ''
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim()
      return (
        <h6 
          id={id}
          className="text-sm font-bold text-gray-800 mt-4 mb-2 break-words scroll-mt-24 group"
          {...props}
        >
          <a href={`#${id}`} className="flex items-center group-hover:text-red-600 transition-colors">
            {children}
            <Hash className="ml-2 h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
          </a>
        </h6>
      )
    },
    p: ({node, children, ...props}: any) => (
      <div className="text-base text-gray-700 leading-relaxed mb-6 break-words" {...props}>
        {children}
      </div>
    ),
    a: ({node, children, href, ...props}: any) => (
      <a 
        href={href}
        className="text-red-600 font-medium hover:text-red-700 hover:underline transition-colors duration-200 break-all inline-flex items-center gap-1"
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        {...props}
      >
        {children}
        {href?.startsWith('http') && <LinkIcon className="h-3 w-3" />}
      </a>
    ),
    strong: ({node, children, ...props}: any) => (
      <strong className="font-semibold text-gray-900" {...props}>{children}</strong>
    ),
    em: ({node, children, ...props}: any) => (
      <em className="italic text-gray-700" {...props}>{children}</em>
    ),
    code: ({node, className, children, ...props}: any) => {
      const isInline = !className?.includes('language-')
      const language = className?.replace('language-', '') || 'text'
      const codeString = String(children).replace(/\n$/, '')
      
      if (isInline) {
        return (
          <code 
            className="bg-gray-100 text-red-600 px-2 py-1 rounded text-sm font-mono border border-gray-200 break-words"
            {...props}
          >
            {children}
          </code>
        )
      }
      
      return (
        <div className="relative group my-6">
          <div className="flex items-center justify-between bg-gray-800 text-gray-300 px-4 py-2 text-sm rounded-t-lg border border-gray-700">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span className="font-medium">{language}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyCodeToClipboard(codeString)}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
            >
              {copiedCode === codeString ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <pre className="bg-gray-900 text-gray-100 p-4 overflow-x-auto rounded-b-lg border-x border-b border-gray-700">
            <code className="text-sm leading-relaxed" {...props}>
              {children}
            </code>
          </pre>
        </div>
      )
    },
    blockquote: ({node, children, ...props}: any) => (
      <blockquote 
        className="border-l-4 border-red-500 bg-red-50 pl-6 py-4 my-6 italic text-gray-700 rounded-r-lg shadow-sm break-words relative"
        {...props}
      >
        <Quote className="absolute top-4 left-2 h-4 w-4 text-red-400" />
        {children}
      </blockquote>
    ),
    ul: ({node, children, ...props}: any) => (
      <ul className="space-y-2 my-6 pl-6 break-words" {...props}>
        {children}
      </ul>
    ),
    ol: ({node, children, ...props}: any) => (
      <ol className="space-y-2 my-6 pl-6 break-words list-decimal" {...props}>
        {children}
      </ol>
    ),
    li: ({node, children, ...props}: any) => (
      <li className="text-gray-700 mb-2 relative break-words" {...props}>
        {children}
      </li>
    ),
    img: ({node, src, alt, ...props}: any) => (
      <div className="my-8">
        <div className="relative overflow-hidden rounded-lg shadow-lg border border-gray-200 group">
          <img 
            src={src}
            alt={alt}
            className="max-w-full h-auto mx-auto transition-transform duration-300 group-hover:scale-105" 
            {...props}
          />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Badge variant="secondary" className="bg-black/70 text-white">
              <ImageIcon className="h-3 w-3 mr-1" />
              {alt || 'Image'}
            </Badge>
          </div>
        </div>
        {alt && (
          <div className="text-center text-sm text-gray-600 mt-2 italic">
            {alt}
          </div>
        )}
      </div>
    ),
    table: ({node, children, ...props}: any) => (
      <div className="overflow-x-auto my-8 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 border-b border-gray-200">
          <TableIcon className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Bảng dữ liệu</span>
        </div>
        <table className="w-full border-collapse bg-white" {...props}>
          {children}
        </table>
      </div>
    ),
    th: ({node, children, ...props}: any) => (
      <th className="bg-gray-50 border border-gray-200 px-4 py-3 text-left font-semibold text-gray-900 text-sm" {...props}>
        {children}
      </th>
    ),
    td: ({node, children, ...props}: any) => (
      <td className="border border-gray-200 px-4 py-3 text-gray-700 text-sm" {...props}>
        {children}
      </td>
    ),
    hr: ({node, ...props}: any) => (
      <hr className="my-12 border-gray-300 border-t-2" {...props} />
    ),
    // Task list support
    input: ({node, type, checked, ...props}: any) => {
      if (type === 'checkbox') {
        return (
          <input 
            type="checkbox" 
            checked={checked}
            className="mr-2 rounded border-gray-300 text-red-600 focus:ring-red-500"
            disabled
            {...props}
          />
        )
      }
      return <input {...props} />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
        
        {/* Reading Progress Bar */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
          <div className="h-full bg-red-600 animate-pulse" style={{ width: '30%' }}></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8 relative z-10">
          <motion.div 
            className="animate-pulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-10 bg-gray-200 rounded-lg w-48 mb-8"></div>
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="h-64 md:h-80 bg-gray-200"></div>
              <div className="p-6 md:p-8">
                <div className="h-10 bg-gray-200 rounded-lg w-3/4 mb-6"></div>
                <div className="flex items-center space-x-4 mb-8">
                  <div className="h-5 bg-gray-200 rounded w-32"></div>
                  <div className="h-5 bg-gray-200 rounded w-24"></div>
                  <div className="h-5 bg-gray-200 rounded w-28"></div>
                </div>
                <div className="space-y-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
        <motion.div 
          className="text-center bg-white rounded-lg p-8 shadow-lg border border-gray-200 max-w-md mx-4 relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-8 w-8 text-gray-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy bài viết</h1>
          <p className="text-gray-600 mb-8">Bài viết bạn tìm kiếm không tồn tại hoặc đã bị xóa</p>
          <Button asChild className="bg-gray-800 hover:bg-red-600 text-white">
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách
            </Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      {/* Enhanced SEO Meta Tags */}
      <Head>
        <title>{blog.title} | Blog In Ấn & Thiết Kế - Phú Long</title>
        <meta name="description" content={blog.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...'} />
        <meta name="keywords" content={`${blog.tags?.join(', ')}, in ấn, thiết kế, ${blog.category}, phú long`} />
        <meta name="author" content={blog.author} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...'} />
        <meta property="og:image" content={blog.image_url} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${typeof window !== 'undefined' ? window.location.origin : ''}/blog/${createSlug(blog.title)}`} />
        <meta property="article:author" content={blog.author} />
        <meta property="article:published_time" content={blog.created_at} />
        <meta property="article:modified_time" content={blog.updated_at} />
        <meta property="article:section" content={blog.category} />
        <meta property="article:tag" content={blog.tags?.join(', ')} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.title} />
        <meta name="twitter:description" content={blog.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...'} />
        <meta name="twitter:image" content={blog.image_url} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={`/blog/${createSlug(blog.title)}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": blog.title,
            "image": blog.image_url,
            "author": {
              "@type": "Person",
              "name": blog.author
            },
            "publisher": {
              "@type": "Organization",
              "name": "Phú Long",
              "logo": {
                "@type": "ImageObject",
                "url": "/logo.png"
              }
            },
            "datePublished": blog.created_at,
            "dateModified": blog.updated_at,
            "description": blog.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
          })}
        </script>
      </Head>

      <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
      <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-red-50/20 to-transparent"></div>

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <motion.div 
          className="h-full bg-red-600"
          style={{ width: `${readingProgress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Table of Contents - Fixed Position */}
      {tableOfContents.length > 0 && (
        <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-30 hidden xl:block">
          <Card className="w-64 max-h-96 overflow-y-auto shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Mục lục
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowToc(!showToc)}
                  className="h-6 w-6 p-0"
                >
                  {showToc ? '−' : '+'}
                </Button>
              </div>
              {(showToc || true) && (
                <nav className="space-y-1">
                  {tableOfContents.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => scrollToHeading(item.id)}
                      className={`
                        block w-full text-left text-xs text-gray-600 hover:text-red-600 transition-colors
                        ${item.level === 1 ? 'font-semibold' : ''}
                        ${item.level === 2 ? 'pl-3' : ''}
                        ${item.level === 3 ? 'pl-6' : ''}
                        ${item.level >= 4 ? 'pl-9' : ''}
                      `}
                    >
                      {item.title}
                    </button>
                  ))}
                </nav>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="relative z-10 max-w-4xl mx-auto px-4 lg:px-6 py-8">
        {/* Breadcrumb */}
        {/* Enhanced Breadcrumb với category info */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" asChild className="hover:bg-gray-100 hover:text-gray-800 rounded-lg transition-all duration-300 group">
              <Link href="/blog" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
                Quay lại danh sách bài viết
              </Link>
            </Button>
            
            {/* Reading Time Indicator */}
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Coffee className="h-4 w-4 mr-1" />
                <span>{estimatedReadTime} phút đọc</span>
              </div>
              <div className="flex items-center">
                <ZapIcon className="h-4 w-4 mr-1" />
                <span>Cập nhật {new Date(blog.updated_at).toLocaleDateString("vi-VN")}</span>
              </div>
            </div>
          </div>
          
          {/* Category Navigation */}
          {(() => {
            const categoryInfo = getCategoryInfo(blog.category)
            const CategoryIcon = categoryInfo.icon
            return (
              <div className="flex items-center space-x-2">
                <Badge className={`${categoryInfo.color} px-3 py-1 rounded-lg`}>
                  <CategoryIcon className="h-3 w-3 mr-1" />
                  {categoryInfo.label}
                </Badge>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-600">Chuyên mục: {categoryInfo.label}</span>
              </div>
            )
          })()}
        </motion.div>

        {/* Main Article */}
        <motion.article 
          className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Featured Image */}
          <div className="relative h-64 md:h-80 group">
            <Image
              src={blog.image_url || "/api/placeholder/800/400"}
              alt={blog.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            
            {/* Floating Category Badge */}
            <div className="absolute top-4 left-4">
              <Badge className="bg-red-600 text-white shadow-md backdrop-blur-sm border border-white/20">
                {blog.category}
              </Badge>
            </div>

            {/* Reading Time Badge */}
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm border-gray-200 text-gray-700">
                <Clock className="h-3 w-3 mr-1" />
                {calculateReadingTime(blog.content)} phút đọc
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 lg:p-10">
            <header className="mb-8">
              <motion.h1 
                className="text-2xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-6 leading-tight break-words"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {blog.title}
              </motion.h1>

              {/* Enhanced Author & Meta Section */}
              <motion.div 
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="flex items-center space-x-6">
                  {/* Author Info */}
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{blog.author}</p>
                      <p className="text-sm text-gray-600">Chuyên gia in ấn</p>
                    </div>
                  </div>
                  
                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(blog.created_at).toLocaleDateString("vi-VN", { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                   
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{estimatedReadTime} phút đọc</span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex items-center space-x-3">
                  {/* Like Button */}
                  <Button
                    variant="outline"
                    onClick={handleLike}
                    className={`transition-all duration-300 px-4 py-2 ${
                      liked 
                        ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100" 
                        : "hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                    }`}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${liked ? "fill-current" : ""}`} />
                    <span className="hidden sm:inline">Thích</span>
                    <span className="ml-1">({likeCount})</span>
                  </Button>

                  {/* Bookmark Button */}
                  <Button
                    variant="outline"
                    onClick={handleBookmark}
                    className={`transition-all duration-300 px-4 py-2 ${
                      bookmarked 
                        ? "bg-yellow-50 border-yellow-200 text-yellow-600 hover:bg-yellow-100" 
                        : "hover:bg-yellow-50 hover:border-yellow-200 hover:text-yellow-600"
                    }`}
                  >
                    <Bookmark className={`h-4 w-4 mr-2 ${bookmarked ? "fill-current" : ""}`} />
                    <span className="hidden sm:inline">Lưu</span>
                    <span className="ml-1">({bookmarkCount})</span>
                  </Button>

                  {/* Share Dropdown */}
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      onClick={() => handleShare('facebook')}
                      className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all duration-300 p-2"
                    >
                      <Facebook className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => handleShare('twitter')}
                      className="hover:bg-sky-50 hover:border-sky-200 hover:text-sky-600 transition-all duration-300 p-2"
                    >
                      <Twitter className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => handleShare('copy')}
                      className="hover:bg-gray-50 hover:border-gray-300 hover:text-gray-600 transition-all duration-300 p-2"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </header>

            <Separator className="mb-8 bg-gray-200" />

            {/* Article Body with Enhanced React Markdown */}
            <motion.div 
              className="blog-content prose prose-gray max-w-none overflow-hidden prose-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
                components={components}
              >
                {blog.content}
              </ReactMarkdown>
            </motion.div>

            <Separator className="mt-12 mb-8 bg-gray-200" />

            {/* Enhanced Footer Actions */}
            <motion.div 
              className="mt-12 pt-8 border-t border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {/* Tags Section */}
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={handleLike}
                    className={`transition-all duration-300 ${
                      liked 
                        ? "bg-red-600 hover:bg-red-700 text-white" 
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                    }`}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${liked ? "fill-current" : ""}`} />
                    {liked ? "Đã thích" : "Thích bài viết"}
                  </Button>

                  <Button
                    onClick={handleBookmark}
                    variant="outline"
                    className={`transition-all duration-300 ${
                      bookmarked 
                        ? "bg-yellow-50 border-yellow-200 text-yellow-600 hover:bg-yellow-100" 
                        : "hover:bg-yellow-50 hover:border-yellow-200 hover:text-yellow-600"
                    }`}
                  >
                    <Bookmark className={`h-4 w-4 mr-2 ${bookmarked ? "fill-current" : ""}`} />
                    {bookmarked ? "Đã lưu" : "Lưu bài viết"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleShare()}
                    className="hover:bg-gray-50 hover:border-gray-300 hover:text-gray-600 transition-all duration-300"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Chia sẻ
                  </Button>
                </div>

                <Button asChild className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-red-600 hover:to-red-700 text-white shadow-lg">
                  <Link href="/blog">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại danh sách
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.article>

        {/* Related Articles Section */}
        {relatedBlogs.length > 0 && (
          <motion.section 
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Card className="border border-gray-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                  <Sparkles className="h-6 w-6 mr-3 text-red-500" />
                  Bài viết liên quan
                </CardTitle>
                <p className="text-gray-600 mt-2">Khám phá thêm những kiến thức bổ ích khác</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedBlogs.map((relatedBlog, index) => {
                    const categoryInfo = getCategoryInfo(relatedBlog.category)
                    const CategoryIcon = categoryInfo.icon
                    
                    return (
                      <motion.div
                        key={relatedBlog.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                      >
                        <Link href={`/blog/${createSlug(relatedBlog.title)}`}>
                          <Card className="h-full hover:shadow-xl transition-all duration-300 group border border-gray-200 hover:-translate-y-1">
                            <div className="relative h-48 overflow-hidden">
                              <Image
                                src={relatedBlog.image_url || "/api/placeholder/400/250"}
                                alt={relatedBlog.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                              <div className="absolute bottom-3 left-3">
                                <Badge className={`${categoryInfo.color} px-2 py-1 text-xs`}>
                                  <CategoryIcon className="h-3 w-3 mr-1" />
                                  {categoryInfo.label}
                                </Badge>
                              </div>
                              <div className="absolute top-3 right-3">
                                <Badge variant="secondary" className="bg-black/70 text-white text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {relatedBlog.read_time}p
                                </Badge>
                              </div>
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                                {relatedBlog.title}
                              </h3>
                              <div className="flex items-center text-xs text-gray-500">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>{new Date(relatedBlog.created_at).toLocaleDateString("vi-VN")}</span>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
                
                {/* See More Button */}
                <div className="mt-8 text-center">
                  <Button asChild variant="outline" className="bg-white border-gray-300 hover:bg-red-50 hover:border-red-200 hover:text-red-600">
                    <Link href="/blog">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Xem tất cả bài viết
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {/* Newsletter Subscription CTA */}
        <motion.section 
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="bg-gradient-to-br from-red-50 via-white to-gray-50 border border-red-200 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Send className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Theo dõi Sản phẩm của chúng tôi
                </h3>
                <p className="text-gray-600 mb-8 text-lg">
                  Nhận thông báo về những bài viết mới nhất về in ấn, thiết kế và marketing. 
                  Kiến thức chuyên sâu từ đội ngũ chuyên gia Phú Long.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button asChild className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg px-8">
                    <Link href="/blog">
                      <Award className="h-4 w-4 mr-2" />
                      Khám phá thêm bài viết
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                    <Link href="/contact">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Liên hệ tư vấn
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 bg-gray-800 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-40"
          >
            <ChevronUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
      </div>
    </>
  )
}

