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
import { updateProfile } from "firebase/auth";
import { updateUserData } from "@/lib/auth"; // Import the new function
import { toast } from "@/components/ui/use-toast";
import Image from "next/image";
import { auth } from "@/lib/firebase";

export default function ProfilePage() {
  const { user, userData, loading } = useAuth();
  const { darkMode } = useDarkMode();
  const router = useRouter();

  // State for form inputs and submission
  const [formData, setFormData] = useState({
    fullName: userData?.fullName || user?.displayName || "",
    email: user?.email || "",
    age: userData?.age?.toString() || "",
    phone: userData?.phone || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Update form data when userData changes
  useEffect(() => {
    setFormData({
      fullName: userData?.fullName || user?.displayName || "",
      email: user?.email || "",
      age: userData?.age?.toString() || "",
      phone: userData?.phone || "",
    });
  }, [user, userData]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  // Handle form submission
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return;
    }
    if (!formData.age || isNaN(Number(formData.age))) {
      setError("Valid age is required");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (user) {
        // Update Firebase auth profile
        await updateProfile(user, { displayName: formData.fullName });
        // Update Firestore user data
        await updateUserData(user.uid, {
          fullName: formData.fullName,
          age: Number(formData.age),
          phone: formData.phone || undefined, // Handle empty phone
        });
        setSuccess("Profile updated successfully!");
        toast({ title: "Success", description: "Your profile has been updated." });
      }
    } catch (error: any) {
      console.error("Update error:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsSubmitting(true);
    try {
      // Use Firebase's sendPasswordResetEmail (update import if needed)
      const { sendPasswordResetEmail } = await import("firebase/auth");
      await sendPasswordResetEmail(auth, user.email);
      setSuccess("Password reset email sent!");
      toast({ title: "Success", description: "Check your email for the password reset link." });
    } catch (error: any) {
      console.error("Password reset error:", error);
      setError("Failed to send password reset email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl font-semibold">Loading...</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "dark bg-slate-900" : "bg-gradient-to-br from-teal-50 via-white to-indigo-50"
      }`}
    >
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Link href="/">
          <Button
            variant="ghost"
            className={`mb-6 hover:bg-indigo-100 dark:hover:bg-slate-700 transition-all duration-300 ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Button>
        </Link>

        {/* Profile Card */}
        <Card
          className={`max-w-2xl mx-auto p-8 shadow-xl border-0 ${
            darkMode ? "bg-slate-800/50 backdrop-blur-sm" : "bg-white/70 backdrop-blur-sm"
          } rounded-2xl transition-all duration-300`}
        >
          <div className="flex flex-col items-center mb-8">
            {/* Profile Picture */}
            <div className="relative w-24 h-24 mb-4">
              <Image
                src={user.photoURL || "/placeholder.svg?height=96&width=96"}
                alt="Profile Picture"
                width={96}
                height={96}
                className="rounded-full object-cover border-4 border-indigo-600/20 shadow-lg"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-1 hover:bg-indigo-700"
                aria-label="Change Profile Picture"
                disabled
              >
                <User className="h-4 w-4" />
              </Button>
            </div>
            <h1 className={`text-3xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
              Profile Settings
            </h1>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Manage your personal information
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            {/* Full Name */}
            <div>
              <Label htmlFor="fullName" className={darkMode ? "text-gray-200" : "text-gray-700"}>
                Full Name
              </Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className={`mt-1 ${darkMode ? "bg-slate-700 text-gray-200 border-slate-600" : "bg-white"}`}
                required
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <Label htmlFor="email" className={darkMode ? "text-gray-200" : "text-gray-700"}>
                Email
              </Label>
              <Input
                id="email"
                name="email"
                value={formData.email}
                disabled
                className={`mt-1 ${
                  darkMode ? "bg-slate-700 text-gray-400 border-slate-600" : "bg-gray-100 text-gray-600"
                } cursor-not-allowed`}
              />
            </div>

            {/* Age */}
            <div>
              <Label htmlFor="age" className={darkMode ? "text-gray-200" : "text-gray-700"}>
                Age
              </Label>
              <Input
                id="age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleInputChange}
                placeholder="Enter your age"
                className={`mt-1 ${darkMode ? "bg-slate-700 text-gray-200 border-slate-600" : "bg-white"}`}
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <Label htmlFor="phone" className={darkMode ? "text-gray-200" : "text-gray-700"}>
                Phone Number (Optional)
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className={`mt-1 ${darkMode ? "bg-slate-700 text-gray-200 border-slate-600" : "bg-white"}`}
              />
            </div>

            {/* Role (Read-only) */}
            <div>
              <Label htmlFor="role" className={darkMode ? "text-gray-200" : "text-gray-700"}>
                Role
              </Label>
              <Input
                id="role"
                value={userData?.role || "Patient"}
                disabled
                className={`mt-1 ${
                  darkMode ? "bg-slate-700 text-gray-400 border-slate-600" : "bg-gray-100 text-gray-600"
                } cursor-not-allowed`}
              />
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            {success && (
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                <p className="text-sm">{success}</p>
              </div>
            )}

            {/* Update Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 shadow-lg text-lg py-3 transition-all duration-300 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Profile"
              )}
            </Button>
          </form>

          {/* Password Reset */}
          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={handlePasswordReset}
              className={`text-sm ${
                darkMode ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-700"
              }`}
              disabled={isSubmitting}
            >
              Send Password Reset Email
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}