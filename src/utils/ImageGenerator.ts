
import domtoimage from 'dom-to-image-more';
import html2canvas from 'html2canvas';

export class ImageGenerator {
  private previewElement: HTMLElement | null;

  constructor(previewSelector = '.ad-content') {
    this.previewElement = document.querySelector(previewSelector);
  }

  private async captureElement(): Promise<string> {
    if (!this.previewElement) {
      throw new Error('Preview element not found');
    }

    await Promise.all([
      document.fonts.ready,
      new Promise(resolve => setTimeout(resolve, 500))
    ]);

    try {
      console.log('Using html2canvas...');
      const canvas = await html2canvas(this.previewElement, {
        backgroundColor: null,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        logging: true,
        imageTimeout: 15000, // Increase timeout for image loading
        width: this.previewElement.offsetWidth,
        height: this.previewElement.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: this.previewElement.offsetWidth,
        windowHeight: this.previewElement.offsetHeight,
        x: 0,
        y: 0,
        proxy: 'https://corsproxy.io/?', // Add CORS proxy
      });

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

    try {
      const dataUrl = await domtoimage.toPng(this.previewElement, {
        quality: 1.0,
        scale: 1,
        imagePlaceholder: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        cacheBust: true,
        width: this.previewElement.offsetWidth,
        height: this.previewElement.offsetHeight,
        style: {
          transform: 'none',
          transformOrigin: 'top left',
          width: '100%',
          height: '100%'
        }
      });

      return dataUrl;
    } catch (error) {
      console.error('Fallback capture failed:', error);
      throw error;
    }
  }

  async getImageUrl(): Promise<string> {
    try {
      const dataUrl = await this.captureElement();
      return dataUrl;
    } catch (error) {
      console.error('Error getting image URL:', error);
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
}
