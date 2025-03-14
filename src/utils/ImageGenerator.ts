import domtoimage from 'dom-to-image-more';
import html2canvas from 'html2canvas';

export class ImageGenerator {
  private previewElement: HTMLElement | null;
  private lastCaptureTime: number = 0;
  private captureInProgress: boolean = false;
  private captureQueue: Array<() => void> = [];

  constructor(previewSelector = '.ad-content') {
    this.previewElement = document.querySelector(previewSelector);
  }

  private async waitForImages(maxWaitTime = 2000): Promise<void> {
    if (!this.previewElement) return;

    const startTime = performance.now();
    const images = Array.from(this.previewElement.getElementsByTagName('img'));
    
    // Skip waiting if no images
    if (images.length === 0) {
      return;
    }
    
    const imagePromises = images.map(img => 
      new Promise<void>((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          // Set up resolved callbacks
          img.onload = () => resolve();
          img.onerror = () => {
            console.warn(`Failed to load image: ${img.src}`);
            resolve(); // Resolve anyway to continue with capture
          };
          
          // Set a timeout in case the image hangs
          setTimeout(() => {
            // If image wasn't loaded yet, move on
            resolve();
          }, 1500);
        }
      })
    );

    // Set a maximum wait time with Promise.race
    await Promise.race([
      Promise.all([
        ...imagePromises,
        document.fonts.ready,
        new Promise<void>(resolve => setTimeout(resolve, 300)) // Reduced waiting time
      ]),
      new Promise<void>(resolve => setTimeout(() => {
        console.warn(`Maximum wait time for images reached (${maxWaitTime}ms)`);
        resolve();
      }, maxWaitTime))
    ]);
    
    console.log(`Waited for images: ${performance.now() - startTime}ms`);
  }

  private async prepareForCapture(): Promise<(() => void)> {
    if (!this.previewElement) {
      return () => {};
    }

    // Simulate hover effect on button - fix the selector
    const ctaButton = this.previewElement.querySelector('button');
    console.log('CTA Button found:', ctaButton !== null);
    
    // Find text elements - now using the class names we added
    const headlineElement = this.previewElement.querySelector('h2');
    const descriptionElement = this.previewElement.querySelector('p');
    const buttonTextElement = ctaButton?.querySelector('.cta-text');
    
    // Find arrow element separately
    const arrowElement = ctaButton?.querySelector('.cta-arrow');
    
    // Store original positions to restore later
    const originalPositions = new Map<Element, string>();
    
    // Helper to move elements up
    const moveElementUp = (element: Element | null, pixels: number = 7) => {
      if (!element) return;
      
      const currentTransform = window.getComputedStyle(element).transform;
      originalPositions.set(element, currentTransform);
      
      // Apply transform to move up
      if (currentTransform && currentTransform !== 'none') {
        (element as HTMLElement).style.transform = `${currentTransform} translateY(-${pixels}px)`;
      } else {
        (element as HTMLElement).style.transform = `translateY(-${pixels}px)`;
      }
      
      console.log(`Moved element up by ${pixels}px:`, element);
    };
    
    // Move text elements up but NOT the arrow
    moveElementUp(headlineElement);
    moveElementUp(descriptionElement);
    moveElementUp(buttonTextElement);
    
    // We do NOT modify the arrow position here to keep it static
    if (arrowElement) {
      console.log('Arrow found, keeping it static during rendering');
      // Just store the original transform to restore later
      const svgElement = arrowElement as SVGElement;
      originalPositions.set(svgElement, svgElement.style.transform);
    }
    
    return () => {
      // Restore original positions
      originalPositions.forEach((originalTransform, element) => {
        if (element instanceof SVGElement || element instanceof HTMLElement) {
          element.style.transform = originalTransform;
        }
      });
    };
  }

  private async captureElement(): Promise<string> {
    if (!this.previewElement) {
      throw new Error('Preview element not found');
    }
    
    const startTime = performance.now();
    
    // Wait for all images to load
    await this.waitForImages(2000);
    
    console.log(`Image waiting completed in ${performance.now() - startTime}ms`);

    // Trigger hover effect
    console.log('Preparing for capture...');
    const resetEffect = await this.prepareForCapture();
    
    // Give time for animation to take effect
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      console.log('Using html2canvas...');
      
      // Find and fix the background image
      const backgroundImage = this.previewElement.querySelector('img');
      const backgroundImageStyles = backgroundImage ? window.getComputedStyle(backgroundImage) : null;
      
      // Create a clone of the element to preserve the original
      const clonedElement = this.previewElement.cloneNode(true) as HTMLElement;
      
      // Find the image in the cloned element
      const clonedImage = clonedElement.querySelector('img');
      
      // If we have an image, make sure it's set to object-fit: cover with extra scale
      if (clonedImage && backgroundImageStyles) {
        // Preserve the original dimensions
        const rect = this.previewElement.getBoundingClientRect();
        const extraScaleFactor = 1.5; // Increased to ensure no borders
        
        // Apply styles directly that will ensure the image covers everything
        clonedImage.style.objectFit = 'cover';
        clonedImage.style.width = `${rect.width * extraScaleFactor}px`;
        clonedImage.style.height = `${rect.height * extraScaleFactor}px`;
        clonedImage.style.position = 'absolute';
        clonedImage.style.left = `${-(rect.width * (extraScaleFactor - 1) / 2)}px`;
        clonedImage.style.top = `${-(rect.height * (extraScaleFactor - 1) / 2)}px`;
        clonedImage.style.transform = 'none'; // Reset any transforms
        
        // Ensure the parent container has the correct positioning
        const imageContainer = clonedImage.parentElement;
        if (imageContainer) {
          imageContainer.style.overflow = 'hidden';
          imageContainer.style.position = 'relative';
        }
        
        console.log('Applied image scaling styles for html2canvas');
      }
      
      // Fix all absolute positioned elements
      const elementsToFixPosition = Array.from(clonedElement.querySelectorAll('.absolute, [style*="position: absolute"]'));
      elementsToFixPosition.forEach(el => {
        if (el === clonedImage) return; // Skip the background image we already handled
        
        const computedStyle = window.getComputedStyle(el);
        const currentLeft = computedStyle.left;
        const currentTop = computedStyle.top;
        const currentTransform = computedStyle.transform;
        
        // Apply computed position directly
        (el as HTMLElement).style.position = 'absolute';
        (el as HTMLElement).style.left = currentLeft;
        (el as HTMLElement).style.top = currentTop;
        (el as HTMLElement).style.transform = currentTransform;
      });

      // Use html2canvas on the cloned element
      const canvas = await html2canvas(clonedElement, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        imageTimeout: 0,
        onclone: (documentClone) => {
          // Add all CSS font faces to the clone
          const styleSheets = Array.from(document.styleSheets);
          styleSheets.forEach(sheet => {
            try {
              const rules = Array.from(sheet.cssRules || []);
              rules.forEach(rule => {
                if (rule instanceof CSSFontFaceRule) {
                  const style = document.createElement('style');
                  style.textContent = rule.cssText;
                  documentClone.head.appendChild(style);
                }
              });
            } catch (e) {
              // Silently fail for cross-origin stylesheets
            }
          });
        }
      });

      const renderTime = performance.now() - startTime;
      console.log(`Canvas generated successfully in ${renderTime.toFixed(2)}ms`);
      
      // Reset hover effect after capture
      console.log('Resetting text positions and hover effect');
      resetEffect();
      
      this.lastCaptureTime = performance.now();
      return canvas.toDataURL('image/png', 0.95);
    } catch (html2canvasError) {
      console.warn('html2canvas failed, trying dom-to-image fallback:', html2canvasError);
      
      // Reset hover effect
      resetEffect();
      
      return this.fallbackCapture();
    }
  }

  private async fallbackCapture(): Promise<string> {
    if (!this.previewElement) {
      throw new Error('Preview element not found');
    }
    
    const startTime = performance.now();
    await this.waitForImages(1500); // Reduced waiting time
    
    // Trigger hover effect
    const resetEffect = await this.prepareForCapture();

    console.log('Using dom-to-image fallback...');
    
    // Clone the element for manipulation
    const clonedElement = this.previewElement.cloneNode(true) as HTMLElement;
    document.body.appendChild(clonedElement);
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = '-9999px';
    clonedElement.style.top = '-9999px';
    
    // Find and fix the background image in the clone
    const clonedImage = clonedElement.querySelector('img');
    if (clonedImage) {
      const rect = this.previewElement.getBoundingClientRect();
      const extraScaleFactor = 1.5; // Increased to ensure no borders
      
      // Apply styles directly that will ensure the image covers everything
      clonedImage.style.objectFit = 'cover';
      clonedImage.style.width = `${rect.width * extraScaleFactor}px`;
      clonedImage.style.height = `${rect.height * extraScaleFactor}px`;
      clonedImage.style.position = 'absolute';
      clonedImage.style.left = `${-(rect.width * (extraScaleFactor - 1) / 2)}px`;
      clonedImage.style.top = `${-(rect.height * (extraScaleFactor - 1) / 2)}px`;
      clonedImage.style.transform = 'none'; // Reset any transforms
      
      console.log('Applied image scaling styles for dom-to-image');
    }

    try {
      const config = {
        quality: 0.95,
        scale: 2,
        bgcolor: null,
        style: {
          'transform-origin': 'top left',
        },
        imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
      };

      const dataUrl = await domtoimage.toPng(clonedElement, config);
      console.log(`Dom-to-image generated successfully in ${performance.now() - startTime}ms`);
      
      // Cleanup
      document.body.removeChild(clonedElement);
      
      // Reset hover effect
      resetEffect();
      
      this.lastCaptureTime = performance.now();
      return dataUrl;
    } catch (error) {
      console.error('Fallback capture failed:', error);
      
      // Cleanup
      if (document.body.contains(clonedElement)) {
        document.body.removeChild(clonedElement);
      }
      
      // Reset hover effect
      resetEffect();
      
      // Last resort: try to get a screenshot with a simpler approach
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get canvas context');
        
        const rect = this.previewElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        // Fill with a background color as placeholder
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '20px Arial';
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.fillText('Image generation failed', canvas.width / 2, canvas.height / 2);
        
        return canvas.toDataURL('image/png');
      } catch (lastError) {
        console.error('Last resort failed:', lastError);
        throw error;
      }
    }
  }

  // Rate-limited getImageUrl to prevent performance issues
  async getImageUrl(): Promise<string> {
    // If a capture is already in progress, queue this request
    if (this.captureInProgress) {
      console.log('Capture already in progress, queuing this request');
      return new Promise((resolve, reject) => {
        this.captureQueue.push(async () => {
          try {
            const url = await this.captureElement();
            resolve(url);
          } catch (error) {
            reject(error);
          }
        });
      });
    }

    // Check if we need to throttle requests
    const now = performance.now();
    const timeSinceLastCapture = now - this.lastCaptureTime;
    
    // If the last capture was too recent, wait before proceeding
    if (timeSinceLastCapture < 500) {
      console.log(`Waiting ${500 - timeSinceLastCapture}ms before capture`);
      await new Promise(resolve => setTimeout(resolve, 500 - timeSinceLastCapture));
    }
    
    try {
      this.captureInProgress = true;
      const url = await this.captureElement();
      
      // Process any queued captures
      if (this.captureQueue.length > 0) {
        console.log(`Processing ${this.captureQueue.length} queued captures`);
        setTimeout(() => {
          const nextCapture = this.captureQueue.shift();
          if (nextCapture) nextCapture();
          this.captureInProgress = false;
        }, 500);
      } else {
        this.captureInProgress = false;
      }
      
      return url;
    } catch (error) {
      this.captureInProgress = false;
      console.error('Error getting image URL:', error);
      throw error;
    }
  }

  async downloadImage(filename = 'ad-preview.png'): Promise<void> {
    try {
      console.log('Starting download process...');
      const dataUrl = await this.getImageUrl();
      
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Download completed successfully');
    } catch (error) {
      console.error('Error downloading image:', error);
      throw error;
    }
  }
}
