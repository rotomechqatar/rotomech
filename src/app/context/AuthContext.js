"use client";
import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // On mount, verify authentication (this helps on a full reload)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/checkAuth", { credentials: "include" });
        const data = await res.json();
        setIsAuthenticated(data.authenticated);
      } catch (error) {
        console.error("Error checking auth:", error);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
