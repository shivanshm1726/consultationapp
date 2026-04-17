"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, User, Mail, Lock, Stethoscope, BriefcaseMedical } from "lucide-react";
import axios from "axios";

export default function DoctorSignup() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    specialization: "",
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/auth/register-doctor`, formData);
      setSuccess("Registration successful. Your account is under review.");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 border-0 shadow-xl dark:bg-slate-800 text-center space-y-6">
           <div className="mx-auto w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
             <BriefcaseMedical className="w-10 h-10 text-amber-600" />
           </div>
           <h2 className="text-2xl font-bold dark:text-white">Account Under Review</h2>
           <p className="text-slate-600 dark:text-slate-300">
             Thank you for registering! Your application is pending admin approval. You will be able to log in once your credentials have been verified by the administration.
           </p>
           <Button onClick={() => router.push("/login")} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
             Back to Login
           </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg mb-4">
            <Stethoscope className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Doctor Application</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Register to join our clinical platform
          </p>
        </div>

        <Card className="border-0 shadow-2xl overflow-hidden dark:bg-slate-800/90 py-4">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Professional Name</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      required
                      placeholder="Dr. Jane Doe"
                      className="pl-10 dark:bg-slate-700 dark:border-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      placeholder="doctor@clinic.com"
                      className="pl-10 dark:bg-slate-700 dark:border-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="specialization">Primary Specialization</Label>
                  <div className="relative mt-1">
                    <BriefcaseMedical className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="specialization"
                      value={formData.specialization}
                      onChange={(e) => handleInputChange("specialization", e.target.value)}
                      required
                      placeholder="e.g. Cardiology, Pediatrics"
                      className="pl-10 dark:bg-slate-700 dark:border-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                      className="pl-10 pr-10 dark:bg-slate-700 dark:border-slate-600"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white shadow-md"
                disabled={loading}
              >
                {loading ? "Submitting Application..." : "Submit Application"}
              </Button>

              <div className="text-center border-t border-gray-100 dark:border-slate-700 pt-4 mt-6">
                <Link href="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                  Already have an account? Sign in
                </Link>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
