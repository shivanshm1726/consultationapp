"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import axios from "axios";
import { Phone, Video, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface CallInitiatorProps {
  patientName?: string;
  patientEmail?: string;
  urgency?: "low" | "medium" | "high";
}

const CALLS_API = "http://localhost:5001/api/calls";

export function CallInitiator({
  patientName = "Anonymous Patient",
  patientEmail = "patient@example.com",
  urgency = "medium",
}: CallInitiatorProps) {
  const { user, userData } = useAuth();
  const [initiating, setInitiating] = useState<string | null>(null);
  const router = useRouter();

  const initiateCall = async (callType: "audio" | "video") => {
    if (!user) return;

    setInitiating(callType);

    try {
      const doctorEmail = process.env.NEXT_PUBLIC_DOCTOR_EMAIL! || "contact@medicalclinic.com";
      const channelName = `${doctorEmail}_${user.email}`;

      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
      const token = tokenMatch ? tokenMatch[1] : null;

      const response = await axios.post(CALLS_API, {
        patientName: userData?.fullName || patientName,
        patientEmail: user.email,
        patientPhone: userData?.phone || "",
        callType,
        channelName,
        urgency,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      router.push(
        `/call?channel=${channelName}&type=${callType}&callId=${response.data._id}`
      );
    } catch (error) {
      console.error("Error initiating call:", error);
      alert("Failed to initiate call.");
    } finally {
      setInitiating(null);
    }
  };

  return (
    <div className="flex space-x-3">
      <Button
        onClick={() => initiateCall("audio")}
        disabled={!!initiating}
        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
      >
        {initiating === "audio" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Phone className="h-4 w-4" />
        )}
        <span>Audio Call</span>
      </Button>

      <Button
        onClick={() => initiateCall("video")}
        disabled={!!initiating}
        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
      >
        {initiating === "video" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Video className="h-4 w-4" />
        )}
        <span>Video Call</span>
      </Button>
    </div>
  );
}
