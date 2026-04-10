import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/patients';

export const usePatients = (userEmail: string, userPhone: string, userUid: string) => {
  const [linkedPatients, setLinkedPatients] = useState<any[]>([]);
  const [activePatient, setActivePatient] = useState<any | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      if (!userEmail && !userPhone) {
        setLinkedPatients([]);
        setActivePatient(null);
        return;
      }

      try {
        const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
        const token = tokenMatch ? tokenMatch[1] : null;

        const response = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Current user mapping
        const currentUserPatient = {
          id: userUid,
          firstName: "Myself",
          lastName: "",
          patientUid: userUid,
        };

        const mergedList = [currentUserPatient, ...response.data];
        setLinkedPatients(mergedList);

        const savedActivePatientId = localStorage.getItem("activePatientId");
        if (savedActivePatientId) {
          const selected = mergedList.find((p: any) => p.id === savedActivePatientId || p._id === savedActivePatientId);
          if (selected) setActivePatient(selected);
        } else if (mergedList.length > 0) {
          setActivePatient(mergedList[0]);
        }

      } catch (error) {
        console.error("Failed to fetch patients:", error);
      }
    };

    fetchPatients();
  }, [userEmail, userPhone, userUid]);

  const addPatient = async (patientData: any) => {
    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
      const token = tokenMatch ? tokenMatch[1] : null;

      const response = await axios.post(API_URL, patientData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const newEntry = { id: response.data._id, ...response.data };
      setLinkedPatients((prev) => [...prev, newEntry]);
      return newEntry;
    } catch (err) {
      console.error("Error adding patient:", err);
      throw err;
    }
  };

  const selectPatient = (patient: any) => {
    setActivePatient(patient);
    localStorage.setItem("activePatientId", patient.id || patient._id);
  };

  return {
    linkedPatients,
    activePatient,
    addPatient,
    selectPatient,
  };
};
