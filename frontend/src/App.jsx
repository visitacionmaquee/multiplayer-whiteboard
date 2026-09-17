// frontend/src/App.jsx
import { useEffect, useState } from 'react';
import Whiteboard from './components/Whiteboard';

function App() {
  const [serverMessage, setServerMessage] = useState('Connecting to backend...');

  useEffect(() => {
    fetch('https://multiplayer-whiteboard-jh3d.onrender.com/api/ping')
      .then(response => response.json())
      .then(data => setServerMessage(data.message))
      .catch(error => setServerMessage('Backend connection failed.'));
  }, []);

  return (
    <div style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
      {/* Top Navigation Bar */}
      <div style={{ 
        padding: '0.5rem 1rem', 
        backgroundColor: '#1f2937', 
        color: 'white', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        height: '40px'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.2rem' }}>Multiplayer Whiteboard</h1>
        <span style={{ 
          fontSize: '0.85rem', 
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: serverMessage.includes('failed') ? '#ef4444' : '#10b981' 
        }}>
          {serverMessage}
        </span>
      </div>
      
      {/* The Canvas Component */}
      <Whiteboard />
    </div>
  );
}

export default App;