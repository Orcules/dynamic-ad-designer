
import React from 'react';

export function useAdPreviewFont(fontUrl: string | undefined) {
  const [fontFamily, setFontFamily] = React.useState<string>('');
  const fontLoaded = React.useRef<boolean>(false);
  const fontLoadAttempts = React.useRef<number>(0);
  
  React.useEffect(() => {
    if (!fontUrl) return;
    
    const familyMatch = fontUrl.match(/family=([^:&]+)/);
    if (!familyMatch || !familyMatch[1]) return;
    
    const family = familyMatch[1].replace(/\+/g, ' ');
    console.log(`Setting font family to: ${family} from ${fontUrl}`);
    setFontFamily(family);
    
    if (!document.querySelector(`link[href="${fontUrl}"]`)) {
      const link = document.createElement('link');
      link.href = fontUrl;
      link.rel = 'stylesheet';
      link.onload = () => {
        console.log(`Font loaded in AdPreviewContent: ${family}`);
        fontLoaded.current = true;
        
        setFontFamily(prev => prev + ' ');
        setTimeout(() => setFontFamily(family), 10);
      };
      document.head.appendChild(link);
    } else {
      console.log(`Font already in DOM: ${family}`);
      fontLoaded.current = true;
      
      if (fontLoadAttempts.current < 3) {
        fontLoadAttempts.current++;
        setTimeout(() => {
          setFontFamily(prev => prev + ' ');
          setTimeout(() => setFontFamily(family), 10);
        }, 100);
      }
    }
  }, [fontUrl]);

  return fontFamily;
}
