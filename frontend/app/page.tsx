"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  async function handleConnect() {
    if (isConnected) return;

    try {
      // Get ephemeral token from backend
      const tokenResponse = await fetch("http://localhost:8000/api/session", {
        method: "POST",
      });
      const data = await tokenResponse.json();
      const EPHEMERAL_KEY = data.value;

      console.log("Got ephemeral key:", EPHEMERAL_KEY);

      // Create a peer connection (WebRTC)
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      // Set up to play remote audio from the model
      const audioElement = document.createElement("audio");
      audioElement.autoplay = true;
      audioElementRef.current = audioElement;
      pc.ontrack = (e) => {
        console.log("Received audio track from OpenAI");
        audioElement.srcObject = e.streams[0];
      };

      // Add local audio track for microphone input
      const ms = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      pc.addTrack(ms.getTracks()[0]);

      // Set up data channel for sending and receiving events
      const dc = pc.createDataChannel("oai-events");
      dataChannelRef.current = dc;

      dc.addEventListener("open", () => {
        console.log("Data channel opened");
        setIsConnected(true);
      });

      dc.addEventListener("message", (e) => {
        const event = JSON.parse(e.data);
        console.log("Received event:", event);
        
        // Debug response.done to see why no audio
        if (event.type === "response.done") {
          console.log("RESPONSE.DONE details:", JSON.stringify(event.response, null, 2));
        }
      });

      dc.addEventListener("close", () => {
        console.log("Data channel closed");
        setIsConnected(false);
      });

      // Start the session using the Session Description Protocol (SDP)
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      console.log("Sending SDP to OpenAI...");
      const sdpResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp",
        },
      });

      if (!sdpResponse.ok) {
        throw new Error(`Failed to connect: ${await sdpResponse.text()}`);
      }

      const answer = {
        type: "answer" as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      await pc.setRemoteDescription(answer);

      console.log("Connected to OpenAI Realtime API via WebRTC!");
    } catch (error) {
      console.error("Connection error:", error);
      setIsConnected(false);
    }
  }

  function handleDisconnect() {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null;
    }
    setIsConnected(false);
    console.log("Disconnected from voice assistant");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <div className="relative">
        <div
          onClick={handleConnect}
          className="flex h-64 w-64 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
        >
          <video
            className="h-56 w-56 rounded-full object-cover"
            src="/icon.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
        </div>
        
        {/* Disconnect button - appears with smooth animation when connected */}
        <button
          onClick={handleDisconnect}
          className={`
            absolute top-2 right-2
            flex items-center justify-center
            w-14 h-14 rounded-full
            bg-black/80 hover:bg-black
            text-white
            transition-all duration-300 ease-in-out
            ${isConnected 
              ? 'opacity-100 scale-100 pointer-events-auto' 
              : 'opacity-0 scale-75 pointer-events-none'
            }
          `}
          aria-label="Disconnect"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </main>
  );
}
