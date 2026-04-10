import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SuperAdminLayoutClient from "./layout.client";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
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
        
        if (userData.role !== "superadmin") {
            redirect("/");
        }

        return <SuperAdminLayoutClient>{children}</SuperAdminLayoutClient>;
    } catch (error) {
        console.error("SuperAdmin layout verification error:", error);
        redirect("/login");
    }
}
