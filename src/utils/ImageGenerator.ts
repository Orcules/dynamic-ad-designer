
import html2canvas from "html2canvas";
import { Logger } from "./logger";

interface Options {
  selector?: string;
  quality?: number;
  scale?: number;
  backgroundColor?: string | null;
}

export class ImageGenerator {
  private selector: string;
  private quality: number;
  private scale: number;
  private backgroundColor: string | null;
  private canvasElements: HTMLCanvasElement[] = [];
  private blobUrls: string[] = [];

  constructor(
    selector: string = ".capture-element",
    options: Options = {}
  ) {
    this.selector = options.selector || selector;
    this.quality = options.quality || 0.9;
    this.scale = options.scale || 2;
    this.backgroundColor = options.backgroundColor !== undefined ? options.backgroundColor : null;
  }

  /**
   * Get a DOM element based on the selector string
   */
  private getElement(): HTMLElement | null {
    let element: HTMLElement | null = null;
    try {
      if (typeof this.selector === "string") {
        element = document.querySelector(this.selector) as HTMLElement;
      }
    } catch (error) {
      Logger.error(`Error getting element with selector ${this.selector}: ${error}`);
    }
    return element;
  }

  /**
   * Capture an element as a canvas
   */
  private async captureElement(
    element: HTMLElement,
    scale: number = this.scale
  ): Promise<HTMLCanvasElement | null> {
    try {
      // Add required properties to options
      const canvas = await html2canvas(element, {
        backgroundColor: this.backgroundColor,
        scale: scale,
        useCORS: true,
        // Remove allowTaint as it conflicts with useCORS
        logging: false,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        onclone: (documentClone: Document) => {
          // Improved image loading handling
          const images = Array.from(documentClone.querySelectorAll("img"));
          Logger.info(`Checking ${images.length} images for complete loading`);
          
          // Create an array of promises for images that need to load
          const loadPromises = images
            .filter(img => !img.complete && img.src)
            .map(img => {
              return new Promise<void>((resolve) => {
                const originalSrc = img.src;
                img.onload = () => resolve();
                img.onerror = () => {
                  Logger.warn(`Failed to load image: ${originalSrc.substring(0, 30)}...`);
                  resolve(); // Resolve anyway to continue the process
                };
                // Only set src if it's a valid URL
                if (originalSrc && originalSrc !== 'undefined' && originalSrc !== 'null') {
                  // Add a cache-busting parameter for images that might be cached incorrectly
                  if (originalSrc.indexOf('?') === -1) {
                    img.src = `${originalSrc}?t=${Date.now()}`;
                  } else {
                    img.src = `${originalSrc}&t=${Date.now()}`;
                  }
                }
              });
            });
          
          // Log the number of images that need loading
          if (loadPromises.length > 0) {
            Logger.info(`Waiting for ${loadPromises.length} images to load`);
          }
          
          // We don't actually wait for these promises here because html2canvas
          // doesn't support returning a promise from onclone
          // This approach improves the chances of images loading, but doesn't guarantee it
        },
      });

      // Keep track of canvas elements we create
      this.canvasElements.push(canvas);
      
      return canvas;
    } catch (error) {
      Logger.error(`Error capturing element: ${error}`);
      return null;
    }
  }

  /**
   * Convert a canvas to a data URL with proper memory management
   */
  private canvasToDataUrl(
    canvas: HTMLCanvasElement,
    type: string = "image/png",
    quality: number = this.quality
  ): string {
    try {
      // Use a consistent quality parameter regardless of scale
      const dataUrl = canvas.toDataURL(type, quality);
      return dataUrl;
    } catch (error) {
      Logger.error(`Error converting canvas to data URL: ${error}`);
      throw error;
    }
  }

  /**
   * Convert a canvas to a blob URL with proper memory management
   */
  private async canvasToBlob(
    canvas: HTMLCanvasElement,
    type: string = "image/png",
    quality: number = this.quality
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to create blob from canvas"));
              return;
            }
            
            const url = URL.createObjectURL(blob);
            // Track blob URLs so we can revoke them later
            this.blobUrls.push(url);
            resolve(url);
          },
          type,
          quality
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Clean up memory by removing references to canvas elements and revoking object URLs
   */
  private cleanupMemory() {
    // Clean up previous blob URLs
    this.blobUrls.forEach(url => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        Logger.error(`Error revoking URL: ${e}`);
      }
    });
    this.blobUrls = [];
    
    // Remove references to previous canvas elements to help garbage collection
    this.canvasElements = [];
  }

  /**
   * Get an image URL from the selected element
   */
  public async getImageUrl(scaleOverride?: number): Promise<string> {
    try {
      const element = this.getElement();
      if (!element) {
        throw new Error(`Element not found with selector: ${this.selector}`);
      }

      const scale = scaleOverride !== undefined ? scaleOverride : this.scale;
      
      // Don't clean up memory before creating a new canvas
      // This prevents issues with async operations still using previous canvases
      const canvas = await this.captureElement(element, scale);
      
      if (!canvas) {
        throw new Error("Failed to capture element as canvas");
      }
      
      // Keep quality consistent regardless of scale
      // Only clean up after we've successfully generated a new data URL
      const dataUrl = this.canvasToDataUrl(canvas, "image/png", this.quality);
      
      // Now that we have the result, clean up old resources
      this.cleanupMemory();
      
      return dataUrl;
    } catch (error) {
      Logger.error(`Error generating image: ${error}`);
      throw error;
    }
  }
  
  /**
   * Downloads the generated image with the specified filename
   */
  public async downloadImage(filename: string): Promise<void> {
    try {
      const dataUrl = await this.getImageUrl();
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      Logger.error(`Error downloading image: ${error}`);
      throw error;
    }
  }
  
  /**
   * Explicitly dispose this generator and clean up any resources
   */
  public dispose() {
    Logger.info('Disposing ImageGenerator and cleaning up resources');
    this.cleanupMemory();
  }
}
