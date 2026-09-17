// frontend/src/components/Whiteboard.jsx
import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:3001' 
  : 'https://multiplayer-whiteboard-jh3d.onrender.com';

const socket = io(BACKEND_URL);

const Whiteboard = () => {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  
  const [color, setColor] = useState('#000000');
  const [brushWidth, setBrushWidth] = useState(5);

  useEffect(() => {
    if (fabricRef.current) return;

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

    return () => {
      socket.off('canvas-data');
      socket.off('clear-canvas');
      canvas.dispose();
      fabricRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

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
      socket.emit('clear-canvas'); 
    }
  };

  return (
    // Height is 100% of the parent flex container
    <div style={{ backgroundColor: '#e5e7eb', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Responsive Toolbar */}
      <div style={{ 
        padding: '10px 15px', 
        backgroundColor: '#ffffff', 
        display: 'flex', 
        flexWrap: 'wrap', // Allows controls to drop to the next line on mobile
        gap: '15px', 
        alignItems: 'center',
        borderBottom: '1px solid #d1d5db',
        justifyContent: 'space-between'
      }}>
        
        {/* Controls Wrapper */}
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

      {/* Viewport Wrapper with Touch Scrolling */}
      <div style={{ 
        flex: 1, 
        padding: '10px', 
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch' // Enables smooth momentum scrolling on iOS/iPadOS
      }}>
        <div style={{ 
            width: '2000px', 
            height: '1500px',
            backgroundColor: '#ffffff',
            border: '1px solid #ccc'
        }}>
          <canvas ref={canvasRef} />
        </div>
      </div>
      
    </div>
  );
};

export default Whiteboard;