"use client";

import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5001/api/appointments";

export function useAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
      const token = tokenMatch ? tokenMatch[1] : null;

      const response = await axios.get(`${API_URL}/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(response.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const updateAppointmentStatus = async (
    appointmentId: string,
    status: string,
    paymentStatus?: string
  ) => {
    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
      const token = tokenMatch ? tokenMatch[1] : null;

      await axios.put(`${API_URL}/${appointmentId}`, { status, paymentStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAppointments(); // Refresh
    } catch (error) {
      console.error("Error updating appointment:", error);
      throw error;
    }
  };

  const createAppointment = async (appointmentData: any) => {
    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
      const token = tokenMatch ? tokenMatch[1] : null;

      const response = await axios.post(API_URL, appointmentData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAppointments(); // Refresh
      return response.data;
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
