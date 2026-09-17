// frontend/src/App.jsx
import { useEffect, useState } from 'react';
import Whiteboard from './components/Whiteboard';

const BACKEND_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:3001' 
  : 'https://multiplayer-whiteboard-jh3d.onrender.com';

function App() {
  const [serverMessage, setServerMessage] = useState('Connecting...');

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/ping`)
      .then(response => response.json())
      .then(data => setServerMessage('Connected'))
      .catch(error => setServerMessage('Disconnected'));
  }, []);

  return (
    // Locked to 100vh so the body never scrolls, only the canvas wrapper
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', margin: 0, padding: 0, overflow: 'hidden' }}>
      
      {/* Responsive Header */}
      <div style={{ 
        padding: '0.5rem 1rem', 
        backgroundColor: '#1f2937', 
        color: 'white', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.2rem', whiteSpace: 'nowrap' }}>Multiplayer Board</h1>
        <span style={{ 
          fontSize: '0.85rem', 
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: serverMessage === 'Connected' ? '#10b981' : '#ef4444' 
        }}>
          {serverMessage}
        </span>
      </div>
      
      {/* The Whiteboard takes up exactly the remaining height */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Whiteboard />
      </div>

    </div>
  );
}

export default App;