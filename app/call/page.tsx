"use client"

import { useEffect, useRef, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuthState } from "react-firebase-hooks/auth"
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Users, Clock, ArrowLeft, Loader2 } from "lucide-react"
import { auth } from "@/lib/firebase"

const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID!
const tokenBaseURL = process.env.NEXT_PUBLIC_TOKEN_BASE_URL!
const doctorEmail = process.env.NEXT_PUBLIC_DOCTOR_EMAIL!

const CallPage = () => {
  const [user] = useAuthState(auth)
  const defaultRole = user?.email === doctorEmail ? "doctor" : "patient"

  const searchParams = useSearchParams()
  const channelName = searchParams.get("channel")
  const callType = searchParams.get("type") || "video" // audio or video
  const router = useRouter()

  const localVideoRef = useRef<HTMLDivElement>(null)
  const remoteVideoRef = useRef<HTMLDivElement>(null)

  const clientRef = useRef<any>(null)
  const localTracksRef = useRef<any>(null)

  const [AgoraRTC, setAgoraRTC] = useState<any>(null)
  const [joined, setJoined] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [remoteUsers, setRemoteUsers] = useState<any[]>([])
  const [mutedAudio, setMutedAudio] = useState(false)
  const [mutedVideo, setMutedVideo] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState("Ready to connect")

  // Add this after the state declarations
  useEffect(() => {
    console.log("Environment check:")
    console.log("AGORA_APP_ID:", appId ? "✓ Set" : "✗ Missing")
    console.log("TOKEN_BASE_URL:", tokenBaseURL ? "✓ Set" : "✗ Missing")
    console.log("DOCTOR_EMAIL:", doctorEmail ? "✓ Set" : "✗ Missing")
  }, [])

  // Load AgoraRTC dynamically on client only
  useEffect(() => {
    ;(async () => {
      try {
        const rtc = await import("agora-rtc-sdk-ng")
        setAgoraRTC(rtc)
        setConnectionStatus("Ready to connect")
      } catch (error) {
        console.error("Failed to load Agora SDK:", error)
        setConnectionStatus("Failed to load video SDK")
      }
    })()
  }, [])

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (joined) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [joined])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }







  const joinCall = async () => {
    if (!channelName || !user || !AgoraRTC) return

    setConnecting(true)
    setConnectionStatus("Joining call...")

    try {
      const uid = user.email || String(Math.floor(Math.random() * 100000))
      let token = null

     try {
  if (tokenBaseURL) {
    const res = await fetch(`${tokenBaseURL}?channelName=${channelName}&uid=${uid}&role=${defaultRole}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.token) {
        token = data.token;
      } else {
        console.warn("Token not found in response:", data);
      }
    } else {
      console.error("Token fetch failed with status:", res.status);
    }
  } else {
    console.warn("tokenBaseURL not configured, using null token for testing");
  }
} catch (tokenError) {
  console.error("Token generation failed:", tokenError);
  console.warn("Using null token for testing - this may not work in production");
}

      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
      clientRef.current = client

      client.on("user-published", async (remoteUser: any, mediaType: any) => {
        await client.subscribe(remoteUser, mediaType)
        if (mediaType === "video" && callType === "video") {
          remoteVideoRef.current && remoteUser.videoTrack?.play(remoteVideoRef.current)
        }
        if (mediaType === "audio") {
          remoteUser.audioTrack?.play()
        }
        setRemoteUsers((prev) => {
          const existing = prev.find((u) => u.uid === remoteUser.uid)
          if (existing) return prev
          return [...prev, remoteUser]
        })
        setConnectionStatus("Connected")
      })

      client.on("user-unpublished", (remoteUser: any) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== remoteUser.uid))
      })

      client.on("connection-state-change", (curState: string) => {
        setConnectionStatus(curState === "CONNECTED" ? "Connected" : "Connecting...")
      })

      // Join with token (null token works for testing but not production)
      await client.join(appId, channelName, token, uid)

      // Create tracks based on call type
      if (callType === "video") {
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks()
        localTracksRef.current = [audioTrack, videoTrack]

        videoTrack.play(localVideoRef.current!)
        await client.publish([audioTrack, videoTrack])
      } else {
        // Audio only
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack()
        localTracksRef.current = [audioTrack]
        await client.publish([audioTrack])
      }

      setJoined(true)
      setConnectionStatus("Connected")
    } catch (error) {
      console.error("Failed to join call:", error)
      setConnectionStatus("Connection failed")

      // Show user-friendly error message
      const err = error as Error;
      alert(
        `Failed to join call: ${err.message || "Unknown error"}. Please check your internet connection and try again.`,
      )
    } finally {
      setConnecting(false)
    }
  }

  const leaveCall = async () => {
    if (clientRef.current && localTracksRef.current) {
      localTracksRef.current.forEach((track: any) => track.close())
      await clientRef.current.leave()
      setJoined(false)
      setCallDuration(0)
      setConnectionStatus("Call ended")

      // Redirect back to chat after ending call
      setTimeout(() => {
        router.push("/chat")
      }, 1000)
    }
  }

  const toggleAudio = () => {
    const audioTrack = localTracksRef.current?.[0]
    if (audioTrack) {
      audioTrack.setEnabled(mutedAudio)
      setMutedAudio(!mutedAudio)
    }
  }

  const toggleVideo = () => {
    if (callType === "audio") return // No video in audio calls

    const videoTrack = localTracksRef.current?.[1]
    if (videoTrack) {
      videoTrack.setEnabled(mutedVideo)
      setMutedVideo(!mutedVideo)
    }
  }

  if (!user || !AgoraRTC) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading call interface...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      {/* Header with Doctor/Patient Info */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/chat")}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Chat
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                {callType === "video" ? (
                  <Video className="h-5 w-5 text-white" />
                ) : (
                  <Phone className="h-5 w-5 text-white" />
                )}
              </div>
              <div>
                <h2 className="font-semibold">
                  {callType === "video" ? "Video Call" : "Audio Call"} with Dr. Nitin Mishra
                </h2>
                <p className="text-sm text-gray-300">Dermatologist - MBBS, MD (Skin & VD)</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge
              variant="secondary"
              className={`${
                connectionStatus === "Connected"
                  ? "bg-green-500/20 text-green-300 border-green-500/30"
                  : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full mr-2 ${
                  connectionStatus === "Connected" ? "bg-green-400 animate-pulse" : "bg-yellow-400"
                }`}
              ></div>
              {connectionStatus}
            </Badge>
            {joined && (
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Clock className="h-4 w-4" />
                <span className="font-mono">{formatDuration(callDuration)}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 h-[calc(100vh-80px)]">
        {callType === "video" ? (
          // VIDEO CALL LAYOUT
          <div className="h-full flex flex-col">
            <div className="flex-1 grid lg:grid-cols-2 gap-6 mb-6">
              {/* Local Video */}
              <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-300 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    You ({defaultRole === "doctor" ? "Doctor" : "Patient"})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div
                    ref={localVideoRef}
                    className="bg-gray-800 rounded-lg w-full h-64 lg:h-96 flex items-center justify-center relative overflow-hidden"
                  >
                    {mutedVideo && (
                      <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                        <div className="text-center">
                          <VideoOff className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-400">Camera is off</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Remote Video */}
              <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-300 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {defaultRole === "doctor" ? "Patient" : "Dr. Nitin Mishra"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div
                    ref={remoteVideoRef}
                    className="bg-gray-800 rounded-lg w-full h-64 lg:h-96 flex items-center justify-center"
                  >
                    {remoteUsers.length === 0 && (
                      <div className="text-center">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400">
                          Waiting for {defaultRole === "doctor" ? "patient" : "doctor"} to join...
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* VIDEO CALL CONTROLS */}
            <div className="flex justify-center">
              <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    {!joined ? (
                      <Button
                        onClick={joinCall}
                        disabled={connecting}
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                        size="lg"
                      >
                        {connecting ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Joining...
                          </>
                        ) : (
                          <>
                            <Video className="h-5 w-5 mr-2" />
                            Join Video Call
                          </>
                        )}
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant={mutedAudio ? "destructive" : "secondary"}
                          onClick={toggleAudio}
                          className="p-3"
                          title={mutedAudio ? "Unmute" : "Mute"}
                        >
                          {mutedAudio ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                        </Button>
                        <Button
                          variant={mutedVideo ? "destructive" : "secondary"}
                          onClick={toggleVideo}
                          className="p-3"
                          title={mutedVideo ? "Turn Camera On" : "Turn Camera Off"}
                        >
                          {mutedVideo ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                        </Button>
                        <Button variant="destructive" onClick={leaveCall} className="px-6 py-3">
                          <PhoneOff className="h-5 w-5 mr-2" />
                          End Call
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // AUDIO CALL LAYOUT
          <div className="h-full flex items-center justify-center">
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm w-full max-w-md">
              <CardHeader className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-12 w-12 text-white" />
                </div>
                <CardTitle className="text-xl">
                  {defaultRole === "doctor" ? "Patient Call" : "Dr. Nitin Mishra"}
                </CardTitle>
                <p className="text-gray-400">Audio Call Session</p>
                {joined && (
                  <div className="flex items-center justify-center space-x-2 text-lg font-mono mt-2">
                    <Clock className="h-5 w-5" />
                    <span>{formatDuration(callDuration)}</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      connectionStatus === "Connected" ? "bg-green-500 animate-pulse" : "bg-yellow-500"
                    }`}
                  ></div>
                  <span>{connectionStatus}</span>
                </div>

                {/* AUDIO CALL CONTROLS */}
                <div className="flex justify-center space-x-4">
                  {!joined ? (
                    <Button
                      onClick={joinCall}
                      disabled={connecting}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                      size="lg"
                    >
                      {connecting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        <>
                          <Phone className="h-5 w-5 mr-2" />
                          Join Audio Call
                        </>
                      )}
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant={mutedAudio ? "destructive" : "secondary"}
                        onClick={toggleAudio}
                        className="p-4"
                        size="lg"
                        title={mutedAudio ? "Unmute" : "Mute"}
                      >
                        {mutedAudio ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                      </Button>
                      <Button variant="destructive" onClick={leaveCall} className="px-6 py-4" size="lg">
                        <PhoneOff className="h-6 w-6 mr-2" />
                        End Call
                      </Button>
                    </>
                  )}
                </div>

                {joined && (
                  <div className="text-sm text-gray-400">
                    <p>Connected participants: {remoteUsers.length + 1}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default CallPage