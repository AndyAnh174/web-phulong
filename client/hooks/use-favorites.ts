import { useState, useEffect } from 'react'

interface FavoriteService {
  id: number
  name: string
  price: number
  image_url: string
  category: string
}

const FAVORITES_KEY = 'favorite-services'

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteService[]>([])

  // Load favorites từ localStorage khi component mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem(FAVORITES_KEY)
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      } catch (error) {
        console.error('Error loading favorites from localStorage:', error)
        setFavorites([])
      }
    }
  }, [])

  // Save favorites vào localStorage khi favorites thay đổi
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  }, [favorites])

  const addToFavorites = (service: FavoriteService) => {
    setFavorites(prev => {
      const isAlreadyFavorite = prev.some(fav => fav.id === service.id)
      if (isAlreadyFavorite) {
        return prev
      }
      return [...prev, service]
    })
  }

  const removeFromFavorites = (serviceId: number) => {
    setFavorites(prev => prev.filter(fav => fav.id !== serviceId))
  }

  const toggleFavorite = (service: FavoriteService) => {
    const isAlreadyFavorite = favorites.some(fav => fav.id === service.id)
    if (isAlreadyFavorite) {
      removeFromFavorites(service.id)
    } else {
      addToFavorites(service)
    }
    return !isAlreadyFavorite
  }

  const isFavorite = (serviceId: number) => {
    return favorites.some(fav => fav.id === serviceId)
  }

  const getFavoritesCount = () => {
    return favorites.length
  }

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    getFavoritesCount
  }
} 