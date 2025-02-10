
export const applyImageEffect = async (
  canvas: HTMLCanvasElement,
  effect: 'sepia' | 'none'
): Promise<string> => {
  // Simply return the canvas data URL without any effects
  return canvas.toDataURL('image/jpeg', 0.95);
};
