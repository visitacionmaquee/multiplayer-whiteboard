// frontend/src/components/Whiteboard.jsx
import { useEffect, useRef } from 'react';
import * as fabric from 'fabric';

const Whiteboard = () => {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);

  useEffect(() => {
    // 1. Initialize the Fabric canvas with drawing mode enabled
    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      width: window.innerWidth,
      height: window.innerHeight - 40, // Account for the header height
      backgroundColor: '#ffffff'
    });

    // We removed the custom brush color/width settings here that were causing the crash!
    // Fabric will default to a standard black pencil brush.

    fabricRef.current = canvas;

    // 2. Handle window resizing dynamically
    const handleResize = () => {
      canvas.setWidth(window.innerWidth);
      canvas.setHeight(window.innerHeight - 40);
      canvas.renderAll();
    };
    
    window.addEventListener('resize', handleResize);

    // 3. Cleanup function when the component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, []);

  return (
    <div style={{ backgroundColor: '#e5e7eb', height: 'calc(100vh - 40px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default Whiteboard;