import * as functions from "firebase-functions"
import * as functionsV1 from "firebase-functions/v1"
import * as admin from "firebase-admin"
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { RtcTokenBuilder, RtcRole } from "agora-access-token"

dotenv.config()
admin.initializeApp()

// --- Express API for Agora Token ---
const app = express()
app.use(cors({ origin: true }))

app.get("/generate-agora-token", (req, res) => {
  const { channelName, uid, role } = req.query

  if (!channelName || !uid || !role) {
    return res.status(400).json({
      error: "Missing required query parameters (channelName, uid, role)",
    })
  }

  const appID = process.env.AGORA_APP_ID!
  const appCertificate = process.env.AGORA_APP_CERTIFICATE!

  const agoraRole =
    role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER

  const expireTimeInSeconds = 3600
  const currentTimestamp = Math.floor(Date.now() / 1000)
  const privilegeExpireTimestamp = currentTimestamp + expireTimeInSeconds

  const uidNum = isNaN(Number(uid)) ? 0 : Number(uid)

  const token = RtcTokenBuilder.buildTokenWithUid(
    appID,
    appCertificate,
    channelName as string,
    uidNum,
    agoraRole,
    privilegeExpireTimestamp
  )

  return res.status(200).json({ token })
})

// 🌐 Export the Express app
export const api = functions.https.onRequest(app)

export const cleanupExpiredActiveChats = functionsV1.pubsub
  .schedule("every 5 minutes")
  .timeZone("Asia/Kolkata") // Optional: match your time zone
  .onRun(async () => {
    const db = admin.firestore()
    const now = new Date()

    try {
      const snapshot = await db
        .collection("activeChats")
        .where("expiresAt", "<=", now)
        .get()

      if (snapshot.empty) {
        console.log("✅ No expired activeChats found.")
        return null
      }

      console.log(`🧹 Found ${snapshot.docs.length} expired activeChats. Deleting...`)

      const deletions = snapshot.docs.map((doc) => {
        console.log(`🗑️ Deleting document: ${doc.id}`)
        return doc.ref.delete()
      })

      await Promise.all(deletions)
      console.log("✅ Cleanup completed.")
    } catch (error) {
      console.error("❌ Error cleaning up activeChats:", error)
    }

    return null
  })
  
