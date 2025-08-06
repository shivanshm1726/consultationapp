"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Appointment } from "../lib/types";

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "appointments"),
      orderBy("appointmentDate", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appointmentData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          patientId: data.patientId || "", 
          ...data,
        };
      }) as Appointment[];

      setAppointments(appointmentData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateAppointmentStatus = async (
    appointmentId: string,
    status: Appointment["status"]
  ) => {
    try {
      await updateDoc(doc(db, "appointments", appointmentId), {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating appointment:", error);
      throw error;
    }
  };

  const createAppointment = async (
    appointmentData: Omit<Appointment, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const docRef = await addDoc(collection(db, "appointments"), {
        ...appointmentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  };

  const getFilteredAppointments = (filters: {
    status?: string;
    urgency?: string;
    date?: string;
  }) => {
    return appointments.filter((appointment) => {
      if (filters.status && appointment.status !== filters.status) return false;
      if (filters.urgency && appointment.urgency !== filters.urgency)
        return false;
      if (filters.date && appointment.appointmentDate !== filters.date)
        return false;
      return true;
    });
  };

  return {
    appointments,
    loading,
    updateAppointmentStatus,
    createAppointment,
    getFilteredAppointments,
  };
}
