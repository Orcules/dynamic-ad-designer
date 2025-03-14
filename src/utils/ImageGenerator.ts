
import domtoimage from 'dom-to-image-more';
import html2canvas from 'html2canvas';
import { applyImageEffect } from './imageEffects';

export class ImageGenerator {
  private previewElement: HTMLElement | null;
  private lastCaptureTime: number = 0;
  private captureInProgress: boolean = false;
  private captureQueue: Array<() => void> = [];
  private outputWidth: number | null = null;
  private outputHeight: number | null = null;
  private outputScale: number = 2;
  private imageEffect: 'sepia' | 'none' = 'none';

  constructor(
    previewSelector = '.ad-content', 
    options?: { 
      outputWidth?: number; 
      outputHeight?: number; 
      outputScale?: number;
      effect?: 'sepia' | 'none';
    }
  ) {
    this.previewElement = document.querySelector(previewSelector);
    
    if (options) {
      if (options.outputWidth) this.outputWidth = options.outputWidth;
      if (options.outputHeight) this.outputHeight = options.outputHeight;
      if (options.outputScale) this.outputScale = options.outputScale;
      if (options.effect) this.imageEffect = options.effect;
    }
    
    console.log(`ImageGenerator initialized with dimensions: ${this.outputWidth}x${this.outputHeight}, scale: ${this.outputScale}`);
  }

  /**
   * Set the output dimensions for the generated image
   * @param width The width in pixels for the output image (null to use original)
   * @param height The height in pixels for the output image (null to use original)
   * @param scale The scale factor for the output image (default: 2)
   */
  public setOutputDimensions(width: number | null, height: number | null, scale: number = 2): void {
    this.outputWidth = width;
    this.outputHeight = height;
    this.outputScale = scale;
    console.log(`Output dimensions set to: ${width}x${height}, scale: ${scale}`);
  }
  
  /**
   * Set the image effect to apply during generation
   * @param effect The effect to apply ('sepia' or 'none')
   */
  public setImageEffect(effect: 'sepia' | 'none'): void {
    this.imageEffect = effect;
    console.log(`Image effect set to: ${effect}`);
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
      
      // Create a clone of the element to avoid modifying the original
      const clone = this.previewElement.cloneNode(true) as HTMLElement;
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.appendChild(clone);
      document.body.appendChild(container);
      
      // Set up advanced positioning for absolute elements
      const elementsToFixPosition = Array.from(clone.querySelectorAll('.absolute, [style*="position: absolute"]'));
      const originalStyles = new Map<Element, string>();
      
      elementsToFixPosition.forEach(el => {
        originalStyles.set(el, el.getAttribute('style') || '');
        const computedStyle = window.getComputedStyle(el);
        const currentLeft = computedStyle.left;
        const currentTop = computedStyle.top;
        const currentTransform = computedStyle.transform;
        
        // Apply computed position directly
        el.setAttribute('style', `${el.getAttribute('style') || ''}; position: absolute; left: ${currentLeft}; top: ${currentTop}; transform: ${currentTransform};`);
      });
      
      // Set up options for html2canvas with custom dimensions if specified
      const options: any = {
        backgroundColor: null,
        useCORS: true,
        allowTaint: true,
        logging: false,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        imageTimeout: 0,
        onclone: (documentClone: Document) => {
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
      };
      
      // Apply custom dimensions if specified
      if (this.outputWidth && this.outputHeight) {
        options.width = this.outputWidth;
        options.height = this.outputHeight;
        options.scale = this.outputScale;
        console.log(`Using custom dimensions: ${this.outputWidth}x${this.outputHeight}, scale: ${this.outputScale}`);
      } else {
        options.scale = this.outputScale;
        console.log(`Using original dimensions with scale: ${this.outputScale}`);
      }

      // Generate the canvas
      const canvas = await html2canvas(clone, options);
      
      // Clean up the cloned element
      document.body.removeChild(container);

      // Apply any image effects to the canvas
      const dataUrl = await applyImageEffect(canvas, this.imageEffect);

      const renderTime = performance.now() - startTime;
      console.log(`Canvas generated successfully in ${renderTime.toFixed(2)}ms`);
      
      // Reset hover effect after capture
      console.log('Resetting text positions and hover effect');
      resetEffect();
      
      this.lastCaptureTime = performance.now();
      return dataUrl;
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
    
    const config: any = {
      quality: 0.9, // Slightly reduced quality for better performance
      bgcolor: null,
      style: {
        'transform-origin': 'top left',
      },
      imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    };
    
    // Apply custom dimensions for dom-to-image if specified
    if (this.outputWidth && this.outputHeight) {
      config.width = this.outputWidth;
      config.height = this.outputHeight;
      config.scale = this.outputScale;
    } else {
      config.scale = this.outputScale;
    }

    // Skip extra processing for cross-origin images to improve performance
    try {
      const dataUrl = await domtoimage.toPng(this.previewElement, config);
      console.log(`Dom-to-image generated successfully in ${performance.now() - startTime}ms`);
      
      // Reset hover effect
      resetEffect();
      
      this.lastCaptureTime = performance.now();
      
      // Apply image effect to the data URL if needed
      if (this.imageEffect !== 'none') {
        // Create a canvas from the data URL
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = dataUrl;
        });
        
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get canvas context');
        
        ctx.drawImage(img, 0, 0);
        return applyImageEffect(canvas, this.imageEffect);
      }
      
      return dataUrl;
    } catch (error) {
      console.error('Fallback capture failed:', error);
      
      // Reset hover effect
      resetEffect();
      
      // Last resort: try to get a screenshot with a simpler approach
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get canvas context');
        
        const rect = this.previewElement.getBoundingClientRect();
        canvas.width = this.outputWidth || rect.width;
        canvas.height = this.outputHeight || rect.height;
        
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
  
  /**
   * Generate a high-resolution version of the image
   * Useful for creating images suitable for printing or high-quality sharing
   * @param filename Optional filename for download
   * @param scale Scale factor for the high-resolution image
   */
  async downloadHighResolution(filename = 'ad-high-res.png', scale = 3): Promise<void> {
    try {
      console.log(`Starting high-resolution download (scale: ${scale})...`);
      
      // Store original settings
      const originalWidth = this.outputWidth;
      const originalHeight = this.outputHeight;
      const originalScale = this.outputScale;
      
      // Set high-resolution settings
      if (originalWidth && originalHeight) {
        this.setOutputDimensions(originalWidth * scale / originalScale, originalHeight * scale / originalScale, scale);
      } else {
        this.setOutputDimensions(null, null, scale);
      }
      
      // Generate high-resolution image
      const dataUrl = await this.getImageUrl();
      
      // Restore original settings
      this.setOutputDimensions(originalWidth, originalHeight, originalScale);
      
      // Download the image
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('High-resolution download completed successfully');
    } catch (error) {
      console.error('Error downloading high-resolution image:', error);
      throw error;
    }
  }
}
