// frontend/src/pages/Dashboard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'User';

  const handleCreateBoard = () => {
    // Generate a random 6-character string for the room ID
    const newRoomId = Math.random().toString(36).substring(2, 8);
    navigate(`/board/${newRoomId}`);
  };

  const handleJoinBoard = (e) => {
    e.preventDefault();
    if (roomCode.trim()) {
      navigate(`/board/${roomCode.trim()}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f3f4f6' }}>
      {/* Navbar */}
      <div style={{ padding: '1rem 2rem', backgroundColor: '#1f2937', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Doodle Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span>Welcome, {userName}</span>
          <button onClick={handleLogout} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
          
          {/* Create Board Card */}
          <div style={{ padding: '40px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '300px', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '15px', color: '#1f2937' }}>New Workspace</h2>
            <p style={{ color: '#4b5563', marginBottom: '25px', fontSize: '0.9rem' }}>Create a brand new private whiteboard and invite others.</p>
            <button onClick={handleCreateBoard} style={{ width: '100%', padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
              + Create New Board
            </button>
          </div>

          {/* Join Board Card */}
          <div style={{ padding: '40px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '300px', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '15px', color: '#1f2937' }}>Join Workspace</h2>
            <p style={{ color: '#4b5563', marginBottom: '25px', fontSize: '0.9rem' }}>Have a room code? Enter it below to join an existing board.</p>
            <form onSubmit={handleJoinBoard} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Enter Room Code (e.g. x7y9z)" 
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                required
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db', textAlign: 'center' }}
              />
              <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                Join Board
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;