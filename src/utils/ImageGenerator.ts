
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
    
    const computedStyle = window.getComputedStyle(this.previewElement);
    
    Object.assign(clone.style, {
      position: 'absolute',
      left: '-9999px',
      top: '-9999px',
      width: `${this.previewElement.offsetWidth}px`,
      height: `${this.previewElement.offsetHeight}px`,
      transform: 'none',
      transformOrigin: 'top left',
      margin: '0',
      padding: '0',
      border: 'none',
      backgroundColor: computedStyle.backgroundColor,
      display: 'block'
    });

    // העתקת סגנונות לכל האלמנטים בתוך הקלון
    const cloneElements = clone.getElementsByTagName('*');
    const originalElements = this.previewElement.getElementsByTagName('*');

    for (let i = 0; i < cloneElements.length; i++) {
      const cloneElement = cloneElements[i] as HTMLElement;
      const originalElement = originalElements[i] as HTMLElement;
      
      if (originalElement) {
        const style = window.getComputedStyle(originalElement);
        cloneElement.style.position = style.position;
        cloneElement.style.transform = style.transform;
        cloneElement.style.top = style.top;
        cloneElement.style.left = style.left;
        cloneElement.style.width = style.width;
        cloneElement.style.height = style.height;
        cloneElement.style.margin = '0';
        cloneElement.style.padding = style.padding;
        cloneElement.style.border = style.border;
        cloneElement.style.opacity = '1';
        cloneElement.style.visibility = 'visible';
        cloneElement.style.display = style.display;
      }
    }

    return clone;
  }

  async generateHighQualityImage() {
    if (!this.previewElement) {
      throw new Error('Preview element not found');
    }

    await Promise.all([
      document.fonts.ready,
      new Promise(resolve => setTimeout(resolve, 1000))
    ]);

    const clone = this.createClone();
    clone.classList.add('capturing');

    try {
      console.log('Starting image generation...');
      const options = {
        backgroundColor: null,
        scale: this.pixelRatio * 2,
        useCORS: true,
        allowTaint: true,
        logging: true,
        imageTimeout: 0,
        removeContainer: true,
        foreignObjectRendering: true,
        x: 0,
        y: 0,
        width: this.previewElement.offsetWidth,
        height: this.previewElement.offsetHeight,
        onclone: (clonedDoc: Document) => {
          console.log('Cloning document...');
          const clonedElement = clonedDoc.querySelector('.ad-content') as HTMLElement;
          if (clonedElement) {
            const elements = clonedElement.getElementsByTagName('*');
            for (let i = 0; i < elements.length; i++) {
              const elem = elements[i] as HTMLElement;
              elem.style.opacity = '1';
              elem.style.visibility = 'visible';
            }
          }
          return Promise.resolve();
        }
      };

      try {
        console.log('Using html2canvas...');
        const canvas = await html2canvas(clone, options);
        console.log('Canvas generated successfully');
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        return dataUrl;
      } catch (html2canvasError) {
        console.warn('html2canvas failed, trying dom-to-image fallback:', html2canvasError);
        return this.fallbackCapture(clone);
      } finally {
        if (clone.parentNode) {
          document.body.removeChild(clone);
        }
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
      console.log('Using dom-to-image fallback...');
      const config = {
        quality: 1.0,
        scale: this.pixelRatio * 2,
        width: clone.offsetWidth,
        height: clone.offsetHeight,
        style: {
          transform: 'none',
          transformOrigin: 'top left',
          width: `${clone.offsetWidth}px`,
          height: `${clone.offsetHeight}px`
        },
        filter: (node: Element) => {
          return !['SCRIPT', 'STYLE'].includes(node.tagName);
        }
      };

      const dataUrl = await domtoimage.toPng(clone, config);
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
      const dataUrl = await this.generateHighQualityImage();
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
      return await this.generateHighQualityImage();
    } catch (error) {
      console.error('Error getting image URL:', error);
      throw error;
    }
  }
}
