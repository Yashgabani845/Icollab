import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const VideoCall = () => {
  const [userId, setUserId] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const [isInCall, setIsInCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [currentCallId, setCurrentCallId] = useState(null);

  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }
    ]
  };

  useEffect(() => {
    socketRef.current = io('http://localhost:3001', {
      transports: ['websocket'],
      forceNew: true
    });

    socketRef.current.on('connect', () => {
      console.log('Connected with ID:', socketRef.current.id);
      setUserId(socketRef.current.id);
    });

    socketRef.current.on('incoming-call', async ({ from, offer }) => {
      console.log('Received call from:', from);
      setIncomingCall({ from, offer });
      setCurrentCallId(from);
    });

    socketRef.current.on('call-accepted', async (answer) => {
      console.log('Call accepted, setting remote description');
      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (error) {
        console.error('Error setting remote description:', error);
      }
    });

    socketRef.current.on('candidate', async (candidate) => {
      console.log('Received ICE candidate');
      try {
        if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    });

    socketRef.current.on('call-ended', () => {
      cleanupCall();
    });

    return () => {
      cleanupCall();
      socketRef.current?.disconnect();
    };
  }, []);

  const createPeerConnection = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    const pc = new RTCPeerConnection(iceServers);
    peerConnectionRef.current = pc;

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate to:', currentCallId);
        socketRef.current.emit('candidate', {
          to: currentCallId,
          candidate: event.candidate
        });
      }
    };

    // Handle incoming tracks
    pc.ontrack = (event) => {
      console.log('Received remote track');
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE Connection State:', pc.iceConnectionState);
    };

    return pc;
  };

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Cannot access camera or microphone');
    }
  };

  const initiateCall = async () => {
    if (!targetUserId.trim()) {
      alert('Please enter a user ID to call');
      return;
    }

    try {
      setCurrentCallId(targetUserId);
      setIsInCall(true);
      
      const stream = await startLocalStream();
      const pc = createPeerConnection();

      // Add local tracks to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Create and send offer
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await pc.setLocalDescription(offer);

      console.log('Sending call offer to:', targetUserId);
      socketRef.current.emit('initiate-call', {
        to: targetUserId,
        offer: pc.localDescription
      });
    } catch (error) {
      console.error('Error initiating call:', error);
      cleanupCall();
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;

    try {
      setIsInCall(true);
      const stream = await startLocalStream();
      const pc = createPeerConnection();

      // Add local tracks
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Set remote description (offer)
      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));

      // Create and send answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      console.log('Sending answer to:', incomingCall.from);
      socketRef.current.emit('accept-call', {
        to: incomingCall.from,
        answer: pc.localDescription
      });

      setIncomingCall(null);
    } catch (error) {
      console.error('Error accepting call:', error);
      cleanupCall();
    }
  };

  const cleanupCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    setLocalStream(null);
    setIsInCall(false);
    setIncomingCall(null);
    setCurrentCallId(null);
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  };

  const endCall = () => {
    socketRef.current.emit('end-call', { to: currentCallId });
    cleanupCall();
  };

  return (
    <div className="flex flex-col items-center p-6 max-w-4xl mx-auto">
      <div className="w-full mb-6">
        <h2 className="text-xl mb-2">Your ID: {userId}</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            placeholder="Enter user ID to call"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={initiateCall}
            disabled={isInCall}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            Call
          </button>
        </div>
      </div>

      {incomingCall && (
        <div className="fixed top-4 right-4 bg-white p-4 rounded shadow-lg border">
          <p>Incoming call from: {incomingCall.from}</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={acceptCall}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Accept
            </button>
            <button
              onClick={() => setIncomingCall(null)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {isInCall && (
        <div className="w-full grid grid-cols-2 gap-4">
          <div className="relative">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-64 bg-black rounded"
            />
            <p className="absolute top-2 left-2 text-white bg-black/50 px-2 rounded">Local</p>
          </div>
          <div className="relative">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-64 bg-black rounded"
            />
            <p className="absolute top-2 left-2 text-white bg-black/50 px-2 rounded">Remote</p>
          </div>
          <button
            onClick={endCall}
            className="col-span-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            End Call
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoCall;