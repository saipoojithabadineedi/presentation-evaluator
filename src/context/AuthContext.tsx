import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { loginUserApi, registerUserApi } from '../services/api';
import { signOutFirebase, signInWithGoogleOAuth } from '../services/firebaseAuth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  registeredUsers: User[];
  toastState: { isOpen: boolean; message: string; type: 'login' | 'logout' };
  closeToast: () => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (profile?: { email: string; name?: string; photoURL?: string }) => Promise<{ success: boolean; error?: string }>;
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
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          const emailKey = parsed.email.toLowerCase();
          const savedFullName = localStorage.getItem('pe_full_name_' + emailKey);
          if (savedFullName && savedFullName.trim()) {
            parsed.name = savedFullName.trim();
          }
        }
        return parsed;
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
    const cleanName = name.trim();
    if (cleanName) {
      localStorage.setItem('pe_full_name_' + cleanEmail, cleanName);
    }

    try {
      // Call backend API for real registration
      const backendUser = await registerUserApi(name, cleanEmail, pass);
      
      const newUserRecord: User & { password?: string } = {
        id: backendUser.id || ('usr-' + Date.now()),
        name: cleanName || backendUser.name || 'User',
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

      // Look up locally if we have the full name stored from signup:
      const localMatch = registeredUsers.find(u => u.email?.toLowerCase() === query);
      const localSavedName = localStorage.getItem('pe_full_name_' + query);
      
      let finalName = localSavedName;
      if (!finalName && localMatch?.name && localMatch.name !== query.split('@')[0]) {
        finalName = localMatch.name;
      }
      if (!finalName && backendUser.name && backendUser.name !== query.split('@')[0] && backendUser.name !== 'User') {
        finalName = backendUser.name;
      }
      if (!finalName) {
        finalName = localMatch?.name || backendUser.name || 'User';
      }

      const safeUser: User = {
        id: backendUser.id || ('usr-' + Date.now()),
        name: finalName || 'User',
        email: backendUser.email || query,
        avatarUrl: backendUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        tier: backendUser.tier || 'Developing speaker tier',
        practiceHours: backendUser.practiceHours ?? 0,
        totalEvaluations: backendUser.totalEvaluations ?? 0,
        averageScore: backendUser.averageScore ?? 0,
        averageCadence: backendUser.averageCadence ?? 0,
        fillerWordRate: backendUser.fillerWordRate ?? 0
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

  const loginWithGoogle = async (profile?: { email: string; name?: string; photoURL?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      let targetEmail = profile?.email;
      let targetName = profile?.name;
      let targetPhoto = profile?.photoURL;

      if (!targetEmail) {
        const result = await signInWithGoogleOAuth();
        if (!result.success || !result.email) {
          return { success: false, error: result.error || 'Google Sign-In was cancelled or failed.' };
        }
        targetEmail = result.email;
        targetName = result.name;
        targetPhoto = result.photoURL;
      }

      const cleanEmail = targetEmail.trim().toLowerCase();
      const rawName = targetName || cleanEmail.split('@')[0];
      const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

      // Build user from Google profile data
      const googleUser: User = {
        id: 'goog-' + cleanEmail.replace(/[^a-z0-9]/gi, '-'),
        name: formattedName,
        email: cleanEmail,
        avatarUrl: targetPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        tier: 'Developing speaker tier',
        practiceHours: 0,
        totalEvaluations: 0,
        averageScore: 0,
        averageCadence: 0,
        fillerWordRate: 0
      };

      setUser(googleUser);
      setRegisteredUsers(prev => {
        const filtered = prev.filter(u => u.email.toLowerCase() !== cleanEmail);
        return [...filtered, googleUser];
      });

      setToastState({
        isOpen: true,
        message: `🎉 Welcome, ${googleUser.name}! Signed in with Google successfully.`,
        type: 'login'
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Google Sign-In failed.' };
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
    if (data.name && updatedUser.email) {
      localStorage.setItem('pe_full_name_' + updatedUser.email.toLowerCase(), data.name.trim());
    }
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
      loginWithGoogle,
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
