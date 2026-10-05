import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { loginUserApi, registerUserApi } from '../services/api';
import { signOutFirebase } from '../services/firebaseAuth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  registeredUsers: User[];
  toastState: { isOpen: boolean; message: string; type: 'login' | 'logout' };
  closeToast: () => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  updateLocalUserPassword: (email: string, newPass: string) => void;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial registered user seed
const defaultRegisteredUser: User & { password?: string } = {
  id: 'usr-101',
  name: 'Demo Speaker',
  email: 'user@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  tier: 'Top 5% speaker tier',
  practiceHours: 14.5,
  totalEvaluations: 8,
  averageScore: 92,
  averageCadence: 135,
  fillerWordRate: 1.2,
  password: 'password123'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Store registered user accounts in localStorage
  const [registeredUsers, setRegisteredUsers] = useState<any[]>(() => {
    const saved = localStorage.getItem('pe_registered_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [defaultRegisteredUser];
      }
    }
    return [defaultRegisteredUser];
  });

  // Active logged-in user
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pe_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null; // Start unauthenticated
  });

  useEffect(() => {
    localStorage.setItem('pe_registered_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('pe_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('pe_auth_user');
    }
  }, [user]);

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'login' | 'logout' }>({
    isOpen: false,
    message: '',
    type: 'login'
  });

  const closeToast = () => {
    setToastState(prev => ({ ...prev, isOpen: false }));
  };

  const register = async (name: string, email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();

    try {
      // Call backend API for real registration
      const backendUser = await registerUserApi(name, cleanEmail, pass);
      
      const newUserRecord: User & { password?: string } = {
        id: backendUser.id || ('usr-' + Date.now()),
        name: backendUser.name || name.trim() || 'User',
        email: cleanEmail,
        avatarUrl: backendUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        tier: backendUser.tier || 'Top 5% speaker tier',
        practiceHours: backendUser.practiceHours ?? 0.0,
        totalEvaluations: backendUser.totalEvaluations ?? 0,
        averageScore: backendUser.averageScore ?? 0,
        averageCadence: backendUser.averageCadence ?? 0,
        fillerWordRate: backendUser.fillerWordRate ?? 0.0,
        password: pass
      };

      setRegisteredUsers(prev => {
        const filtered = prev.filter(u => u.email.toLowerCase() !== cleanEmail);
        return [...filtered, newUserRecord];
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed.' };
    }
  };

  const login = async (emailOrPhone: string, pass: string) => {
    const query = emailOrPhone.trim().toLowerCase();

    try {
      // Call Spring Boot backend authentication
      const backendUser = await loginUserApi(query, pass);

      const safeUser: User = {
        id: backendUser.id || ('usr-' + Date.now()),
        name: backendUser.name || 'User',
        email: backendUser.email || query,
        avatarUrl: backendUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        tier: backendUser.tier || 'Top 5% speaker tier',
        practiceHours: backendUser.practiceHours ?? 14.5,
        totalEvaluations: backendUser.totalEvaluations ?? 8,
        averageScore: backendUser.averageScore ?? 92,
        averageCadence: backendUser.averageCadence ?? 135,
        fillerWordRate: backendUser.fillerWordRate ?? 1.2
      };

      setUser(safeUser);

      // Keep local registered user list password in sync
      setRegisteredUsers(prev => {
        const index = prev.findIndex(u => u.email.toLowerCase() === query);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = { ...updated[index], password: pass };
          return updated;
        }
        return [...prev, { ...safeUser, password: pass }];
      });

      setToastState({
        isOpen: true,
        message: `🎉 Welcome back, ${safeUser.name}! Signed in successfully.`,
        type: 'login'
      });

      return { success: true };
    } catch (err: any) {
      return { 
        success: false, 
        error: err.message || 'Incorrect email or password. Please verify your credentials and try again.' 
      };
    }
  };

  const updateLocalUserPassword = (email: string, newPass: string) => {
    const clean = email.trim().toLowerCase();
    setRegisteredUsers(prev => prev.map(u => u.email.toLowerCase() === clean ? { ...u, password: newPass } : u));
  };

  const logout = () => {
    signOutFirebase();
    setUser(null);
    localStorage.removeItem('pe_auth_user');
    setToastState({
      isOpen: true,
      message: '👋 Logged out successfully. See you next time!',
      type: 'logout'
    });
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);

    setRegisteredUsers(prev => prev.map(u => u.id === user.id ? { ...u, ...data } : u));
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      registeredUsers,
      toastState,
      closeToast,
      login,
      register,
      updateLocalUserPassword,
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
