
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
    
    // יצירת מיכל זמני
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '0';
    container.style.top = '0';
    container.style.width = `${rect.width}px`;
    container.style.height = `${rect.height}px`;
    container.style.overflow = 'hidden';
    container.style.zIndex = '-9999';
    container.style.background = 'transparent';
    container.appendChild(clone);
    document.body.appendChild(container);
    
    // Apply base styles to clone
    Object.assign(clone.style, {
      position: 'absolute',
      left: '0',
      top: '0',
      width: '100%',
      height: '100%',
      transform: 'none',
      margin: '0',
      padding: '0',
      border: 'none',
      display: 'block',
      opacity: '1',
      visibility: 'visible',
      background: 'transparent',
      pointerEvents: 'none'
    });

    // Apply styles to all child elements
    const processElements = (originalParent: Element, cloneParent: Element) => {
      const originalChildren = originalParent.children;
      const cloneChildren = cloneParent.children;

      for (let i = 0; i < originalChildren.length; i++) {
        const originalChild = originalChildren[i] as HTMLElement;
        const cloneChild = cloneChildren[i] as HTMLElement;

        if (originalChild && cloneChild) {
          const computedStyle = window.getComputedStyle(originalChild);
          const originalRect = originalChild.getBoundingClientRect();
          const relativeTop = originalRect.top - rect.top;
          const relativeLeft = originalRect.left - rect.left;

          // שמירה על המיקום המקורי של האלמנט
          cloneChild.style.cssText = computedStyle.cssText;
          Object.assign(cloneChild.style, {
            position: 'absolute',
            top: `${relativeTop}px`,
            left: `${relativeLeft}px`,
            width: `${originalRect.width}px`,
            height: `${originalRect.height}px`,
            transform: 'none',
            margin: '0',
            opacity: '1',
            visibility: 'visible',
            pointerEvents: 'none',
            overflow: 'visible',
            zIndex: 'auto'
          });

          // העתקת תוכן טקסטואלי
          if (originalChild.tagName === 'H2' || originalChild.tagName === 'P' || originalChild.tagName === 'BUTTON' || originalChild.tagName === 'SPAN') {
            cloneChild.textContent = originalChild.textContent;
          }

          // Recursively process children
          processElements(originalChild, cloneChild);
        }
      }
    };

    processElements(this.previewElement, clone);
    return container;
  }

  async generateHighQualityImage() {
    if (!this.previewElement) {
      throw new Error('Preview element not found');
    }

    await Promise.all([
      document.fonts.ready,
      new Promise(resolve => setTimeout(resolve, 1000))
    ]);

    const container = this.createClone();

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
          const clonedElement = clonedDoc.querySelector('.ad-content');
          if (clonedElement) {
            (clonedElement as HTMLElement).style.transform = 'none';
          }
          return Promise.resolve();
        }
      };

      try {
        console.log('Using html2canvas...');
        const canvas = await html2canvas(container.firstElementChild as HTMLElement, options);
        console.log('Canvas generated successfully');
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        document.body.removeChild(container);
        return dataUrl;
      } catch (html2canvasError) {
        console.warn('html2canvas failed, trying dom-to-image fallback:', html2canvasError);
        return this.fallbackCapture(container);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      if (container.parentNode) {
        document.body.removeChild(container);
      }
      throw error;
    }
  }

  private async fallbackCapture(container: HTMLElement): Promise<string> {
    try {
      console.log('Using dom-to-image fallback...');
      const element = container.firstElementChild as HTMLElement;
      const config = {
        quality: 1.0,
        scale: this.pixelRatio * 2,
        width: element.offsetWidth,
        height: element.offsetHeight,
        style: {
          transform: 'none',
          transformOrigin: 'top left',
          width: '100%',
          height: '100%'
        },
        filter: (node: Element) => {
          return !['SCRIPT', 'STYLE'].includes(node.tagName);
        }
      };

      const dataUrl = await domtoimage.toPng(element, config);
      if (container.parentNode) {
        document.body.removeChild(container);
      }
      console.log('Dom-to-image generated successfully');
      return dataUrl;
    } catch (error) {
      console.error('Fallback capture failed:', error);
      if (container.parentNode) {
        document.body.removeChild(container);
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
