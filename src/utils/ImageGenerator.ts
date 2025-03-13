
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
    
    if (images.length === 0) {
      return;
    }
    
    const imagePromises = images.map(img => 
      new Promise<void>((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => {
            console.warn(`Failed to load image: ${img.src}`);
            resolve();
          };
          
          setTimeout(() => {
            resolve();
          }, 1000); // Reduced from 1500ms for smoother experience
        }
      })
    );

    await Promise.race([
      Promise.all([
        ...imagePromises,
        document.fonts.ready,
        new Promise<void>(resolve => setTimeout(resolve, 200)) // Reduced from 300ms
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

    // Hide ONLY navigation controls, not the CTA button
    const navigationButtons = this.previewElement.querySelectorAll('[data-navigation-control]');
    const navigationControls = this.previewElement.querySelector('.absolute.inset-0.flex.items-center.justify-between.pointer-events-none.z-10');
    
    const originalStyles = new Map<Element, string>();
    
    // Hide all navigation controls
    if (navigationControls) {
      originalStyles.set(navigationControls, navigationControls.getAttribute('style') || '');
      (navigationControls as HTMLElement).style.display = 'none';
    }
    
    navigationButtons.forEach(button => {
      originalStyles.set(button, (button as HTMLElement).style.display);
      (button as HTMLElement).style.display = 'none';
    });

    // Find the CTA button and ensure it's visible
    const ctaContainer = this.previewElement.querySelector('[data-cta-container="true"]');
    const ctaButton = this.previewElement.querySelector('[data-cta-button="true"]');
    
    if (ctaContainer && ctaContainer instanceof HTMLElement) {
      originalStyles.set(ctaContainer, ctaContainer.getAttribute('style') || '');
      ctaContainer.style.opacity = '1';
      ctaContainer.style.visibility = 'visible';
      ctaContainer.style.zIndex = '999'; // Ensure it's above everything else
      ctaContainer.style.display = 'flex'; // Explicitly set display to flex
      console.log('CTA container found and made visible');
    }
    
    if (ctaButton && ctaButton instanceof HTMLElement) {
      originalStyles.set(ctaButton, ctaButton.getAttribute('style') || '');
      ctaButton.style.opacity = '1';
      ctaButton.style.visibility = 'visible';
      ctaButton.style.zIndex = '1000'; // Ensure it's above everything else
      ctaButton.style.display = 'inline-flex'; // Explicitly set display to inline-flex
      console.log('CTA button found and made visible');
    } else {
      console.log('CTA button not found, using fallback selector');
      // Try fallback selector
      const fallbackCtaButton = this.previewElement.querySelector('button:not([data-navigation-control])');
      if (fallbackCtaButton && fallbackCtaButton instanceof HTMLElement) {
        originalStyles.set(fallbackCtaButton, fallbackCtaButton.getAttribute('style') || '');
        fallbackCtaButton.style.opacity = '1';
        fallbackCtaButton.style.visibility = 'visible';
        fallbackCtaButton.style.zIndex = '1000'; // Ensure it's above everything else
        fallbackCtaButton.style.display = 'inline-flex'; // Explicitly set display
        console.log('Fallback CTA button found and made visible');
      }
    }
    
    const headlineElement = this.previewElement.querySelector('h2');
    const descriptionElement = this.previewElement.querySelector('p');
    const buttonTextElement = this.previewElement.querySelector('.cta-text');
    const arrowElement = this.previewElement.querySelector('.cta-arrow');
    
    // Preserve original positions to reset after capture
    if (headlineElement) {
      originalStyles.set(headlineElement, headlineElement.getAttribute('style') || '');
    }
    
    if (descriptionElement) {
      originalStyles.set(descriptionElement, descriptionElement.getAttribute('style') || '');
    }
    
    if (buttonTextElement) {
      originalStyles.set(buttonTextElement, buttonTextElement.getAttribute('style') || '');
      (buttonTextElement as HTMLElement).style.opacity = '1';
      (buttonTextElement as HTMLElement).style.visibility = 'visible';
      (buttonTextElement as HTMLElement).style.display = 'inline';
    }
    
    if (arrowElement) {
      originalStyles.set(arrowElement, arrowElement.getAttribute('style') || '');
      console.log('Arrow found, keeping it visible during rendering');
      const svgElement = arrowElement as SVGElement;
      svgElement.style.opacity = '1';
      svgElement.style.visibility = 'visible';
      svgElement.style.display = 'inline';
    }
    
    // Move text elements up for snapshot and keep them there
    // This ensures we capture at the right moment when texts are moved up
    const moveElementUp = (element: Element | null, pixels: number = 7) => {
      if (!element) return;
      
      const currentTransform = window.getComputedStyle(element).transform;
      
      if (currentTransform && currentTransform !== 'none') {
        (element as HTMLElement).style.transform = `${currentTransform} translateY(-${pixels}px)`;
      } else {
        (element as HTMLElement).style.transform = `translateY(-${pixels}px)`;
      }
      
      console.log(`Moved element up by ${pixels}px:`, element);
    };
    
    // Apply upward transform to elements
    moveElementUp(headlineElement);
    moveElementUp(descriptionElement);
    moveElementUp(buttonTextElement);
    
    // Don't move the arrow to ensure it points down correctly
    if (arrowElement) {
      console.log('Found arrow element, ensuring it points downward');
      const arrowSvg = arrowElement as SVGElement;
      arrowSvg.style.transform = 'rotate(0deg)'; // Ensure arrow points downward
    }
    
    // Make sure ALL CTA elements are visible
    const allCtaElements = this.previewElement.querySelectorAll('[data-cta-container], [data-cta-button], .cta-text, .cta-arrow, button:not([data-navigation-control])');
    allCtaElements.forEach(el => {
      if (el instanceof HTMLElement || el instanceof SVGElement) {
        el.style.opacity = '1';
        el.style.visibility = 'visible';
        el.style.display = 'inline-flex';
        el.style.zIndex = '1000';
      }
    });
    
    return () => {
      // Restore original styles
      originalStyles.forEach((originalStyle, element) => {
        if (element instanceof HTMLElement || element instanceof SVGElement) {
          element.setAttribute('style', originalStyle);
        }
      });
      
      console.log('Reset all elements to original styles');
    };
  }

  private async captureElement(): Promise<string> {
    if (!this.previewElement) {
      throw new Error('Preview element not found');
    }
    
    const startTime = performance.now();
    
    await this.waitForImages(2000);
    
    console.log(`Image waiting completed in ${performance.now() - startTime}ms`);

    console.log('Preparing for capture...');
    const resetEffect = await this.prepareForCapture();
    
    // Add a small delay to ensure DOM changes are applied before capture
    await new Promise(resolve => setTimeout(resolve, 100)); // Reduced from 150ms for smoother capture

    try {
      console.log('Using html2canvas...');
      
      // IMPORTANT: Force all elements to be visible before capture
      const ctaElements = this.previewElement.querySelectorAll(
        '[data-cta-container="true"], [data-cta-button="true"], .cta-text, .cta-arrow, button:not([data-navigation-control])'
      );
      
      ctaElements.forEach(el => {
        if (el instanceof HTMLElement || el instanceof SVGElement) {
          el.style.opacity = '1';
          el.style.visibility = 'visible';
          el.style.display = el.classList.contains('cta-text') ? 'inline' : 'flex';
          el.style.zIndex = '9999';
          el.style.pointerEvents = 'auto';
        }
      });
      
      // Make sure AdContent has proper z-index
      const adContent = this.previewElement.querySelector('.ad-content > div > div');
      if (adContent && adContent instanceof HTMLElement) {
        adContent.style.zIndex = '50';
      }
      
      // Fix absolute positioned elements
      const elementsToFixPosition = this.previewElement ? 
        Array.from(this.previewElement.querySelectorAll('.absolute, [style*="position: absolute"]')) : 
        [];
      
      const positionStyles = new Map<Element, { style: string, zIndex: string }>();
      
      elementsToFixPosition.forEach(el => {
        if (el instanceof HTMLElement) {
          positionStyles.set(el, { 
            style: el.getAttribute('style') || '',
            zIndex: el.style.zIndex
          });
          
          const computedStyle = window.getComputedStyle(el);
          
          // Don't change navigation controls
          if (!el.hasAttribute('data-navigation-control')) {
            el.style.zIndex = el === adContent ? '50' : '99';
          }
        }
      });

      // IMPORTANT: Preserve exact image position - fix for the jumpiness issue
      const imageElement = this.previewElement.querySelector('[data-preview-image="true"]');
      if (imageElement && imageElement instanceof HTMLImageElement) {
        // Save the original style first
        const originalStyle = imageElement.getAttribute('style') || '';
        positionStyles.set(imageElement, { 
          style: originalStyle,
          zIndex: imageElement.style.zIndex
        });
        
        // Preserve the EXACT position and transform of the image
        // THIS IS CRITICAL - DO NOT MODIFY THIS
        console.log('Preserving exact image position and transform during capture');
        const computedStyle = window.getComputedStyle(imageElement);
        
        // Only set these additional properties but DO NOT change position/transform
        imageElement.style.objectFit = 'cover';
        // DO NOT reset the width/height/position values
      }

      const htmlToCanvas = html2canvas as unknown as (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
      const canvas = await htmlToCanvas(this.previewElement, {
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
          // In the cloned document, ensure CTA is visible
          const clonedCtaContainer = documentClone.querySelector('[data-cta-container="true"]');
          const clonedCtaButton = documentClone.querySelector('[data-cta-button="true"]');
          const clonedNavControls = documentClone.querySelector('.absolute.inset-0.flex.items-center.justify-between.pointer-events-none.z-10');
          
          // Hide navigation controls in the clone
          if (clonedNavControls instanceof HTMLElement) {
            clonedNavControls.style.display = 'none';
          }
          
          // Show CTA elements in the clone
          if (clonedCtaContainer instanceof HTMLElement) {
            clonedCtaContainer.style.opacity = '1';
            clonedCtaContainer.style.visibility = 'visible';
            clonedCtaContainer.style.zIndex = '9999';
            clonedCtaContainer.style.display = 'flex';
          }
          
          if (clonedCtaButton instanceof HTMLElement) {
            clonedCtaButton.style.opacity = '1';
            clonedCtaButton.style.visibility = 'visible';
            clonedCtaButton.style.zIndex = '9999';
            clonedCtaButton.style.display = 'inline-flex';
          }
          
          // Explicitly handle the CTA Text and Arrow
          const ctaText = documentClone.querySelector('.cta-text');
          if (ctaText instanceof HTMLElement) {
            ctaText.style.opacity = '1';
            ctaText.style.visibility = 'visible';
            ctaText.style.display = 'inline';
          }
          
          const ctaArrow = documentClone.querySelector('.cta-arrow');
          if (ctaArrow instanceof HTMLElement || ctaArrow instanceof SVGElement) {
            ctaArrow.style.opacity = '1';
            ctaArrow.style.visibility = 'visible';
            ctaArrow.style.display = 'inline';
          }
          
          // CRITICAL: Preserve the EXACT same position for the image in the clone
          const imageElement = documentClone.querySelector('[data-preview-image="true"]');
          if (imageElement && imageElement instanceof HTMLImageElement) {
            // Only add object-fit but DO NOT change the position/transform
            imageElement.style.objectFit = 'cover';
            // DO NOT add any other styles that could affect positioning
          }
          
          // Hide only navigation controls, not the CTA
          const navigationControls = documentClone.querySelectorAll('[data-navigation-control]');
          navigationControls.forEach(control => {
            (control as HTMLElement).style.display = 'none';
          });
          
          // Copy fonts
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
      
      // Restore original positions
      elementsToFixPosition.forEach(el => {
        if (el instanceof HTMLElement) {
          const original = positionStyles.get(el);
          if (original) {
            el.setAttribute('style', original.style);
          }
        }
      });
      
      console.log('Resetting text positions and hover effect');
      resetEffect();
      
      this.lastCaptureTime = performance.now();
      return canvas.toDataURL('image/png', 0.9);
    } catch (html2canvasError) {
      console.warn('html2canvas failed, trying dom-to-image fallback:', html2canvasError);
      
      resetEffect();
      
      return this.fallbackCapture();
    }
  }

  private async fallbackCapture(): Promise<string> {
    if (!this.previewElement) {
      throw new Error('Preview element not found');
    }
    
    const startTime = performance.now();
    await this.waitForImages(1500);
    
    const resetEffect = await this.prepareForCapture();

    console.log('Using dom-to-image fallback...');
    const config = {
      quality: 0.9,
      scale: 2,
      bgcolor: null,
      style: {
        'transform-origin': 'top left',
      },
      imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    };

    try {
      const dataUrl = await domtoimage.toPng(this.previewElement, config);
      console.log(`Dom-to-image generated successfully in ${performance.now() - startTime}ms`);
      
      resetEffect();
      
      this.lastCaptureTime = performance.now();
      return dataUrl;
    } catch (error) {
      console.error('Fallback capture failed:', error);
      
      resetEffect();
      
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get canvas context');
        
        const rect = this.previewElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
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

  async getImageUrl(): Promise<string> {
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

    const now = performance.now();
    const timeSinceLastCapture = now - this.lastCaptureTime;
    
    if (timeSinceLastCapture < 500) {
      console.log(`Waiting ${500 - timeSinceLastCapture}ms before capture`);
      await new Promise(resolve => setTimeout(resolve, 500 - timeSinceLastCapture));
    }
    
    try {
      this.captureInProgress = true;
      const url = await this.captureElement();
      
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

