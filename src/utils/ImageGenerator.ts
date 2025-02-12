
import domtoimage from 'dom-to-image-more';

export class ImageGenerator {
  private previewElement: HTMLElement | null;
  private quality: number;
  private scale: number;

  constructor(previewSelector = '.ad-content') {
    this.previewElement = document.querySelector(previewSelector);
    this.quality = 1.0;
    this.scale = 2;
  }

  async generateHighQualityImage() {
    if (!this.previewElement) {
      throw new Error('Preview element not found');
    }

    try {
      await this.waitForImages();
      
      const config = {
        quality: this.quality,
        scale: this.scale,
        style: {
          transform: `scale(${this.scale})`,
          transformOrigin: 'top left',
          width: this.previewElement.offsetWidth + "px",
          height: this.previewElement.offsetHeight + "px"
        },
        filter: (node: Element) => {
          return node.tagName !== 'I';
        }
      };

      const dataUrl = await domtoimage.toPng(this.previewElement, config);
      return dataUrl;
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  }

  private async waitForImages() {
    if (!this.previewElement) return;

    const images = Array.from(this.previewElement.getElementsByTagName('img'));
    const imagePromises = images.map(img => {
      if (img.complete) {
        return Promise.resolve();
      }
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    });
    await Promise.all(imagePromises);
  }

  async downloadImage(filename = 'ad-preview.png') {
    try {
      const dataUrl = await this.generateHighQualityImage();
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
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
