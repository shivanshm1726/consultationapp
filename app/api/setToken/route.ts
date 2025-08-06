import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
const body = await request.json();
const token = body.token;

if (!token) {
return NextResponse.json({ error: "Token missing" }, { status: 400 });
}

(await cookies()).set({
name: "token",
value: token,
httpOnly: true,
secure: process.env.NODE_ENV === "production",
path: "/",
maxAge: 60 * 60 * 24,
});

return NextResponse.json({ message: "Token set" });
}