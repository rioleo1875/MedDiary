import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  isAuthenticated: boolean;
  email: string | null;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  const checkAuth = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem('userEmail');
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      
      if (storedEmail && isLoggedIn === 'true') {
        setEmail(storedEmail);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setEmail(null);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
      setEmail(null);
    }
  };

  const login = async (userEmail: string) => {
    try {
      await AsyncStorage.setItem('userEmail', userEmail);
      await AsyncStorage.setItem('isLoggedIn', 'true');
      setEmail(userEmail);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error saving auth:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userEmail');
      await AsyncStorage.removeItem('isLoggedIn');
      await AsyncStorage.removeItem('activeMemberId');
      setEmail(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, email, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
