
import { useEffect, useRef } from 'react';
import { capturePreview } from '@/utils/adPreviewCapture';

interface AdPreviewCaptureProps {
  onCapture: (file: File) => void;
  children: React.ReactNode;
}

export const AdPreviewCapture: React.FC<AdPreviewCaptureProps> = ({ onCapture, children }) => {
  const previewRef = useRef<HTMLDivElement>(null);

  const handleCapture = async () => {
    console.log('Starting preview capture process...');
    
    if (!previewRef.current) {
      console.error('Preview reference is empty');
      return;
    }

    try {
      // Ensure the content is fully rendered and stable
      await new Promise(resolve => setTimeout(resolve, 1000));

      const file = await capturePreview(previewRef, 'default');
      
      if (file) {
        console.log('Preview captured successfully');
        onCapture(file);
      } else {
        console.error('Failed to capture preview');
      }
    } catch (error) {
      console.error('Preview capture error:', error);
    }
  };

  useEffect(() => {
    const element = previewRef.current;
    if (element) {
      console.log('AdPreviewCapture mounted');
      handleCapture();
    }
    
    return () => {
      console.log('AdPreviewCapture unmounting...');
    };
  }, []);

  return (
    <div 
      ref={previewRef} 
      className="preview-container relative"
      style={{
        width: '100%',
        height: '100%',
        transformOrigin: 'center center',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden'
      }}
    >
      {children}
    </div>
  );
};
