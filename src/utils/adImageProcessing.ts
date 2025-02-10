
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
  let previewWindow: Window | null = null;

  try {
    console.log('Starting preview capture process...');
    const previewContainer = previewRef.current;
    
    if (!previewContainer) {
      throw new Error('Preview container not found');
    }

    // Create a new window
    previewWindow = window.open('', '_blank');
    if (!previewWindow) {
      throw new Error('Failed to open preview window');
    }

    // Get computed styles from the preview container
    const computedStyle = window.getComputedStyle(previewContainer);
    const width = previewContainer.getBoundingClientRect().width;
    const height = previewContainer.getBoundingClientRect().height;

    // Get fonts and styles
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

    // Write the full HTML structure to the new window
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Generated Ads Preview</title>
          ${externalStylesheets}
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              flex-wrap: wrap;
              gap: 20px;
              background: #f0f0f0;
              min-height: 100vh;
              font-family: ${computedStyle.fontFamily};
            }
            .ad-container {
              flex: 0 0 auto;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              width: ${width}px;
              height: ${height}px;
              overflow: hidden;
              background: white;
              border-radius: 8px;
              position: relative;
            }
            .ad-content {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
            }
            ${internalStyles}
          </style>
        </head>
        <body></body>
      </html>
    `;

    previewWindow.document.open();
    previewWindow.document.write(htmlContent);
    previewWindow.document.close();

    // Wait for the preview window to load
    await new Promise<void>((resolve) => {
      if (previewWindow) {
        previewWindow.onload = () => resolve();
        setTimeout(resolve, 1000); // Fallback timeout
      } else {
        resolve();
      }
    });

    // Process each image sequentially to ensure proper rendering
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      if (typeof image !== 'string') continue;

      try {
        // Create container for this ad
        const adContainer = document.createElement('div');
        adContainer.className = 'ad-container';
        
        // Clone the preview content
        const adContent = previewContainer.cloneNode(true) as HTMLElement;
        adContent.className = 'ad-content';
        
        // Update image source and wait for it to load
        const imgElement = adContent.querySelector('img');
        if (imgElement) {
          imgElement.src = image;
          await new Promise((resolve) => {
            imgElement.onload = resolve;
            imgElement.onerror = resolve;
          });
        }

        // Add content to container
        adContainer.appendChild(adContent);
        
        // Add container to preview window
        previewWindow.document.body.appendChild(adContainer);

        // Ensure styles are applied before capturing
        await new Promise(resolve => setTimeout(resolve, 100));

        // Capture preview
        const previewFile = await capturePreview(previewRef, 'default');
        if (!previewFile) {
          throw new Error('Failed to capture preview');
        }

        // Upload to Supabase
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('ad-images')
          .upload(`generated/${Date.now()}_${i}_ad.png`, previewFile, {
            contentType: 'image/png',
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl: generatedImageUrl } } = supabase.storage
          .from('ad-images')
          .getPublicUrl(uploadData.path);

        // Generate enriched ad data
        const enrichedAdData = enrichAdData(adData, i);
        enrichedAdData.imageUrl = generatedImageUrl;

        onAdGenerated(enrichedAdData);

        console.log(`Successfully processed ad ${i + 1} of ${images.length}`);
      } catch (error) {
        console.error(`Error processing image ${i}:`, error);
        throw error;
      }
    }

    toast.success('Ads created successfully!', {
      action: {
        label: 'View Ads',
        onClick: () => previewWindow?.focus()
      }
    });

  } catch (error) {
    console.error('Error processing images:', error);
    toast.error('Error creating ads');
    if (previewWindow) {
      previewWindow.close();
    }
  } finally {
    setIsGenerating(false);
  }
};
