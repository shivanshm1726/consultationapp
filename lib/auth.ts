// src/lib/auth.ts
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export interface UserData {
  uid: string;
  email: string;
  fullName: string;
  age: number;
  createdAt: Date;
  role?: "admin" | "receptionist" | "patient";
  phone?: string; // Added optional phone field
}

export const registerUser = async (email: string, password: string, fullName: string, age: number, phone?: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: fullName });

    const userData: UserData = {
      uid: user.uid,
      email: user.email!,
      fullName,
      age,
      createdAt: new Date(),
      phone, // Include phone if provided
    };

    await setDoc(doc(db, "users", user.uid), userData);

    return { user, userData };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserData;
    } else {
      return null;
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Optional: Add a function to update user data
export const updateUserData = async (uid: string, data: Partial<UserData>) => {
  try {
    await setDoc(doc(db, "users", uid), data, { merge: true });
  } catch (error: any) {
    throw new Error(error.message);
  }
};