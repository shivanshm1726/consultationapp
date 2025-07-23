import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

export const getAllUsers = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const updateUserRole = async (uid: string, newRole: "patient" | "admin" | "receptionist") => {
  await updateDoc(doc(db, "users", uid), { role: newRole });
};
