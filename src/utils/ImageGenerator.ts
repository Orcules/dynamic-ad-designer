
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

    // Find all positioned elements and store their original styles
    const originalStyles = new Map<Element, {
      transform: string;
      transition: string;
      style: string;
    }>();
    
    // Select all elements with transform or position styles
    const positionedElements = this.previewElement.querySelectorAll('[style*="transform"], [style*="position"], .absolute');
    
    // Save the original styles before modification
    positionedElements.forEach(el => {
      const computedStyle = window.getComputedStyle(el);
      
      originalStyles.set(el, {
        transform: computedStyle.transform,
        transition: computedStyle.transition,
        style: (el as HTMLElement).getAttribute('style') || ''
      });
      
      // Freeze transitions during capture
      if (el instanceof HTMLElement) {
        if (computedStyle.transition !== 'none') {
          el.style.transition = 'none';
        }
      }
    });
    
    // Find and fix the background image specifically
    const backgroundImage = this.previewElement.querySelector('img:not(.placeholder)');
    if (backgroundImage && backgroundImage instanceof HTMLElement) {
      // Ensure object-fit is properly set
      backgroundImage.style.objectFit = 'cover';
      
      // Make sure transform is preserved exactly as it is
      // Don't modify the transform, just ensure transitions are disabled
      backgroundImage.style.transition = 'none';
    }
    
    // Return function to restore original styles
    return () => {
      positionedElements.forEach(el => {
        if (el instanceof HTMLElement) {
          const original = originalStyles.get(el);
          if (original) {
            // Restore the entire style attribute to its original state
            el.setAttribute('style', original.style);
          }
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

    // Prepare for capture - freeze transitions and styles
    console.log('Preparing for capture...');
    const resetStyles = await this.prepareForCapture();
    
    // Give time for any style changes to take effect
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      console.log('Using html2canvas...');
      
      // Clone the node to avoid modifying the original DOM
      const clone = this.previewElement.cloneNode(true) as HTMLElement;
      document.body.appendChild(clone);
      
      // Position the clone off-screen
      clone.style.position = 'fixed';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = this.previewElement.offsetWidth + 'px';
      clone.style.height = this.previewElement.offsetHeight + 'px';
      clone.style.transition = 'none';
      
      // Fix any background images in the clone
      const clonedImage = clone.querySelector('img:not(.placeholder)');
      if (clonedImage && clonedImage instanceof HTMLElement) {
        clonedImage.style.objectFit = 'cover';
        clonedImage.style.objectPosition = 'center center'; 
        clonedImage.style.transition = 'none';
        
        // Preserve exact transform from original
        const originalImage = this.previewElement.querySelector('img:not(.placeholder)');
        if (originalImage) {
          const transform = window.getComputedStyle(originalImage).transform;
          if (transform && transform !== 'none') {
            clonedImage.style.transform = transform;
          }
        }
      }

      // Fix all positioned elements in the clone to have exact positions
      const positionedElements = clone.querySelectorAll('[style*="transform"], [style*="position"], .absolute');
      positionedElements.forEach(clonedEl => {
        if (clonedEl instanceof HTMLElement) {
          // Find corresponding original element
          const originalSelector = this.getUniqueSelector(clonedEl);
          const originalEl = this.previewElement?.querySelector(originalSelector);
          
          if (originalEl) {
            const computedStyle = window.getComputedStyle(originalEl);
            
            // Preserve transform exactly
            if (computedStyle.transform && computedStyle.transform !== 'none') {
              clonedEl.style.transform = computedStyle.transform;
            }
            
            // Ensure no transitions
            clonedEl.style.transition = 'none';
          }
        }
      });

      // Set a scaling factor for better quality
      const scaleFactor = 1.5;
      
      // Call html2canvas with proper options
      const canvas = await html2canvas(clone, {
        backgroundColor: null,
        scale: scaleFactor,
        useCORS: true,
        allowTaint: true,
        logging: false,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        imageTimeout: 0,
        onclone: (documentClone) => {
          // Copy font faces for proper rendering
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
          
          // Fix cloned images
          const clonedImages = documentClone.querySelectorAll('img:not(.placeholder)');
          clonedImages.forEach(img => {
            if (img instanceof HTMLElement) {
              img.style.objectFit = 'cover';
              img.style.objectPosition = 'center center';
              img.style.transition = 'none';
            }
          });
        }
      });
      
      // Remove the clone from the DOM
      document.body.removeChild(clone);

      const renderTime = performance.now() - startTime;
      console.log(`Canvas generated successfully in ${renderTime.toFixed(2)}ms`);
      
      // Reset styles to original
      resetStyles();
      
      this.lastCaptureTime = performance.now();
      return canvas.toDataURL('image/png', 0.9);
    } catch (html2canvasError) {
      console.warn('html2canvas failed, trying dom-to-image fallback:', html2canvasError);
      
      // Reset styles before trying fallback
      resetStyles();
      
      return this.fallbackCapture();
    }
  }
  
  // Helper method to get a relatively unique selector for an element
  private getUniqueSelector(el: Element): string {
    // Try to use existing ID
    if (el.id) {
      return `#${el.id}`;
    }
    
    // Try to create a selector with classes
    if (el.classList.length > 0) {
      const classes = Array.from(el.classList).join('.');
      return `.${classes}`;
    }
    
    // Fallback to tag name and position
    const tagName = el.tagName.toLowerCase();
    const siblings = Array.from(el.parentElement?.children || []);
    const index = siblings.indexOf(el);
    
    return `${tagName}:nth-child(${index + 1})`;
  }

  private async fallbackCapture(): Promise<string> {
    if (!this.previewElement) {
      throw new Error('Preview element not found');
    }
    
    const startTime = performance.now();
    await this.waitForImages(1500);
    
    // Prepare for capture with style freezing
    const resetStyles = await this.prepareForCapture();

    console.log('Using dom-to-image fallback...');

    // Clone the node to avoid modifying the original DOM
    const clone = this.previewElement.cloneNode(true) as HTMLElement;
    document.body.appendChild(clone);
    
    // Position the clone off-screen
    clone.style.position = 'fixed';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.width = this.previewElement.offsetWidth + 'px';
    clone.style.height = this.previewElement.offsetHeight + 'px';
    clone.style.transition = 'none';
    
    // Fix background images in the clone
    const clonedImage = clone.querySelector('img:not(.placeholder)');
    if (clonedImage && clonedImage instanceof HTMLElement) {
      clonedImage.style.objectFit = 'cover';
      clonedImage.style.objectPosition = 'center center'; 
      clonedImage.style.transition = 'none';
      
      // Copy the exact transform from the original
      const originalImage = this.previewElement.querySelector('img:not(.placeholder)');
      if (originalImage) {
        const computedStyle = window.getComputedStyle(originalImage);
        if (computedStyle.transform && computedStyle.transform !== 'none') {
          clonedImage.style.transform = computedStyle.transform;
        }
      }
    }
    
    // Fix positioned elements in the clone
    const positionedElements = clone.querySelectorAll('[style*="transform"], [style*="position"], .absolute');
    positionedElements.forEach(el => {
      if (el instanceof HTMLElement) {
        // Ensure transitions are disabled
        el.style.transition = 'none';
      }
    });

    const config = {
      quality: 0.9,
      scale: 1.5,
      bgcolor: null,
      style: {
        'transform-origin': 'top left',
        'transition': 'none',
      },
      imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    };

    try {
      const dataUrl = await domtoimage.toPng(clone, config);
      console.log(`Dom-to-image generated successfully in ${performance.now() - startTime}ms`);
      
      // Clean up clone
      document.body.removeChild(clone);
      
      // Reset original styles
      resetStyles();
      
      this.lastCaptureTime = performance.now();
      return dataUrl;
    } catch (error) {
      console.error('Fallback capture failed:', error);
      
      // Clean up
      if (clone.parentNode) {
        document.body.removeChild(clone);
      }
      
      // Reset styles
      resetStyles();
      
      // Last resort fallback
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
