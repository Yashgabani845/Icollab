const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store connected clients
const clients = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Store the new client
    clients.set(socket.id, socket);

    // Inform all other clients about the new user
    socket.broadcast.emit('user-joined', { 
        userId: socket.id, 
        userCount: clients.size 
    });

    // Handle offer signaling
    socket.on('offer', (data) => {
        console.log('Offer received from:', socket.id, 'to:', data.to);
        const targetSocket = clients.get(data.to);
        if (targetSocket) {
            targetSocket.emit('offer', {
                offer: data.offer,
                from: socket.id
            });
        }
    });

    // Handle answer signaling
    socket.on('answer', (data) => {
        console.log('Answer received from:', socket.id, 'to:', data.to);
        const targetSocket = clients.get(data.to);
        if (targetSocket) {
            targetSocket.emit('answer', {
                answer: data.answer,
                from: socket.id
            });
        }
    });

    // Handle ICE candidate exchange
    socket.on('candidate', (data) => {
        console.log('Candidate received from:', socket.id, 'to:', data.to);
        const targetSocket = clients.get(data.to);
        if (targetSocket) {
            targetSocket.emit('candidate', {
                candidate: data.candidate,
                from: socket.id
            });
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        clients.delete(socket.id);
        
        // Inform remaining clients about user leaving
        socket.broadcast.emit('user-left', { 
            userId: socket.id, 
            userCount: clients.size 
        });
    });

    // Get current list of connected users
    socket.on('get-users', () => {
        const userList = Array.from(clients.keys()).filter(id => id !== socket.id);
        socket.emit('user-list', userList);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});