import { useState, useEffect } from "react";
import axios from "axios";

const STATS_URL = "http://localhost:5001/api/stats/dashboard";
const ACTIVITY_URL = "http://localhost:5001/api/stats/activity";

export function useDashboardData() {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    totalRevenue: 0,
    activePatients: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
        const token = tokenMatch ? tokenMatch[1] : null;

        const [statsRes, activityRes] = await Promise.all([
          axios.get(STATS_URL, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(ACTIVITY_URL, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setStats(statsRes.data);
        setRecentActivity(activityRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { stats, recentActivity, loading };
}
