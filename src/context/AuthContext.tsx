import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { initialUser } from '../utils/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => boolean;
  register: (name: string, email: string, pass: string) => boolean;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pe_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null; // Start unauthenticated so Landing page is always shown first
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('pe_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('pe_auth_user');
    }
  }, [user]);

  const login = (email: string, _pass: string) => {
    const loggedUser: User = {
      ...initialUser,
      email: email || 'name@example.com',
      name: email.includes('@') ? email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'User'
    };
    setUser(loggedUser);
    return true;
  };

  const register = (name: string, email: string, _pass: string) => {
    const newUser: User = {
      id: 'usr-' + Date.now(),
      name: name || 'User',
      email: email || 'name@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      tier: 'Top 5% speaker tier',
      practiceHours: 5.4,
      totalEvaluations: 14,
      averageScore: 92,
      averageCadence: 135,
      fillerWordRate: 0.8
    };
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pe_auth_user');
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
