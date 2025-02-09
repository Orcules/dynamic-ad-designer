
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
      console.error('Preview reference is empty');
      return;
    }

    const adElement = previewRef.current.querySelector('.ad-content');
    if (!adElement) {
      console.error('Ad content element not found');
      return;
    }

    try {
      // Wait for fonts and images to load
      await document.fonts.ready;
      console.log('Fonts loaded successfully');
      
      const images = Array.from(adElement.getElementsByTagName('img'));
      console.log(`Found ${images.length} images to load`);
      
      if (images.length > 0) {
        await Promise.all(
          images.map(img => 
            new Promise<void>((resolve, reject) => {
              if (img.complete) {
                console.log(`Image already loaded: ${img.src}`);
                resolve();
              } else {
                img.onload = () => {
                  console.log(`Image loaded: ${img.src}`);
                  resolve();
                };
                img.onerror = () => reject(new Error(`Failed to load image: ${img.src}`));
              }
            })
          )
        );
      }

      // Force layout calculation
      const rect = adElement.getBoundingClientRect();
      console.log('Element dimensions:', {
        width: rect.width,
        height: rect.height
      });

      // Capture the element
      console.log('Starting html2canvas capture...');
      const canvas = await html2canvas(adElement as HTMLElement, {
        useCORS: true,
        scale: 2,
        logging: true,
        backgroundColor: '#ffffff',
        width: rect.width,
        height: rect.height,
        onclone: (clonedDoc) => {
          console.log('Cloning document for capture...');
          const clonedElement = clonedDoc.querySelector('.ad-content');
          if (clonedElement) {
            clonedElement.classList.add('capturing');
          }
        }
      });

      console.log('Converting canvas to blob...');
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png', 1.0);
      });

      console.log('Creating file from blob...');
      const file = new File([blob], 'preview.png', { type: 'image/png' });
      
      console.log('Calling onCapture with created file...');
      onCapture(file);
    } catch (error) {
      console.error('Preview capture error:', error);
    }
  };

  useEffect(() => {
    const element = previewRef.current;
    if (element) {
      console.log('AdPreviewCapture mounted');
      
      // Allow time for initial render
      setTimeout(() => {
        console.log('Attempting initial capture...');
        capturePreview();
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
