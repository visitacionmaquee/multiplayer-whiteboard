// frontend/src/components/Whiteboard.jsx
import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:3001' 
  : 'https://multiplayer-whiteboard-jh3d.onrender.com';

const socket = io(BACKEND_URL);

// Accept roomId as a prop from the Dashboard/App router
const Whiteboard = ({ roomId }) => {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  
  const activeStreamsRef = useRef({});
  const isDrawingRef = useRef(false);

  const [color, setColor] = useState('#000000');
  const [brushWidth, setBrushWidth] = useState(5);
  const [cursors, setCursors] = useState({});

  useEffect(() => {
    if (fabricRef.current) return;

    // Join the specific room as soon as the component loads
    if (roomId) {
      socket.emit('join-room', roomId);
    }

    const CANVAS_WIDTH = 2000;
    const CANVAS_HEIGHT = 1500;

    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: '#ffffff'
    });

    const brush = new fabric.PencilBrush(canvas);
    brush.color = color;
    brush.width = parseInt(brushWidth, 10);
    canvas.freeDrawingBrush = brush;

    fabricRef.current = canvas;

    // --- LOCAL DRAWING TRACKERS ---
    canvas.on('mouse:down', () => { isDrawingRef.current = true; });
    canvas.on('mouse:up', () => { isDrawingRef.current = false; });

    canvas.on('mouse:move', (options) => {
      // FIX: Fabric.js v6 uses options.scenePoint instead of canvas.getPointer()
      const pointer = options.scenePoint || options.pointer || { x: 0, y: 0 };
      
      socket.emit('cursor-move', { 
        roomId, // Attach the room ID
        x: pointer.x, 
        y: pointer.y, 
        color: color,
        width: brushWidth,
        isDrawing: isDrawingRef.current 
      });
    });

    canvas.on('path:created', (e) => {
      const pathData = e.path.toObject();
      socket.emit('canvas-data', { roomId, pathData }); // Attach the room ID
    });

    // --- REMOTE DRAWING RECEIVERS ---
    socket.on('cursor-move', (data) => {
      const { id, x, y, color: remoteColor, width: remoteWidth, isDrawing } = data;

      setCursors((prevCursors) => {
        const prevCursor = prevCursors[id];

        if (isDrawing && prevCursor && prevCursor.isDrawing) {
          const line = new fabric.Line([prevCursor.x, prevCursor.y, x, y], {
            stroke: remoteColor,
            strokeWidth: parseInt(remoteWidth, 10),
            strokeLineCap: 'round',
            strokeLineJoin: 'round',
            selectable: false,
            evented: false
          });
          
          canvas.add(line);

          if (!activeStreamsRef.current[id]) {
            activeStreamsRef.current[id] = [];
          }
          activeStreamsRef.current[id].push(line);
        }

        return {
          ...prevCursors,
          [id]: { x, y, color: remoteColor, isDrawing }
        };
      });
    });

    socket.on('canvas-data', (payload) => {
      const pathObject = payload.pathData ? payload.pathData : payload;
      const senderId = payload.senderId || 'unknown';
      
      if (!pathObject) return;

      fabric.Path.fromObject(pathObject).then((path) => {
        canvas.add(path);

        if (activeStreamsRef.current[senderId]) {
          activeStreamsRef.current[senderId].forEach(line => canvas.remove(line));
          delete activeStreamsRef.current[senderId];
        }
        
        canvas.renderAll();
      }).catch(err => console.error("Fabric render error:", err));
    });

    socket.on('clear-canvas', () => {
      canvas.clear();
      canvas.backgroundColor = '#ffffff';
      activeStreamsRef.current = {}; 
      canvas.renderAll();
    });

    socket.on('user-disconnected', (id) => {
      setCursors((prevCursors) => {
        const updatedCursors = { ...prevCursors };
        delete updatedCursors[id];
        return updatedCursors;
      });

      if (activeStreamsRef.current[id]) {
        activeStreamsRef.current[id].forEach(line => canvas.remove(line));
        delete activeStreamsRef.current[id];
        canvas.renderAll();
      }
    });

    return () => {
      socket.off('canvas-data');
      socket.off('clear-canvas');
      socket.off('cursor-move');
      socket.off('user-disconnected');
      canvas.dispose();
      fabricRef.current = null;
    };
    // Re-run effect if roomId changes so we join the new room
  }, [roomId]); 

  useEffect(() => {
    if (fabricRef.current && fabricRef.current.freeDrawingBrush) {
      fabricRef.current.freeDrawingBrush.color = color;
      fabricRef.current.freeDrawingBrush.width = parseInt(brushWidth, 10);
    }
  }, [color, brushWidth]);

  const clearCanvas = () => {
    if (fabricRef.current) {
      fabricRef.current.clear();
      fabricRef.current.backgroundColor = '#ffffff';
      fabricRef.current.renderAll();
      socket.emit('clear-canvas', roomId); // Attach the room ID
    }
  };

  return (
    <div style={{ backgroundColor: '#e5e7eb', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Responsive Toolbar */}
      <div style={{ 
        padding: '10px 15px', 
        backgroundColor: '#ffffff', 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '15px', 
        alignItems: 'center',
        borderBottom: '1px solid #d1d5db',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label htmlFor="colorPicker" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Color:</label>
            <input 
              type="color" 
              id="colorPicker" 
              value={color} 
              onChange={(e) => setColor(e.target.value)} 
              style={{ cursor: 'pointer', padding: 0, border: 'none', width: '30px', height: '30px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label htmlFor="brushWidth" style={{ fontSize: '0.9rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Size: {brushWidth}px</label>
            <input 
              type="range" 
              id="brushWidth" 
              min="1" 
              max="50" 
              value={brushWidth} 
              onChange={(e) => setBrushWidth(e.target.value)} 
              style={{ cursor: 'pointer', width: '100px' }}
            />
          </div>
        </div>

        <button 
          onClick={clearCanvas}
          style={{ 
            padding: '6px 12px', 
            backgroundColor: '#ef4444', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            whiteSpace: 'nowrap'
          }}
        >
          Clear Board
        </button>
      </div>

      {/* Viewport Wrapper */}
      <div style={{ flex: 1, padding: '10px', overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ 
            width: '2000px', 
            height: '1500px',
            backgroundColor: '#ffffff',
            border: '1px solid #ccc',
            position: 'relative' 
        }}>
          
          {/* ISOLATED FABRIC CONTAINER: React will leave this alone */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <canvas ref={canvasRef} />
          </div>

          {/* ISOLATED REACT CURSOR CONTAINER: Fabric will leave this alone */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 50 }}>
            {Object.entries(cursors).map(([id, cursor]) => (
              <div
                key={id}
                style={{
                  position: 'absolute',
                  left: cursor.x,
                  top: cursor.y,
                  transform: 'translate(-4px, -4px)',
                  transition: 'left 0.03s linear, top 0.03s linear'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill={cursor.color} stroke="#ffffff" strokeWidth="2">
                  <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                </svg>
              </div>
            ))}
          </div>

        </div>
      </div>
      
    </div>
  );
};

export default Whiteboard;