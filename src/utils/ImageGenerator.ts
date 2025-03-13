
import domtoimage from 'dom-to-image-more';
import html2canvas from 'html2canvas';

export class ImageGenerator {
  private previewElement: HTMLElement | null;
  private captureInProgress: boolean = false;

  constructor(previewSelector = '.ad-content') {
    this.previewElement = document.querySelector(previewSelector);
  }

  private async waitForImages(maxWaitTime = 1000): Promise<void> {
    if (!this.previewElement) return;

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
          img.onerror = () => resolve();
          setTimeout(() => resolve(), 500);
        }
      })
    );

    await Promise.race([
      Promise.all([...imagePromises, document.fonts.ready]),
      new Promise<void>(resolve => setTimeout(resolve, maxWaitTime))
    ]);
  }

  private async prepareForCapture(): Promise<(() => void)> {
    if (!this.previewElement) {
      return () => {};
    }

    // Hide navigation controls
    const navigationControls = this.previewElement.querySelector('.absolute.inset-0.flex.items-center.justify-between.pointer-events-none.z-10');
    const navigationButtons = this.previewElement.querySelectorAll('[data-navigation-control]');
    
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

    // Make sure CTA elements are visible
    const ctaContainer = this.previewElement.querySelector('[data-cta-container="true"]');
    const ctaButton = this.previewElement.querySelector('[data-cta-button="true"]');
    
    if (ctaContainer && ctaContainer instanceof HTMLElement) {
      originalStyles.set(ctaContainer, ctaContainer.getAttribute('style') || '');
      ctaContainer.style.opacity = '1';
      ctaContainer.style.visibility = 'visible';
    }
    
    if (ctaButton && ctaButton instanceof HTMLElement) {
      originalStyles.set(ctaButton, ctaButton.getAttribute('style') || '');
      ctaButton.style.opacity = '1';
      ctaButton.style.visibility = 'visible';
    }

    return () => {
      // Restore original styles
      originalStyles.forEach((originalStyle, element) => {
        if (element instanceof HTMLElement || element instanceof SVGElement) {
          element.setAttribute('style', originalStyle);
        }
      });
    };
  }

  private async captureElement(): Promise<string> {
    if (!this.previewElement) {
      throw new Error('Preview element not found');
    }
    
    await this.waitForImages();
    const resetEffect = await this.prepareForCapture();

    try {
      const canvas = await html2canvas(this.previewElement, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        onclone: (documentClone) => {
          // Hide navigation controls in the clone
          const clonedNavControls = documentClone.querySelector('.absolute.inset-0.flex.items-center.justify-between.pointer-events-none.z-10');
          if (clonedNavControls instanceof HTMLElement) {
            clonedNavControls.style.display = 'none';
          }
          
          // Show CTA elements in the clone
          const clonedCtaContainer = documentClone.querySelector('[data-cta-container="true"]');
          const clonedCtaButton = documentClone.querySelector('[data-cta-button="true"]');
          
          if (clonedCtaContainer instanceof HTMLElement) {
            clonedCtaContainer.style.opacity = '1';
            clonedCtaContainer.style.visibility = 'visible';
          }
          
          if (clonedCtaButton instanceof HTMLElement) {
            clonedCtaButton.style.opacity = '1';
            clonedCtaButton.style.visibility = 'visible';
          }
        }
      });
      
      resetEffect();
      return canvas.toDataURL('image/png', 0.9);
    } catch (error) {
      console.warn('html2canvas failed, trying dom-to-image fallback:', error);
      resetEffect();
      return this.fallbackCapture();
    }
  }

  private async fallbackCapture(): Promise<string> {
    if (!this.previewElement) {
      throw new Error('Preview element not found');
    }
    
    await this.waitForImages();
    const resetEffect = await this.prepareForCapture();

    try {
      const dataUrl = await domtoimage.toPng(this.previewElement, {
        quality: 0.9,
        scale: 2,
        bgcolor: null,
      });
      
      resetEffect();
      return dataUrl;
    } catch (error) {
      console.error('Fallback capture failed:', error);
      resetEffect();
      
      // Create a simple canvas with error message
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
    }
  }

  async getImageUrl(): Promise<string> {
    if (this.captureInProgress) {
      return new Promise((_, reject) => {
        reject(new Error('Capture already in progress'));
      });
    }

    try {
      this.captureInProgress = true;
      const url = await this.captureElement();
      this.captureInProgress = false;
      return url;
    } catch (error) {
      this.captureInProgress = false;
      console.error('Error getting image URL:', error);
      throw error;
    }
  }

  async downloadImage(filename = 'ad-preview.png'): Promise<void> {
    try {
      const dataUrl = await this.getImageUrl();
      
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
      throw error;
    }
  }
}
