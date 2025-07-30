import { useEffect, useState } from "react"
import { doc, onSnapshot, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export const useAppointmentStatus = () => {
  const [active, setActive] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "appointments", "appointmentStatus"), (docSnap) => {
      if (docSnap.exists()) {
        setActive(docSnap.data().active)
      }
      setLoading(false)
    })

    return () => unsub()
  }, [])

  const toggleStatus = async () => {
    const ref = doc(db, "appointments", "appointmentStatus")
    await updateDoc(ref, { active: !active })
  }

  return { active, toggleStatus, loading }
}
