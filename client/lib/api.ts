import { ensureHttps } from "./utils"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : '/api'

// Ensure API base URL uses HTTPS
export const SECURE_API_BASE_URL = ensureHttps(API_BASE_URL)

// For backward compatibility - secure API URL without /api suffix
export const SECURE_API_URL = ensureHttps(process.env.NEXT_PUBLIC_API_URL || '')

// Helper function to make secure API calls
export async function secureApiFetch(endpoint: string, options?: RequestInit) {
  const url = `${SECURE_API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  return fetch(ensureHttps(url), options)
}

// Helper function to process API responses with image URLs
export function processApiResponse(data: any): any {
  if (!data) return data
  
  if (Array.isArray(data)) {
    return data.map(processApiResponse)
  }
  
  if (typeof data === 'object') {
    const processed = { ...data }
    
    // Process common image URL fields
    if (processed.image_url) {
      processed.image_url = ensureHttps(processed.image_url)
    }
    if (processed.url) {
      processed.url = ensureHttps(processed.url)
    }
    if (processed.file_path && SECURE_API_BASE_URL) {
      const baseUrl = SECURE_API_BASE_URL.replace(/\/api$/, '')
      processed.full_url = ensureHttps(`${baseUrl}/${processed.file_path}`)
    }
    if (processed.filename && SECURE_API_BASE_URL) {
      const baseUrl = SECURE_API_BASE_URL.replace(/\/api$/, '')
      processed.full_url = ensureHttps(`${baseUrl}/uploads/${processed.filename}`)
    }
    
    return processed
  }
  
  return data
}

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

      const url = `${SECURE_API_BASE_URL}/services${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch services')
      }
      
      return response.json()
    },

    getById: async (id: number): Promise<Service> => {
      const response = await fetch(`${SECURE_API_BASE_URL}/services/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch service')
      }
      return response.json()
    },

    getSuggested: async (currentId: number): Promise<Service[]> => {
      const response = await fetch(`${SECURE_API_BASE_URL}/services/suggested?current_id=${currentId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch suggested services')
      }
      return response.json()
    }
  },

  // Orders endpoints
  orders: {
    create: async (orderData: FormData): Promise<any> => {
      const response = await fetch(`${SECURE_API_BASE_URL}/orders`, {
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
      const response = await fetch(`${SECURE_API_BASE_URL}/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
      const response = await fetch(`${SECURE_API_BASE_URL}/config/env`)
      if (!response.ok) {
        throw new Error('Failed to fetch config')
      }
      return response.json()
    }
  }
}

export default api