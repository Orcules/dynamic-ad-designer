
declare module 'html2canvas' {
  interface Options {
    backgroundColor: string | null;
    scale: number;
    useCORS: boolean;
    allowTaint: boolean;
    logging: boolean;
    width?: number;
    height?: number;
    scrollX: number;
    scrollY: number;
    x: number;
    y: number;
    windowWidth: number;  // Now properly defined in the interface
    windowHeight: number; // Now properly defined in the interface
    foreignObjectRendering?: boolean;
    onclone?: (document: Document) => void | Promise<void>;
    ignoreElements?: (element: Element) => boolean;
    imageTimeout?: number;
    removeContainer?: boolean;
  }
  
  // Add the default export definition
  function html2canvas(element: HTMLElement, options?: Partial<Options>): Promise<HTMLCanvasElement>;
  export default html2canvas;
}
