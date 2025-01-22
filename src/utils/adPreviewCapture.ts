import puppeteer from 'puppeteer';
import { getDimensions } from './adDimensions';

export async function capturePreview(
  previewRef: React.RefObject<HTMLDivElement>,
  platform: string
): Promise<File | null> {
  if (!previewRef.current) {
    console.error("Preview element not found");
    return null;
  }

  try {
    const { width, height } = getDimensions(platform);
    
    // Launch browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport to match ad dimensions
    await page.setViewport({ 
      width: width,
      height: height,
      deviceScaleFactor: 2 // For higher quality
    });

    // Get the HTML content of the preview
    const previewElement = previewRef.current.querySelector('.ad-content') as HTMLElement;
    if (!previewElement) {
      throw new Error('Ad content element not found');
    }

    const htmlContent = `
      <html>
        <head>
          <style>
            ${document.head.getElementsByTagName('style')[0]?.innerHTML || ''}
            body { margin: 0; }
            .ad-content {
              width: ${width}px;
              height: ${height}px;
              position: relative;
              overflow: hidden;
            }
          </style>
        </head>
        <body>
          ${previewElement.outerHTML}
        </body>
      </html>
    `;

    // Set the content and wait for it to load
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Take the screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      omitBackground: true,
      encoding: 'binary'
    });

    await browser.close();

    // Convert the screenshot to a File object
    const file = new File([screenshot], 'ad-preview.png', {
      type: 'image/png',
      lastModified: Date.now()
    });

    console.log('Preview captured successfully');
    return file;

  } catch (error) {
    console.error('Error capturing preview:', error);
    return null;
  }
}