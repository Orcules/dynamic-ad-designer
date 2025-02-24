
declare module 'html2canvas' {
  interface Options {
    backgroundColor: string | null;
    scale: number;
    useCORS: boolean;
    allowTaint: boolean;
    logging: boolean;
    width: number;
    height: number;
    scrollX: number;
    scrollY: number;
    windowWidth: number;
    windowHeight: number;
    x: number;
    y: number;
  }

  function html2canvas(element: HTMLElement, options?: Partial<Options>): Promise<HTMLCanvasElement>;
  export default html2canvas;
}
