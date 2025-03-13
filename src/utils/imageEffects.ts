
export const applyImageEffect = async (
  canvas: HTMLCanvasElement,
  effect: 'sepia' | 'none' | 'crop-to-cover'
): Promise<string> => {
  if (effect === 'crop-to-cover') {
    // Create a temporary canvas for cropping
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) {
      return canvas.toDataURL('image/jpeg', 0.95);
    }
    
    const width = canvas.width;
    const height = canvas.height;
    tempCanvas.width = width;
    tempCanvas.height = height;
    
    // Get the original image dimensions
    const imageWidth = canvas.width;
    const imageHeight = canvas.height;
    
    // Calculate dimensions that ensure the image covers the entire canvas
    const { width: dWidth, height: dHeight, x: dx, y: dy } = calculateCoverDimensions(
      imageWidth,
      imageHeight,
      width,
      height
    );
    
    // Draw the image centered and covering the entire canvas
    tempCtx.drawImage(
      canvas,
      0, 0, imageWidth, imageHeight, // Source rectangle (entire original image)
      dx, dy, dWidth, dHeight        // Destination rectangle (calculated for coverage)
    );
    
    return tempCanvas.toDataURL('image/jpeg', 0.95);
  }
  
  // Simply return the canvas data URL without any effects for other effect types
  return canvas.toDataURL('image/jpeg', 0.95);
};

// Helper function to ensure image covers container while maintaining aspect ratio
export const calculateCoverDimensions = (
  imageWidth: number,
  imageHeight: number,
  containerWidth: number,
  containerHeight: number,
  offsetX: number = 0,
  offsetY: number = 0
): { width: number; height: number; x: number; y: number } => {
  const imageAspect = imageWidth / imageHeight;
  const containerAspect = containerWidth / containerHeight;
  
  let width, height, x, y;
  
  // חישוב ראשוני של גודל התמונה לפי יחס הממדים
  if (imageAspect > containerAspect) {
    // התמונה רחבה יותר מהמסגרת (יחסית לגובה)
    // שינוי קנה המידה כך שהגובה יתאים לגובה המסגרת
    height = containerHeight;
    width = height * imageAspect;
    y = 0;
    x = (containerWidth - width) / 2;
  } else {
    // התמונה גבוהה יותר מהמסגרת (יחסית לרוחב)
    // שינוי קנה המידה כך שהרוחב יתאים לרוחב המסגרת
    width = containerWidth;
    height = width / imageAspect;
    x = 0;
    y = (containerHeight - height) / 2;
  }
  
  // החלת ההיסט על מיקום התמונה
  x += offsetX;
  y += offsetY;
  
  // וידוא שהתמונה מכסה תמיד את כל המסגרת
  // בדיקה אם יש רווח בין התמונה לשולי המסגרת אחרי הזזת התמונה
  const hasGapX = x > 0 || (x + width) < containerWidth;
  const hasGapY = y > 0 || (y + height) < containerHeight;
  
  if (hasGapX || hasGapY) {
    // חישוב פקטור הגדלה נדרש לכיסוי מלא של המסגרת
    let scaleX = 1;
    let scaleY = 1;
    
    if (hasGapX) {
      // חישוב כמה צריך להגדיל את התמונה ברוחב
      const uncoveredWidth = Math.max(
        x > 0 ? x : 0,
        (x + width) < containerWidth ? containerWidth - (x + width) : 0
      );
      scaleX = (width + uncoveredWidth * 2) / width;
    }
    
    if (hasGapY) {
      // חישוב כמה צריך להגדיל את התמונה בגובה
      const uncoveredHeight = Math.max(
        y > 0 ? y : 0,
        (y + height) < containerHeight ? containerHeight - (y + height) : 0
      );
      scaleY = (height + uncoveredHeight * 2) / height;
    }
    
    // שימוש בפקטור הגדלה גדול יותר לשמירה על יחס ממדים
    const scale = Math.max(scaleX, scaleY) * 1.1; // תוספת 10% לביטחון
    
    // חישוב מימדים חדשים לתמונה
    const newWidth = width * scale;
    const newHeight = height * scale;
    
    // עדכון מיקום התמונה לשמירה על מרכוז
    const newX = x - (newWidth - width) / 2;
    const newY = y - (newHeight - height) / 2;
    
    return { width: newWidth, height: newHeight, x: newX, y: newY };
  }
  
  return { width, height, x, y };
};
