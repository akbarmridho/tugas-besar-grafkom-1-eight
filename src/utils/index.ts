export interface RGB {
  r: number;
  g: number;
  b: number;
}
export function getCoordinate(canvas: HTMLCanvasElement, e: MouseEvent) {
  const rect = canvas.getBoundingClientRect();

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  return [x, y];
}

export function normalizeRgbColor({ r, g, b }: RGB) {
  return [r / 255, g / 255, b / 255, 1];
}

export function rgbToHex({ r, g, b }: RGB) {
  return (
    '#' +
    ((1 << 24) + (Math.floor(r) << 16) + (Math.floor(g) << 8) + Math.floor(b))
      .toString(16)
      .slice(1)
  );
}

export function arrayToRgbAndDenormalize(values: number[]): RGB {
  return {
    r: values[0] * 255,
    g: values[1] * 255,
    b: values[2] * 255
  };
}
