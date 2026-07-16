// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('vrn_token'));
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await authApi.getMe();
      const userData = res.data?.data?.user || res.data?.data || res.data?.user;
      console.log('👤 Fetched user:', userData);
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('vrn_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email, password) => {
    console.log('🔐 AuthContext.login called with:', { email, password });
    
    try {
      const res = await authApi.login({ email, password });
      
      console.log('🎯 Full response object:', res);
      console.log('🎯 Response data:', res.data);
      
      // Backend response: { success: true, message: "...", data: { token, user } }
      const responseData = res.data?.data;
      
      if (!responseData) {
        throw new Error('Invalid response structure');
      }
      
      const { token: newToken, user: newUser } = responseData;
      
      if (!newToken) {
        throw new Error('No token received from server');
      }
      
      console.log('✅ Login successful!');
      console.log('   Token:', newToken.substring(0, 20) + '...');
      console.log('   User:', newUser);
      
      localStorage.setItem('vrn_token', newToken);
      setToken(newToken);
      setUser(newUser);
      
      return newUser;
    } catch (error) {
      console.error('❌ Login failed in AuthContext:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('vrn_token');
      setToken(null);
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    const res = await authApi.changePassword({ currentPassword, newPassword });
    toast.success('Password changed successfully');
    return res.data;
  };

  const isAdmin = user?.role === 'ADMIN';
  const isBDM = user?.role === 'BDM';
  const isAdvisor = user?.role === 'ADVISOR';
  const hasRole = (...roles) => roles.includes(user?.role);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    isAdmin,
    isBDM,
    isAdvisor,
    hasRole,
    login,
    logout,
    changePassword,
    refetchUser: fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;