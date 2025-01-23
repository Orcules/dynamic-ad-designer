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
    // מצא את האלמנט של המודעה
    const adElement = previewRef.current.querySelector('.ad-content');
    if (!adElement) {
      console.error('Ad content element not found');
      return null;
    }

    console.log('Starting preview capture process...');

    // חכה שכל הפונטים יטענו
    await document.fonts.ready;
    console.log('Fonts loaded successfully');

    // חכה שכל התמונות יטענו
    const images = adElement.getElementsByTagName('img');
    await Promise.all(
      Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to load image: ${img.src}`));
        });
      })
    );
    console.log('All images loaded successfully');

    // צור העתק של האלמנט
    const rect = adElement.getBoundingClientRect();
    const canvas = await html2canvas(adElement as HTMLElement, {
      useCORS: true,
      scale: 2, // איכות גבוהה יותר
      width: rect.width,
      height: rect.height,
      backgroundColor: null,
      logging: true,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector('.ad-content');
        if (clonedElement) {
          // העתק את כל הסטיילים
          const styles = window.getComputedStyle(adElement);
          Array.from(styles).forEach(key => {
            (clonedElement as HTMLElement).style[key as any] = styles.getPropertyValue(key);
          });
        }
      }
    });

    console.log('Canvas captured successfully');

    // המר ל-JPEG באיכות גבוהה
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    const file = new File([blob], "ad-preview.jpg", { 
      type: "image/jpeg",
      lastModified: Date.now()
    });

    console.log('JPEG file created successfully');
    return file;

  } catch (error) {
    console.error("Error capturing preview:", error);
    return null;
  }
}