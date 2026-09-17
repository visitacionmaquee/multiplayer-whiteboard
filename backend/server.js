// backend/server.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Define allowed origins for both Express and Socket.io
const allowedOrigins = [
  'https://multiplayer-whiteboard-flame.vercel.app', 
  /https:\/\/multiplayer-whiteboard.*\.vercel\.app/,
  'http://localhost:5173' // Allows local testing!
];

app.use(cors({ origin: allowedOrigins }));

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

// Standard HTTP route for our status bar
app.get('/api/ping', (req, res) => {
  res.json({ message: 'Backend is live and connected!' });
});

// Real-time WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // When this user draws, broadcast the data to everyone ELSE
  socket.on('canvas-data', (data) => {
    socket.broadcast.emit('canvas-data', data);
  });

  // When this user clears the board, tell everyone else to clear theirs
  socket.on('clear-canvas', () => {
    socket.broadcast.emit('clear-canvas');
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;

// IMPORTANT: We use server.listen() here instead of app.listen()
server.listen(PORT, () => {
  console.log(`WebSocket Server running on port ${PORT}`);
});