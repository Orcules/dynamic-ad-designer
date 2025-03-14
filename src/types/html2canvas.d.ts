
declare module 'html2canvas' {
  interface Options {
    backgroundColor: string | null;
    scale: number;
    useCORS: boolean;
    allowTaint: boolean;
    logging: boolean;
    width: number;  // עדכון: הפיכת width לשדה חובה
    height: number; // עדכון: הפיכת height לשדה חובה
    scrollX: number;
    scrollY: number;
    x: number;
    y: number;
    windowWidth: number;
    windowHeight: number;
    foreignObjectRendering?: boolean;
    onclone?: (document: Document) => void | Promise<void>;
    ignoreElements?: (element: Element) => boolean;
    imageTimeout?: number;
    removeContainer?: boolean;
  }
  
  function html2canvas(element: HTMLElement, options?: Partial<Options>): Promise<HTMLCanvasElement>;
  export default html2canvas;
}
