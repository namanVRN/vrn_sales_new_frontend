import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('vrn_token');
    const savedUser = localStorage.getItem('vrn_user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem('vrn_token');
        localStorage.removeItem('vrn_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authApi.login(email, password);
      const { token, user: userData } = response.data;
      
      localStorage.setItem('vrn_token', token);
      localStorage.setItem('vrn_user', JSON.stringify(userData));
      setUser(userData);
      
      toast.success(`Welcome, ${userData.name}!`);
      return { success: true, user: userData };
    } catch (error) {
      toast.error(error.message || 'Login failed');
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('vrn_token');
    localStorage.removeItem('vrn_user');
    setUser(null);
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';
  const isBDM = user?.role === 'BDM';
  const isAdvisor = user?.role === 'ADVISOR';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isBDM,
        isAdvisor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;