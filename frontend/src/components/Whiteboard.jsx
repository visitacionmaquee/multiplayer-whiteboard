// frontend/src/components/Whiteboard.jsx
import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { io } from 'socket.io-client';

// Automatically connect to localhost in dev, or Render in production
const BACKEND_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:3001' 
  : 'https://multiplayer-whiteboard-jh3d.onrender.com';

const socket = io(BACKEND_URL);

const Whiteboard = () => {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  
  const [color, setColor] = useState('#000000');
  const [brushWidth, setBrushWidth] = useState(5);

  // 1. Initialize Canvas and Socket Listeners
  useEffect(() => {
    if (fabricRef.current) return;

    // FIX: Set a fixed, massive resolution for the canvas
    const CANVAS_WIDTH = 3000;
    const CANVAS_HEIGHT = 2000;

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

    canvas.on('path:created', (e) => {
      const pathData = e.path.toObject();
      socket.emit('canvas-data', pathData);
    });

    socket.on('canvas-data', (data) => {
      fabric.Path.fromObject(data).then((path) => {
        canvas.add(path);
        canvas.renderAll();
      });
    });

    socket.on('clear-canvas', () => {
      canvas.clear();
      canvas.backgroundColor = '#ffffff';
      canvas.renderAll();
    });

    // We no longer need the window resize listener because the canvas size is fixed!
    return () => {
      socket.off('canvas-data');
      socket.off('clear-canvas');
      canvas.dispose();
      fabricRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Update Brush Settings
  useEffect(() => {
    if (fabricRef.current && fabricRef.current.freeDrawingBrush) {
      fabricRef.current.freeDrawingBrush.color = color;
      fabricRef.current.freeDrawingBrush.width = parseInt(brushWidth, 10);
    }
  }, [color, brushWidth]);

  // 3. Clear Canvas Function (Updated to emit to others)
  const clearCanvas = () => {
    if (fabricRef.current) {
      fabricRef.current.clear();
      fabricRef.current.backgroundColor = '#ffffff';
      fabricRef.current.renderAll();
      
      // Tell everyone else to clear their boards too!
      socket.emit('clear-canvas'); 
    }
  };

  return (
    <div style={{ backgroundColor: '#e5e7eb', height: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* ... (Keep the Toolbar exactly the same) ... */}

      {/* FIX: Add overflow: 'auto' to make the massive canvas scrollable on small screens */}
      <div style={{ flex: 1, padding: '10px', overflow: 'auto' }}>
        <div style={{ 
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
            width: '3000px', 
            height: '2000px' 
        }}>
          <canvas ref={canvasRef} />
        </div>
      </div>
      
    </div>
  );
};

export default Whiteboard;