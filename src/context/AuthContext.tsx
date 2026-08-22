import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { loginUserApi, registerUserApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  registeredUsers: User[];
  login: (emailOrPhone: string, pass: string) => { success: boolean; error?: string };
  register: (name: string, email: string, phoneNumber: string, pass: string) => { success: boolean; error?: string };
  forgotPassword: (emailOrPhone: string) => { success: boolean; error?: string; otp?: string };
  resetPassword: (emailOrPhone: string, newPass: string) => { success: boolean; error?: string };
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial registered user seed
const defaultRegisteredUser: User & { password?: string } = {
  id: 'usr-101',
  name: 'Demo Speaker',
  email: 'user@example.com',
  phoneNumber: '9876543210',
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

  const register = (name: string, email: string, phoneNumber: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phoneNumber.trim();

    // Check if account already exists
    const existing = registeredUsers.find(
      u => u.email.toLowerCase() === cleanEmail || (u.phoneNumber && u.phoneNumber === cleanPhone)
    );

    if (existing) {
      return { success: false, error: 'An account with this Email or Phone Number is already registered. Please sign in.' };
    }

    const newUserRecord: User & { password?: string } = {
      id: 'usr-' + Date.now(),
      name: name.trim() || 'User',
      email: cleanEmail,
      phoneNumber: cleanPhone,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      tier: 'Top 5% speaker tier',
      practiceHours: 0.0,
      totalEvaluations: 0,
      averageScore: 0,
      averageCadence: 0,
      fillerWordRate: 0.0,
      password: pass
    };

    // Update state & localStorage
    setRegisteredUsers(prev => [...prev, newUserRecord]);
    setUser(newUserRecord);

    // Sync with Spring Boot backend asynchronously
    registerUserApi(newUserRecord.name, newUserRecord.email, pass);

    return { success: true };
  };

  const login = (emailOrPhone: string, pass: string) => {
    const query = emailOrPhone.trim().toLowerCase();

    // Find user by email or phone
    const matchedUser = registeredUsers.find(
      u => u.email.toLowerCase() === query || (u.phoneNumber && u.phoneNumber === query)
    );

    if (!matchedUser) {
      return { 
        success: false, 
        error: 'No registered account found with this Email or Phone Number. Please sign up first!' 
      };
    }

    if (matchedUser.password && matchedUser.password !== pass) {
      return { 
        success: false, 
        error: 'Incorrect password. Please verify your credentials and try again.' 
      };
    }

    // Login successful
    const { password, ...safeUser } = matchedUser;
    setUser(safeUser);

    // Sync with Spring Boot API
    loginUserApi(matchedUser.email, pass);

    return { success: true };
  };

  const forgotPassword = (emailOrPhone: string) => {
    const query = emailOrPhone.trim().toLowerCase();

    const matchedUser = registeredUsers.find(
      u => u.email.toLowerCase() === query || (u.phoneNumber && u.phoneNumber === query)
    );

    if (!matchedUser) {
      return { 
        success: false, 
        error: 'No registered account found with this Email or Phone Number. Please check and try again.' 
      };
    }

    return { success: true, otp: '123456' };
  };

  const resetPassword = (emailOrPhone: string, newPass: string) => {
    const query = emailOrPhone.trim().toLowerCase();

    const matchedIndex = registeredUsers.findIndex(
      u => u.email.toLowerCase() === query || (u.phoneNumber && u.phoneNumber === query)
    );

    if (matchedIndex === -1) {
      return { success: false, error: 'User account not found.' };
    }

    setRegisteredUsers(prev => {
      const copy = [...prev];
      copy[matchedIndex] = { ...copy[matchedIndex], password: newPass };
      return copy;
    });

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pe_auth_user');
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);

    // Update in registeredUsers list as well
    setRegisteredUsers(prev => prev.map(u => u.id === user.id ? { ...u, ...data } : u));
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      registeredUsers,
      login,
      register,
      forgotPassword,
      resetPassword,
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
