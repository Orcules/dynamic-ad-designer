
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
      new Promise<void>(resolve => setTimeout(resolve, 1000)) // Increased timeout
    ]);
  }

  private async captureElement(): Promise<string> {
    if (!this.previewElement) {
      throw new Error('Preview element not found');
    }

    await this.waitForImages();

    const ctaText = this.previewElement.querySelector('button span span');
    if (ctaText) {
      ctaText.classList.add('translate-y-[-8px]');
    }

    // Convert any blob URLs to data URLs before capture
    const images = Array.from(this.previewElement.getElementsByTagName('img'));
    const originalSrcs = new Map<HTMLImageElement, string>();

    for (const img of images) {
      if (img.src.startsWith('blob:')) {
        originalSrcs.set(img, img.src);
        try {
          const response = await fetch(img.src);
          const blob = await response.blob();
          const reader = new FileReader();
          await new Promise<void>((resolve) => {
            reader.onload = () => {
              img.src = reader.result as string;
              resolve();
            };
            reader.onerror = () => {
              console.warn(`Failed to read blob: ${img.src}`);
              resolve();
            };
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.warn(`Failed to convert blob URL: ${img.src}`, error);
        }
      }
    }

    const options = {
      backgroundColor: null as null,
      scale: 1,
      useCORS: true,
      allowTaint: true,
      logging: true,
      width: this.previewElement.offsetWidth,
      height: this.previewElement.offsetHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: this.previewElement.offsetWidth,
      windowHeight: this.previewElement.offsetHeight,
      x: 0,
      y: 0,
      imageTimeout: 5000, // Increased timeout for image loading
      foreignObjectRendering: true
    };

    try {
      console.log('Using html2canvas...');
      const canvas = await html2canvas(this.previewElement, options);
      console.log('Canvas generated successfully');

      // Restore original image sources
      images.forEach(img => {
        const originalSrc = originalSrcs.get(img);
        if (originalSrc) {
          img.src = originalSrc;
        }
      });

      if (ctaText) {
        ctaText.classList.remove('translate-y-[-8px]');
      }

      return canvas.toDataURL('image/png', 1.0);
    } catch (html2canvasError) {
      console.warn('html2canvas failed, trying dom-to-image fallback:', html2canvasError);
      
      if (ctaText) {
        ctaText.classList.remove('translate-y-[-8px]');
      }

      // Restore original image sources before fallback
      images.forEach(img => {
        const originalSrc = originalSrcs.get(img);
        if (originalSrc) {
          img.src = originalSrc;
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

    const ctaText = this.previewElement.querySelector('button span span');
    if (ctaText) {
      ctaText.classList.add('translate-y-[-8px]');
    }

    console.log('Using dom-to-image fallback...');
    const config = {
      quality: 1.0,
      scale: 1,
      width: this.previewElement.offsetWidth,
      height: this.previewElement.offsetHeight,
      style: {
        transform: 'none',
        transformOrigin: 'top left',
        width: '100%',
        height: '100%'
      },
      imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    };

    try {
      const dataUrl = await domtoimage.toPng(this.previewElement, config);
      console.log('Dom-to-image generated successfully');
      
      if (ctaText) {
        ctaText.classList.remove('translate-y-[-8px]');
      }

      return dataUrl;
    } catch (error) {
      if (ctaText) {
        ctaText.classList.remove('translate-y-[-8px]');
      }

      console.error('Fallback capture failed:', error);
      throw error;
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
