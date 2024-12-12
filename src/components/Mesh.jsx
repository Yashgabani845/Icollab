import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const Mesh = () => {
    const socketRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideosRef = useRef({});
    const peerConnectionsRef = useRef({});
    const [localStream, setLocalStream] = useState(null);
    const [remoteUsers, setRemoteUsers] = useState([]);

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

    // Create peer connection for a specific user
    const createPeerConnection = (partnerId) => {
        // Close existing connection if exists
        if (peerConnectionsRef.current[partnerId]) {
            debugLog(`Closing existing peer connection with ${partnerId}`);
            peerConnectionsRef.current[partnerId].close();
        }

        const pc = new RTCPeerConnection(iceServers);
        peerConnectionsRef.current[partnerId] = pc;

        // Add local tracks to peer connection
        if (localStream) {
            localStream.getTracks().forEach(track => {
                debugLog(`Adding Local Track to ${partnerId}:`, track.kind);
                pc.addTrack(track, localStream);
            });
        }

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                debugLog(`Local ICE Candidate for ${partnerId}:`, event.candidate);
                socketRef.current.emit('candidate', {
                    to: partnerId,
                    candidate: event.candidate
                });
            }
        };

        // Handle incoming tracks
        pc.ontrack = (event) => {
            debugLog(`Remote Track Received from ${partnerId}:`, event.track);
            
            if (event.streams && event.streams.length > 0) {
                const remoteStream = event.streams[0];
                
                // Create or update video element for this remote user
                if (!remoteVideosRef.current[partnerId]) {
                    const videoElement = document.createElement('video');
                    videoElement.autoplay = true;
                    videoElement.style.width = '200px';
                    videoElement.style.margin = '10px';
                    document.getElementById('remote-videos').appendChild(videoElement);
                    remoteVideosRef.current[partnerId] = videoElement;
                }

                const videoElement = remoteVideosRef.current[partnerId];
                videoElement.srcObject = remoteStream;
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
            
            // Request list of current users
            socket.emit('get-users');
        });

        // Handle user joining
        socket.on('user-joined', (data) => {
            debugLog('New user joined:', data.userId);
            setRemoteUsers(prev => [...prev, data.userId]);
        });

        // Handle user leaving
        socket.on('user-left', (data) => {
            debugLog('User left:', data.userId);
            
            // Remove video element
            if (remoteVideosRef.current[data.userId]) {
                remoteVideosRef.current[data.userId].remove();
                delete remoteVideosRef.current[data.userId];
            }

            // Remove peer connection
            if (peerConnectionsRef.current[data.userId]) {
                peerConnectionsRef.current[data.userId].close();
                delete peerConnectionsRef.current[data.userId];
            }

            setRemoteUsers(prev => prev.filter(id => id !== data.userId));
        });

        // Handle receiving list of current users
        socket.on('user-list', async (users) => {
            debugLog('Current users:', users);
            
            // Establish connections with each user
            for (const userId of users) {
                await createMeshConnection(userId);
            }
        });

        // Handle incoming offers
        socket.on('offer', async (data) => {
            debugLog('Received Offer from:', data.from);
            try {
                const pc = createPeerConnection(data.from);
                await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                
                socket.emit('answer', {
                    to: data.from,
                    answer: pc.localDescription
                });
            } catch (error) {
                debugLog('Error Handling Offer:', error);
            }
        });

        // Handle incoming answers
        socket.on('answer', async (data) => {
            debugLog('Received Answer from:', data.from);
            try {
                const pc = peerConnectionsRef.current[data.from];
                if (pc) {
                    await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                }
            } catch (error) {
                debugLog('Error Setting Remote Description:', error);
            }
        });

        // Handle ICE candidates
        socket.on('candidate', async (data) => {
            debugLog('Received ICE Candidate from:', data.from);
            try {
                const pc = peerConnectionsRef.current[data.from];
                if (pc) {
                    await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                }
            } catch (error) {
                debugLog('Error Adding ICE Candidate:', error);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [localStream]);

    // Create mesh connection with a specific user
    const createMeshConnection = async (userId) => {
        try {
            const pc = createPeerConnection(userId);
            
            const offer = await pc.createOffer({
                offerToReceiveVideo: true,
                offerToReceiveAudio: true
            });

            await pc.setLocalDescription(offer);
            
            socketRef.current.emit('offer', {
                to: userId,
                offer: pc.localDescription
            });
        } catch (error) {
            debugLog('Error Creating Mesh Connection:', error);
        }
    };

    // Start Video Call
    const startCall = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    width: { ideal: 640 }, 
                    height: { ideal: 480 } 
                },
                audio: true
            });

            setLocalStream(stream);

            // Set local video
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
                localVideoRef.current.play().catch(error => {
                    debugLog('Error playing local video:', error);
                });
            }
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
            <h1>WebRTC Mesh Video Chat</h1>
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                width: '100%', 
                maxWidth: '1200px' 
            }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    marginBottom: '20px' 
                }}>
                    <div style={{ width: '300px', marginRight: '20px' }}>
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
                </div>
                
                <div 
                    id="remote-videos" 
                    style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        justifyContent: 'center' 
                    }}
                >
                    <h3 style={{ width: '100%', textAlign: 'center' }}>Remote Videos</h3>
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
        </div>
    );
};

export default Mesh;