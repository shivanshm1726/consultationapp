// useUserRole.ts
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, setDoc, onSnapshot } from "firebase/firestore"; // getDoc is not needed if only using onSnapshot
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation"; // Import useRouter

export function useUserRole() {
  const [user] = useAuthState(auth);
  const [role, setRole] = useState("patient");
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const userRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setRole(data.role || "patient");

        if (data.forceLogout) {
          // Reset forceLogout flag and then sign out/redirect
          setDoc(userRef, { forceLogout: false }, { merge: true })
            .then(() => {
              console.log("forceLogout flag reset. Signing out...");
              return signOut(auth); // Initiate sign out
            })
            .then(() => {
              console.log("User signed out. Redirecting to /login...");
              router.push("/login"); // Use Next.js router for client-side navigation
            })
            .catch((error) => {
              console.error("Error during force logout process:", error);
              // Handle errors, maybe show a message to the user
            });
        }
      }
      setLoading(false);
    }, (error) => {
      console.error("Error in user document listener:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, router]); // Add router to dependency array

  const updateRole = async (newRole: string) => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), { role: newRole }, { merge: true });
    setRole(newRole);
  };

  return { role, updateRole, loading };
}