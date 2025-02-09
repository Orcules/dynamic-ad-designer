
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
    const aspectRatio = height / width;

    // Write the HTML content with preserved styles
    previewWindow.document.write(`
      <html>
        <head>
          <title>Generated Ads Preview</title>
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
            ${Array.from(document.styleSheets)
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
              .join('\n')}
          </style>
          ${Array.from(document.head.getElementsByTagName('link'))
            .filter(link => link.rel === 'stylesheet' && link.href.includes('fonts.googleapis.com'))
            .map(link => link.outerHTML)
            .join('\n')}
        </head>
        <body>
          <div class="ad-container">
            ${previewContainer.outerHTML}
          </div>
        </body>
      </html>
    `);

    // Store in Supabase for persistence
    const previewFile = await capturePreview(previewRef, 'default');
    if (!previewFile) {
      throw new Error('Failed to capture preview');
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('ad-images')
      .upload(`generated/${Date.now()}_ad.png`, previewFile, {
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

    // Create ad record with the Supabase URL
    const enrichedAdData = enrichAdData(adData, 0);
    enrichedAdData.imageUrl = generatedImageUrl;

    onAdGenerated(enrichedAdData);
    
    toast.success('Ad created successfully!', {
      action: {
        label: 'View Ad',
        onClick: () => previewWindow.focus()
      }
    });
    
  } catch (error) {
    console.error('Error processing image:', error);
    toast.error('Error creating ad');
  } finally {
    setIsGenerating(false);
  }
};
