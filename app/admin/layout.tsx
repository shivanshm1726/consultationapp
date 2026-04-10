import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DoctorLayout from "./layout.client";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) redirect("/login");

    try {
        const response = await fetch("http://localhost:5001/api/auth/profile", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            redirect("/login");
        }

        const userData = await response.json();
        
        if (userData.role !== "admin") {
            redirect("/unauthorized");
        }

        return <DoctorLayout>{children}</DoctorLayout>;
    } catch (error) {
        console.error("Admin layout verification error:", error);
        redirect("/login");
    }
}