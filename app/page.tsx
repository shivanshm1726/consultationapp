"use client";
import { useDarkMode } from "@/contexts/dark-mode-context";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePatients } from "@/hooks/usePatients";
import { logoutUser } from "@/lib/auth";
import {
  Clock,
  MapPin,
  Phone,
  Mail,
  Award,
  Calendar,
  Stethoscope,
  Shield,
  Heart,
  ArrowRight,
  Menu,
  X,
  Sun,
  Moon,
  ArrowLeft,
  Plus,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface PatientType {
  id: string;
  linkedTo: string | null;
  createdAt: Date;
  patientUid: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string; // Optional
  gender: string;
  age: number;
}

export default function HomePage() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showServices, setShowServices] = useState(true);
  const [showGallery, setShowGallery] = useState(false);
  const [serviceScrollPosition, setServiceScrollPosition] = useState(0);
  const servicesRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { user, userData, loading } = useAuth();
  const [checkingRedirect, setCheckingRedirect] = useState(true);
  
  // Use pure functional hook for authentication
  const { linkedPatients, activePatient, addPatient, selectPatient } = usePatients(
    user?.email || "", 
    userData?.phone || "", 
    user?.uid || ""
  );

  const [showPatientPanel, setShowPatientPanel] = useState(false);
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);
  const [newPatientData, setNewPatientData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    gender: "",
    age: 0,
  });

  // Always call all hooks first, before any early returns
  useEffect(() => {
    if (loading) {
      return; // Wait for auth state to resolve
    }

    if (!user) {
      // Non-authenticated user: Clear stale data and show homepage
      localStorage.removeItem("role");
      localStorage.removeItem("activePatientId");
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      setCheckingRedirect(false);
      return;
    }

    // Authenticated user: Redirect based on role
    if (userData?.role === "admin") {
      router.replace("/admin");
    } else if (userData?.role === "receptionist") {
      router.replace("/reception");
    } else {
      // Regular user (e.g., patient) or no role: Stay on homepage
      setCheckingRedirect(false);
    }
  }, [user, userData, loading, router]);

  // Early return after all hooks are called
  if (checkingRedirect || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl font-semibold">Redirecting...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logoutUser();
      await fetch("/api/logout", { method: "POST" });
      localStorage.removeItem("role");
      localStorage.removeItem("activePatientId");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleChatClick = () => {
    if (user) {
      router.push("/profile");
    } else {
      router.push("/login");
    }
  };

  const handleSelectPatient = (patient: PatientType) => {
    selectPatient(patient);
    setShowPatientPanel(false);
  };

  const handleAddPatient = async () => {
    if (!user) return;

    try {
      const newPatient = {
        ...newPatientData,
        age: Number(newPatientData.age),
      };

      await addPatient(newPatient);

      setNewPatientData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        gender: "",
        age: 0,
      });

      setShowAddPatientForm(false);
    } catch (err) {
      console.error("Error adding patient:", err);
    }
  };

  const scrollServices = (direction: "left" | "right") => {
    const maxScroll = Math.max(0, services.length - 3);
    if (direction === "left") {
      setServiceScrollPosition(Math.max(0, serviceScrollPosition - 1));
    } else {
      setServiceScrollPosition(Math.min(maxScroll, serviceScrollPosition + 1));
    }
  };

  // Update the services array with image URLs
  const services = [
    {
      title: "General Checkup",
      description:
        "Comprehensive health evaluations including vitals monitoring, routine physicals, and preventative health screenings for patients of all ages.",
      icon: "🩺",
      image: "/laserhairremoval.jpg", 
    },
    {
      title: "Pediatrics",
      description:
        "Specialized care for infants, children, and adolescents. From routine vaccinations to developmental assessments and acute illness treatment.",
      icon: "👶",
      image: "/chemicalpeeling.jpg",
    },
    {
      title: "Diagnostics & Labs",
      description:
        "On-site laboratory services providing quick and accurate results for blood work, cultures, and other essential diagnostic tests.",
      icon: "🔬",
      image: "/vitiligo.jpg",
    },
    {
      title: "Specialized Surgery",
      description:
        "Advanced outpatient surgical procedures utilizing state-of-the-art equipment to ensure patient safety and rapid recovery.",
      icon: "🏥",
      image: "/electrosurgery.jpeg",
    },
    {
      title: "Cardiology",
      description:
        "Comprehensive heart health services including ECGs, stress tests, and personalized cardiovascular disease management.",
      icon: "❤️",
      image: "/radiofrequency.jpeg",
    },
    {
      title: "Emergency Care",
      description:
        "Immediate medical attention for acute injuries and sudden illnesses, supported by our experienced trauma-ready staff.",
      icon: "🚑",
      image: "/acnesurgery.jpeg",
    },
  ];

  const galleryImages = [
    "/clinic2.png",
    "/clinic5.png",
    "/clinic8.png",
    "/clinic4.png",
    "/clinic1.png",
    "/clinic3.png",
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "dark bg-slate-900"
          : "bg-gradient-to-br from-teal-50 via-white to-indigo-50"
      }`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
          darkMode
            ? "bg-slate-900/80 border-slate-700"
            : "bg-white/80 border-white/20"
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1
                  className={`text-xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Medical Clinic
                </h1>
                <p className="text-sm text-indigo-600">General Practice</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/doctor-profile"
                className={`${
                  darkMode
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-600 hover:text-indigo-600"
                } transition-colors`}
              >
                About Doctor
              </Link>
              <Link
                href="/gallery"
                className={`${
                  darkMode
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-600 hover:text-blue-600"
                } transition-colors`}
              >
                Gallery
              </Link>
              <Link
                href="/contact"
                className={`${
                  darkMode
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-600 hover:text-indigo-600"
                } transition-colors`}
              >
                Contact
              </Link>
              <Link
                href="/why-choose-us"
                className={`${
                  darkMode
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-600 hover:text-indigo-600"
                } transition-colors`}
              >
                Why Choose Us
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="p-2"
                aria-label={
                  darkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {darkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              <Link href="/profile">
                <Button
                  variant="ghost"
                  className="w-full bg-transparent flex items-center justify-center"
                >
                  <User className="h-4 w-4 mr-2" />
                  
                </Button>
              </Link>
              {/* Active Patient Display */}
              {activePatient && (
                <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900 rounded-full">
                  <User className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    {activePatient.firstName} {activePatient.lastName}
                  </span>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => setShowPatientPanel(true)}
                className="text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                {linkedPatients.length === 0 ? "Add Patient" : "Select Patient"}
              </Button>

              {user ? (
                <div className="hidden md:flex items-center space-x-3">
                  <Button variant="outline" onClick={handleLogout}>
                    Logout
                  </Button>
                  <Link href="/appointment">
                    <Button className="bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 shadow-lg">
                      Book Appointment
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <Link href="/login">
                    <Button variant="outline" className="bg-transparent">
                      Login
                    </Button>
                  </Link>
                  <Link href="/appointment">
                    <Button className="bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 shadow-lg">
                      Book Appointment
                    </Button>
                  </Link>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div
              className={`md:hidden mt-4 p-4 rounded-lg backdrop-blur-md ${
                darkMode ? "bg-slate-800/90" : "bg-white/90"
              }`}
            >
              <nav className="flex flex-col space-y-3">
                <Link href="/" className="text-indigo-600 font-medium">
                  Home
                </Link>
                <Link
                  href="/doctor-profile"
                  className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}
                >
                  About Doctor
                </Link>
                <Link
                  href="/treatments"
                  className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}
                >
                  Gallery
                </Link>
                <Link
                  href="/contact"
                  className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}
                >
                  Contact
                </Link>

                {/* Mobile Active Patient Display */}
                {activePatient && (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <User className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      Active: {activePatient.firstName} {activePatient.lastName}
                    </span>
                  </div>
                )}

                <div className="flex flex-col space-y-2 pt-3 border-t border-gray-200">
                  {user ? (
                    <>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Welcome, {userData?.fullName || user.displayName}
                      </span>
                      <Link href="/profile">
                        <Button
                          variant="outline"
                          className="w-full bg-transparent flex items-center justify-center"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Profile Settings
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="w-full bg-transparent"
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Link href="/login">
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                      >
                        Login
                      </Button>
                    </Link>
                  )}
                  <Link href="/appointment">
                    <Button className="w-full bg-gradient-to-r from-indigo-600 to-teal-600">
                      Book Appointment
                    </Button>
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-teal-600/10"></div>
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center relative">
            <div className="space-y-8 relative z-20">
              <div className="space-y-4">
                <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
                  20+ Years Experience
                </Badge>
                <h1
                  className={`text-4xl md:text-6xl font-bold leading-tight ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Expert Medical Care at{" "}
                  <span className="bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-transparent">
                    Medical Clinic
                  </span>
                </h1>
                <p
                  className={`text-xl leading-relaxed ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <span className="font-bold">
                    Specialists in General Health & Wellness
                  </span>
                  . Comprehensive treatments and consultations for all your medical needs with decades of expertise.
                </p>

                {/* Patient-specific welcome message */}
                {activePatient && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-blue-800 dark:text-blue-200">
                      <strong>Welcome back, {activePatient.firstName}!</strong>{" "}
                      Ready to continue your skin care journey?
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/appointment">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 shadow-lg text-lg px-8 py-4 group"
                  >
                    Book Consultation
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleChatClick}
                  className={`text-lg px-8 py-4 backdrop-blur-sm ${
                    darkMode
                      ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                      : "border-white/20 bg-white/10 hover:bg-white/20"
                  }`}
                >
                  Start Live Chat
                </Button>
              </div>

              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div
                    className={`text-3xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    20+
                  </div>
                  <div
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Years Experience
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-3xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    5000+
                  </div>
                  <div
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Happy Patients
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-3xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    2
                  </div>
                  <div
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Clinic Locations
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex justify-center">
              <div className="relative group">
                <div className="relative p-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-500 rounded-3xl shadow-2xl group-hover:shadow-3xl transition-all duration-300">
                  <div className="bg-white rounded-2xl p-1 shadow-inner">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/doctor-award.jpg-lTIEbH4xBAMehhJONWbfhUwLiYMMRz.jpeg"
                      alt="Clinic receiving professional recognition"
                      className="rounded-xl w-full max-w-md mx-auto object-cover shadow-lg group-hover:scale-[1.02] transition-transform duration-300"
                      style={{
                        aspectRatio: "4/3",
                        height: "auto",
                        minHeight: "350px",
                      }}
                    />
                    <div
                      className={`text-center p-4 rounded-b-xl ${
                        darkMode
                          ? "bg-slate-800/95 text-white"
                          : "bg-white/95 text-gray-900"
                      } backdrop-blur-md border-t ${
                        darkMode ? "border-slate-700" : "border-gray-200"
                      }`}
                    >
                      <div className="font-bold text-lg mb-1">
                        Certified & Licensed
                      </div>
                      <div className="text-indigo-600 font-semibold text-base">
                        Expert Practitioners
                      </div>
                      <div className="text-sm mt-1">
                        Board Certified Physicians
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse shadow-lg"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-pink-400 to-red-500 rounded-full animate-pulse shadow-lg"></div>
                <div className="absolute top-1/2 -left-8 w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-bounce shadow-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section
        className={`py-16 ${
          darkMode ? "bg-slate-800/50" : "bg-white/50"
        } backdrop-blur-sm`}
      >
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                <Clock className="h-8 w-8 text-white transition-transform duration-300" />
              </div>
              <h3
                className={`text-xl font-semibold mb-2 transition-all duration-300 group-hover:text-indigo-600 group-hover:scale-105 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Flexible Timings
              </h3>
              <p
                className={`transition-colors duration-300 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Morning & evening slots available at both clinics
              </p>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                <Award className="h-8 w-8 text-white transition-transform duration-300" />
              </div>
              <h3
                className={`text-xl font-semibold mb-2 transition-all duration-300 group-hover:text-green-600 group-hover:scale-105 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Expert Care
              </h3>
              <p
                className={`transition-colors duration-300 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                MBBS, MD qualified with 20+ years experience
              </p>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                <Heart className="h-8 w-8 text-white transition-transform duration-300" />
              </div>
              <h3
                className={`text-xl font-semibold mb-2 transition-all duration-300 group-hover:text-teal-600 group-hover:scale-105 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Patient Care
              </h3>
              <p
                className={`transition-colors duration-300 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Personalized treatment plans for every patient
              </p>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                <Phone className="h-8 w-8 text-white transition-transform duration-300" />
              </div>
              <h3
                className={`text-xl font-semibold mb-2 transition-all duration-300 group-hover:text-orange-600 group-hover:scale-105 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Easy Booking
              </h3>
              <p
                className={`transition-colors duration-300 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Call +1 (555) 123-4567 or book online instantly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 mb-4">
              Why Choose Us
            </Badge>
            <h2
              className={`text-3xl md:text-4xl font-bold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Reasons to Trust Medical Clinic
            </h2>
            <p
              className={`text-xl max-w-2xl mx-auto mb-8 ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Experience, expertise, and personalized care for your comprehensive health
            </p>
            <Button
              onClick={() => setShowServices(!showServices)}
              className="bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 shadow-lg"
            >
              {showServices ? "Hide Services" : "View Services"}
            </Button>

            {showServices && (
              <div className="mt-12 relative">
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => scrollServices("left")}
                    className="rounded-full p-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => scrollServices("right")}
                    className="rounded-full p-2"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="overflow-hidden">
                  <div
                    ref={servicesRef}
                    className="flex space-x-6 transition-transform duration-500 ease-in-out"
                    style={{
                      transform: `translateX(-${
                        serviceScrollPosition * 320
                      }px)`,
                    }}
                  >
                    {services.map((service, index) => (
                      <div
                        key={index}
                        className={`min-w-[350px] group shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-0 rounded-xl p-6 ${
                          darkMode
                            ? "bg-slate-800/50 backdrop-blur-sm"
                            : "bg-white/70 backdrop-blur-sm"
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-4xl mb-4">{service.icon}</div>
                          <img
                            src={service.image || "/placeholder.svg"}
                            alt={service.title}
                            className="w-full h-32 object-cover rounded-lg mb-4"
                            onError={(e) => {
                              e.currentTarget.src =
                                "/placeholder.svg?height=150&width=300";
                            }}
                          />
                          <h3
                            className={`text-xl font-semibold mb-3 ${
                              darkMode ? "text-white" : "text-blue-900"
                            }`}
                          >
                            {service.title}
                          </h3>
                          <p
                            className={`mb-4 text-sm leading-relaxed ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {service.description}
                          </p>
                          <Link href="/appointment">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all">
                              Book Now
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <p className="text-center font-semibold text-lg mt-8">
              Consultation Fee: ₹500
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Gallery Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2
              className={`text-3xl md:text-4xl font-bold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Clinic Gallery
            </h2>
            <p
              className={`text-xl max-w-2xl mx-auto mb-8 ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Take a look at our modern facilities and equipment
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {galleryImages.slice(0, 3).map((image, index) => (
              <Card
                key={index}
                className={`group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 overflow-hidden ${
                  darkMode
                    ? "bg-slate-800/50 backdrop-blur-sm"
                    : "bg-white/70 backdrop-blur-sm"
                }`}
                onClick={() => setShowGallery(true)}
              >
                <div className="relative">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Clinic Image ${index + 1}`}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={() => setShowGallery(true)}
              className="bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 shadow-lg"
            >
              View Full Gallery
            </Button>
          </div>
        </div>
      </section>

      {/* Clinic Locations */}
      <section
        className={`py-20 ${darkMode ? "bg-slate-800/30" : "bg-teal-50/50"}`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2
              className={`text-3xl md:text-4xl font-bold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Our Clinic Locations
            </h2>
            <p
              className={`text-xl ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Visit us at either of our convenient locations in the City Center
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card
              className={`p-8 ${
                darkMode
                  ? "bg-slate-800/50 backdrop-blur-sm"
                  : "bg-white/70 backdrop-blur-sm"
              } border-0 shadow-xl`}
            >
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3
                    className={`text-xl font-semibold mb-2 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    North Branch Clinic
                  </h3>
                  <p
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    } mb-4`}
                  >
                    Main clinic location with full treatment facilities
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <div
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Mon-Sat: 10:00 AM - 2:00 PM
                    </div>
                    <div
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Mon-Fri: 6:00 PM - 8:00 PM
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <span
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    +1 (555) 123-4567
                  </span>
                </div>
              </div>
            </Card>

            <Card
              className={`p-8 ${
                darkMode
                  ? "bg-slate-800/50 backdrop-blur-sm"
                  : "bg-white/70 backdrop-blur-sm"
              } border-0 shadow-xl`}
            >
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h3
                    className={`text-xl font-semibold mb-2 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    South Branch Clinic
                  </h3>
                  <p
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    } mb-4`}
                  >
                    Secondary location for convenient access
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <div
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Mon-Sat: 2:00 PM - 4:00 PM
                    </div>
                    <div
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Mon-Fri: 8:30 PM - 9:30 PM
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <span
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    +1 (555) 123-4567
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Skin?
          </h2>
          <p className="text-xl mb-8 text-indigo-100 max-w-2xl mx-auto">
            Book your consultation today and take the
            first step towards healthier, beautiful skin
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/appointment">
              <Button
                size="lg"
                className="bg-white text-indigo-600 hover:bg-gray-100 text-lg px-8 py-4 shadow-lg"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Book Appointment
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={handleChatClick}
              className="border-white text-white hover:bg-white hover:text-indigo-600 text-lg px-8 py-4 bg-transparent"
            >
              Start Live Chat
            </Button>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6">
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span className="text-lg font-medium">+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>contact@medicalclinic.com</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`${
          darkMode ? "bg-slate-900" : "bg-slate-900"
        } text-white py-12`}
      >
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-teal-600 rounded-lg flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Medical Clinic</span>
              </div>
              <p className="text-gray-400 mb-4">
                Expert physician with 20+ years of experience in advanced
                skin treatments and care.
              </p>
              <div className="flex space-x-4">
                <Phone className="h-5 w-5 text-gray-400" />
                <span className="text-gray-400">+1 (555) 123-4567</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/doctor-profile"
                    className="hover:text-white transition-colors"
                  >
                    About Doctor
                  </Link>
                </li>
                <li>
                  <Link
                    href="/treatments"
                    className="hover:text-white transition-colors"
                  >
                    Interactive Gallery
                  </Link>
                </li>
                <li>
                  <Link
                    href="/appointment"
                    className="hover:text-white transition-colors"
                  >
                    Book Appointment
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Laser Hair Removal</li>
                <li>Chemical Peels</li>
                <li>Vitiligo Surgery</li>
                <li>Acne Treatment</li>
                <li>Hair Transplantation</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-5 w-5 mt-0.5" />
                  <div>
                    <div>City Center Branch</div>
                    <div>North Branch</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>contact@medicalclinic.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; 2025 Medical Clinic. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 z-50">
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleChatClick}
            className="flex-1 bg-transparent"
          >
            Chat Now
          </Button>
          <Link href="/appointment" className="flex-1">
            <Button className="w-full bg-gradient-to-r from-indigo-600 to-teal-600">
              Book Appointment
            </Button>
          </Link>
        </div>
      </div>

      {/* Patient Management Panel */}
      {showPatientPanel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold">
                {showAddPatientForm ? "Add New Patient" : "Select Patient"}
              </h2>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowPatientPanel(false);
                  setShowAddPatientForm(false);
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {showAddPatientForm ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={newPatientData.firstName}
                        onChange={(e) =>
                          setNewPatientData((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={newPatientData.lastName}
                        onChange={(e) =>
                          setNewPatientData((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={newPatientData.phone}
                      onChange={(e) =>
                        setNewPatientData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email (optional)</Label>
                    <Input
                      id="email"
                      value={newPatientData.email}
                      onChange={(e) =>
                        setNewPatientData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <Label htmlFor="age">Age (optional)</Label>
                    <Input
                      id="age"
                      type="number"
                      value={newPatientData.age || ""}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        setNewPatientData((prev) => ({
                          ...prev,
                          age: isNaN(value) ? 0 : value,
                        }));
                      }}
                      placeholder="Enter age"
                    />
                  </div>

                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <select
                      id="gender"
                      value={newPatientData.gender}
                      onChange={(e) =>
                        setNewPatientData((prev) => ({
                          ...prev,
                          gender: e.target.value,
                        }))
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={handleAddPatient}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={
                        !newPatientData.firstName ||
                        !newPatientData.lastName ||
                        !newPatientData.phone
                      }
                    >
                      Add Patient
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddPatientForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {linkedPatients.length === 0 ? (
                    <div className="text-center py-8">
                      <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        No patients found. Add your first patient to get
                        started.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {linkedPatients.map((patient) => (
                          <div
                            key={patient.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                              activePatient?.id === patient.id
                                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                            }`}
                            onClick={() => handleSelectPatient(patient)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {patient.firstName} {patient.lastName}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Phone: {patient.phone}
                                </p>
                              </div>
                              {activePatient?.id === patient.id && (
                                <div className="text-green-600">
                                  <Shield className="h-5 w-5" />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => setShowAddPatientForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Patient
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-bold">Clinic Gallery</h3>
              <Button variant="ghost" onClick={() => setShowGallery(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto">
              {galleryImages.map((image, index) => (
                <img
                  key={index}
                  src={image || "/placeholder.svg"}
                  alt={`Clinic Image ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
