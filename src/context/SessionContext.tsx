'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Safeguard for Node.js 25+ where an experimental, incomplete global `localStorage` is defined on the server side
if (typeof window === 'undefined' && typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
  try {
    const localstorage = (globalThis as any).localStorage;
    if (!localstorage || typeof localstorage.getItem !== 'function') {
      delete (globalThis as any).localStorage;
    }
  } catch (e) {
    // Silently ignore deletion failures
  }
}



// Define the shape of the user object
type User = {
  full_name: string;
  email: string;
  student_number: string;
  college: string;
  department?: string;
  year_of_study?: string;
};

// Define the shape of the context
interface SessionContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

// Create the context
const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Define the provider component
interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On initial load, try to get the user from localStorage
  useEffect(() => {
    try {
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        setUser(JSON.parse(storedUserData));
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage on initial load", error);
      // Clear invalid data if parsing fails
      localStorage.removeItem('userData');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = (userData: User) => {
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('userData');
    setUser(null);
  };

  const value = { user, loading, login, logout };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

// Custom hook to use the session context
export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
