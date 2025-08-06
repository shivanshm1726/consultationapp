import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { admin } from "@/lib/firebase-admin";
import DoctorLayout from "./layout.client";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const token = (await cookies()).get("token")?.value;

    if (!token) redirect("/login");

    try {
        const decoded = await admin.auth().verifyIdToken(token);
        const uid = decoded.uid;
        const snap = await admin.firestore().doc(`users/${uid}`).get();
        const data = snap.data();
        if (data?.role !== "admin") redirect("/unauthorized");

        return <DoctorLayout>{children}</DoctorLayout>;
    } catch {
        redirect("/login");
    }
}