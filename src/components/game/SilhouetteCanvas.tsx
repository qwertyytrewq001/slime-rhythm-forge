import { useEffect, useRef } from 'react';

interface SilhouetteCanvasProps {
  spritePath: string;
  size: number;
  slimeName: string;
  onSpriteError?: () => void;
}

export function SilhouetteCanvas({ spritePath, size, slimeName, onSpriteError }: SilhouetteCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = size;
    canvas.height = size;

    // Load and render silhouette
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Handle CORS if needed
    
    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, size, size);
      
      // Calculate scaling to fit image in canvas
      const scale = Math.min(size / img.width, size / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const x = (size - scaledWidth) / 2;
      const y = (size - scaledHeight) / 2;
      
      // Save context state
      ctx.save();
      
      // Draw the image
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      
      // Get image data and create true silhouette
      const imageData = ctx.getImageData(0, 0, size, size);
      const data = imageData.data;
      
      // Convert to solid black silhouette
      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3]; // Alpha channel
        if (alpha > 0) {
          // Make non-transparent pixels solid black
          data[i] = 0;     // Red
          data[i + 1] = 0; // Green  
          data[i + 2] = 0; // Blue
          data[i + 3] = Math.min(alpha, 204); // Max opacity of 0.8 (204/255)
        }
      }
      
      // Put the modified image data back
      ctx.putImageData(imageData, 0, 0);
      
      // Restore context state
      ctx.restore();
    };
    
    img.onerror = () => {
      console.warn(`Failed to load sprite for silhouette: ${spritePath}`);
      // Call error callback if provided
      if (onSpriteError) {
        onSpriteError();
      }
      // Draw fallback silhouette
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(size * 0.2, size * 0.2, size * 0.6, size * 0.6);
    };
    
    img.src = spritePath;
  }, [spritePath, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: size,
        height: size,
        imageRendering: 'auto'
      }}
    />
  );
}
