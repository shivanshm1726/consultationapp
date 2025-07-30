import { getAuth, signOut } from "firebase/auth";

export async function logoutUser() {
  const auth = getAuth();
  await signOut(auth);
  window.location.href = "@/login"; // Redirect to login page after logout
}
