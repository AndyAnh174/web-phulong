const API_BASE_URL =  'http://14.187.218.183:12122/api'

// Helper function để tạo slug từ text tiếng Việt
export function createSlug(text: string): string {
  if (!text) return "";
  
  // Bảng chuyển đổi ký tự tiếng Việt
  const vietnameseChars: Record<string, string> = {
    'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
    'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
    'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
    'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
    'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
    'đ': 'd',
    // Uppercase
    'À': 'a', 'Á': 'a', 'Ạ': 'a', 'Ả': 'a', 'Ã': 'a',
    'Â': 'a', 'Ầ': 'a', 'Ấ': 'a', 'Ậ': 'a', 'Ẩ': 'a', 'Ẫ': 'a',
    'Ă': 'a', 'Ằ': 'a', 'Ắ': 'a', 'Ặ': 'a', 'Ẳ': 'a', 'Ẵ': 'a',
    'È': 'e', 'É': 'e', 'Ẹ': 'e', 'Ẻ': 'e', 'Ẽ': 'e',
    'Ê': 'e', 'Ề': 'e', 'Ế': 'e', 'Ệ': 'e', 'Ể': 'e', 'Ễ': 'e',
    'Ì': 'i', 'Í': 'i', 'Ị': 'i', 'Ỉ': 'i', 'Ĩ': 'i',
    'Ò': 'o', 'Ó': 'o', 'Ọ': 'o', 'Ỏ': 'o', 'Õ': 'o',
    'Ô': 'o', 'Ồ': 'o', 'Ố': 'o', 'Ộ': 'o', 'Ổ': 'o', 'Ỗ': 'o',
    'Ơ': 'o', 'Ờ': 'o', 'Ớ': 'o', 'Ợ': 'o', 'Ở': 'o', 'Ỡ': 'o',
    'Ù': 'u', 'Ú': 'u', 'Ụ': 'u', 'Ủ': 'u', 'Ũ': 'u',
    'Ư': 'u', 'Ừ': 'u', 'Ứ': 'u', 'Ự': 'u', 'Ử': 'u', 'Ữ': 'u',
    'Ỳ': 'y', 'Ý': 'y', 'Ỵ': 'y', 'Ỷ': 'y', 'Ỹ': 'y',
    'Đ': 'd'
  }

  // Chuyển đổi ký tự tiếng Việt
  let result = ""
  for (const char of text) {
    result += vietnameseChars[char] || char
  }

  // Chuyển về lowercase
  result = result.toLowerCase()

  // Chỉ giữ lại chữ cái, số và khoảng trắng
  result = result.replace(/[^a-z0-9\s]/g, '')

  // Thay khoảng trắng bằng dấu gạch ngang
  result = result.replace(/\s+/g, '-')

  // Loại bỏ dấu gạch ngang thừa
  result = result.replace(/-+/g, '-')

  // Loại bỏ dấu gạch ngang ở đầu và cuối
  result = result.replace(/^-+|-+$/g, '')

  return result
}

export interface Service {
  id: number
  name: string
  description: string
  price: number
  image_id?: number | null
  category: string
  is_active: boolean
  featured?: boolean
  created_at?: string
  updated_at?: string
  image?: {
    id: number
    filename: string
    url: string
    alt_text: string | null
    width: number
    height: number
  }
}

export interface Blog {
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
}

export interface PrintingPost {
  id: number
  title: string
  time: string
  content: string
  content_html: string
  is_visible: boolean
  created_at: string
  updated_at: string
  creator: {
    id: number
    username: string
  }
  images: Array<{
    id: number
    order: number
    image: {
      id: number
      url: string
      filename: string
      alt_text: string
    }
  }>
}

// Import createSlug utility
import { createSlug } from './utils'

export interface ApiResponse<T> {
  data: T
  message?: string
  status: string
}

export const api = {
  // Services endpoints
  services: {
    getAll: async (params?: {
      skip?: number
      limit?: number
      is_active?: boolean
      featured?: boolean
      category?: string
    }): Promise<Service[]> => {
      const queryParams = new URLSearchParams()
      
      if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString())
      if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString())
      if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString())
      if (params?.featured !== undefined) queryParams.append('featured', params.featured.toString())
      if (params?.category) queryParams.append('category', params.category)

      const url = `${API_BASE_URL}/services${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch services')
      }
      
      return response.json()
    },

    getBySlug: async (slug: string): Promise<Service> => {
      const response = await fetch(`${API_BASE_URL}/services/${slug}`)
      if (!response.ok) {
        throw new Error('Failed to fetch service')
      }
      return response.json()
    },

    getByName: async (name: string): Promise<Service> => {
      const slug = createSlug(name)
      return api.services.getBySlug(slug)
    },

    getSuggested: async (currentSlug: string): Promise<Service[]> => {
      const response = await fetch(`${API_BASE_URL}/services/suggested?current_slug=${currentSlug}`)
      if (!response.ok) {
        throw new Error('Failed to fetch suggested services')
      }
      return response.json()
    },

    createSlugFromService: (service: Service): string => {
      return createSlug(service.name)
    },

    // Tạo service mới với upload ảnh
    create: async (serviceData: FormData, token: string): Promise<Service> => {
      const response = await fetch(`${API_BASE_URL}/services/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: serviceData
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to create service')
      }
      
      return response.json()
    },

    // Cập nhật service với upload ảnh
    update: async (id: number, serviceData: FormData, token: string): Promise<Service> => {
      const response = await fetch(`${API_BASE_URL}/services/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: serviceData
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to update service')
      }
      
      return response.json()
    },

    // Xóa service
    delete: async (id: number, token: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/services/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to delete service')
      }
    }
  },

  // Orders endpoints
  orders: {
    create: async (orderData: FormData): Promise<any> => {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        body: orderData
      })
      
      if (!response.ok) {
        throw new Error('Failed to create order')
      }
      
      return response.json()
    }
  },

  // Blogs endpoints
  blogs: {
    getAll: async (params?: {
      skip?: number
      limit?: number
      is_active?: boolean
      category?: string
      search?: string
    }): Promise<Blog[]> => {
      const queryParams = new URLSearchParams()
      
      if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString())
      if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString())
      if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString())
      if (params?.category) queryParams.append('category', params.category)
      if (params?.search) queryParams.append('search', params.search)

      const url = `${API_BASE_URL}/blogs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch blogs')
      }
      
      return response.json()
    },

    // Lấy blog theo slug thay vì ID
    getBySlug: async (slug: string): Promise<Blog> => {
      const response = await fetch(`${API_BASE_URL}/blogs/${slug}`)
      if (!response.ok) {
        throw new Error('Failed to fetch blog')
      }
      return response.json()
    },

    // Helper function để get blog by title (tạo slug từ title)
    getByTitle: async (title: string): Promise<Blog> => {
      const slug = createSlug(title)
      return api.blogs.getBySlug(slug)
    },

    // Tạo slug từ blog
    createSlugFromBlog: (blog: Blog): string => {
      return createSlug(blog.title)
    }
  },

  // Printing endpoints  
  printing: {
    getAll: async (params?: {
      skip?: number
      limit?: number
      is_visible?: boolean
      search?: string
    }): Promise<PrintingPost[]> => {
      const queryParams = new URLSearchParams()
      
      if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString())
      if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString())
      if (params?.is_visible !== undefined) queryParams.append('is_visible', params.is_visible.toString())
      if (params?.search) queryParams.append('search', params.search)

      const url = `${API_BASE_URL}/printing${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch printing posts')
      }
      
      return response.json()
    },

    // Lấy printing post theo slug thay vì ID
    getBySlug: async (slug: string): Promise<PrintingPost> => {
      const response = await fetch(`${API_BASE_URL}/printing/${slug}`)
      if (!response.ok) {
        throw new Error('Failed to fetch printing post')
      }
      return response.json()
    },

    // Helper function để get printing by title (tạo slug từ title)
    getByTitle: async (title: string): Promise<PrintingPost> => {
      const slug = createSlug(title)
      return api.printing.getBySlug(slug)
    },

    // Tạo slug từ printing post
    createSlugFromPrinting: (printing: PrintingPost): string => {
      return createSlug(printing.title)
    },

    // Upload ảnh cho content (giữ nguyên)
    uploadContentImage: async (file: File, altText: string, token: string): Promise<{
      message: string
      image: {
        id: number
        url: string
        filename: string
        alt_text: string
      }
      shortcode: string
      usage: string
    }> => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('alt_text', altText)

      const response = await fetch(`${API_BASE_URL}/printing/upload-content-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to upload image')
      }
      
      return response.json()
    }
  },

  // Contact endpoints
  contact: {
    submit: async (contactData: {
      fullname: string
      email: string
      phone: string
      subject: string
      message: string
    }): Promise<any> => {
      const response = await fetch(`${API_BASE_URL}/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit contact form')
      }
      
      return response.json()
    }
  },

  // Config endpoints
  config: {
    getPublicEnv: async (): Promise<any> => {
      const response = await fetch(`${API_BASE_URL}/config/env`)
      if (!response.ok) {
        throw new Error('Failed to fetch config')
      }
      return response.json()
    }
  }
}

export default api 