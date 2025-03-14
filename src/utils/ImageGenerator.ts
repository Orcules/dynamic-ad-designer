
import domtoimage from 'dom-to-image-more';
import html2canvas from 'html2canvas';
import * as htmlToImage from 'html-to-image';
import { applyImageEffect, createProportionalCanvas, optimizeCanvasRendering, ensureElementsVisible, fixRTLTextRendering } from './imageEffects';

export class ImageGenerator {
  private previewElement: HTMLElement | null;
  private lastCaptureTime: number = 0;
  private captureInProgress: boolean = false;
  private captureQueue: Array<() => void> = [];
  private outputWidth: number | null = null;
  private outputHeight: number | null = null;
  private outputScale: number = 2;
  private imageEffect: 'sepia' | 'none' | 'highres' = 'none';
  private renderMethod: 'html2canvas' | 'dom-to-image' | 'html-to-image' = 'html2canvas';

  constructor(
    previewSelector = '.ad-content', 
    options?: { 
      outputWidth?: number; 
      outputHeight?: number; 
      outputScale?: number;
      effect?: 'sepia' | 'none' | 'highres';
      renderMethod?: 'html2canvas' | 'dom-to-image' | 'html-to-image';
    }
  ) {
    this.previewElement = document.querySelector(previewSelector);
    
    if (options) {
      if (options.outputWidth) this.outputWidth = options.outputWidth;
      if (options.outputHeight) this.outputHeight = options.outputHeight;
      if (options.outputScale) this.outputScale = options.outputScale;
      if (options.effect) this.imageEffect = options.effect;
      if (options.renderMethod) this.renderMethod = options.renderMethod;
    }
    
    console.log(`ImageGenerator initialized with dimensions: ${this.outputWidth}x${this.outputHeight}, scale: ${this.outputScale}, method: ${this.renderMethod}`);
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
   * @param effect The effect to apply ('sepia', 'none', or 'highres')
   */
  public setImageEffect(effect: 'sepia' | 'none' | 'highres'): void {
    this.imageEffect = effect;
    console.log(`Image effect set to: ${effect}`);
  }

  /**
   * Set the rendering method to use
   * @param method The rendering method ('html2canvas', 'dom-to-image', or 'html-to-image')
   */
  public setRenderMethod(method: 'html2canvas' | 'dom-to-image' | 'html-to-image'): void {
    this.renderMethod = method;
    console.log(`Render method set to: ${method}`);
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
        new Promise<void>(resolve => setTimeout(resolve, 300)) // Wait for fonts to load
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

    // Store and remove transformations temporarily to avoid scaling issues
    const elementsWithTransform = Array.from(this.previewElement.querySelectorAll('*[style*="transform"]'));
    const originalTransforms = new Map<Element, string>();
    const originalBoxShadows = new Map<Element, string>();
    const originalBorders = new Map<Element, string>();
    
    // Store original styles
    elementsWithTransform.forEach(el => {
      const computedStyle = window.getComputedStyle(el);
      originalTransforms.set(el, computedStyle.transform);
      
      // Don't remove positioning transforms completely, just scale transforms
      const elStyle = (el as HTMLElement).style;
      if (elStyle.transform.includes('scale')) {
        elStyle.transform = elStyle.transform.replace(/scale\([^)]+\)/g, 'scale(1)');
      }
    });
    
    // Also handle box-shadow and border which can cause rendering issues
    const elementsWithShadow = Array.from(this.previewElement.querySelectorAll('*[style*="box-shadow"]'));
    elementsWithShadow.forEach(el => {
      const computedStyle = window.getComputedStyle(el);
      originalBoxShadows.set(el, computedStyle.boxShadow);
      
      // Temporarily remove box-shadow for capture
      (el as HTMLElement).style.boxShadow = 'none';
    });
    
    const elementsWithBorder = Array.from(this.previewElement.querySelectorAll('*[style*="border"]'));
    elementsWithBorder.forEach(el => {
      const computedStyle = window.getComputedStyle(el);
      originalBorders.set(el, computedStyle.border);
      
      // Make sure borders are solid for better rendering
      if ((el as HTMLElement).style.borderStyle === 'dashed' || (el as HTMLElement).style.borderStyle === 'dotted') {
        (el as HTMLElement).style.borderStyle = 'solid';
      }
    });
    
    // Ensure all navigation elements are visible for capture
    ensureElementsVisible(this.previewElement);
    
    // Fix RTL text rendering issues before capture
    fixRTLTextRendering(this.previewElement);
    
    return () => {
      // Restore original styles
      originalTransforms.forEach((originalTransform, element) => {
        if (element instanceof HTMLElement) {
          element.style.transform = originalTransform;
        }
      });
      
      originalBoxShadows.forEach((originalBoxShadow, element) => {
        if (element instanceof HTMLElement) {
          element.style.boxShadow = originalBoxShadow;
        }
      });
      
      originalBorders.forEach((originalBorder, element) => {
        if (element instanceof HTMLElement) {
          element.style.border = originalBorder;
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

    // Prepare element for capture (remove transforms, ensure visibility)
    console.log('Preparing for capture...');
    const resetEffect = await this.prepareForCapture();
    
    // Give time for prep changes to take effect
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      console.log(`Using ${this.renderMethod} for image capture...`);
      
      // Choose the rendering method based on configuration
      if (this.renderMethod === 'html-to-image') {
        return this.captureWithHtmlToImage(resetEffect);
      } else if (this.renderMethod === 'dom-to-image') {
        return this.captureWithDomToImage(resetEffect);
      } else {
        return this.captureWithHtml2Canvas(resetEffect);
      }
    } catch (error) {
      console.error('Primary capture method failed:', error);
      resetEffect();
      
      // If the primary method fails, fall back to a different method
      console.warn('Trying fallback method...');
      if (this.renderMethod !== 'html-to-image') {
        try {
          return await this.captureWithHtmlToImage(() => {});
        } catch (htmlToImageError) {
          console.error('html-to-image fallback failed:', htmlToImageError);
        }
      }
      
      // If all else fails, try dom-to-image as a last resort
      console.warn('Trying dom-to-image as last resort...');
      return this.fallbackCapture();
    }
  }

  private async captureWithHtml2Canvas(resetEffect: () => void): Promise<string> {
    try {
      const startTime = performance.now();
      
      // Create a clone to avoid modifying the original
      const clone = this.previewElement!.cloneNode(true) as HTMLElement;
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.appendChild(clone);
      document.body.appendChild(container);
      
      // Set up html2canvas options with fixes for stretching
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
        scale: this.outputScale || window.devicePixelRatio || 2,
        letterRendering: true, // Better text rendering
        onclone: (documentClone: Document) => {
          // Copy over font face rules to ensure text renders correctly
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
          
          // Fix background-size on elements to prevent stretching
          const bgElements = documentClone.querySelectorAll('[style*="background"]');
          bgElements.forEach(el => {
            if (el instanceof HTMLElement) {
              if (el.style.backgroundSize === '200%' || el.style.backgroundSize === '200% auto') {
                el.style.backgroundSize = '200% 200%';
              }
              // Ensure backgrounds maintain aspect ratio
              if (!el.style.backgroundSize) {
                el.style.backgroundSize = 'contain';
                el.style.backgroundRepeat = 'no-repeat';
                el.style.backgroundPosition = 'center';
              }
            }
          });
        }
      };
      
      // Apply custom dimensions if specified
      if (this.outputWidth && this.outputHeight) {
        options.width = this.outputWidth;
        options.height = this.outputHeight;
        console.log(`Using custom dimensions: ${this.outputWidth}x${this.outputHeight}, scale: ${this.outputScale}`);
      } else {
        // Use exact element dimensions to prevent stretching
        options.width = clone.offsetWidth;
        options.height = clone.offsetHeight;
        console.log(`Using element dimensions: ${clone.offsetWidth}x${clone.offsetHeight}, scale: ${this.outputScale}`);
      }

      // Generate the canvas with optimized settings
      const canvas = await html2canvas(clone, options);
      
      // Clean up the cloned element
      document.body.removeChild(container);
      
      // Ensure the canvas maintains the proper aspect ratio
      let finalCanvas = canvas;
      if (this.outputWidth && this.outputHeight) {
        finalCanvas = createProportionalCanvas(canvas, this.outputWidth, this.outputHeight);
      }
      
      // Optimize canvas rendering
      const ctx = finalCanvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        // Disable image smoothing for sharper lines
        ctx.imageSmoothingEnabled = false;
        optimizeCanvasRendering(ctx);
      }

      // Apply any image effects to the canvas
      const dataUrl = await applyImageEffect(finalCanvas, this.imageEffect);

      const renderTime = performance.now() - startTime;
      console.log(`Canvas generated successfully in ${renderTime.toFixed(2)}ms with html2canvas`);
      
      // Reset the element after capture
      resetEffect();
      
      this.lastCaptureTime = performance.now();
      return dataUrl;
    } catch (error) {
      console.error('html2canvas error:', error);
      resetEffect();
      throw error;
    }
  }

  private async captureWithHtmlToImage(resetEffect: () => void): Promise<string> {
    try {
      const startTime = performance.now();
      
      // Configure the html-to-image options
      const options: htmlToImage.Options = {
        pixelRatio: this.outputScale,
        quality: 1.0,
        backgroundColor: null,
        skipFonts: false,
        canvasWidth: this.outputWidth || undefined,
        canvasHeight: this.outputHeight || undefined,
        cacheBust: true, // Add cache busting to ensure fresh rendering
        filter: (node) => {
          // Filter out any unwanted nodes (e.g., hidden elements)
          return node.nodeName !== 'SCRIPT';
        }
      };
      
      // Use toPng method for best quality
      const dataUrl = await htmlToImage.toPng(this.previewElement!, options);
      
      const renderTime = performance.now() - startTime;
      console.log(`Canvas generated successfully in ${renderTime.toFixed(2)}ms with html-to-image`);
      
      // Apply effects if needed
      const effectResult = await this.applyEffectsToDataUrl(dataUrl);
      
      // Reset element styles
      resetEffect();
      
      this.lastCaptureTime = performance.now();
      return effectResult;
    } catch (error) {
      console.error('html-to-image error:', error);
      resetEffect();
      throw error;
    }
  }

  private async captureWithDomToImage(resetEffect: () => void): Promise<string> {
    try {
      const startTime = performance.now();
      
      // Configure dom-to-image options
      const config: any = {
        quality: 1.0,
        bgcolor: null,
        scale: this.outputScale,
        style: {
          'transform-origin': 'top left',
        },
        width: this.outputWidth,
        height: this.outputHeight,
        imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
      };
      
      // Use toPng method for best quality
      const dataUrl = await domtoimage.toPng(this.previewElement!, config);
      
      const renderTime = performance.now() - startTime;
      console.log(`Canvas generated successfully in ${renderTime.toFixed(2)}ms with dom-to-image`);
      
      // Apply effects if needed
      const effectResult = await this.applyEffectsToDataUrl(dataUrl);
      
      // Reset element styles
      resetEffect();
      
      this.lastCaptureTime = performance.now();
      return effectResult;
    } catch (error) {
      console.error('dom-to-image error:', error);
      resetEffect();
      throw error;
    }
  }

  private async applyEffectsToDataUrl(dataUrl: string): Promise<string> {
    // Only apply effects if needed
    if (this.imageEffect === 'none') {
      return dataUrl;
    }
    
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
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Failed to get canvas context');
    
    ctx.drawImage(img, 0, 0);
    return applyImageEffect(canvas, this.imageEffect);
  }

  private async fallbackCapture(): Promise<string> {
    console.warn('All primary rendering methods failed, using basic fallback...');
    
    if (!this.previewElement) {
      throw new Error('Preview element not found');
    }
    
    // Create a very simple canvas as a last resort
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
      const originalMethod = this.renderMethod;
      
      // Set high-resolution settings
      if (originalWidth && originalHeight) {
        this.setOutputDimensions(originalWidth * scale / originalScale, originalHeight * scale / originalScale, scale);
      } else {
        this.setOutputDimensions(null, null, scale);
      }
      
      // Use html-to-image for high-res rendering as it typically gives better results
      this.setRenderMethod('html-to-image');
      
      // Generate high-resolution image
      const dataUrl = await this.getImageUrl();
      
      // Restore original settings
      this.setOutputDimensions(originalWidth, originalHeight, originalScale);
      this.setRenderMethod(originalMethod);
      
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
