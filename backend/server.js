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

// Login Route
app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      
      // Check if mongoose is connected
      if (mongoose.connection.readyState !== 1) {
        return res.status(500).json({ error: 'Database is still connecting. Please try again in a moment.' });
      }
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use.' });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      const newUser = new User({ name, email, password: hashedPassword });
      await newUser.save();
  
      res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) {
      // THIS WILL PRINT THE EXACT ERROR IN YOUR RENDER/LOCAL TERMINAL
      console.error('DETAILED REGISTRATION ERROR:', err);
      res.status(500).json({ error: err.message || 'Server error during registration.' });
    }
  });

// Ping route for status bar
app.get('/api/ping', (req, res) => {
  res.json({ message: 'Backend is live and connected!' });
});

// Real-time WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('canvas-data', (pathData) => {
    socket.broadcast.emit('canvas-data', { pathData, senderId: socket.id });
  });

  socket.on('clear-canvas', () => {
    socket.broadcast.emit('clear-canvas');
  });

  socket.on('cursor-move', (cursorData) => {
    socket.broadcast.emit('cursor-move', { ...cursorData, id: socket.id });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    socket.broadcast.emit('user-disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});