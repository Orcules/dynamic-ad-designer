
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
  
  // Return the canvas data URL with high quality, but without any metadata
  return canvas.toDataURL('image/jpeg', 0.95);
};

// Clean image URLs by removing any metadata
export const cleanImageUrl = (url: string): string => {
  if (!url) return url;
  
  // If the URL is a data URL with metadata
  if (url.startsWith('data:') && url.includes('#metadata=')) {
    return url.split('#metadata=')[0];
  }
  
  // If the URL is a regular URL with metadata
  if (url.includes('#metadata=')) {
    return url.split('#metadata=')[0];
  }
  
  return url;
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

// Add function to account for scale factor in positioning
export const adjustPositionForScale = (position: { x: number, y: number }, scaleFactor: number = 1): { x: number, y: number } => {
  if (scaleFactor === 1) return position;
  
  return {
    x: position.x * scaleFactor,
    y: position.y * scaleFactor
  };
};

// Check if an image URL contains metadata
export const hasImageMetadata = (url: string): boolean => {
  return url.includes('#metadata=');
};

// Extract metadata from image URL
export const extractImageMetadata = (url: string): any | null => {
  if (!hasImageMetadata(url)) return null;
  
  try {
    const metadataPart = url.split('#metadata=')[1];
    if (metadataPart) {
      const decodedMetadata = atob(metadataPart);
      return JSON.parse(decodedMetadata);
    }
  } catch (error) {
    console.warn('Failed to parse image metadata:', error);
  }
  
  return null;
};
