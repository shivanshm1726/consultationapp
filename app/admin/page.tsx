"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useUserRole } from "@/hooks/useUserRole";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Users,
  DollarSign,
  Activity,
  Clock,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Video,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalAppointments: number;
  todayAppointments: number;
  totalRevenue: number;
  activePatients: number;
}

interface RecentActivity {
  id: string;
  type: "chat" | "appointment" | "call";
  patient: string;
  time: string;
  status: string;
}

export default function DoctorDashboard() {
  const [user] = useAuthState(auth);
  const { role, updateRole, loading: roleLoading } = useUserRole();
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    todayAppointments: 0,
    totalRevenue: 0,
    activePatients: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const doctorFee = Number.parseInt(
    process.env.NEXT_PUBLIC_DOCTOR_FEE || "500"
  );

  useEffect(() => {
    if (!user) return;

    // Listen to real-time updates from "appointments"
    const unsubscribe = onSnapshot(
      collection(db, "appointments"),
      (snapshot) => {
        const allAppointments = snapshot.docs.map((doc) => doc.data());

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const todayAppointments = allAppointments.filter((a) => {
          const date = new Date(a.date); // string date from Firestore
          return date >= today && date < tomorrow;
        }).length;

        const totalAppointments = allAppointments.length;

        const totalRevenue =
          allAppointments.filter((a) => a.status === "completed").length *
          doctorFee;

        setStats((prev) => ({
          ...prev,
          todayAppointments,
          totalAppointments,
          totalRevenue,
        }));
      }
    );

    return () => unsubscribe();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Get total appointments from appointments collection
      const appointmentsQuery = query(collection(db, "appointments"));
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const totalAppointments = appointmentsSnapshot.size;

      // Get today's appointments
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayQuery = query(
        collection(db, "appointments"),
        where("date", ">=", Timestamp.fromDate(today)),
        where("date", "<", Timestamp.fromDate(tomorrow))
      );
      const todaySnapshot = await getDocs(todayQuery);
      const todayAppointments = todaySnapshot.size;

      // Calculate revenue (completed consultations * fee)
      const completedQuery = query(
        collection(db, "appointments"),
        where("status", "==", "completed")
      );
      const completedSnapshot = await getDocs(completedQuery);
      const totalRevenue = completedSnapshot.size * doctorFee;

      // Get active patients in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentChatsQuery = query(
        collection(db, "chats"),
        where("createdAt", ">=", Timestamp.fromDate(thirtyDaysAgo))
      );
      const recentChatsSnapshot = await getDocs(recentChatsQuery);
      const activePatients = new Set(
        recentChatsSnapshot.docs.map((doc) => doc.data().patientEmail)
      ).size;

      setStats({
        totalAppointments,
        todayAppointments,
        totalRevenue,
        activePatients,
      });

      // Get recent activity
      const recentQuery = query(
        collection(db, "appointments"),
        orderBy("createdAt", "desc"),
        limit(5)
      );
      const recentSnapshot = await getDocs(recentQuery);
      const activities: RecentActivity[] = recentSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: "appointment",
          patient: data.patientName || "Unknown Patient",
          time: data.createdAt?.toDate?.()?.toLocaleTimeString() || "Unknown",
          status: data.status || "pending",
        };
      });
      setRecentActivity(activities);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickAccessCards = [
    {
      title: "Chats",
      description: "Active patient conversations",
      icon: MessageCircle,
      color: "from-teal-500 to-teal-600",
      hoverColor: "hover:from-teal-600 hover:to-teal-700",
      bgColor: "bg-teal-50 dark:bg-teal-950/20",
      href: "/doctor/chats",
      count: "Available",
    },
    {
      title: "Calls",
      description: "Video consultations",
      icon: Video,
      color: "from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-600 hover:to-blue-700",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      href: "/doctor/calls",
      count: "Available",
    },
  ];

  const statsCards = [
    {
      title: "Today's Appointments",
      value: stats.todayAppointments.toString(),
      icon: Calendar,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50 dark:bg-amber-950/20",
      change: "+12%",
    },
    {
      title: "Total Appointments",
      value: stats.totalAppointments.toString(),
      icon: Users,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      change: "+8%",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
      change: "+15%",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card
              key={i}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 shadow-xl"
            >
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-full">
      {/* Welcome Section */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <Sparkles className="h-8 w-8 text-teal-600 dark:text-teal-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Welcome back, Doctor
          </h1>
        </div>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Here's what's happening with your practice today.
        </p>
      </motion.div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {quickAccessCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ y: -5 }}
            className="group"
          >
            <Link href={card.href}>
              <Card
                className={`${card.bgColor} border-0 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden relative`}
              >
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">
                        {card.description}
                      </p>
                      <motion.div
                        className="flex items-center text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <span className="font-semibold text-lg">
                          Access now
                        </span>
                        <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </motion.div>
                    </div>
                    <motion.div
                      className={`w-20 h-20 bg-gradient-to-r ${card.color} ${card.hoverColor} rounded-2xl flex items-center justify-center ml-6 shadow-lg group-hover:shadow-xl transition-all duration-300`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <card.icon className="h-10 w-10 text-white" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
            whileHover={{ y: -3 }}
          >
            <Card
              className={`${stat.bgColor} border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden relative`}
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2 group-hover:scale-105 transition-transform duration-300">
                      {stat.value}
                    </p>
                  </div>
                  <motion.div
                    className={`w-14 h-14 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <stat.icon className="h-7 w-7 text-white" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {/* User Role Management Section (Admin Only) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full mt-10"
        >
          <Card className="w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl border-slate-200/60 dark:border-slate-700/60">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                User Role Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const roleEl = form.elements.namedItem(
                    "role"
                  ) as HTMLSelectElement | null;
                  const emailEl = form.elements.namedItem(
                    "email"
                  ) as HTMLInputElement | null;

                  const role = roleEl?.value.trim();
                  const email = emailEl?.value.trim().toLowerCase(); // normalize email

                  if (!email || !role) {
                    alert("Please provide email and select role");
                    return;
                  }

                  try {
                    // Step 1: Find user document by email field
                    const usersRef = collection(db, "users");
                    const q = query(usersRef, where("email", "==", email));
                    const querySnapshot = await getDocs(q);

                    if (querySnapshot.empty) {
                      alert("User not found. Please check the email.");
                      return;
                    }

                    // Step 2: Update the role in that document
                    const userDoc = querySnapshot.docs[0];
                    await updateDoc(userDoc.ref, { role });

                    alert(`Role updated to '${role}' for ${email}`);
                    form.reset();
                  } catch (err) {
                    console.error(err);
                    alert("Failed to update role. Try again.");
                  }
                }}
                className="space-y-4"
              >
                <div className="flex flex-col md:flex-row gap-4 w-full">
                  <Input
                    name="email"
                    placeholder="Enter user email..."
                    className="flex-1"
                  />
                  <select
                    name="role"
                    className="border rounded-md px-4 py-2 dark:bg-slate-700 dark:text-white dark:border-slate-600"
                  >
                    <option value="">Select role</option>
                    <option value="patient">Patient</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <Button
                  type="submit"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Update Role
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
