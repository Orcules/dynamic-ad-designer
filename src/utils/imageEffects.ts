export const applyImageEffect = async (
  canvas: HTMLCanvasElement,
  effect: 'sepia' | 'none' | 'highres' = 'none'
): Promise<string> => {
  const ctx = canvas.getContext('2d', { alpha: false });
  
  if (!ctx) {
    console.error('Failed to get canvas context');
    return canvas.toDataURL('image/jpeg', 0.95);
  }
  
  // Create a new optimized canvas to prevent stretching
  const optimizedCanvas = document.createElement('canvas');
  const optimizedCtx = optimizedCanvas.getContext('2d', { alpha: false });
  
  if (!optimizedCtx) {
    console.error('Failed to get optimized canvas context');
    return canvas.toDataURL('image/jpeg', 0.95);
  }
  
  // Set explicit dimensions to match original
  optimizedCanvas.width = canvas.width;
  optimizedCanvas.height = canvas.height;
  
  // Enable high-quality image rendering
  optimizedCtx.imageSmoothingEnabled = true;
  if ('imageSmoothingQuality' in optimizedCtx) {
    // @ts-ignore: Property exists but TypeScript doesn't recognize it
    optimizedCtx.imageSmoothingQuality = 'high';
  }
  
  // Draw the original canvas onto the optimized one with explicit dimensions
  optimizedCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
  
  if (effect === 'sepia') {
    // Get image data
    const imageData = optimizedCtx.getImageData(0, 0, optimizedCanvas.width, optimizedCanvas.height);
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
    optimizedCtx.putImageData(imageData, 0, 0);
  } else if (effect === 'highres') {
    // For high-resolution output, we keep the pixel data but improve JPEG quality
    // This effect doesn't modify pixels, just affects final output quality
  }
  
  // Return the optimized canvas data URL with high quality
  return optimizedCanvas.toDataURL('image/jpeg', effect === 'highres' ? 0.98 : 0.95);
};

// Add a new function to create a canvas with proper proportions
export const createProportionalCanvas = (
  sourceCanvas: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement => {
  // Create a new canvas with the target dimensions
  const newCanvas = document.createElement('canvas');
  newCanvas.width = targetWidth;
  newCanvas.height = targetHeight;
  
  const ctx = newCanvas.getContext('2d', { alpha: false });
  if (!ctx) {
    console.error('Failed to get context for proportional canvas');
    return sourceCanvas; // Return original if we can't create new one
  }
  
  // Set high quality rendering
  ctx.imageSmoothingEnabled = true;
  if ('imageSmoothingQuality' in ctx) {
    // @ts-ignore: Property exists but TypeScript doesn't recognize it
    ctx.imageSmoothingQuality = 'high';
  }
  
  // Calculate the scaling to maintain aspect ratio
  const sourceAspect = sourceCanvas.width / sourceCanvas.height;
  const targetAspect = targetWidth / targetHeight;
  
  let drawWidth = targetWidth;
  let drawHeight = targetHeight;
  let offsetX = 0;
  let offsetY = 0;
  
  // Adjust dimensions to maintain aspect ratio
  if (sourceAspect > targetAspect) {
    // Source is wider - scale to match height
    drawHeight = targetHeight;
    drawWidth = sourceAspect * drawHeight;
    offsetX = (targetWidth - drawWidth) / 2;
  } else {
    // Source is taller - scale to match width
    drawWidth = targetWidth;
    drawHeight = drawWidth / sourceAspect;
    offsetY = (targetHeight - drawHeight) / 2;
  }
  
  // Fill with background color (prevents transparency issues)
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  
  // Draw with calculated dimensions to maintain aspect ratio
  ctx.drawImage(
    sourceCanvas,
    0, 0, sourceCanvas.width, sourceCanvas.height,
    offsetX, offsetY, drawWidth, drawHeight
  );
  
  return newCanvas;
};

// Optimize canvas rendering settings for better quality
export const optimizeCanvasRendering = (ctx: CanvasRenderingContext2D): void => {
  // Enable high-quality image rendering
  ctx.imageSmoothingEnabled = true;
  if ('imageSmoothingQuality' in ctx) {
    // @ts-ignore: Property exists but TypeScript doesn't recognize it
    ctx.imageSmoothingQuality = 'high';
  }
  
  // Set composition mode for better text rendering
  ctx.globalCompositeOperation = 'source-over';
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
}

// Fix RTL text rendering in canvas
export const fixRTLTextRendering = (container: HTMLElement): void => {
  // Find all text elements that might need RTL support
  const rtlElements = container.querySelectorAll('[dir="rtl"], [lang="he"], [lang="ar"]');
  
  rtlElements.forEach(element => {
    const el = element as HTMLElement;
    // Ensure proper text alignment and direction
    el.style.textAlign = 'right';
    el.style.direction = 'rtl';
    el.style.unicodeBidi = 'embed';
    
    // For text inside canvas, we need special handling
    const textNodes = el.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, button');
    textNodes.forEach(node => {
      const textEl = node as HTMLElement;
      textEl.style.textAlign = 'right';
      textEl.style.direction = 'rtl';
      textEl.style.unicodeBidi = 'embed';
    });
  });
}
