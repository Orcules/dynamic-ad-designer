import puppeteer from 'puppeteer';

export async function capturePreview(
  previewRef: React.RefObject<HTMLDivElement>,
  platform: string
): Promise<File | null> {
  if (!previewRef.current) {
    console.error("Preview element not found");
    return null;
  }

  try {
    // Launch browser with correct configuration for browser environment
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Get the HTML content of the preview
    const previewElement = previewRef.current.querySelector('.ad-content') as HTMLElement;
    if (!previewElement) {
      throw new Error('Ad content element not found');
    }

    // Get computed styles
    const styles = window.getComputedStyle(previewElement);
    const width = parseInt(styles.width);
    const height = parseInt(styles.height);

    // Set viewport to match ad dimensions
    await page.setViewport({ 
      width,
      height,
      deviceScaleFactor: 2 // For higher quality
    });

    // Include all necessary styles and content
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