// backend/server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);

// Middleware to parse JSON bodies
app.use(express.json());

const allowedOrigins = [
  'https://multiplayer-whiteboard-flame.vercel.app', 
  /https:\/\/multiplayer-whiteboard.*\.vercel\.app/,
  'http://localhost:5173'
];

app.use(cors({ origin: allowedOrigins }));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

// --- CONNECT TO MONGODB ATLAS ---
const MONGO_URI = process.env.MONGODB_URI;

mongoose.connect(MONGO_URI, { dbName: 'whiteboard_db' })
  .then(() => console.log('Connected to MongoDB Atlas successfully!'))
  .catch((err) => console.error('MongoDB connection error:', err));

// --- AUTH API ROUTES ---

// Register Route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists in MongoDB
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use.' });
    }

    // Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user to MongoDB
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Check if mongoose is connected
      if (mongoose.connection.readyState !== 1) {
        return res.status(500).json({ error: 'Database is still connecting. Please try again in a moment.' });
      }
  
      // 1. Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: 'Invalid email or password.' });
      }
  
      // 2. Compare provided password with hashed password in DB
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid email or password.' });
      }
  
      // 3. Generate a JWT token
      // Make sure to add JWT_SECRET to your .env file
      const token = jwt.sign(
        { userId: user._id }, 
        process.env.JWT_SECRET || 'fallback_secret_key', 
        { expiresIn: '1d' }
      );
  
      // 4. Send token and user data to the client
      res.status(200).json({ 
        message: 'Logged in successfully!',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
  
    } catch (err) {
      console.error('DETAILED LOGIN ERROR:', err);
      res.status(500).json({ error: err.message || 'Server error during login.' });
    }
  });

// Ping route for status bar
app.get('/api/ping', (req, res) => {
  res.json({ message: 'Backend is live and connected!' });
});

// Real-time WebSocket connection handling
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
  
    // 1. User joins a specific whiteboard room
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room: ${roomId}`);
    });
  
    // 2. Broadcast drawing data ONLY to users in that specific room
    socket.on('canvas-data', (data) => {
      // Expecting data to look like { roomId, pathData, senderId }
      socket.to(data.roomId).emit('canvas-data', { pathData: data.pathData, senderId: socket.id });
    });
  
    // 3. Clear canvas ONLY for the specific room
    socket.on('clear-canvas', (roomId) => {
      socket.to(roomId).emit('clear-canvas');
    });
  
    // 4. Broadcast cursor movements ONLY to the specific room
    socket.on('cursor-move', (data) => {
      // Expecting data to look like { roomId, x, y, userName }
      socket.to(data.roomId).emit('cursor-move', { ...data, id: socket.id });
    });
  
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      // Socket.io automatically handles removing the user from all rooms they were in
      socket.broadcast.emit('user-disconnected', socket.id);
    });
  });

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});