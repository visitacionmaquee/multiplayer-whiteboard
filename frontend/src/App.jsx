// frontend/src/App.jsx
import { useEffect, useState } from 'react';

function App() {
  const [serverMessage, setServerMessage] = useState('Connecting to backend...');

  useEffect(() => {
    // We will change this URL to your live Render URL after deployment
    fetch('https://multiplayer-whiteboard-jh3d.onrender.com/api/ping')
      .then(response => response.json())
      .then(data => setServerMessage(data.message))
      .catch(error => setServerMessage('Backend connection failed.'));
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Multiplayer Whiteboard</h1>
      <p>Status: {serverMessage}</p>
    </div>
  );
}

export default App;