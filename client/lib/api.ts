const API_BASE_URL =  'http://14.187.180.6:12122/api'

export interface Service {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  category: string
  is_active: boolean
  featured?: boolean
  created_at?: string
  updated_at?: string
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