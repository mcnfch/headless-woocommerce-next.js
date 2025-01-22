'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PostLoginModal from '@/components/PostLoginModal';
import AuthModal from '@/components/auth/AuthModal';

const AUTH_STATE = {
  CLOSED: 'CLOSED',
  LOGIN: 'LOGIN',
  POST_LOGIN: 'POST_LOGIN'
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState(AUTH_STATE.CLOSED);
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
      
      const data = await response.json();
      console.log('Auth check response data:', data);
      
      if (!response.ok) {
        console.error('Auth check failed:', data);
        setUser(null);
        return;
      }

      setUser(data.user);
    } catch (error) {
      console.error('Auth check error:', error);
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
      setUser(data.user);
      await checkAuth();
      
      // Transition to post-login state
      console.log('Showing post-login modal...');
      setAuthState(AUTH_STATE.POST_LOGIN);
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

      // Clear all state
      setUser(null);
      setAuthState(AUTH_STATE.CLOSED);
      setLoading(true);
      
      // Force a hard reload to clear any cached state
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const openLogin = () => setAuthState(AUTH_STATE.LOGIN);
  const closeAuth = () => setAuthState(AUTH_STATE.CLOSED);

  const value = {
    user,
    loading,
    login,
    logout,
    openLogin,
    closeAuth,
    authState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {authState === AUTH_STATE.LOGIN && (
        <AuthModal 
          isOpen={true}
          onClose={closeAuth}
        />
      )}
      {authState === AUTH_STATE.POST_LOGIN && (
        <PostLoginModal 
          onClose={() => {
            closeAuth();
            router.push('/');
          }} 
        />
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
