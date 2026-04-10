"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import axios from "axios";

export function useUserRole() {
  const { user, userData } = useAuth();
  const [role, setRole] = useState("patient");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (userData) {
      setRole(userData.role || "patient");
      setLoading(false);
    } else if (!user) {
      setLoading(false);
    }
  }, [user, userData]);

  const updateRole = async (newRole: string) => {
    if (!user) return;
    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
      const token = tokenMatch ? tokenMatch[1] : null;

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      await axios.put(`${API_BASE_URL}/api/users/${user.uid}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRole(newRole);
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  return { role, updateRole, loading };
}