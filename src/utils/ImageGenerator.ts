
import domtoimage from 'dom-to-image-more';
import html2canvas from 'html2canvas';

export class ImageGenerator {
  private previewElement: HTMLElement | null;

  constructor(previewSelector = '.ad-content') {
    this.previewElement = document.querySelector(previewSelector);
  }

  private getElementDimensions() {
    if (!this.previewElement) {
      throw new Error('Preview element not found');
    }
    
    const rect = this.previewElement.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(this.previewElement);
    const aspectRatio = computedStyle.aspectRatio || '1.91';
    const [widthRatio, heightRatio] = aspectRatio.split('/').map(Number);
    
    // קובע את הגודל הרצוי לפי היחס המקורי
    const targetWidth = 1200; // רוחב קבוע
    const targetHeight = Math.round(targetWidth * (heightRatio / widthRatio));
    
    return {
      width: targetWidth,
      height: targetHeight,
      scale: targetWidth / rect.width
    };
  }

  private async captureElement(): Promise<string> {
    if (!this.previewElement) {
      throw new Error('Preview element not found');
    }

    await Promise.all([
      document.fonts.ready,
      new Promise(resolve => setTimeout(resolve, 500))
    ]);

    // מעתיק את האלמנט כדי לא לשנות את המקורי
    const clonedElement = this.previewElement.cloneNode(true) as HTMLElement;
    document.body.appendChild(clonedElement);
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = '-9999px';
    clonedElement.style.top = '-9999px';

    const { width, height, scale } = this.getElementDimensions();

    try {
      console.log('Using html2canvas with dimensions:', { width, height, scale });
      const canvas = await html2canvas(clonedElement, {
        backgroundColor: null,
        scale: scale,
        useCORS: true,
        allowTaint: true,
        logging: true,
        width: width,
        height: height,
        scrollX: -window.scrollX,
        scrollY: -window.scrollY
      });
      
      document.body.removeChild(clonedElement);
      console.log('Canvas generated successfully');
      return canvas.toDataURL('image/png', 1.0);
    } catch (html2canvasError) {
      console.warn('html2canvas failed, trying dom-to-image fallback:', html2canvasError);
      document.body.removeChild(clonedElement);
      return this.fallbackCapture();
    }
  }

  private async fallbackCapture(): Promise<string> {
    if (!this.previewElement) {
      throw new Error('Preview element not found');
    }

    // מעתיק את האלמנט כדי לא לשנות את המקורי
    const clonedElement = this.previewElement.cloneNode(true) as HTMLElement;
    document.body.appendChild(clonedElement);
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = '-9999px';
    clonedElement.style.top = '-9999px';

    const { width, height, scale } = this.getElementDimensions();

    console.log('Using dom-to-image fallback with dimensions:', { width, height, scale });
    
    try {
      const dataUrl = await domtoimage.toPng(clonedElement, {
        quality: 1.0,
        width: width,
        height: height,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: `${width}px`,
          height: `${height}px`
        }
      });
      
      document.body.removeChild(clonedElement);
      console.log('Dom-to-image generated successfully');
      return dataUrl;
    } catch (error) {
      document.body.removeChild(clonedElement);
      console.error('Fallback capture failed:', error);
      throw error;
    }
  }

  async downloadImage(filename = 'ad-preview.png') {
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

  async getImageUrl() {
    try {
      return await this.captureElement();
    } catch (error) {
      console.error('Error getting image URL:', error);
      throw error;
    }
  }
}
