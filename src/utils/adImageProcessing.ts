
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

    // Create a new window
    const previewWindow = window.open('', '_blank');
    if (!previewWindow) {
      throw new Error('Failed to open preview window');
    }

    // Get the original styles from the preview
    const computedStyle = window.getComputedStyle(previewContainer);
    const width = previewContainer.getBoundingClientRect().width;
    const height = previewContainer.getBoundingClientRect().height;

    // Prepare all HTML content first
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

    // Prepare all ad containers HTML
    const adsHTML = images.map((image) => {
      if (typeof image === 'string') {
        const adContainer = previewContainer.cloneNode(true) as HTMLElement;
        const imgElement = adContainer.querySelector('img');
        if (imgElement) {
          imgElement.src = image;
        }
        return `<div class="ad-container">${adContainer.outerHTML}</div>`;
      }
      return '';
    }).join('\n');

    // Write complete HTML at once
    previewWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
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
              aspect-ratio: ${width} / ${height};
              overflow: hidden;
            }
            .ad-content {
              width: 100%;
              height: 100%;
              position: relative;
            }
            ${internalStyles}
          </style>
        </head>
        <body>
          ${adsHTML}
        </body>
      </html>
    `);
    previewWindow.document.close();

    // Upload to Supabase in parallel
    const uploadPromises = images.map(async (image, index) => {
      // Update preview ref with current image
      const imgElement = previewRef.current?.querySelector('img');
      if (imgElement && typeof image === 'string') {
        imgElement.src = image;
      }

      // Wait for image to load
      if (imgElement) {
        await new Promise((resolve) => {
          imgElement.onload = resolve;
          imgElement.onerror = resolve;
        });
      }

      const previewFile = await capturePreview(previewRef, 'default');
      if (!previewFile) {
        throw new Error('Failed to capture preview');
      }

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('ad-images')
        .upload(`generated/${Date.now()}_${index}_ad.png`, previewFile, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Failed to upload preview: ${uploadError.message}`);
      }

      const { data: { publicUrl: generatedImageUrl } } = supabase.storage
        .from('ad-images')
        .getPublicUrl(uploadData.path);

      const enrichedAdData = enrichAdData(adData, index);
      enrichedAdData.imageUrl = generatedImageUrl;

      onAdGenerated(enrichedAdData);
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

