import { Shape } from '../models/shape.ts';

export type shapeType = 'LINE' | 'RECTANGLE' | 'POLYGON' | 'SQUARE' | '';
export interface Config {
  type: shapeType;
  isMouseDown: boolean;
  isDrawingPolygon: boolean;
  draggedShape: Shape | null;
}
