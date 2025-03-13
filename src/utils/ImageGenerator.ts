
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
  private dataUrls: string[] = [];

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
      // Enhanced memory cleanup for previous canvases to prevent leaks
      this.cleanupMemory();
      
      // Add required properties to options
      const canvas = await html2canvas(element, {
        backgroundColor: this.backgroundColor,
        scale: scale,
        useCORS: true,
        allowTaint: true,
        logging: false,
        // Add the missing required properties
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        onclone: (documentClone: Document) => {
          // Make sure all images are fully loaded
          Array.from(documentClone.querySelectorAll("img")).forEach((img) => {
            if (!img.complete && img.src) {
              Logger.info(`Forcing image load: ${img.src.substring(0, 30)}...`);
              img.src = img.src; // Trigger reload
            }
          });
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
   * Convert a canvas to a data URL
   */
  private canvasToDataUrl(
    canvas: HTMLCanvasElement,
    type: string = "image/png",
    quality: number = this.quality
  ): string {
    const dataUrl = canvas.toDataURL(type, quality);
    // Track data URLs to clean them up later
    this.dataUrls.push(dataUrl);
    return dataUrl;
  }

  /**
   * Clean up memory by removing references to canvas elements and revoking object URLs
   */
  private cleanupMemory() {
    // Clean up previous data URLs
    this.dataUrls.forEach(url => {
      try {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      } catch (e) {
        Logger.error(`Error revoking URL: ${e}`);
      }
    });
    this.dataUrls = [];
    
    // Remove references to previous canvas elements
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
      const canvas = await this.captureElement(element, scale);
      
      if (!canvas) {
        throw new Error("Failed to capture element as canvas");
      }
      
      // Use a lower quality to reduce memory usage
      const actualQuality = scaleOverride ? Math.min(this.quality, 0.75) : this.quality;
      const dataUrl = this.canvasToDataUrl(canvas, "image/png", actualQuality);
      
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
