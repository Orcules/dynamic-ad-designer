
import { useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';

interface AdPreviewCaptureProps {
  onCapture: (file: File) => void;
  children: React.ReactNode;
}

export const AdPreviewCapture: React.FC<AdPreviewCaptureProps> = ({ onCapture, children }) => {
  const previewRef = useRef<HTMLDivElement>(null);

  const capturePreview = async () => {
    console.log('מתחיל תהליך צילום תצוגה מקדימה...');
    
    if (!previewRef.current) {
      console.error('הפניית התצוגה המקדימה ריקה');
      return null;
    }

    const adElement = previewRef.current.querySelector('.ad-content');
    if (!adElement) {
      console.error('אלמנט תוכן המודעה לא נמצא');
      return null;
    }

    try {
      console.log('מוסיף מחלקת צילום...');
      adElement.classList.add('capturing');
      
      // מחכה לפונטים והשהיה קטנה לרינדור
      console.log('מחכה לטעינת פונטים...');
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 500));

      // מחכה לכל התמונות
      const images = Array.from(adElement.getElementsByTagName('img'));
      console.log(`נמצאו ${images.length} תמונות לטעינה`);
      
      if (images.length > 0) {
        await Promise.all(
          images.map((img, index) => 
            new Promise<void>((resolve, reject) => {
              console.log(`מעבד תמונה ${index + 1}/${images.length}: ${img.src}`);
              
              if (img.complete && img.naturalHeight !== 0) {
                console.log(`תמונה ${index + 1} כבר טעונה`);
                resolve();
              } else {
                const timeout = setTimeout(() => {
                  console.error(`פסק זמן בטעינת תמונה ${index + 1}`);
                  reject(new Error('פסק זמן בטעינת תמונה'));
                }, 10000);

                img.onload = () => {
                  console.log(`תמונה ${index + 1} נטענה בהצלחה`);
                  clearTimeout(timeout);
                  resolve();
                };

                img.onerror = () => {
                  console.error(`נכשל בטעינת תמונה ${index + 1}: ${img.src}`);
                  clearTimeout(timeout);
                  reject(new Error(`נכשל בטעינת תמונה: ${img.src}`));
                };
              }
            })
          )
        );
      }

      console.log('מאלץ חישוב פריסה...');
      // מאלץ חישוב פריסה ומחכה
      adElement.getBoundingClientRect();
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('מתחיל צילום html2canvas...');
      const canvas = await html2canvas(adElement as HTMLElement, {
        useCORS: true,
        scale: 2,
        logging: true,
        allowTaint: true,
        backgroundColor: null,
        foreignObjectRendering: true,
        onclone: (clonedDoc) => {
          console.log('משכפל מסמך לצילום...');
          const clonedElement = clonedDoc.querySelector('.ad-content');
          if (clonedElement) {
            clonedElement.classList.add('capturing');
          }
        }
      });

      console.log('ממיר קנבס לבלוב...');
      const blob = await new Promise<Blob>(resolve => {
        canvas.toBlob(blob => resolve(blob!), 'image/jpeg', 1.0);
      });

      console.log('יוצר קובץ מבלוב...');
      const file = new File([blob], 'preview.jpg', { type: 'image/jpeg' });
      console.log('קורא ל-onCapture עם הקובץ שנוצר...');
      onCapture(file);
    } catch (error) {
      console.error('שגיאת צילום תצוגה מקדימה:', error);
      throw error;
    } finally {
      console.log('מסיר מחלקת צילום...');
      adElement.classList.remove('capturing');
    }
  };

  useEffect(() => {
    const element = previewRef.current;
    if (element) {
      console.log('AdPreviewCapture עלה');
      element.style.opacity = '1';
      element.style.visibility = 'visible';
      
      // מנסה לצלם אחרי השהיה קצרה כדי להבטיח שהכל מרונדר
      setTimeout(() => {
        console.log('מנסה צילום ראשוני...');
        capturePreview().catch(err => {
          console.error('הצילום הראשוני נכשל:', err);
        });
      }, 1000);
    }
    
    return () => {
      console.log('AdPreviewCapture יורד...');
    };
  }, []);

  return (
    <div ref={previewRef} className="preview-container">
      {children}
    </div>
  );
};
