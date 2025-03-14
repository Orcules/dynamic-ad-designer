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
      
      // Initialize variables before using them
      const originalStyles = new Map<Element, string>();
      const elementsToFixPosition = this.previewElement ? 
        Array.from(this.previewElement.querySelectorAll('.absolute, [style*="position: absolute"]')) : 
        [];
      
      elementsToFixPosition.forEach(el => {
        originalStyles.set(el, el.getAttribute('style') || '');
        const computedStyle = window.getComputedStyle(el);
        const currentLeft = computedStyle.left;
        const currentTop = computedStyle.top;
        const currentTransform = computedStyle.transform;
        
        // Apply computed position directly
        el.setAttribute('style', `${el.getAttribute('style') || ''}; position: absolute; left: ${currentLeft}; top: ${currentTop}; transform: ${currentTransform};`);
      });

      // Find and fix the background image to prevent stretching
      const bgImageContainer = this.previewElement.querySelector('.ad-image-container');
      const bgImage = this.previewElement.querySelector('.ad-image');
      
      let originalImageStyles: Record<string, string> = {};
      let originalContainerStyles: Record<string, string> = {};
      
      if (bgImage && bgImageContainer) {
        // Save original styles
        const imgStyle = window.getComputedStyle(bgImage);
        const containerStyle = window.getComputedStyle(bgImageContainer);
        
        // Record original styles
        originalImageStyles = {
          objectFit: imgStyle.objectFit,
          objectPosition: imgStyle.objectPosition,
          width: imgStyle.width,
          height: imgStyle.height,
          transform: imgStyle.transform
        };
        
        originalContainerStyles = {
          overflow: containerStyle.overflow,
          position: containerStyle.position
        };
      }

      // Clone the node to avoid modifying the original DOM
      const clone = this.previewElement.cloneNode(true) as HTMLElement;
      document.body.appendChild(clone);
      
      // Make the clone visible but off-screen
      clone.style.position = 'fixed';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = this.previewElement.offsetWidth + 'px';
      clone.style.height = this.previewElement.offsetHeight + 'px';
      
      // Fix any background images in the clone
      const allImagesInClone = clone.querySelectorAll('img');
      allImagesInClone.forEach(img => {
        // Preserve original aspect ratio for all images
        img.style.objectFit = 'contain';
        
        // Store original dimensions
        const originalWidth = img.width;
        const originalHeight = img.height;
        
        // Make sure the image keeps its position but doesn't stretch
        if (img.style.transform) {
          // Position is maintained through transform
          img.style.maxWidth = '100%';
          img.style.maxHeight = '100%';
        }
      });

      // Prevent text or content overflow
      const textElements = clone.querySelectorAll('h1, h2, h3, p, button, div:not(.ad-image-container)');
      textElements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.overflow = 'hidden';
          el.style.textOverflow = 'ellipsis';
        }
      });

      // Fix: Call html2canvas as a function with proper options
      const canvas = await html2canvas(clone, {
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
      
      // Remove the clone from the DOM
      document.body.removeChild(clone);

      const renderTime = performance.now() - startTime;
      console.log(`Canvas generated successfully in ${renderTime.toFixed(2)}ms`);
      
      // Restore original styles
      elementsToFixPosition.forEach(el => {
        const original = originalStyles.get(el);
        if (original !== undefined) {
          el.setAttribute('style', original);
        }
      });
      
      // Restore original image styles
      if (bgImage && bgImageContainer) {
        Object.entries(originalImageStyles).forEach(([prop, value]) => {
          (bgImage as HTMLElement).style[prop as any] = value;
        });
        
        Object.entries(originalContainerStyles).forEach(([prop, value]) => {
          (bgImageContainer as HTMLElement).style[prop as any] = value;
        });
      }
      
      // Reset hover effect after capture
      console.log('Resetting text positions and hover effect');
      resetEffect();
      
      this.lastCaptureTime = performance.now();
      return canvas.toDataURL('image/png', 0.9); // Slightly reduced quality for better performance
    } catch (html2canvasError) {
      console.warn('html2canvas failed, trying dom-to-image fallback:', html2canvasError);
      
      // Fix: Define a local scope copy of these variables before using them in this catch block
      const localElementsToFixPosition = this.previewElement ? 
        Array.from(this.previewElement.querySelectorAll('.absolute, [style*="position: absolute"]')) : 
        [];
      const localOriginalStyles = new Map<Element, string>();
      
      // Restore original styles before fallback
      localElementsToFixPosition.forEach(el => {
        const original = localOriginalStyles.get(el);
        if (original !== undefined) {
          el.setAttribute('style', original);
        }
      });
      
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

    // Find and fix the background image to prevent stretching
    const bgImageContainer = this.previewElement.querySelector('.ad-image-container');
    const bgImage = this.previewElement.querySelector('.ad-image');
    
    let originalImageStyles: Record<string, string> = {};
    let originalContainerStyles: Record<string, string> = {};
    
    if (bgImage && bgImageContainer) {
      // Save original styles
      const imgStyle = window.getComputedStyle(bgImage);
      const containerStyle = window.getComputedStyle(bgImageContainer);
      
      // Record original styles
      originalImageStyles = {
        objectFit: imgStyle.objectFit,
        objectPosition: imgStyle.objectPosition,
        width: imgStyle.width,
        height: imgStyle.height
      };
      
      originalContainerStyles = {
        overflow: containerStyle.overflow,
        position: containerStyle.position
      };
    }

    // Clone the node to avoid modifying the original DOM
    const clone = this.previewElement.cloneNode(true) as HTMLElement;
    document.body.appendChild(clone);
    
    // Make the clone visible but off-screen
    clone.style.position = 'fixed';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.width = this.previewElement.offsetWidth + 'px';
    clone.style.height = this.previewElement.offsetHeight + 'px';
    
    // Fix any images in the clone for correct aspect ratio
    const allImagesInClone = clone.querySelectorAll('img');
    allImagesInClone.forEach(img => {
      // For preservation of aspect ratio, use 'contain' 
      img.style.objectFit = 'contain'; 
      
      // Ensure the image doesn't overflow its container
      img.style.maxWidth = '100%';
      img.style.maxHeight = '100%';
    });

    const config = {
      quality: 0.9,
      scale: 2,
      bgcolor: null,
      style: {
        'transform-origin': 'top left',
      },
      imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    };

    // Skip extra processing for cross-origin images to improve performance
    try {
      const dataUrl = await domtoimage.toPng(clone, config);
      console.log(`Dom-to-image generated successfully in ${performance.now() - startTime}ms`);
      
      // Remove the clone from the DOM
      document.body.removeChild(clone);
      
      // Restore original image styles
      if (bgImage && bgImageContainer) {
        Object.entries(originalImageStyles).forEach(([prop, value]) => {
          (bgImage as HTMLElement).style[prop as any] = value;
        });
        
        Object.entries(originalContainerStyles).forEach(([prop, value]) => {
          (bgImageContainer as HTMLElement).style[prop as any] = value;
        });
      }
      
      // Reset hover effect
      resetEffect();
      
      this.lastCaptureTime = performance.now();
      return dataUrl;
    } catch (error) {
      console.error('Fallback capture failed:', error);
      
      // Remove the clone from the DOM if it exists
      if (clone.parentNode) {
        document.body.removeChild(clone);
      }
      
      // Restore original image styles
      if (bgImage && bgImageContainer) {
        Object.entries(originalImageStyles).forEach(([prop, value]) => {
          (bgImage as HTMLElement).style[prop as any] = value;
        });
        
        Object.entries(originalContainerStyles).forEach(([prop, value]) => {
          (bgImageContainer as HTMLElement).style[prop as any] = value;
        });
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
