"use client";

import { useAuth } from "@/contexts/auth-context";
import { useDarkMode } from "@/contexts/dark-mode-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import Image from "next/image";

const AUTH_API = "http://localhost:5001/api/auth";

export default function ProfilePage() {
  const { user, userData, loading } = useAuth();
  const { darkMode } = useDarkMode();
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    age: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [myAppointments, setMyAppointments] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (user) {
       const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
       const token = tokenMatch ? tokenMatch[1] : null;
       axios.get("http://localhost:5001/api/appointments", { headers: { Authorization: `Bearer ${token}` } })
         .then(res => setMyAppointments(res.data))
         .catch(console.error)
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || "",
        email: user?.email || "",
        age: userData.age?.toString() || "",
        phone: userData.phone || "",
      });
    }
  }, [user, userData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
      const token = tokenMatch ? tokenMatch[1] : null;

      const response = await axios.put(`${AUTH_API}/profile`, {
        fullName: formData.fullName,
        age: Number(formData.age),
        phone: formData.phone,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess("Profile updated successfully!");
      toast({ title: "Success", description: "Your profile has been updated." });
      
      // Force refresh data in context if needed or user will see updated values on next poll/reload
      window.location.reload();
    } catch (error: any) {
      console.error("Update error:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? "dark bg-slate-900" : "bg-slate-50"}`}>
      <div className="container mx-auto px-4 py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Button>
        </Link>

        <Card className={`max-w-2xl mx-auto p-8 shadow-xl ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white"}`}>
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <User className="h-12 w-12 text-white" />
            </div>
            <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Profile Settings</h1>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={formData.email} disabled className="mt-1 bg-slate-100" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
            </div>

            {error && <div className="text-red-600 flex items-center"><AlertCircle className="mr-2 h-4 w-4" />{error}</div>}
            {success && <div className="text-green-600 flex items-center"><CheckCircle className="mr-2 h-4 w-4" />{success}</div>}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Update Profile"}
            </Button>
          </form>
        </Card>

        {/* Patient Appointments Dashboard */}
        <div className="max-w-4xl mx-auto mt-12">
           <h2 className={`text-2xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>My Appointments</h2>
           {myAppointments.length > 0 ? (
             <div className="grid gap-4">
                {myAppointments.map((apt: any) => (
                  <Card key={apt._id} className={`p-6 ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white"}`}>
                     <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                           <h3 className="font-bold text-lg">{new Date(apt.appointmentDate).toDateString()}</h3>
                           <p className="opacity-70">Time Slot: {apt.timeSlot}</p>
                           <p className="opacity-70 mt-2 text-sm italic">Reason: {apt.reason}</p>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                           <div className="capitalize px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-700">
                             {apt.status}
                           </div>
                           {apt.status === 'in-progress' && (
                             <Link href={`/call?roomId=${apt._id}&type=video`}>
                               <Button className="bg-emerald-600 hover:bg-emerald-700 animate-pulse text-white shadow-lg shadow-emerald-500/20">
                                 Join Video Call
                               </Button>
                             </Link>
                           )}
                           <Link href={`/chat?appointmentId=${apt._id}`}>
                             <Button variant="outline">Consultation Chat</Button>
                           </Link>
                        </div>
                     </div>
                  </Card>
                ))}
             </div>
           ) : (
             <Card className={`p-8 text-center opacity-70 ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white"}`}>
                No appointments found. <br/><br/>
                <Link href="/appointment">
                  <Button>Book Appointment</Button>
                </Link>
             </Card>
           )}
        </div>

      </div>
    </div>
  );
}