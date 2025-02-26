
import domtoimage from 'dom-to-image-more';
import html2canvas from 'html2canvas';

export class ImageGenerator {
  private previewElement: HTMLElement | null;

  constructor(previewSelector = '.ad-content') {
    this.previewElement = document.querySelector(previewSelector);
  }

  private async waitForImages(): Promise<void> {
    if (!this.previewElement) return;

    const images = Array.from(this.previewElement.getElementsByTagName('img'));
    const imagePromises = images.map(img => 
      new Promise<void>((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => {
            console.warn(`Failed to load image: ${img.src}`);
            resolve(); // Resolve anyway to continue with capture
          };
        }
      })
    );

    await Promise.all([
      ...imagePromises,
      document.fonts.ready,
      new Promise<void>(resolve => setTimeout(resolve, 500)) // Give the browser time to render
    ]);
  }

  private async captureElement(): Promise<string> {
    if (!this.previewElement) {
      throw new Error('Preview element not found');
    }

    await this.waitForImages();

    // Save original styles
    const originalStyles = new Map<Element, string>();
    const elementsToFixPosition = Array.from(this.previewElement.querySelectorAll('.absolute, [style*="position: absolute"]'));
    
    elementsToFixPosition.forEach(el => {
      originalStyles.set(el, el.getAttribute('style') || '');
      const computedStyle = window.getComputedStyle(el);
      const currentLeft = computedStyle.left;
      const currentTop = computedStyle.top;
      const currentTransform = computedStyle.transform;
      
      // Apply computed position directly
      el.setAttribute('style', `${el.getAttribute('style') || ''}; position: absolute; left: ${currentLeft}; top: ${currentTop}; transform: ${currentTransform};`);
    });

    try {
      console.log('Using html2canvas...');
      const canvas = await html2canvas(this.previewElement, {
        backgroundColor: null,
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        logging: true,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0
      });
      
      console.log('Canvas generated successfully');
      
      // Restore original styles
      elementsToFixPosition.forEach(el => {
        const original = originalStyles.get(el);
        if (original !== undefined) {
          el.setAttribute('style', original);
        }
      });
      
      return canvas.toDataURL('image/png', 1.0);
    } catch (html2canvasError) {
      console.warn('html2canvas failed, trying dom-to-image fallback:', html2canvasError);
      
      // Restore original styles before fallback
      elementsToFixPosition.forEach(el => {
        const original = originalStyles.get(el);
        if (original !== undefined) {
          el.setAttribute('style', original);
        }
      });
      
      return this.fallbackCapture();
    }
  }

  private async fallbackCapture(): Promise<string> {
    if (!this.previewElement) {
      throw new Error('Preview element not found');
    }

    await this.waitForImages();

    console.log('Using dom-to-image fallback...');
    const config = {
      quality: 1.0,
      scale: 2, // Higher scale for better quality
      bgcolor: null,
      style: {
        'transform-origin': 'top left',
      },
      imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    };

    try {
      // Fix for cross-origin images
      const images = Array.from(this.previewElement.querySelectorAll('img[src^="http"]'));
      for (const img of images) {
        try {
          const response = await fetch(img.getAttribute('src') || '', { mode: 'cors' });
          const blob = await response.blob();
          const dataUrl = await new Promise<string>(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          img.setAttribute('src', dataUrl);
        } catch (err) {
          console.warn('Could not convert image URL:', err);
        }
      }
      
      const dataUrl = await domtoimage.toPng(this.previewElement, config);
      console.log('Dom-to-image generated successfully');
      return dataUrl;
    } catch (error) {
      console.error('Fallback capture failed:', error);
      
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

  async downloadImage(filename = 'ad-preview.png'): Promise<void> {
    try {
      console.log('Starting download process...');
      const dataUrl = await this.captureElement();
      
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

  async getImageUrl(): Promise<string> {
    try {
      return await this.captureElement();
    } catch (error) {
      console.error('Error getting image URL:', error);
      throw error;
    }
  }
}
