'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, type LoginCredentials } from '@/lib/auth';
import type { User } from '@/lib/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have a stored user
        const storedUser = authService.getStoredUser();
        if (storedUser && authService.isAuthenticated()) {
          setUser(storedUser);
          setIsAuthenticated(true);
          
          // Verify token is still valid
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          } else {
            // Token invalid, clear everything
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    setLoading(true);
    try {
      const loggedInUser = await authService.login(credentials);
      setUser(loggedInUser);
      setIsAuthenticated(true);
      return loggedInUser;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  };
};

export const useRequireAuth = (redirectTo: string = '/admin') => {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [loading, isAuthenticated, router, redirectTo]);

  return { user, loading, isAuthenticated, logout };
}; 