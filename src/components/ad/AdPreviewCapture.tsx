
import { useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';

interface AdPreviewCaptureProps {
  onCapture: (file: File) => void;
  children: React.ReactNode;
}

export const AdPreviewCapture: React.FC<AdPreviewCaptureProps> = ({ onCapture, children }) => {
  const previewRef = useRef<HTMLDivElement>(null);

  const capturePreview = async () => {
    console.log('Starting preview capture process...');
    
    if (!previewRef.current) {
      console.error('Preview ref is null');
      return null;
    }

    const adElement = previewRef.current.querySelector('.ad-content');
    if (!adElement) {
      console.error('Ad content element not found');
      return null;
    }

    try {
      console.log('Adding capturing class...');
      adElement.classList.add('capturing');
      
      // Wait for fonts and a small delay for rendering
      console.log('Waiting for fonts to load...');
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 500));

      // Wait for all images
      const images = Array.from(adElement.getElementsByTagName('img'));
      console.log(`Found ${images.length} images to load`);
      
      if (images.length > 0) {
        await Promise.all(
          images.map((img, index) => 
            new Promise<void>((resolve, reject) => {
              console.log(`Processing image ${index + 1}/${images.length}: ${img.src}`);
              
              if (img.complete && img.naturalHeight !== 0) {
                console.log(`Image ${index + 1} already loaded`);
                resolve();
              } else {
                const timeout = setTimeout(() => {
                  console.error(`Image ${index + 1} load timeout`);
                  reject(new Error('Image load timeout'));
                }, 10000);

                img.onload = () => {
                  console.log(`Image ${index + 1} loaded successfully`);
                  clearTimeout(timeout);
                  resolve();
                };

                img.onerror = () => {
                  console.error(`Failed to load image ${index + 1}: ${img.src}`);
                  clearTimeout(timeout);
                  reject(new Error(`Failed to load image: ${img.src}`));
                };
              }
            })
          )
        );
      }

      console.log('Forcing layout calculation...');
      // Force layout calculation and wait
      adElement.getBoundingClientRect();
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('Starting html2canvas capture...');
      const canvas = await html2canvas(adElement as HTMLElement, {
        useCORS: true,
        scale: 2,
        logging: true,
        allowTaint: true,
        backgroundColor: null,
        foreignObjectRendering: true,
        onclone: (clonedDoc) => {
          console.log('Cloning document for capture...');
          const clonedElement = clonedDoc.querySelector('.ad-content');
          if (clonedElement) {
            clonedElement.classList.add('capturing');
          }
        }
      });

      console.log('Converting canvas to blob...');
      const blob = await new Promise<Blob>(resolve => {
        canvas.toBlob(blob => resolve(blob!), 'image/jpeg', 1.0);
      });

      console.log('Creating file from blob...');
      const file = new File([blob], 'preview.jpg', { type: 'image/jpeg' });
      console.log('Calling onCapture with generated file...');
      onCapture(file);
    } catch (error) {
      console.error('Preview capture error:', error);
      throw error;
    } finally {
      console.log('Removing capturing class...');
      adElement.classList.remove('capturing');
    }
  };

  useEffect(() => {
    const element = previewRef.current;
    if (element) {
      console.log('AdPreviewCapture mounted');
      element.style.opacity = '1';
      element.style.visibility = 'visible';
      
      // Try to capture after a short delay to ensure everything is rendered
      setTimeout(() => {
        console.log('Attempting initial capture...');
        capturePreview().catch(err => {
          console.error('Initial capture failed:', err);
        });
      }, 1000);
    }
    
    return () => {
      console.log('AdPreviewCapture unmounting...');
    };
  }, []);

  return (
    <div ref={previewRef} className="preview-container">
      {children}
    </div>
  );
};
