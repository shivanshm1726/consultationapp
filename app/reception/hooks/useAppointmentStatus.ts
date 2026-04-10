import { useEffect, useState } from "react"
import axios from "axios"

const SETTINGS_API = "http://localhost:5001/api/settings";

export const useAppointmentStatus = () => {
  const [active, setActive] = useState(true)
  const [loading, setLoading] = useState(true)

  const fetchStatus = async () => {
    try {
      const response = await axios.get(`${SETTINGS_API}/appointmentStatus`);
      if (response.data && response.data.value) {
        setActive(response.data.value.active)
      }
    } catch (err) {
      console.error("Error fetching appointment status:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const toggleStatus = async () => {
    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
      const token = tokenMatch ? tokenMatch[1] : null;

      await axios.put(`${SETTINGS_API}/appointmentStatus`, { 
        value: { active: !active } 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActive(!active)
    } catch (err) {
      console.error("Error toggling appointment status:", err)
    }
  }

  return { active, toggleStatus, loading }
}
