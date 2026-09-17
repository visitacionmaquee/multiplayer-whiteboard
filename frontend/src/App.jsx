// frontend/src/App.jsx
import { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import Whiteboard from './components/Whiteboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard'; // 1. Import the Dashboard

const BACKEND_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:3001' 
  : 'https://multiplayer-whiteboard-jh3d.onrender.com';

// Protected Route wrapper to check if user has a token
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Whiteboard Wrapper with Dynamic Room ID
const WhiteboardLayout = ({ serverMessage }) => {
  const navigate = useNavigate();
  const { roomId } = useParams(); // 2. Extract roomId from the URL
  const userName = localStorage.getItem('userName') || 'User';

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', margin: 0, padding: 0, overflow: 'hidden' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* 3. Replaced Logout with a Back to Dashboard button */}
          <button 
            onClick={() => navigate('/dashboard')}
            style={{ 
              padding: '4px 10px', 
              backgroundColor: '#4b5563', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            ← Dashboard
          </button>
          <h1 style={{ margin: 0, fontSize: '1.2rem', whiteSpace: 'nowrap' }}>Room: {roomId}</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Hello, {userName}</span>
          <span style={{ 
            fontSize: '0.85rem', 
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: serverMessage === 'Connected' ? '#10b981' : '#ef4444' 
          }}>
            {serverMessage}
          </span>
        </div>
      </div>
      
      <div style={{ flex: 1, position: 'relative' }}>
        {/* 4. Pass the roomId down to the Whiteboard component */}
        <Whiteboard roomId={roomId} />
      </div>
    </div>
  );
};

function App() {
  const [serverMessage, setServerMessage] = useState('Connecting...');

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/ping`)
      .then(response => response.json())
      .then(data => setServerMessage('Connected'))
      .catch(error => setServerMessage('Disconnected'));
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* 5. Add the new Dashboard Route */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* 6. Update Board Route with :roomId parameter */}
        <Route path="/board/:roomId" element={
          <ProtectedRoute>
            <WhiteboardLayout serverMessage={serverMessage} />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;