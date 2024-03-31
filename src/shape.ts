import { WebglUtils } from './utils/webgl-utils.ts';
import { flattenMatrix } from './utils/vector.ts';

export type shapeType = 'LINE' | 'RECTANGLE' | 'POLYGON' | 'SQUARE' | '';
export abstract class Shape {
  protected coordinates: number[][];
  protected colors: number[][];
  protected translation: number[];
  protected scaleVector: number[];
  protected rotation: number;
  protected centroid: number[];
  protected isActive: boolean;
  protected type: shapeType;

  constructor(
    coordinates?: number[][],
    colors?: number[][],
    translation?: number[],
    scaleVector?: number[],
    rotation?: number,
    centroid?: number[],
    isActive?: boolean
  ) {
    this.coordinates = coordinates || [];
    this.colors = colors || [];
    this.translation = translation || [0, 0];
    this.scaleVector = scaleVector || [0, 0];
    this.rotation = rotation || 0;
    this.centroid = centroid || [0, 0];
    this.isActive = isActive || false;
    this.type = '';
  }

  getPosition() {
    return this.coordinates;
  }

  getType() {
    return this.type;
  }

  getColor() {
    return this.colors;
  }

  getTranslation() {
    return this.translation;
  }

  getScaleVector() {
    return this.scaleVector;
  }

  getRotation() {
    return this.rotation;
  }

  getCentroid() {
    return this.centroid;
  }

  setColor(newColor: number[]) {
    for (let i = 0; i < this.colors.length; i++) {
      this.colors[i] = newColor;
    }
  }

  getIsActive() {
    return this.isActive;
  }
  abstract render(webglUtils: WebglUtils): void;
  abstract translate(x: number, y: number): void;
  abstract scale(x: number, y: number): void;
  abstract rotate(degree: number): void;
  abstract setActive(active: boolean): void;
}

export class Line extends Shape {
  /**
   * Constructs a line
   *
   * @param startCoordinate The start coordinate of the line relative to GL corodinates
   * @param color
   */
  constructor(startCoordinate: number[], color: number[]) {
    super();
    this.type = 'LINE';
    for (let i = 0; i < 2; i++) {
      this.coordinates.push(startCoordinate);
      this.colors.push(color);
    }
  }

  /**
   * Update the end coordinate
   *
   * @param endCoordinate
   */
  updateEndCoordinate(endCoordinate: number[]) {
    this.coordinates[this.coordinates.length - 1] = endCoordinate;
  }

  render(webglUtils: WebglUtils) {
    webglUtils.renderColor(new Float32Array(flattenMatrix(this.colors)), 4);
    webglUtils.renderVertex(
      new Float32Array(flattenMatrix(this.coordinates)),
      2
    );
    for (let i = 0; i < this.coordinates.length; i += 2) {
      webglUtils.gl.drawArrays(webglUtils.gl.LINES, i, 2);
    }
  }
}
