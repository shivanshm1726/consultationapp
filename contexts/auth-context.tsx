// auth-context.tsx
"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { type User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserData, type UserData } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        try {
          const data = await getUserData(user.uid);
          setUserData(data);

          if (data?.role) {
            localStorage.setItem("role", data.role);
          } else {
            localStorage.removeItem("role");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData(null);
          localStorage.removeItem("role");
          document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        }
      } else {
        setUserData(null);
        localStorage.removeItem("role");
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ user, userData, loading }}>{children}</AuthContext.Provider>;
};