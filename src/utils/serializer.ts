import { Shape } from '../models/shape.ts';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { shapeType } from './interfaces.ts';
import { Line } from '../models/line.ts';
import { Square } from '../models/square.ts';
import { Polygon } from '../models/polygon.ts';
import { Rectangle } from '../models/rectangle.ts';

export const serializeData = (shapes: Shape[]): string => {
  const result = [];

  for (const shape of shapes) {
    result.push(instanceToPlain(shape));
  }

  return JSON.stringify(result);
};

export const deserializeData = (data: string): Shape[] => {
  const result: Shape[] = [];

  const rawData = JSON.parse(data) as any[];

  for (const raw of rawData) {
    const type = raw.type as shapeType;
    let lineCount = 0;
    let squareCount = 0;
    let rectangleCount = 0;
    let polygonCount = 0;

    if (type === 'LINE') {
      const shape = plainToInstance(Line, raw) as any as Line;
      result.push(shape);
      const id = parseInt(shape.getId().split('-')[1]);
      lineCount = Math.max(id, lineCount);
    } else if (type === 'SQUARE') {
      const shape = plainToInstance(Square, raw) as any as Square;
      result.push(shape);
      const id = parseInt(shape.getId().split('-')[1]);
      squareCount = Math.max(id, squareCount);
    } else if (type === 'RECTANGLE') {
      const shape = plainToInstance(Rectangle, raw) as any as Rectangle;
      result.push(shape);
      const id = parseInt(shape.getId().split('-')[1]);
      rectangleCount = Math.max(id, rectangleCount);
    } else if (type === 'POLYGON') {
      const shape = plainToInstance(Polygon, raw) as any as Polygon;
      result.push(shape);
      const id = parseInt(shape.getId().split('-')[1]);
      polygonCount = Math.max(id, polygonCount);
    }

    Line.count = lineCount;
    Square.count = squareCount;
    Rectangle.count = rectangleCount;
    Polygon.count = polygonCount;
  }

  return result;
};
