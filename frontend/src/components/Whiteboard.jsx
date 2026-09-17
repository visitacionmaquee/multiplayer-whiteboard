// frontend/src/components/Whiteboard.jsx
import { useEffect, useRef } from 'react';
import * as fabric from 'fabric';

const Whiteboard = () => {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);

  useEffect(() => {
    // Initialize the Fabric canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true, // This enables freehand drawing out of the box!
      width: window.innerWidth,
      height: window.innerHeight - 80, // Leave some room for a header
      backgroundColor: '#ffffff'
    });

    // Customize the initial brush
    canvas.freeDrawingBrush.color = '#000000';
    canvas.freeDrawingBrush.width = 5;

    // Save the canvas instance to a ref so we can access it later
    fabricRef.current = canvas;

    // Handle window resizing dynamically
    const handleResize = () => {
      canvas.setWidth(window.innerWidth);
      canvas.setHeight(window.innerHeight - 80);
      canvas.renderAll();
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup function when the component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, []);

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      <div style={{ padding: '1rem', backgroundColor: '#1f2937', color: '#fff' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Board Workspace</h2>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
        <div style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;