import { Shape } from './shape.ts';
import { Config } from './utils/interfaces.ts';
import { Tweakpane } from './components/tweakpane.ts';

export const shapes: Shape[] = [];

export const config: Config = {
  type: '',
  isMouseDown: false,
  isDrawingPolygon: false
};

export const tweakpane = new Tweakpane(shapes);
