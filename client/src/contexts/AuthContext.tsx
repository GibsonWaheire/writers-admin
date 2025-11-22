import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'writer' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; user?: User; error?: string }>;
  signup: (name: string, email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage keys for persistent authentication
const AUTH_STORAGE_KEY = 'writers_admin_auth';
const USER_STORAGE_KEY = 'writers_admin_user';

// All user data is now stored in the database

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize user from storage if available (check both localStorage and sessionStorage)
    try {
      // Check localStorage first (persistent)
      let storedUser = localStorage.getItem(USER_STORAGE_KEY);
      let isAuthenticated = localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
      
      // If not in localStorage, check sessionStorage (session-only)
      if (!storedUser || !isAuthenticated) {
        storedUser = sessionStorage.getItem(USER_STORAGE_KEY);
        isAuthenticated = sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true';
      }
      
      if (storedUser && isAuthenticated) {
        return JSON.parse(storedUser);
      }
    } catch (error) {
      console.warn('Failed to restore authentication state:', error);
      // Clear corrupted data
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(USER_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    }
    return null;
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize authentication state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we have stored authentication data (check both storage types)
        let storedUser = localStorage.getItem(USER_STORAGE_KEY);
        let isAuthenticated = localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
        
        // If not in localStorage, check sessionStorage
        if (!storedUser || !isAuthenticated) {
          storedUser = sessionStorage.getItem(USER_STORAGE_KEY);
          isAuthenticated = sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true';
        }
        
        if (storedUser && isAuthenticated) {
          const userData = JSON.parse(storedUser);
          
          // In a real app, you would validate the token here
          // For now, we'll just restore the user data
          setUser(userData);
          console.log('🔐 Authentication restored from storage:', userData.email);
          
          // Optional: Add token expiration check
          // const tokenExpiry = localStorage.getItem('token_expiry');
          // if (tokenExpiry && new Date(tokenExpiry) < new Date()) {
          //   // Token expired, clear authentication
          //   return;
          // }
        } else {
          console.log('🔓 No stored authentication found');
        }
      } catch (error) {
        console.warn('Failed to initialize authentication:', error);
        // Clear corrupted data
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe: boolean = true) => {
    setIsLoading(true);
    
    try {
      // Use API login endpoint
      const response = await api.login(email, password);
      
      if (response.user) {
        const userWithoutPassword = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role
        };
        
        // Store authentication data based on rememberMe preference
        try {
          if (rememberMe) {
            // Use localStorage for persistent storage
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userWithoutPassword));
            localStorage.setItem(AUTH_STORAGE_KEY, 'true');
          } else {
            // Use sessionStorage for session-only storage
            sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userWithoutPassword));
            sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
          }
        } catch (error) {
          console.warn('Failed to store authentication data:', error);
        }
        
        setUser(userWithoutPassword);
        console.log('🔐 User logged in successfully:', userWithoutPassword.email);
        return { success: true, user: userWithoutPassword };
      } else {
        return { success: false, error: 'Invalid email or password' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error?.message || 'An error occurred during login' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Use API register endpoint - need to access private request method or create register method
      // For now, use fetch directly
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role: 'writer' }),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Registration failed' }));
        throw new Error(error.error || 'Registration failed');
      }
      
      const data = await response.json();
      
      if (data.user) {
        const newUser: User = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role
        };
        
        // Store authentication data in localStorage
        try {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
          localStorage.setItem(AUTH_STORAGE_KEY, 'true');
        } catch (error) {
          console.warn('Failed to store authentication data:', error);
        }
        
        setUser(newUser);
        return { success: true, user: newUser, requiresApplication: true };
      } else {
        return { success: false, error: 'Failed to create account' };
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      return { success: false, error: error?.message || 'An error occurred during signup' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    // Clear authentication data from both storage types
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(USER_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear authentication data:', error);
    }
    
    setUser(null);
    console.log('🔓 User logged out successfully');
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isInitialized,
      login,
      signup,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
