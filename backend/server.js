// backend/server.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

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

app.get('/api/ping', (req, res) => {
  res.json({ message: 'Backend is live and connected!' });
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // UPDATED: Attach the sender's ID so clients know whose temporary lines to delete
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
  console.log(`WebSocket Server running on port ${PORT}`);
});