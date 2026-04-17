import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from './mockDB';
import type { User } from './mockDB';

interface AuthContextType {
  user: User | null;
  login: (usuario: string, senha?: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for session
    const storedUserId = localStorage.getItem('@FoodFlow:Session');
    if (storedUserId) {
      // Mock validation since we don't have endpoints to fetch full user by ID directly in api without full refactor,
      // but we can fake it since login allows empty pass or we can just save full user for MVP:
      const storedUser = localStorage.getItem('@FoodFlow:SessionUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
    setIsLoading(false);
  }, []);

  const login = (usuario: string, senha?: string) => {
    const validUser = api.login(usuario, senha);
    if (validUser) {
      setUser(validUser);
      localStorage.setItem('@FoodFlow:Session', validUser.id);
      localStorage.setItem('@FoodFlow:SessionUser', JSON.stringify(validUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('@FoodFlow:Session');
    localStorage.removeItem('@FoodFlow:SessionUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
