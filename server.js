// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const cors = require('cors');

// const app = express();
// app.use(cors());

// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"]
//   }
// });

// io.on('connection', (socket) => {
//     console.log('User connected:', socket.id);

//     socket.on('offer', (offer) => {
//         console.log('Offer received from:', socket.id);
//         socket.broadcast.emit('offer', offer);
//     });

//     socket.on('answer', (answer) => {
//         console.log('Answer received from:', socket.id);
//         socket.broadcast.emit('answer', answer);
//     });

//     socket.on('candidate', (candidate) => {
//         console.log('Candidate received from:', socket.id);
//         socket.broadcast.emit('candidate', candidate);
//     });
// });

// const PORT = process.env.PORT || 3001;
// server.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const emailToSocketMap = new Map();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('register-email', (email) => {
    emailToSocketMap.set(email, socket.id);
    console.log(`Registered email: ${email} with socket ID: ${socket.id}`);
  });

  socket.on('initiate-call', ({ toEmail, offer }) => {
    const targetSocketId = emailToSocketMap.get(toEmail);
    if (targetSocketId) {
      io.to(targetSocketId).emit('incoming-call', { from: socket.id, offer });
    } else {
      socket.emit('user-not-found', { email: toEmail });
    }
  });

  socket.on('accept-call', ({ to, answer }) => {
    console.log(`Call accepted by ${socket.id}, sending to ${to}`);
    socket.to(to).emit('call-accepted', answer);
  });

  socket.on('candidate', ({ to, candidate }) => {
    if (to) {
      console.log(`ICE candidate from ${socket.id} to ${to}`);
      socket.to(to).emit('candidate', candidate);
    }
  });

  socket.on('end-call', ({ to }) => {
    console.log(`Call ended by ${socket.id}`);
    socket.to(to).emit('call-ended');
  });

  socket.on('disconnect', () => {
    for (const [email, id] of emailToSocketMap.entries()) {
      if (id === socket.id) {
        emailToSocketMap.delete(email);
        console.log(`User with email ${email} disconnected`);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});