
export const applyImageEffect = async (
  canvas: HTMLCanvasElement,
  effect: 'sepia' | 'none'
): Promise<string> => {
  const ctx = canvas.getContext('2d');
  
  if (ctx && effect === 'sepia') {
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Apply sepia effect
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
      data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
      data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
    }
    
    // Put the sepia data back
    ctx.putImageData(imageData, 0, 0);
  }
  
  // Return the canvas data URL with high quality
  return canvas.toDataURL('image/jpeg', 0.95);
};
