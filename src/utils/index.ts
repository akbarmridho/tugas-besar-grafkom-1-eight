export function getCoordinate(canvas: HTMLCanvasElement, e: MouseEvent) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = 2 / canvas.width;
  const scaleY = -2 / canvas.height;

  const xRelativeToCanvas = e.clientX - rect.left;
  const yRelativeToCanvas = e.clientY - rect.top;

  const x = scaleX * xRelativeToCanvas - 1;
  const y = scaleY * yRelativeToCanvas + 1;

  return [x, y];
}
