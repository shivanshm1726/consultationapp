"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
const API_URL = `${API_BASE_URL}/api/appointments/all`;

export function useTodayNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(false);
  const [isUserInteracted, setIsUserInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const prevCountRef = useRef(0);

  useEffect(() => {
    const handleInteraction = () => {
      setIsUserInteracted(true);
      document.removeEventListener("click", handleInteraction);
    };
    document.addEventListener("click", handleInteraction);
    return () => document.removeEventListener("click", handleInteraction);
  }, []);

  const fetchNotifications = async () => {
    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
      const token = tokenMatch ? tokenMatch[1] : null;

      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const latest = response.data
        .filter((apt: any) => new Date(apt.createdAt) >= today)
        .map((apt: any) => ({
          id: apt._id,
          name: `${apt.patientId?.firstName ?? "?"} ${apt.patientId?.lastName ?? ""}`,
          phone: apt.patientId?.phone ?? "N/A",
          createdAt: apt.createdAt,
          time: new Date(apt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));

      latest.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      if (latest.length > prevCountRef.current && prevCountRef.current > 0 && isUserInteracted && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.warn);
        setUnread(true);
      }

      setNotifications(latest);
      prevCountRef.current = latest.length;
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [isUserInteracted]);

  const markAsRead = () => setUnread(false);

  return {
    notifications,
    unread,
    markAsRead,
    audioRef,
  };
}
