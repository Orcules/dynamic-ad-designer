
import domtoimage from 'dom-to-image-more';
import html2canvas from 'html2canvas';

export class ImageGenerator {
  private previewElement: HTMLElement | null;
  private pixelRatio: number;

  constructor(previewSelector = '.ad-content') {
    this.previewElement = document.querySelector(previewSelector);
    this.pixelRatio = window.devicePixelRatio || 1;
  }

  private createClone(): HTMLElement {
    if (!this.previewElement) {
      throw new Error('Preview element not found');
    }

    const clone = this.previewElement.cloneNode(true) as HTMLElement;
    document.body.appendChild(clone);
    
    // Apply computed styles from the original element
    const computedStyle = window.getComputedStyle(this.previewElement);
    
    Object.assign(clone.style, {
      position: 'absolute',
      left: '-9999px',
      top: '-9999px',
      width: `${this.previewElement.offsetWidth}px`,
      height: `${this.previewElement.offsetHeight}px`,
      transform: 'none',
      transformOrigin: 'top left',
      margin: computedStyle.margin,
      padding: computedStyle.padding,
      border: computedStyle.border,
      backgroundColor: computedStyle.backgroundColor,
      display: 'block',
      opacity: '1',
      visibility: 'visible'
    });

    // בשונה מהקוד הקודם, אנחנו נעתיק את המיקומים המדויקים של כל האלמנטים
    clone.querySelectorAll('*').forEach((el: Element) => {
      const originalEl = this.previewElement?.querySelector(`[data-id="${el.getAttribute('data-id')}"]`);
      if (originalEl) {
        const originalStyle = window.getComputedStyle(originalEl);
        const transformValue = originalStyle.transform;
        (el as HTMLElement).style.transform = transformValue;
      }
      (el as HTMLElement).style.opacity = '1';
      (el as HTMLElement).style.visibility = 'visible';
    });

    return clone;
  }

  async generateHighQualityImage() {
    if (!this.previewElement) {
      throw new Error('Preview element not found');
    }

    // Wait for fonts and images to load
    await Promise.all([
      document.fonts.ready,
      new Promise(resolve => setTimeout(resolve, 500))
    ]);

    // Create a clone for capturing
    const clone = this.createClone();
    clone.classList.add('capturing');

    try {
      // Configure html2canvas options with better quality settings
      const options = {
        backgroundColor: null,
        scale: this.pixelRatio * 2,
        useCORS: true,
        allowTaint: true,
        logging: true,
        imageTimeout: 0,
        removeContainer: false,
        foreignObjectRendering: true, // Enable foreign object rendering
        x: 0,
        y: 0,
        width: this.previewElement.offsetWidth,
        height: this.previewElement.offsetHeight,
        onclone: (clonedDoc: Document) => {
          const clonedElement = clonedDoc.querySelector('.ad-content') as HTMLElement;
          if (clonedElement) {
            // שמירה על המיקומים המקוריים של האלמנטים
            clonedElement.querySelectorAll('[style*="transform"]').forEach((el) => {
              const originalTransform = (el as HTMLElement).style.transform;
              (el as HTMLElement).style.transform = originalTransform;
            });
          }
          return Promise.resolve();
        }
      };

      try {
        const canvas = await html2canvas(clone, options);
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        document.body.removeChild(clone);
        return dataUrl;
      } catch (html2canvasError) {
        console.warn('html2canvas failed, trying dom-to-image fallback:', html2canvasError);
        return this.fallbackCapture(clone);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      if (clone.parentNode) {
        document.body.removeChild(clone);
      }
      throw error;
    }
  }

  private async fallbackCapture(clone: HTMLElement): Promise<string> {
    try {
      const computedStyle = window.getComputedStyle(this.previewElement!);
      
      const config = {
        quality: 1.0,
        scale: this.pixelRatio * 2,
        width: clone.offsetWidth,
        height: clone.offsetHeight,
        style: {
          transform: 'none',
          transformOrigin: 'top left',
          width: `${clone.offsetWidth}px`,
          height: `${clone.offsetHeight}px`,
          margin: '0',
          padding: computedStyle.padding,
          border: computedStyle.border,
          borderRadius: computedStyle.borderRadius,
          backgroundColor: computedStyle.backgroundColor,
          boxShadow: computedStyle.boxShadow
        },
        filter: (node: Element) => {
          const exclusions = ['I', 'IFRAME', 'SCRIPT'];
          return !exclusions.includes(node.tagName);
        }
      };

      const dataUrl = await domtoimage.toPng(clone, config);
      document.body.removeChild(clone);
      return dataUrl;
    } catch (error) {
      console.error('Fallback capture failed:', error);
      if (clone.parentNode) {
        document.body.removeChild(clone);
      }
      throw error;
    }
  }

  async downloadImage(filename = 'ad-preview.png') {
    try {
      const dataUrl = await this.generateHighQualityImage();
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

  async getImageUrl() {
    try {
      return await this.generateHighQualityImage();
    } catch (error) {
      console.error('Error getting image URL:', error);
      throw error;
    }
  }
}
