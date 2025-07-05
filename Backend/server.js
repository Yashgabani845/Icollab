require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const { setupSocket } = require('./sockets');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskListRoutes = require('./routes/taskListRoutes');
const taskRoutes = require('./routes/taskRoutes');
const channelRoutes = require('./routes/channelRoutes');
const messageRoutes = require('./routes/messageRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
connectDB();

app.use(cors({ origin: ['https://icollab-eta.vercel.app', "http://localhost:3000"], credentials: true }));
app.use(express.json());

// API ROUTES
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', workspaceRoutes);
app.use('/api', projectRoutes);
app.use('/api', taskListRoutes);
app.use('/api', taskRoutes);
app.use('/api', channelRoutes);
app.use('/api', messageRoutes);

app.get('/', (req, res) => res.send('MongoDB Atlas Connection Successful!'));
app.use(errorHandler);

// SOCKET.IO
setupSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));