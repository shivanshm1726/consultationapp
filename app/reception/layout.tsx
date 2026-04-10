import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ReceptionLayout from "./layout.client";

export default async function ReceptionProtectedLayout({ children }: { children: React.ReactNode }) {
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
        
        if (userData.role !== "receptionist") {
            redirect("/unauthorized");
        }

        return <ReceptionLayout>{children}</ReceptionLayout>;
    } catch (error) {
        console.error("Reception layout verification error:", error);
        redirect("/login");
    }
}