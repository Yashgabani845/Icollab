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

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('offer', (offer) => {
        console.log('Offer received from:', socket.id);
        socket.broadcast.emit('offer', offer);
    });

    socket.on('answer', (answer) => {
        console.log('Answer received from:', socket.id);
        socket.broadcast.emit('answer', answer);
    });

    socket.on('candidate', (candidate) => {
        console.log('Candidate received from:', socket.id);
        socket.broadcast.emit('candidate', candidate);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});