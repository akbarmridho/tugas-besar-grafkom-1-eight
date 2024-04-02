import { Line, Polygon, Rectangle, Shape, Square } from '../shape.ts';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { shapeType } from './interfaces.ts';

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

    if (type === 'LINE') {
      result.push(plainToInstance(Line, raw) as any as Line);
    } else if (type === 'SQUARE') {
      result.push(plainToInstance(Square, raw) as any as Square);
    } else if (type === 'RECTANGLE') {
      result.push(plainToInstance(Rectangle, raw) as any as Rectangle);
    } else if (type === 'POLYGON') {
      result.push(plainToInstance(Polygon, raw) as any as Polygon);
    }
  }

  return result;
};
