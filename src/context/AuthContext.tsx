import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserRole, UserSettings } from '../types';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  requestPasswordReset, 
  subscribeToAuth 
} from '../firebase/auth';
import { getUserProfile, updateUserSettings as updateSettingsInDb } from '../firebase/firestore';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  register: (name: string, email: string, pass: string, role: UserRole) => Promise<UserProfile>;
  login: (email: string, pass: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((profile) => {
      setUser(profile);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const register = async (name: string, email: string, pass: string, role: UserRole) => {
    setLoading(true);
    try {
      const profile = await registerUser(name, email, pass, role);
      setUser(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const profile = await loginUser(email, pass);
      setUser(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await requestPasswordReset(email);
  };

  const updateSettings = async (settings: Partial<UserSettings>) => {
    if (!user) return;
    const updated = {
      ...(user.settings || {
        voiceReminders: true,
        browserNotifications: true,
        gracePeriodMinutes: 30,
        fontSizePreference: 'large'
      }),
      ...settings
    };
    await updateSettingsInDb(user.uid, updated);
    setUser(prev => prev ? { ...prev, settings: updated } : null);
  };

  const refreshProfile = async () => {
    if (!user) return;
    const refreshed = await getUserProfile(user.uid);
    if (refreshed) {
      setUser(refreshed);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        resetPassword,
        updateSettings,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
