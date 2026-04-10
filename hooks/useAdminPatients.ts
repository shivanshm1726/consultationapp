import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/appointments/all';

export const useAdminPatients = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
        const token = tokenMatch ? tokenMatch[1] : null;

        const response = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Map populated appointments to a unique patient list
        const map = new Map<string, any>();
        response.data.forEach((app: any) => {
          if (app.patientId) {
            const p = app.patientId;
            const key = p.email || p.phone || p._id;
            if (!map.has(key)) {
              map.set(key, {
                id: p._id,
                patientName: `${p.firstName} ${p.lastName}`.trim(),
                contactNumber: p.phone,
                chiefComplaint: app.reason,
                email: p.email,
                age: p.age,
                gender: p.gender,
                createdAt: new Date(p.createdAt),
              });
            }
          }
        });

        setPatients(Array.from(map.values()));
      } catch (error) {
        console.error("Error fetching admin patients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  return { patients, loading };
};
