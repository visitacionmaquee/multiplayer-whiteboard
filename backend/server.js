// backend/server.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Allow the frontend to communicate with the backend
app.use(cors({
    origin: [
      'https://multiplayer-whiteboard-flame.vercel.app',
      'https://multiplayer-whiteboard-git-main-maquee1.vercel.app'
    ]
  }));

app.get('/api/ping', (req, res) => {
  res.json({ message: 'Backend is live and connected!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});