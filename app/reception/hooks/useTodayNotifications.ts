"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

type Notification = {
  id: string;
  name: string;
  phone: string;
  createdAt: Timestamp;
  time: string; // <-- actual appointment time
};

export function useTodayNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(false);
  const [isUserInteracted, setIsUserInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const prevCountRef = useRef(0);

  // Detect user interaction before playing sound
  useEffect(() => {
    const handleInteraction = () => {
      setIsUserInteracted(true);
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };

    document.addEventListener("click", handleInteraction);
    document.addEventListener("keydown", handleInteraction);

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  // Subscribe to today's appointments
  useEffect(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const startTimestamp = Timestamp.fromDate(todayStart);

    const q = query(
      collection(db, "appointments"),
      where("createdAt", ">=", startTimestamp)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const latest = snapshot.docs.map((doc) => {
        const data = doc.data();

        const formatTime = (value: any): string => {
          if (typeof value === "string") return value;
          if (value?.seconds) {
            return new Date(value.seconds * 1000).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
          }
          return "N/A";
        };

        return {
          id: doc.id,
          name: `${data.firstName ?? "?"} ${data.lastName ?? ""}`,
          phone: data.phone ?? "N/A",
          createdAt: data.createdAt, // (you can still keep it if needed)
          time: formatTime(data.time), // ✅ actual time slot selected
        };
      });

      // Sort by createdAt DESCENDING (newest first)
      latest.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);

      // Play sound only when a new appointment is added
      try {
        if (
          latest.length > prevCountRef.current &&
          prevCountRef.current > 0 &&
          isUserInteracted &&
          audioRef.current
        ) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch((e) => {
            console.warn("Audio play failed:", e.message ?? e);
          });
          setUnread(true);
        }
      } catch (e: any) {
        console.warn("Notification error:", e.message ?? e);
      }

      setNotifications(latest);
      prevCountRef.current = latest.length;
    });

    return () => unsub();
  }, [isUserInteracted]);

  const markAsRead = () => setUnread(false);

  return {
    notifications,
    unread,
    markAsRead,
    audioRef,
  };
}
