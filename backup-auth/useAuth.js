'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PostLoginModal from '@/components/PostLoginModal';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPostLogin, setShowPostLogin] = useState(false);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      console.log('Starting auth check...');
      const response = await fetch('/api/auth/check', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      console.log('Auth check response status:', response.status);
      console.log('Auth check response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('Auth check response data:', data);
      
      if (!response.ok) {
        console.error('Auth check failed:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        setUser(null);
        return;
      }

      console.log('Setting user data:', data.user);
      setUser(data.user);
    } catch (error) {
      console.error('Auth check error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        await checkAuth();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [checkAuth]);

  const login = async ({ username, password }) => {
    try {
      setLoading(true);
      console.log('Starting login process...');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('Login failed:', data);
        throw new Error(data.error || 'Login failed');
      }

      console.log('Login successful, setting user data...');
      // Set user data from login response
      setUser(data.user);
      
      // Check auth status to ensure session is properly set
      await checkAuth();
      
      // Show post-login modal after a small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('Showing post-login modal...');
      setShowPostLogin(true);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    showPostLogin,
    setShowPostLogin
  };

  console.log('Auth Provider State:', { user, loading, showPostLogin });

  return (
    <AuthContext.Provider value={value}>
      {children}
      {showPostLogin && (
        <div className="fixed inset-0 z-50">
          <PostLoginModal 
            onClose={() => {
              console.log('Closing post-login modal');
              setShowPostLogin(false);
            }} 
          />
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
