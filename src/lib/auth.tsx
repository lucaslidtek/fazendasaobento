import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";
import type { User } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string) => void;
  loginDemo: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_KEY = "fsb_demo_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();

  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(DEMO_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = (_token: string) => {
    // Real auth placeholder — currently demo mode only
  };

  const loginDemo = (demoUser: User) => {
    localStorage.setItem(DEMO_KEY, JSON.stringify(demoUser));
    setUser(demoUser);
    setLocation("/");
  };

  const logout = () => {
    localStorage.removeItem(DEMO_KEY);
    localStorage.removeItem("fsb_token");
    setUser(null);
    setLocation("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading: false, login, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
