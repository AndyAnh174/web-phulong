'use client';

import { authApi } from './api/client';
import type { User } from './types';

export interface LoginCredentials {
  username: string;
  password: string;
}

// Token management
export const tokenManager = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  },

  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('access_token', token);
  },

  removeToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  isAuthenticated: (): boolean => {
    return !!tokenManager.getToken();
  }
};

// User management
export const userManager = {
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  setUser: (user: User): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user', JSON.stringify(user));
  },

  removeUser: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('user');
  }
};

// Auth service
export const authService = {
  login: async (credentials: LoginCredentials): Promise<User> => {
    try {
      const response = await authApi.login(credentials);
      
      // Store token
      tokenManager.setToken(response.data.access_token);
      
      // Get user info
      const userResponse = await authApi.me();
      const user = userResponse.data;
      
      // Store user
      userManager.setUser(user);
      
      return user;
    } catch (error: unknown) {
      // Clear any stored data on login failure
      tokenManager.removeToken();
      userManager.removeUser();
      throw error;
    }
  },

  logout: (): void => {
    tokenManager.removeToken();
    userManager.removeUser();
  },

  getCurrentUser: (): User | null => {
    try {
      return userManager.getUser();
    } catch {
      return null;
    }
  },

  getStoredUser: (): User | null => {
    return userManager.getUser();
  },

  isAuthenticated: (): boolean => {
    return tokenManager.isAuthenticated();
  }
}; 