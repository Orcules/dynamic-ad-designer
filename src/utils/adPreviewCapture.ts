import html2canvas from "html2canvas";

export async function capturePreview(
  previewRef: React.RefObject<HTMLDivElement>,
  platform: string
): Promise<File | null> {
  if (!previewRef.current) {
    console.error("Preview element not found");
    return null;
  }

  try {
    // מצא את האלמנט הספציפי שמכיל את המודעה
    const previewElement = previewRef.current.querySelector('.ad-content');
    if (!previewElement) {
      console.error('Ad content element not found');
      return null;
    }

    console.log('Starting preview capture...');

    // חכה שכל הפונטים יטענו
    await document.fonts.ready;
    console.log('Fonts loaded');

    // חכה שכל התמונות יטענו
    const images = previewElement.getElementsByTagName('img');
    if (images.length > 0) {
      console.log(`Waiting for ${images.length} images to load...`);
      await Promise.all(
        Array.from(images).map((img) => {
          return new Promise<void>((resolve, reject) => {
            if (img.complete && img.naturalHeight !== 0) {
              resolve();
            } else {
              img.onload = () => resolve();
              img.onerror = () => reject(new Error(`Failed to load image: ${img.src}`));
            }
          });
        })
      );
      console.log('All images loaded');
    }

    // הוסף השהייה קטנה כדי לוודא שהכל נטען
    await new Promise(resolve => setTimeout(resolve, 100));

    console.log('Capturing with html2canvas...');

    // צלם את התצוגה המקדימה עם הגדרות אופטימליות
    const canvas = await html2canvas(previewElement as HTMLElement, {
      useCORS: true,
      scale: 2, // איכות גבוהה יותר
      logging: true,
      backgroundColor: null,
      allowTaint: true,
      foreignObjectRendering: true,
      removeContainer: false,
      imageTimeout: 15000,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector('.ad-content');
        if (clonedElement) {
          clonedElement.classList.add('capturing');
        }
      }
    });

    console.log('Canvas captured, converting to data URL...');

    // המר את הקנבס ל-URL עם איכות מקסימלית
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    
    // המר את ה-URL ל-Blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    // צור קובץ מה-Blob
    const file = new File([blob], "ad-preview.png", { 
      type: "image/png",
      lastModified: Date.now()
    });
    
    console.log('File created successfully');
    return file;

  } catch (error) {
    console.error("Error capturing preview:", error);
    return null;
  }
}