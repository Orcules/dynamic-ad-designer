
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

    console.log('מתחיל תהליך צילום תצוגה מקדימה...');

    // מוסיף מחלקה לפני כל הפעולות
    adElement.classList.add('capturing');

    // מחכה שהפונטים יטענו
    await document.fonts.ready;
    console.log('הפונטים נטענו בהצלחה');

    // מחכה שהתמונות יטענו בגישה יותר חזקה
    const images = Array.from(adElement.getElementsByTagName('img'));
    if (images.length > 0) {
      await Promise.all(
        images.map((img) => {
          if (img.complete && img.naturalHeight !== 0) {
            return Promise.resolve();
          }
          return new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error(`פסק זמן בטעינת תמונה: ${img.src}`));
            }, 10000); // 10 שניות לפסק זמן

            img.onload = () => {
              clearTimeout(timeout);
              // מאלץ השהיה קטנה אחרי טעינת התמונה כדי להבטיח רינדור
              setTimeout(resolve, 100);
            };
            img.onerror = () => {
              clearTimeout(timeout);
              reject(new Error(`נכשל בטעינת תמונה: ${img.src}`));
            };
          });
        })
      );
    }
    console.log('כל התמונות נטענו בהצלחה');

    // מאלץ חישוב מחדש של הפריסה ומחכה רגע
    adElement.getBoundingClientRect();
    await new Promise(resolve => setTimeout(resolve, 100));

    // מקבל מימדים מדויקים אחרי שהפריסה יציבה
    const rect = adElement.getBoundingClientRect();
    console.log('מימדי האלמנט שנלכד:', { width: rect.width, height: rect.height });
    
    // יוצר קנבס עם מימדים מדויקים
    const canvas = await html2canvas(adElement as HTMLElement, {
      useCORS: true,
      scale: 2,
      width: rect.width,
      height: rect.height,
      backgroundColor: null,
      logging: true,
      allowTaint: true,
      foreignObjectRendering: true,
      removeContainer: false,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector('.ad-content');
        if (clonedElement) {
          clonedElement.classList.add('capturing');
          // מעתיק את כל הסגנונות המחושבים
          const styles = window.getComputedStyle(adElement as HTMLElement);
          Array.from(styles).forEach(key => {
            (clonedElement as HTMLElement).style[key as any] = styles.getPropertyValue(key);
          });
        }
      }
    });

    console.log('הקנבס נלכד בהצלחה');

    // ממיר לJPEG באיכות גבוהה
    const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    const file = new File([blob], "ad-preview.jpg", { 
      type: "image/jpeg",
      lastModified: Date.now()
    });

    console.log('קובץ JPEG נוצר בהצלחה');
    return file;

  } catch (error) {
    console.error("שגיאה בצילום תצוגה מקדימה:", error);
    return null;
  } finally {
    // מסיר את המחלקה בבלוק finally כדי להבטיח שהיא תמיד תוסר
    if (adElement) {
      adElement.classList.remove('capturing');
    }
  }
}
