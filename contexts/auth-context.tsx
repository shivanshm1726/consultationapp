// auth-context.tsx
"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { getUserData, type UserData } from "@/lib/auth";

interface AuthContextType {
  user: any;
  userData: UserData | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  logout: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    setUser(null);
    setUserData(null);
    localStorage.removeItem("role");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
        const token = tokenMatch ? tokenMatch[1] : null;

        if (token) {
          const data = await getUserData(token);
          if (data) {
            setUser({ uid: data.uid, email: data.email, displayName: data.fullName });
            setUserData(data);

            if (data.role) {
              localStorage.setItem("role", data.role);
            } else {
              localStorage.removeItem("role");
            }
          } else {
            throw new Error("Invalid token");
          }
        } else {
          setUser(null);
          setUserData(null);
          localStorage.removeItem("role");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUser(null);
        setUserData(null);
        localStorage.removeItem("role");
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return <AuthContext.Provider value={{ user, userData, loading, logout }}>{children}</AuthContext.Provider>;
};