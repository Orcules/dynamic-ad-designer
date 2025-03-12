
declare module 'html2canvas' {
  namespace html2canvas {
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
      foreignObjectRendering?: boolean;
      onclone?: (document: Document) => void;
    }
  }

  function html2canvas(element: HTMLElement, options?: Partial<html2canvas.Options>): Promise<HTMLCanvasElement>;
  export default html2canvas;
}
