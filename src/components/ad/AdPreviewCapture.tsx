import { useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';

interface AdPreviewCaptureProps {
  onCapture: (file: File) => void;
  children: React.ReactNode;
}

export const AdPreviewCapture: React.FC<AdPreviewCaptureProps> = ({ onCapture, children }) => {
  const previewRef = useRef<HTMLDivElement>(null);

  const capturePreview = async () => {
    if (!previewRef.current) return null;

    const adElement = previewRef.current.querySelector('.ad-content');
    if (!adElement) return null;

    try {
      adElement.classList.add('capturing');
      
      // Wait for fonts and a small delay for rendering
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 100));

      // Wait for all images
      const images = Array.from(adElement.getElementsByTagName('img'));
      if (images.length > 0) {
        await Promise.all(
          images.map(img => 
            new Promise<void>((resolve, reject) => {
              if (img.complete && img.naturalHeight !== 0) {
                resolve();
              } else {
                const timeout = setTimeout(() => reject(new Error('Image load timeout')), 10000);
                img.onload = () => {
                  clearTimeout(timeout);
                  resolve();
                };
                img.onerror = () => {
                  clearTimeout(timeout);
                  reject(new Error(`Failed to load image: ${img.src}`));
                };
              }
            })
          )
        );
      }

      // Force layout calculation and wait
      adElement.getBoundingClientRect();
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(adElement as HTMLElement, {
        useCORS: true,
        scale: 2,
        logging: true,
        allowTaint: true,
        backgroundColor: null,
        foreignObjectRendering: true
      });

      const blob = await new Promise<Blob>(resolve => {
        canvas.toBlob(blob => resolve(blob!), 'image/jpeg', 1.0);
      });

      const file = new File([blob], 'preview.jpg', { type: 'image/jpeg' });
      onCapture(file);
    } catch (error) {
      console.error('Preview capture error:', error);
      throw error;
    } finally {
      adElement.classList.remove('capturing');
    }
  };

  useEffect(() => {
    const element = previewRef.current;
    if (element) {
      element.style.opacity = '1';
      element.style.visibility = 'visible';
    }
  }, []);

  return (
    <div ref={previewRef} className="preview-container">
      {children}
    </div>
  );
};