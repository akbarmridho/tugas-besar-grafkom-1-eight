import { Shape } from './models/shape.ts';
import { Config } from './utils/interfaces.ts';
import { Tweakpane } from './components/tweakpane.ts';

export const shapes: Shape[] = [];

export const config: Config = {
  type: '',
  isMouseDown: false,
  isDrawingPolygon: false,
  draggedShape: null
};

export const tweakpane = new Tweakpane(shapes);

export const getActiveShape = () => {
  return shapes.find((s) => s.getIsActive()) || null;
};

export const getActiveVertex = () => {
  const shape = getActiveShape();

  if (!shape) {
    return null;
  }

  return shape.activeVertex;
};
