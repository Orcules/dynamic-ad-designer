
export const applyImageEffect = async (
  canvas: HTMLCanvasElement,
  effect: 'sepia' | 'none' | 'grayscale' | 'highres'
): Promise<string> => {
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return canvas.toDataURL('image/jpeg', 0.95);
  }
  
  // Preserve original dimensions
  const originalWidth = canvas.width;
  const originalHeight = canvas.height;
  
  if (effect === 'sepia') {
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
  } else if (effect === 'grayscale') {
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Apply grayscale effect
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Convert to grayscale using luminance formula
      const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
    
    // Put the grayscale data back
    ctx.putImageData(imageData, 0, 0);
  } else if (effect === 'highres') {
    // Create a larger canvas for high resolution output
    const highResCanvas = document.createElement('canvas');
    const scale = 3; // Scale factor for higher resolution
    
    highResCanvas.width = originalWidth * scale;
    highResCanvas.height = originalHeight * scale;
    
    const highResCtx = highResCanvas.getContext('2d');
    
    if (highResCtx) {
      // Disable image smoothing for sharper scaling
      highResCtx.imageSmoothingEnabled = false;
      if ('imageSmoothingQuality' in highResCtx) {
        // @ts-ignore: Property exists but TypeScript doesn't recognize it
        highResCtx.imageSmoothingQuality = 'high';
      }
      
      // Draw the original canvas onto the high-res canvas
      highResCtx.drawImage(
        canvas, 
        0, 0, originalWidth, originalHeight,
        0, 0, highResCanvas.width, highResCanvas.height
      );
      
      // Return the high-res canvas data URL
      return highResCanvas.toDataURL('image/png', 1.0);
    }
  }
  
  // Return the canvas data URL with appropriate quality
  return effect === 'highres' 
    ? canvas.toDataURL('image/png', 1.0) 
    : canvas.toDataURL('image/jpeg', 0.95);
};

// Add a new function to ensure page flip and navigation elements are included in the capture
export const ensureElementsVisible = (container: HTMLElement): void => {
  // Find all page flip elements and make sure they're visible
  const pageFlips = container.querySelectorAll('.page-flip');
  pageFlips.forEach(flip => {
    const element = flip as HTMLElement;
    element.style.opacity = '1';
    element.style.visibility = 'visible';
    element.style.zIndex = '10';
  });
  
  // Ensure navigation arrows are visible during capture
  const navigationButtons = container.querySelectorAll('.absolute.inset-0.flex.items-center.justify-between button, .px-4.items-center.justify-between button');
  navigationButtons.forEach(button => {
    const element = button as HTMLElement;
    element.style.opacity = '1';
    element.style.visibility = 'visible';
    element.style.zIndex = '20';
    element.style.pointerEvents = 'none'; // Ensure they don't interfere with capture
  });
  
  // Ensure pagination dots are visible
  const paginationDots = container.querySelectorAll('.absolute.bottom-4.left-1\\/2.-translate-x-1\\/2.flex.gap-2');
  paginationDots.forEach(dots => {
    const element = dots as HTMLElement;
    element.style.opacity = '1';
    element.style.visibility = 'visible';
    element.style.zIndex = '20';
  });
  
  // Special handling for hidden elements during generation
  // Make them temporarily visible for the screenshot but preserve their hidden state
  const hiddenElements = container.querySelectorAll('[data-hidden="true"]');
  hiddenElements.forEach(hiddenEl => {
    const element = hiddenEl as HTMLElement;
    element.dataset.wasHidden = 'true';
    element.style.opacity = '1';
    element.style.visibility = 'visible';
    element.style.display = 'block';
  });
}

// Function to prevent image stretching by setting proper canvas dimensions
export const createProportionalCanvas = (
  element: HTMLElement, 
  options: { width?: number; height?: number; scale?: number } = {}
): HTMLCanvasElement => {
  // Get element dimensions
  const rect = element.getBoundingClientRect();
  
  // Create canvas with proper dimensions
  const canvas = document.createElement('canvas');
  
  // Determine scale factor (use devicePixelRatio if not specified)
  const scale = options.scale || window.devicePixelRatio || 2;
  
  // Set canvas dimensions based on options or element size, applying scale
  canvas.width = (options.width || rect.width) * scale;
  canvas.height = (options.height || rect.height) * scale;
  
  // Get canvas context and apply settings for better quality
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Scale everything by the scale factor
    ctx.scale(scale, scale);
    
    // Set high quality image rendering
    ctx.imageSmoothingEnabled = true;
    if ('imageSmoothingQuality' in ctx) {
      // @ts-ignore: Property exists but TypeScript doesn't recognize it
      ctx.imageSmoothingQuality = 'high';
    }
  }
  
  return canvas;
}

// Enhance the quality of canvas rendering by applying optimal settings
export const optimizeCanvasRendering = (canvas: HTMLCanvasElement): void => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Enable image smoothing for better quality
  ctx.imageSmoothingEnabled = true;
  
  // Set highest quality if available
  if ('imageSmoothingQuality' in ctx) {
    // @ts-ignore: Property exists but TypeScript doesn't recognize it
    ctx.imageSmoothingQuality = 'high';
  }
  
  // Ensure proper pixel scaling for high-DPI displays
  const dpr = window.devicePixelRatio || 1;
  if (dpr > 1) {
    const originalWidth = canvas.width;
    const originalHeight = canvas.height;
    
    // Adjust canvas for device pixel ratio
    canvas.width = originalWidth * dpr;
    canvas.height = originalHeight * dpr;
    
    // Scale back down using CSS
    canvas.style.width = `${originalWidth}px`;
    canvas.style.height = `${originalHeight}px`;
    
    // Scale context to match
    ctx.scale(dpr, dpr);
  }
}
