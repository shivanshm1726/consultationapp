import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "./firebase"

export interface UserData {
  uid: string
  email: string
  fullName: string
  age: number
  createdAt: Date
}

// Register new user
export const registerUser = async (email: string, password: string, fullName: string, age: number) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update user profile
    await updateProfile(user, {
      displayName: fullName,
    })

    // Save additional user data to Firestore
    const userData: UserData = {
      uid: user.uid,
      email: user.email!,
      fullName,
      age,
      createdAt: new Date(),
    }

    await setDoc(doc(db, "users", user.uid), userData)

    return { user, userData }
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// Login user
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// Get user data from Firestore
export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const docRef = doc(db, "users", uid)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return docSnap.data() as UserData
    } else {
      return null
    }
  } catch (error: any) {
    throw new Error(error.message)
  }
}
