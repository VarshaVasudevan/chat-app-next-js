const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Check if environment variables are loaded
console.log('=== Environment Check ===');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('PORT:', process.env.PORT || '5000');
console.log('=======================\n');

const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const Message = require('./models/Message');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);

// CORS configuration - Allow all origins for development
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// Socket.io with CORS - Allow all origins
const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// MongoDB Connection - using MONGO_URI from .env
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERROR: MONGO_URI is not defined in .env file');
  console.error('Please check your .env file');
  process.exit(1);
}

console.log('Attempting to connect to MongoDB Atlas...');

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected successfully to Atlas');
  console.log('Database: chat-app');
})
.catch(err => {
  console.error('MongoDB connection error:', err.message);
  console.error('\nTroubleshooting tips:');
  console.error('1. Check your internet connection');
  console.error('2. Verify your MongoDB Atlas credentials');
  console.error('3. Make sure IP address is whitelisted in Atlas');
  console.error('4. Check if cluster is active');
  process.exit(1);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!', timestamp: new Date() });
});

// Socket.io authentication middleware
io.use((socket, next) => {
  const userId = socket.handshake.auth.userId;
  if (!userId) {
    return next(new Error("Authentication required"));
  }
  socket.userId = userId;
  next();
});

// Connected users tracking
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);
  
  // Add user to online users
  onlineUsers.set(socket.userId, socket.id);
  
  // Update user status in database
  User.findByIdAndUpdate(socket.userId, { status: 'online', lastSeen: new Date() })
    .then(() => {
      // Broadcast online status to all users
      io.emit('userStatus', { userId: socket.userId, status: 'online' });
    })
    .catch(err => console.error('Error updating user status:', err));

  // Join user's personal room
  socket.join(socket.userId);

  // Handle sending messages
  socket.on('sendMessage', async (data) => {
    try {
      const message = new Message({
        sender: socket.userId,
        receiver: data.receiverId,
        content: data.content,
        type: data.type || 'text',
        timestamp: new Date()
      });

      await message.save();
      await message.populate('sender', 'username email avatar');
      await message.populate('receiver', 'username email avatar');

      // Send to receiver if online
      const receiverSocketId = onlineUsers.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', message);
      }
      
      // Send back to sender
      socket.emit('messageSent', message);
      
      // Store in conversation history
      socket.emit('messageDelivered', { messageId: message._id });
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const receiverSocketId = onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      socket.to(receiverSocketId).emit('userTyping', {
        userId: socket.userId,
        isTyping: data.isTyping
      });
    }
  });

  // Handle message read receipt
  socket.on('markAsRead', async (data) => {
    try {
      await Message.updateMany(
        { sender: data.senderId, receiver: socket.userId, read: false },
        { read: true }
      );
      
      const senderSocketId = onlineUsers.get(data.senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('messageRead', {
          readerId: socket.userId,
          senderId: data.senderId
        });
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
    onlineUsers.delete(socket.userId);
    
    // Update user status
    User.findByIdAndUpdate(socket.userId, { 
      status: 'offline', 
      lastSeen: new Date() 
    }).then(() => {
      io.emit('userStatus', { userId: socket.userId, status: 'offline' });
    }).catch(err => console.error('Error updating user status:', err));
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\nServer running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`CORS enabled for all origins (development mode)\n`);
});