import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  isAuthenticated: boolean;
  email: string | null;
  userId: number | null;
  isInitialized: boolean;
  login: (email: string, user?: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const checkAuth = async () => {
    try {
      console.log('AuthContext: Checking auth...');
      const storedEmail = await AsyncStorage.getItem('userEmail');
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      const storedUserId = await AsyncStorage.getItem('userId');
      console.log('AuthContext: Found stored data', { storedEmail, isLoggedIn, storedUserId });
      
      if (storedEmail && isLoggedIn === 'true') {
        console.log('AuthContext: User is authenticated');
        setEmail(storedEmail);
        setUserId(storedUserId ? parseInt(storedUserId, 10) : null);
        setIsAuthenticated(true);
      } else {
        console.log('AuthContext: User is not authenticated');
        setIsAuthenticated(false);
        setEmail(null);
        setUserId(null);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
      setEmail(null);
      setUserId(null);
    } finally {
      setIsInitialized(true);
      console.log('AuthContext: Auth check complete');
    }
  };

  const login = async (userEmail: string, user?: any) => {
    try {
      console.log('AuthContext: Starting login process for:', userEmail);
      await AsyncStorage.setItem('userEmail', userEmail);
      await AsyncStorage.setItem('isLoggedIn', 'true');
      
      if (user && user.user_id) {
        await AsyncStorage.setItem('userId', String(user.user_id));
        setUserId(user.user_id);
      }
      
      setEmail(userEmail);
      setIsAuthenticated(true);
      setIsInitialized(true);
      console.log('AuthContext: Login completed successfully');
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
      await AsyncStorage.removeItem('userId');
      setEmail(null);
      setUserId(null);
      setIsAuthenticated(false);
      setIsInitialized(false);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, email, userId, isInitialized, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
