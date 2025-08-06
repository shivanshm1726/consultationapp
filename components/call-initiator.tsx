"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthState } from "react-firebase-hooks/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Phone, Video, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface CallInitiatorProps {
  patientName?: string;
  patientEmail?: string;
  urgency?: "low" | "medium" | "high";
}

export function CallInitiator({
  patientName = "Anonymous Patient",
  patientEmail = "patient@example.com",
  urgency = "medium",
}: CallInitiatorProps) {
  const [user] = useAuthState(auth);
  const [initiating, setInitiating] = useState<string | null>(null);
  const router = useRouter();

  const initiateCall = async (callType: "audio" | "video") => {
    if (!user) return;

    setInitiating(callType);

    try {
      // Generate unique channel name
      const patientUid = user.uid;
      const doctorEmail = process.env.NEXT_PUBLIC_DOCTOR_EMAIL!
      const channelName = `${doctorEmail}_${patientUid}`;

      // Create active call document
      const callDoc = await addDoc(collection(db, "activeCalls"), {
        patientName: user.displayName || patientName,
        patientEmail: user.email || patientEmail,
        patientPhone: user.phoneNumber || "",
        callType,
        status: "waiting",
        createdAt: serverTimestamp(),
        channelName,
        urgency,
        patientUid: user.uid,
        doctorEmail,
      });

      // Navigate to call interface
      router.push(
        `/call?channel=${channelName}&type=${callType}&callId=${callDoc.id}`
      );
    } catch (error) {
      console.error("Error initiating call:", error);
      alert("Failed to initiate call. Please try again.");
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
