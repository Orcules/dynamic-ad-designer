
import html2canvas from "html2canvas";

export async function capturePreview(
  previewRef: React.RefObject<HTMLDivElement>,
  platform: string
): Promise<File | null> {
  if (!previewRef.current) {
    console.error("אלמנט התצוגה המקדימה לא נמצא");
    return null;
  }

  let adElement: Element | null = null;
  
  try {
    // מחפש את אלמנט התוכן של המודעה בתוך מיכל התצוגה המקדימה
    adElement = previewRef.current.querySelector('.ad-content');
    if (!adElement) {
      console.error('אלמנט תוכן המודעה לא נמצא');
      return null;
    }

    // מוסיף מחלקה לפני כל הפעולות
    adElement.classList.add('capturing');

    // מחכה שהפונטים יטענו
    await document.fonts.ready;
    console.log('הפונטים נטענו בהצלחה');

    // מחכה לטעינת התמונות
    const images = Array.from(adElement.getElementsByTagName('img'));
    if (images.length > 0) {
      console.log(`מחכה לטעינת ${images.length} תמונות...`);
      await Promise.all(
        images.map((img) => {
          if (img.complete && img.naturalHeight !== 0) {
            return Promise.resolve();
          }
          return new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error(`פסק זמן בטעינת תמונה: ${img.src}`));
            }, 10000);

            img.onload = () => {
              clearTimeout(timeout);
              resolve();
            };
            img.onerror = () => {
              clearTimeout(timeout);
              reject(new Error(`נכשל בטעינת תמונה: ${img.src}`));
            };
          });
        })
      );
      console.log('כל התמונות נטענו בהצלחה');
    }

    // השהייה קצרה כדי לוודא שהכל התרנדר
    await new Promise(resolve => setTimeout(resolve, 500));

    // מאלץ חישוב מחדש של הפריסה
    const rect = adElement.getBoundingClientRect();
    console.log('מימדי האלמנט שנלכד:', { width: rect.width, height: rect.height });

    // יוצר את הקנבס
    const canvas = await html2canvas(adElement as HTMLElement, {
      useCORS: true,
      scale: 2,
      width: rect.width,
      height: rect.height,
      backgroundColor: null,
      logging: true,
      allowTaint: true,
      foreignObjectRendering: true,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector('.ad-content');
        if (clonedElement) {
          clonedElement.classList.add('capturing');
        }
      }
    });

    // ממיר את הקנבס לתמונה
    console.log('הקנבס נוצר, ממיר לתמונה...');
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('נכשל ביצירת blob מהקנבס');
          resolve(null);
          return;
        }
        
        const file = new File([blob], "ad-preview.jpg", { 
          type: "image/jpeg",
          lastModified: Date.now()
        });
        console.log('קובץ התמונה נוצר בהצלחה');
        resolve(file);
      }, 'image/jpeg', 1.0);
    });

  } catch (error) {
    console.error("שגיאה בצילום תצוגה מקדימה:", error);
    return null;
  } finally {
    if (adElement) {
      adElement.classList.remove('capturing');
    }
  }
}
