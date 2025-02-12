
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
      
      // Get computed styles
      const computedStyle = window.getComputedStyle(this.previewElement);
      const width = this.previewElement.offsetWidth;
      const height = this.previewElement.offsetHeight;
      
      // Clone the element to maintain exact styling
      const clone = this.previewElement.cloneNode(true) as HTMLElement;
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '-9999px';
      document.body.appendChild(clone);

      // Apply all computed styles
      const config = {
        quality: this.quality,
        scale: this.scale,
        width: width,
        height: height,
        style: {
          transform: `scale(${this.scale})`,
          transformOrigin: 'top left',
          width: width + "px",
          height: height + "px",
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

      // Ensure fonts are loaded
      await document.fonts.ready;
      
      // Generate the image
      const dataUrl = await domtoimage.toPng(this.previewElement, config);
      
      // Clean up
      document.body.removeChild(clone);
      
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
