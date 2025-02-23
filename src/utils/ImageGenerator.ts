
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

    const { width, height, scale } = this.getElementDimensions();

    const options = {
      backgroundColor: null,
      scale: scale,
      useCORS: true,
      allowTaint: true,
      logging: true,
      width: width,
      height: height,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
      windowWidth: width,
      windowHeight: height
    };

    try {
      console.log('Using html2canvas with dimensions:', { width, height, scale });
      const canvas = await html2canvas(this.previewElement, options);
      console.log('Canvas generated successfully');
      return canvas.toDataURL('image/png', 1.0);
    } catch (html2canvasError) {
      console.warn('html2canvas failed, trying dom-to-image fallback:', html2canvasError);
      return this.fallbackCapture();
    }
  }

  private async fallbackCapture(): Promise<string> {
    if (!this.previewElement) {
      throw new Error('Preview element not found');
    }

    const { width, height, scale } = this.getElementDimensions();

    console.log('Using dom-to-image fallback with dimensions:', { width, height, scale });
    const config = {
      quality: 1.0,
      width: width,
      height: height,
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: `${width}px`,
        height: `${height}px`
      }
    };

    try {
      const dataUrl = await domtoimage.toPng(this.previewElement, config);
      console.log('Dom-to-image generated successfully');
      return dataUrl;
    } catch (error) {
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
