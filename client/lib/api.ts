const API_BASE_URL =  'http://14.187.180.6:12122/api'

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

    getById: async (id: number): Promise<Service> => {
      const response = await fetch(`${API_BASE_URL}/services/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch service')
      }
      return response.json()
    },

    getSuggested: async (currentId: number): Promise<Service[]> => {
      const response = await fetch(`${API_BASE_URL}/services/suggested?current_id=${currentId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch suggested services')
      }
      return response.json()
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

  // Printing/Blog endpoints
  printing: {
    // Upload ảnh cho content
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