"use client"
import React, { useEffect, useRef, useState } from "react"
import AgoraRTC from "agora-rtc-sdk-ng"

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!
const BACKEND_API_URL = process.env.NEXT_PUBLIC_FUNCTIONS_URL || "https://us-central1-doctor-app-98244.cloudfunctions.net/api"

const VideoCall = ({ channelName, uid }: { channelName: string; uid: string }) => {
  const client = useRef(AgoraRTC.createClient({ mode: "rtc", codec: "vp8" }))
  const localVideoRef = useRef<HTMLDivElement>(null)
  const remoteVideoRef = useRef<HTMLDivElement>(null)
  const [joined, setJoined] = useState(false)

  useEffect(() => {
    const joinChannel = async () => {
      const res = await fetch(`${BACKEND_API_URL}/generate-agora-token?channelName=${channelName}&uid=${uid}&role=subscriber`)
      const { token } = await res.json()

      const localTrack = await AgoraRTC.createMicrophoneAndCameraTracks()

      await client.current.join(APP_ID, channelName, token, uid)

      await client.current.publish(localTrack)

      localTrack[1].play(localVideoRef.current!)
      client.current.on("user-published", async (user, mediaType) => {
        await client.current.subscribe(user, mediaType)
        if (mediaType === "video") {
          user.videoTrack?.play(remoteVideoRef.current!)
        }
      })

      setJoined(true)
    }

    joinChannel()

    return () => {
      client.current.leave()
      client.current.removeAllListeners()
    }
  }, [channelName, uid])

  return (
    <div className="flex gap-4">
      <div ref={localVideoRef} className="w-1/2 h-64 bg-black" />
      <div ref={remoteVideoRef} className="w-1/2 h-64 bg-gray-800" />
    </div>
  )
}

export default VideoCall
