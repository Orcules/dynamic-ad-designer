
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

    const rect = this.previewElement.getBoundingClientRect();
    const clone = this.previewElement.cloneNode(true) as HTMLElement;
    document.body.appendChild(clone);
    
    // Apply base styles to clone
    const computedStyle = window.getComputedStyle(this.previewElement);
    Object.assign(clone.style, {
      position: 'fixed',
      left: '0',
      top: '0',
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      transform: 'none',
      margin: '0',
      padding: '0',
      border: 'none',
      display: 'block',
      background: computedStyle.background,
      opacity: '1',
      visibility: 'visible'
    });

    // Apply styles to all child elements
    const applyStyles = (element: HTMLElement, originalElement: HTMLElement) => {
      const style = window.getComputedStyle(originalElement);
      const originalRect = originalElement.getBoundingClientRect();
      
      element.style.position = style.position;
      element.style.top = `${originalRect.top - rect.top}px`;
      element.style.left = `${originalRect.left - rect.left}px`;
      element.style.width = `${originalRect.width}px`;
      element.style.height = `${originalRect.height}px`;
      element.style.transform = style.transform;
      element.style.margin = '0';
      element.style.padding = style.padding;
      element.style.border = style.border;
      element.style.opacity = '1';
      element.style.visibility = 'visible';
      element.style.display = style.display;
      element.style.zIndex = style.zIndex;
      element.style.backgroundColor = style.backgroundColor;
      element.style.color = style.color;
      element.style.fontSize = style.fontSize;
      element.style.fontFamily = style.fontFamily;
      element.style.textAlign = style.textAlign;
      element.style.lineHeight = style.lineHeight;
    };

    // Apply styles recursively
    const processElement = (element: HTMLElement, originalElement: HTMLElement) => {
      applyStyles(element, originalElement);
      const children = element.children;
      const originalChildren = originalElement.children;
      for (let i = 0; i < children.length; i++) {
        if (originalChildren[i]) {
          processElement(children[i] as HTMLElement, originalChildren[i] as HTMLElement);
        }
      }
    };

    processElement(clone, this.previewElement);
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

    try {
      console.log('Starting image generation...');
      const rect = this.previewElement.getBoundingClientRect();
      const options = {
        backgroundColor: null,
        scale: this.pixelRatio * 2,
        useCORS: true,
        allowTaint: true,
        logging: true,
        width: rect.width,
        height: rect.height,
        scrollX: 0,
        scrollY: 0,
        windowWidth: rect.width,
        windowHeight: rect.height,
        x: 0,
        y: 0,
        onclone: (clonedDoc: Document) => {
          console.log('Cloning document...');
          return Promise.resolve();
        }
      };

      try {
        console.log('Using html2canvas...');
        const canvas = await html2canvas(clone, options);
        console.log('Canvas generated successfully');
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
      console.log('Using dom-to-image fallback...');
      const rect = this.previewElement!.getBoundingClientRect();
      const config = {
        quality: 1.0,
        scale: this.pixelRatio * 2,
        width: rect.width,
        height: rect.height,
        style: {
          transform: 'none',
          transformOrigin: 'top left',
          width: `${rect.width}px`,
          height: `${rect.height}px`
        },
        filter: (node: Element) => {
          return !['SCRIPT', 'STYLE'].includes(node.tagName);
        }
      };

      const dataUrl = await domtoimage.toPng(clone, config);
      if (clone.parentNode) {
        document.body.removeChild(clone);
      }
      console.log('Dom-to-image generated successfully');
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
