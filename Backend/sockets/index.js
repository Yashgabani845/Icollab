const { Server } = require('socket.io');
const Workspace = require('../models/WorkSpace');
const User = require('../models/User');

const emailToSocketMap = new Map();
const socketToEmailMap = new Map();

function setupSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Register Email for WebRTC Signaling
    socket.on('register-email', (email) => {
      for (const [oldEmail, id] of emailToSocketMap.entries()) {
        if (id === socket.id && oldEmail !== email) {
          emailToSocketMap.delete(oldEmail);
        }
      }
      emailToSocketMap.set(email, socket.id);
      socketToEmailMap.set(socket.id, email);
      console.log(`Registered email: ${email} with socket ID: ${socket.id}`);
      console.log('Current emailToSocketMap:', Array.from(emailToSocketMap.entries()));
    });

    // WebRTC: Initiate Call (by email)
    socket.on('initiate-call', ({ toEmail, offer }) => {
      const targetSocketId = emailToSocketMap.get(toEmail);
      const fromEmail = socketToEmailMap.get(socket.id);
      if (targetSocketId) {
        io.to(targetSocketId).emit('incoming-call', {
          from: fromEmail,
          offer
        });
      } else {
        socket.emit('user-not-found', { email: toEmail });
      }
    });

    // WebRTC: Accept Call (by email)
    socket.on('accept-call', ({ to, answer }) => {
      const targetSocketId = emailToSocketMap.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit('call-accepted', answer);
      }
    });

    // WebRTC: ICE Candidate (by email)
    socket.on('candidate', ({ to, candidate }) => {
      const targetSocketId = emailToSocketMap.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit('candidate', candidate);
      }
    });

    // WebRTC: End Call (by email)
    socket.on('end-call', ({ to }) => {
      const targetSocketId = emailToSocketMap.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit('call-ended');
      }
    });

    // Chat: Join/Leave Room
    socket.on('joinChannel', ({ channelId, workspaceName }) => {
      const roomName = `${workspaceName}-${channelId}`;
      socket.join(roomName);
      console.log(`User joined room: ${roomName}`);
    });
    socket.on('leaveChannel', ({ channelId, workspaceName }) => {
      const roomName = `${workspaceName}-${channelId}`;
      socket.leave(roomName);
      console.log(`User left room: ${roomName}`);
    });

    // Chat: Send Message
    socket.on('sendMessage', async ({ channelId, workspaceName, message }) => {
      try {
        const { senderId, content, senderName } = message;
        const roomName = `${workspaceName}-${channelId}`;
        const workspace = await Workspace.findOne({ name: workspaceName });
        if (!workspace) return socket.emit('error', { message: "Workspace not found" });
        const channel = workspace.chat.channels.id(channelId);
        if (!channel) return socket.emit('error', { message: "Channel not found" });
        const user = await User.findOne({ email: senderId });
        if (!user) return socket.emit('error', { message: "User not found" });
        const newMessage = {
          sender: user._id,
          content,
          timestamp: new Date(),
        };
        channel.messages.push(newMessage);
        await workspace.save();
        const updatedWorkspace = await Workspace.findOne({ name: workspaceName })
          .populate({
            path: 'chat.channels.messages.sender',
            select: 'name email _id'
          });
        const updatedChannel = updatedWorkspace.chat.channels.id(channelId);
        const populatedMessage = updatedChannel.messages[updatedChannel.messages.length - 1];
        io.to(roomName).emit('newMessage', populatedMessage);
      } catch (error) {
        console.error("Error sending message via socket:", error);
        socket.emit('error', { message: "Failed to send message" });
      }
    });

    // Chat: Typing Indicator
    socket.on('typing', ({ channelId, workspaceName, userId, isTyping }) => {
      const roomName = `${workspaceName}-${channelId}`;
      socket.to(roomName).emit('userTyping', { userId, isTyping });
    });

    // Handle Disconnect
    socket.on('disconnect', () => {
      const email = socketToEmailMap.get(socket.id);
      if (email) {
        emailToSocketMap.delete(email);
        socketToEmailMap.delete(socket.id);
        console.log(`User with email ${email} disconnected`);
        console.log('Current emailToSocketMap:', Array.from(emailToSocketMap.entries()));
      } else {
        console.log('Client disconnected');
      }
    });
  });
}

module.exports = { setupSocket };