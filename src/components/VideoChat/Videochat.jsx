import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const VideoChat = () => {
    const socketRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const [localStream, setLocalStream] = useState(null);

    // Comprehensive STUN/TURN servers
    const iceServers = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { 
                urls: 'turn:openrelay.metered.ca:80', 
                username: 'openrelayproject', 
                credential: 'openrelayproject' 
            }
        ]
    };

    // Comprehensive logging function
    const debugLog = (message, ...args) => {
        console.log(`[WebRTC Debug] ${message}`, ...args);
    };

    // Create peer connection with extensive error handling
    const createPeerConnection = () => {
        // Close existing connection
        if (peerConnectionRef.current) {
            debugLog('Closing existing peer connection');
            peerConnectionRef.current.close();
        }

        const pc = new RTCPeerConnection(iceServers);
        peerConnectionRef.current = pc;

        // Track connection states
        pc.onconnectionstatechange = () => {
            debugLog('Connection State:', pc.connectionState);
        };

        pc.oniceconnectionstatechange = () => {
            debugLog('ICE Connection State:', pc.iceConnectionState);
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                debugLog('Local ICE Candidate:', event.candidate);
                socketRef.current.emit('candidate', event.candidate);
            } else {
                debugLog('All local candidates gathered');
            }
        };

        // Handle incoming tracks
        pc.ontrack = (event) => {
            debugLog('Remote Track Received:', event.track);
            debugLog('Remote Streams:', event.streams);

            if (event.streams && event.streams.length > 0) {
                const remoteStream = event.streams[0];
                debugLog('Setting Remote Stream to Video Element');
                
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                    remoteVideoRef.current.play().catch(error => {
                        debugLog('Error playing remote video:', error);
                    });
                }
            }
        };

        return pc;
    };

    // Initialize Socket Connection
    useEffect(() => {
        const socket = io('http://localhost:3000', { 
            transports: ['websocket'],
            forceNew: true 
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            debugLog('Socket Connected with ID:', socket.id);
        });

        socket.on('offer', async (offer) => {
            debugLog('Received Offer:', JSON.stringify(offer));
            try {
                const pc = createPeerConnection();
                
                // Add local tracks to peer connection before setting remote description
                if (localStream) {
                    localStream.getTracks().forEach(track => {
                        debugLog('Adding Local Track to Peer Connection:', track.kind);
                        pc.addTrack(track, localStream);
                    });
                }

                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                
                debugLog('Sending Answer:', JSON.stringify(answer));
                socket.emit('answer', pc.localDescription);
            } catch (error) {
                debugLog('Error Handling Offer:', error);
            }
        });

        socket.on('answer', async (answer) => {
            debugLog('Received Answer:', JSON.stringify(answer));
            try {
                if (peerConnectionRef.current) {
                    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
                }
            } catch (error) {
                debugLog('Error Setting Remote Description:', error);
            }
        });

        socket.on('candidate', async (candidate) => {
            debugLog('Received ICE Candidate:', JSON.stringify(candidate));
            try {
                if (peerConnectionRef.current) {
                    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                }
            } catch (error) {
                debugLog('Error Adding ICE Candidate:', error);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [localStream]);

    // Start Video Call
    const startCall = async () => {
        try {
            debugLog('Requesting User Media');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    width: { ideal: 640 }, 
                    height: { ideal: 480 } 
                },
                audio: true
            });

            debugLog('Local Stream Acquired');
            setLocalStream(stream);

            // Set local video
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
                localVideoRef.current.play().catch(error => {
                    debugLog('Error playing local video:', error);
                });
            }

            // Create peer connection and send offer
            const pc = createPeerConnection();
            
            // Add local tracks to peer connection
            stream.getTracks().forEach(track => {
                debugLog('Adding Local Track:', track.kind);
                pc.addTrack(track, stream);
            });

            const offer = await pc.createOffer({
                offerToReceiveVideo: true,
                offerToReceiveAudio: true
            });

            await pc.setLocalDescription(offer);
            
            debugLog('Sending Offer:', JSON.stringify(offer));
            socketRef.current.emit('offer', pc.localDescription);
        } catch (error) {
            debugLog('Error Starting Call:', error);
        }
    };

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            padding: '20px' 
        }}>
            <h1>WebRTC Video Chat</h1>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                width: '100%', 
                maxWidth: '1000px' 
            }}>
                <div style={{ width: '48%' }}>
                    <h3>Local Video</h3>
                    <video 
                        ref={localVideoRef} 
                        autoPlay 
                        muted 
                        style={{
                            width: '100%', 
                            backgroundColor: 'black',
                            borderRadius: '10px'
                        }}
                    />
                </div>
                <div style={{ width: '48%' }}>
                    <h3>Remote Video</h3>
                    <video 
                        ref={remoteVideoRef} 
                        autoPlay 
                        style={{
                            width: '100%', 
                            backgroundColor: 'black',
                            borderRadius: '10px'
                        }}
                    />
                </div>
            </div>
            <button 
                onClick={startCall} 
                style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    fontSize: '16px'
                }}
            >
                Start Call
            </button>
        </div>
    );
};

export default VideoChat;