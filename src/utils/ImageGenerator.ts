
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
          }, 1500);
        }
      })
    );

    await Promise.race([
      Promise.all([
        ...imagePromises,
        document.fonts.ready,
        new Promise<void>(resolve => setTimeout(resolve, 300))
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

    // Hide navigation buttons only, not the CTA button
    const navigationButtons = this.previewElement.querySelectorAll('.ad-content > div > div > [class*="absolute inset-0"] button');
    const originalButtonStyles = new Map<Element, string>();
    
    navigationButtons.forEach(button => {
      originalButtonStyles.set(button, (button as HTMLElement).style.display);
      (button as HTMLElement).style.display = 'none';
    });

    // Find the CTA button and ensure it's visible
    const ctaContainer = this.previewElement.querySelector('[data-cta-container="true"]');
    const ctaButton = this.previewElement.querySelector('[data-cta-button="true"]');
    
    if (ctaContainer && ctaContainer instanceof HTMLElement) {
      ctaContainer.style.opacity = '1';
      ctaContainer.style.visibility = 'visible';
      console.log('CTA container found and made visible');
    }
    
    if (ctaButton && ctaButton instanceof HTMLElement) {
      ctaButton.style.opacity = '1';
      ctaButton.style.visibility = 'visible';
      console.log('CTA button found and made visible');
    } else {
      console.log('CTA button not found, using fallback selector');
      // Try fallback selector
      const fallbackCtaButton = this.previewElement.querySelector('button');
      if (fallbackCtaButton && fallbackCtaButton instanceof HTMLElement) {
        fallbackCtaButton.style.opacity = '1';
        fallbackCtaButton.style.visibility = 'visible';
        console.log('Fallback CTA button found and made visible');
      }
    }
    
    const headlineElement = this.previewElement.querySelector('h2');
    const descriptionElement = this.previewElement.querySelector('p');
    const buttonTextElement = ctaButton instanceof HTMLElement ? 
      ctaButton.querySelector('.cta-text') : 
      this.previewElement.querySelector('.cta-text');
    
    const arrowElement = ctaButton instanceof HTMLElement ? 
      ctaButton.querySelector('.cta-arrow') : 
      this.previewElement.querySelector('.cta-arrow');
    
    const originalPositions = new Map<Element, string>();
    
    const moveElementUp = (element: Element | null, pixels: number = 7) => {
      if (!element) return;
      
      const currentTransform = window.getComputedStyle(element).transform;
      originalPositions.set(element, currentTransform);
      
      if (currentTransform && currentTransform !== 'none') {
        (element as HTMLElement).style.transform = `${currentTransform} translateY(-${pixels}px)`;
      } else {
        (element as HTMLElement).style.transform = `translateY(-${pixels}px)`;
      }
      
      console.log(`Moved element up by ${pixels}px:`, element);
    };
    
    moveElementUp(headlineElement);
    moveElementUp(descriptionElement);
    moveElementUp(buttonTextElement);
    
    if (arrowElement) {
      console.log('Arrow found, keeping it static during rendering');
      const svgElement = arrowElement as SVGElement;
      originalPositions.set(svgElement, svgElement.style.transform);
    }
    
    return () => {
      originalPositions.forEach((originalTransform, element) => {
        if (element instanceof SVGElement || element instanceof HTMLElement) {
          element.style.transform = originalTransform;
        }
      });
      
      navigationButtons.forEach(button => {
        const originalStyle = originalButtonStyles.get(button);
        if (originalStyle !== undefined && button instanceof HTMLElement) {
          button.style.display = originalStyle;
        }
      });
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
    
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      console.log('Using html2canvas...');
      
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
        
        el.setAttribute('style', `${el.getAttribute('style') || ''}; position: absolute; left: ${currentLeft}; top: ${currentTop}; transform: ${currentTransform};`);
      });

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
          const navigationControls = documentClone.querySelectorAll('.ad-content button[class*="-translate-x-full"], .ad-content button[class*="translate-x-full"]');
          navigationControls.forEach(control => {
            (control as HTMLElement).style.display = 'none';
          });
          
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
      
      elementsToFixPosition.forEach(el => {
        const original = originalStyles.get(el);
        if (original !== undefined) {
          el.setAttribute('style', original);
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
