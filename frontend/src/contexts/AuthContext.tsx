import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAccessToken } from '../api/axios';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const decodeToken = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handleAuthSuccess = (accessToken: string) => {
    setToken(accessToken);
    setAccessToken(accessToken);
    const decoded = decodeToken(accessToken);
    if (decoded) {
      setUser({
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      });
    }
  };

  const handleClearAuth = () => {
    setToken(null);
    setAccessToken(null);
    setUser(null);
  };

  const refreshSession = async () => {
    try {
      const response = await api.post('/auth/refresh');
      handleAuthSuccess(response.data.accessToken);
    } catch {
      handleClearAuth();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    handleAuthSuccess(response.data.accessToken);
  };

  const register = async (email: string, password: string) => {
    const response = await api.post('/auth/register', { email, password });
    handleAuthSuccess(response.data.accessToken);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      handleClearAuth();
    }
  };

  useEffect(() => {
    refreshSession();

    const handleLogoutEvent = () => {
      handleClearAuth();
    };

    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('auth-logout', handleLogoutEvent);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken: token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
