export type shapeType = 'LINE' | 'RECTANGLE' | 'POLYGON' | 'SQUARE' | '';
export interface Config {
  type: shapeType;
  isMouseDown: boolean;
}
