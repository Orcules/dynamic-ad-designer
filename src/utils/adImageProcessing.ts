
import { toast } from "sonner";
import { enrichAdData } from "./adEnrichment";
import { capturePreview } from "./adPreviewCapture";
import { supabase } from "@/integrations/supabase/client";

export const processImages = async (
  adData: any,
  images: (File | string)[],
  previewRef: React.RefObject<HTMLDivElement>,
  onAdGenerated: (adData: any) => void,
  handleSubmission: any,
  setIsGenerating: (value: boolean) => void
) => {
  try {
    console.log('Starting preview capture process...');
    const previewContainer = previewRef.current;
    
    if (!previewContainer) {
      throw new Error('Preview container not found');
    }

    // Create a new window and immediately write basic structure
    const previewWindow = window.open('', '_blank');
    if (!previewWindow) {
      throw new Error('Failed to open preview window');
    }

    // Get essential styles
    const styles = getStyles(previewContainer);
    
    // Write initial HTML structure with DOCTYPE and UTF-8 encoding
    previewWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Generated Ads Preview</title>
          ${styles.externalStylesheets}
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              flex-wrap: wrap;
              gap: 20px;
              background: #f0f0f0;
              min-height: 100vh;
              font-family: ${styles.fontFamily};
            }
            .ad-container {
              flex: 0 0 auto;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              width: ${styles.width}px;
              aspect-ratio: ${styles.width} / ${styles.height};
              overflow: hidden;
              background: white;
              border-radius: 8px;
            }
            ${styles.internalStyles}
          </style>
        </head>
        <body></body>
      </html>
    `);
    previewWindow.document.close();

    // Process images and upload to Supabase in parallel
    const uploadPromises = images.map(async (image, index) => {
      if (typeof image !== 'string') return;

      try {
        // Create ad container for this image
        const adContainer = document.createElement('div');
        adContainer.className = 'ad-container';
        
        // Clone the preview content
        const adContent = previewContainer.cloneNode(true) as HTMLElement;
        
        // Update image source
        const imgElement = adContent.querySelector('img');
        if (imgElement) {
          imgElement.src = image;
          // Wait for image to load
          await new Promise((resolve) => {
            imgElement.onload = resolve;
            imgElement.onerror = resolve;
          });
        }
        
        // Add the content to the container
        adContainer.appendChild(adContent);
        
        // Add container to preview window
        previewWindow.document.body.appendChild(adContainer);

        // Capture preview
        const previewFile = await capturePreview(previewRef, 'default');
        if (!previewFile) {
          throw new Error('Failed to capture preview');
        }

        // Upload to Supabase
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('ad-images')
          .upload(`generated/${Date.now()}_${index}_ad.png`, previewFile, {
            contentType: 'image/png',
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl: generatedImageUrl } } = supabase.storage
          .from('ad-images')
          .getPublicUrl(uploadData.path);

        const enrichedAdData = enrichAdData(adData, index);
        enrichedAdData.imageUrl = generatedImageUrl;

        onAdGenerated(enrichedAdData);
      } catch (error) {
        console.error(`Error processing image ${index}:`, error);
        throw error;
      }
    });

    await Promise.all(uploadPromises);
    
    toast.success('Ads created successfully!', {
      action: {
        label: 'View Ads',
        onClick: () => previewWindow.focus()
      }
    });
    
  } catch (error) {
    console.error('Error processing images:', error);
    toast.error('Error creating ads');
  } finally {
    setIsGenerating(false);
  }
};

function getStyles(previewContainer: HTMLDivElement) {
  const computedStyle = window.getComputedStyle(previewContainer);
  const width = previewContainer.getBoundingClientRect().width;
  const height = previewContainer.getBoundingClientRect().height;

  const externalStylesheets = Array.from(document.getElementsByTagName('link'))
    .filter(link => link.rel === 'stylesheet' && link.href.includes('fonts.googleapis.com'))
    .map(link => link.outerHTML)
    .join('\n');

  const internalStyles = Array.from(document.styleSheets)
    .filter(sheet => !sheet.href || sheet.href.startsWith(window.location.origin))
    .map(sheet => {
      try {
        return Array.from(sheet.cssRules)
          .map(rule => rule.cssText)
          .join('\n');
      } catch (e) {
        return '';
      }
    })
    .join('\n');

  return {
    externalStylesheets,
    internalStyles,
    width,
    height,
    fontFamily: computedStyle.fontFamily
  };
}

function createAdContainer(previewContainer: HTMLDivElement, imageUrl: string) {
  const container = document.createElement('div');
  container.className = 'ad-container';
  
  const adContent = previewContainer.cloneNode(true) as HTMLElement;
  const imgElement = adContent.querySelector('img');
  if (imgElement) {
    imgElement.src = imageUrl;
  }
  
  container.appendChild(adContent);
  return container;
}
