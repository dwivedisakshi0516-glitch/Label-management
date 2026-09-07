import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('rit_auth_user');
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser) as User;
    } catch {
      localStorage.removeItem('rit_auth_user');
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('rit_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(localStorage.getItem('rit_auth_token')));

  useEffect(() => {
    const savedToken = localStorage.getItem('rit_auth_token');
    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    authApi.getMe()
      .then((user) => {
        if (!isMounted) return;
        localStorage.setItem('rit_auth_user', JSON.stringify(user));
        setCurrentUser(user);
        setToken(savedToken);
      })
      .catch(() => {
        if (!isMounted) return;
        localStorage.removeItem('rit_auth_token');
        localStorage.removeItem('rit_auth_user');
        setToken(null);
        setCurrentUser(null);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await authApi.login(email, pass);
      localStorage.setItem('rit_auth_token', data.access_token);
      localStorage.setItem('rit_auth_user', JSON.stringify(data.user));
      setToken(data.access_token);
      setCurrentUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('rit_auth_token');
    localStorage.removeItem('rit_auth_user');
    setToken(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
