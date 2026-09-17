// frontend/src/components/Whiteboard.jsx
import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';

const Whiteboard = () => {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  
  // State for our drawing tools
  const [color, setColor] = useState('#000000');
  const [brushWidth, setBrushWidth] = useState(5);

  // 1. Initialize Canvas (Runs once)
  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      width: window.innerWidth,
      height: window.innerHeight - 100, // Adjusted for header + toolbar
      backgroundColor: '#ffffff'
    });

    fabricRef.current = canvas;

    const handleResize = () => {
      canvas.setWidth(window.innerWidth);
      canvas.setHeight(window.innerHeight - 100);
      canvas.renderAll();
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, []);

  // 2. Update Brush Settings when state changes
  useEffect(() => {
    if (fabricRef.current && fabricRef.current.freeDrawingBrush) {
      fabricRef.current.freeDrawingBrush.color = color;
      fabricRef.current.freeDrawingBrush.width = parseInt(brushWidth, 10);
    }
  }, [color, brushWidth]);

  // 3. Clear Canvas Function
  const clearCanvas = () => {
    if (fabricRef.current) {
      fabricRef.current.clear();
      fabricRef.current.backgroundColor = '#ffffff';
      fabricRef.current.renderAll();
    }
  };

  return (
    <div style={{ backgroundColor: '#e5e7eb', height: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Toolbar */}
      <div style={{ 
        padding: '10px 20px', 
        backgroundColor: '#ffffff', 
        display: 'flex', 
        gap: '20px', 
        alignItems: 'center',
        borderBottom: '1px solid #d1d5db'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="colorPicker" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Color:</label>
          <input 
            type="color" 
            id="colorPicker" 
            value={color} 
            onChange={(e) => setColor(e.target.value)} 
            style={{ cursor: 'pointer' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="brushWidth" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Brush Size: {brushWidth}px</label>
          <input 
            type="range" 
            id="brushWidth" 
            min="1" 
            max="50" 
            value={brushWidth} 
            onChange={(e) => setBrushWidth(e.target.value)} 
            style={{ cursor: 'pointer' }}
          />
        </div>

        <button 
          onClick={clearCanvas}
          style={{ 
            marginLeft: 'auto', 
            padding: '6px 12px', 
            backgroundColor: '#ef4444', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Clear Board
        </button>
      </div>

      {/* Canvas Container */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, padding: '10px' }}>
        <div style={{ boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
          <canvas ref={canvasRef} />
        </div>
      </div>
      
    </div>
  );
};

export default Whiteboard;