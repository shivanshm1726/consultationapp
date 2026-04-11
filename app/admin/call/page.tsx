"use client"

import { useEffect, useRef, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Users, Clock, ArrowLeft, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import axios from "axios"

const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID!
const tokenBaseURL = "http://localhost:5001/api/calls/get-token";
const CALLS_API = "http://localhost:5001/api/calls";

const AdminCallPage = () => {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const channelName = searchParams.get("roomId")
  const callType = searchParams.get("type") || "video"
  const callId = searchParams.get("callId")
  const router = useRouter()

  const localVideoRef = useRef<HTMLDivElement>(null)
  const remoteVideoRef = useRef<HTMLDivElement>(null)
  const clientRef = useRef<any>(null)
  const localTracksRef = useRef<any>(null)
  const callStartTimeRef = useRef<Date | null>(null)

  const [AgoraRTC, setAgoraRTC] = useState<any>(null)
  const [joined, setJoined] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [remoteUsers, setRemoteUsers] = useState<any[]>([])
  const [mutedAudio, setMutedAudio] = useState(false)
  const [mutedVideo, setMutedVideo] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState("Ready to connect")
  const [callData, setCallData] = useState<any>(null)

  const fetchCallStatus = async () => {
    if (!callId) return
    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
      const token = tokenMatch ? tokenMatch[1] : null;

      const response = await axios.get(`${CALLS_API}/${callId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCallData(response.data)
      if (response.data.status === 'ended') {
        leaveCall()
      }
    } catch (err) {
      console.error("Error fetching call status:", err)
    }
  }

  useEffect(() => {
    if (!callId) return
    fetchCallStatus()
    const interval = setInterval(fetchCallStatus, 3000)
    return () => clearInterval(interval)
  }, [callId])

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

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (joined && callStartTimeRef.current) {
      interval = setInterval(() => {
        const now = new Date()
        const duration = Math.floor((now.getTime() - callStartTimeRef.current!.getTime()) / 1000)
        setCallDuration(duration)
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
      const uid = user.email
      let token = null

      try {
        if (tokenBaseURL) {
          const res = await fetch(`${tokenBaseURL}?channelName=${channelName}&uid=${uid}&role=doctor`)
          if (res.ok) {
            const data = await res.json()
            token = data?.token || null
          }
        }
      } catch (tokenError) {
        console.warn("Token generation failed")
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

      await client.join(appId, channelName, token, uid)

      if (callType === "video") {
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks()
        localTracksRef.current = [audioTrack, videoTrack]
        videoTrack.play(localVideoRef.current!)
        await client.publish([audioTrack, videoTrack])
      } else {
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack()
        localTracksRef.current = [audioTrack]
        await client.publish([audioTrack])
      }

      setJoined(true)
      callStartTimeRef.current = new Date()
      setConnectionStatus("Connected")

      if (callId) {
        const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
        const authToken = tokenMatch ? tokenMatch[1] : null;

        await axios.put(`${CALLS_API}/${callId}`, {
          status: "connected",
        }, {
          headers: { Authorization: `Bearer ${authToken}` }
        })
      }
    } catch (error) {
      console.error("Failed to join call:", error)
      setConnectionStatus("Connection failed")
      alert("Failed to join call.")
    } finally {
      setConnecting(false)
    }
  }

  const leaveCall = async () => {
    if (clientRef.current && localTracksRef.current) {
      localTracksRef.current.forEach((track: any) => track.close())
      await clientRef.current.leave()

      if (callId) {
        try {
          const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
          const authToken = tokenMatch ? tokenMatch[1] : null;

          await axios.put(`${CALLS_API}/${callId}`, { status: "ended" }, {
            headers: { Authorization: `Bearer ${authToken}` }
          });
        } catch (error) {
          console.error("Error updating call status:", error)
        }
      }

      setJoined(false)
      setCallDuration(0)
      setConnectionStatus("Call ended")

      setTimeout(() => {
        router.push("/admin/calls")
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
    if (callType === "audio") return
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
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/calls")}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Calls
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                {callType === "video" ? <Video className="h-5 w-5 text-white" /> : <Phone className="h-5 w-5 text-white" />}
              </div>
              <div>
                <h2 className="font-semibold">{callData?.patientName || "Patient"}</h2>
                <p className="text-sm text-gray-300">Doctor Session</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className={connectionStatus === "Connected" ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"}>
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
          <div className="h-full flex flex-col">
            <div className="flex-1 grid lg:grid-cols-2 gap-6 mb-6">
              <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-300">You (Doctor)</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div ref={localVideoRef} className="bg-gray-800 rounded-lg w-full h-64 lg:h-96 flex items-center justify-center relative overflow-hidden" />
                </CardContent>
              </Card>
              <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-300">{callData?.patientName || "Patient"}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div ref={remoteVideoRef} className="bg-gray-800 rounded-lg w-full h-64 lg:h-96 flex items-center justify-center" />
                </CardContent>
              </Card>
            </div>
            <div className="flex justify-center">
              <div className="flex items-center space-x-4 bg-black/40 p-4 rounded-lg">
                {!joined ? (
                  <Button onClick={joinCall} disabled={connecting} className="bg-green-600 hover:bg-green-700 text-white px-8">Join Video Call</Button>
                ) : (
                  <>
                    <Button variant={mutedAudio ? "destructive" : "secondary"} onClick={toggleAudio}>{mutedAudio ? <MicOff /> : <Mic />}</Button>
                    <Button variant={mutedVideo ? "destructive" : "secondary"} onClick={toggleVideo}>{mutedVideo ? <VideoOff /> : <Video />}</Button>
                    <Button variant="destructive" onClick={leaveCall}>End Call</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm w-full max-w-md p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-2">{callData?.patientName || "Patient"}</h2>
              <p className="text-gray-400 mb-6 font-mono">{formatDuration(callDuration)}</p>
              <div className="flex justify-center space-x-4">
                {!joined ? (
                  <Button onClick={joinCall} disabled={connecting} className="bg-green-600 hover:bg-green-700 text-white">Join Audio Call</Button>
                ) : (
                  <>
                    <Button variant={mutedAudio ? "destructive" : "secondary"} onClick={toggleAudio}>{mutedAudio ? <MicOff /> : <Mic />}</Button>
                    <Button variant="destructive" onClick={leaveCall}>End Call</Button>
                  </>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCallPage
