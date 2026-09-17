// frontend/src/App.jsx
import { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Whiteboard from './components/Whiteboard';
import Login from './pages/Login';
import Register from './pages/Register';

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

// Whiteboard Wrapper with Logout Button
const WhiteboardLayout = ({ serverMessage }) => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    navigate('/login');
  };

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
          <h1 style={{ margin: 0, fontSize: '1.2rem', whiteSpace: 'nowrap' }}>Multiplayer Board</h1>
          <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Hello, {userName}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ 
            fontSize: '0.85rem', 
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: serverMessage === 'Connected' ? '#10b981' : '#ef4444' 
          }}>
            {serverMessage}
          </span>
          
          <button 
            onClick={handleLogout}
            style={{
              padding: '4px 10px',
              backgroundColor: '#374151',
              color: 'white',
              border: '1px solid #4b5563',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 'bold'
            }}
          >
            Logout
          </button>
        </div>
      </div>
      
      <div style={{ flex: 1, position: 'relative' }}>
        <Whiteboard />
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
        {/* Root path is now the Login page */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Whiteboard Workspace */}
        <Route path="/board" element={
          <ProtectedRoute>
            <WhiteboardLayout serverMessage={serverMessage} />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;