import { WebglUtils } from './utils/webgl-utils.ts';
import { flattenMatrix } from './utils/vector.ts';
import { shapeType } from './utils/interfaces.ts';

export abstract class Shape {
  protected coordinates: number[][];
  protected colors: number[][];
  protected translation: number[];
  protected scaleVector: number[];
  protected rotation: number;
  protected centroid: number[];
  protected isActive: boolean;
  protected type: shapeType;
  protected id: string = '';
  protected name: string = '';
  protected icon:
    | 'square'
    | 'slash'
    | 'rectangle-horizontal'
    | 'pentagon'
    | '' = '';

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

  getName() {
    return this.name;
  }

  getId() {
    return this.id;
  }

  getIcon() {
    return this.icon;
  }

  setColor(newColor: number[]) {
    for (let i = 0; i < this.colors.length; i++) {
      this.colors[i] = newColor;
    }
  }

  getIsActive() {
    return this.isActive;
  }

  setIsActive(isActive: boolean) {
    this.isActive = isActive;
  }
  abstract render(webglUtils: WebglUtils): void;
  abstract translate(x: number, y: number): void;
  abstract scale(x: number, y: number): void;
  abstract rotate(degree: number): void;
}

export class Line extends Shape {
  public static count = 0;
  /**
   * Constructs a line
   *
   * @param startCoordinate The start coordinate of the line relative to GL corodinates
   * @param color
   */
  constructor(startCoordinate: number[], color: number[]) {
    super();
    this.icon = 'slash';
    this.type = 'LINE';
    Line.count += 1;
    this.id = 'line-' + Line.count;
    this.name = 'Line ' + Line.count;
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

  rotate(degree: number): void {}

  scale(x: number, y: number): void {}

  translate(x: number, y: number): void {}
}

export class Rectangle extends Shape {
  public static count = 0;
  /**
   * Constructs a rectangle
   *
   * @param startCoordinate The start coordinate of the line relative to GL corodinates
   * @param color
   */
  constructor(startCoordinate: number[], color: number[]) {
    super();
    this.icon = 'rectangle-horizontal';
    this.type = 'RECTANGLE';
    Rectangle.count += 1;
    this.id = 'rectangle-' + Rectangle.count;
    this.name = 'Rectangle ' + Rectangle.count;
    this.colors.push(color);
    for (let i = 0; i < 2; i++) {
      this.coordinates.push(startCoordinate);
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
    if (this.coordinates.length !== 2) {
      return;
    }

    // color for every point
    webglUtils.renderColor(
      new Float32Array(
        flattenMatrix([
          this.colors[0],
          this.colors[0],
          this.colors[0],
          this.colors[0],
          this.colors[0],
          this.colors[0]
        ])
      ),
      4
    );

    const x1 = this.coordinates[0][0];
    const y1 = this.coordinates[0][1];
    const x2 = this.coordinates[1][0];
    const y2 = this.coordinates[1][1];

    // draw two triangle
    const coordinates = new Float32Array([
      x1,
      y1,
      x2,
      y1,
      x1,
      y2,
      x1,
      y2,
      x2,
      y1,
      x2,
      y2
    ]);

    webglUtils.renderVertex(coordinates, 2);
    webglUtils.gl.drawArrays(webglUtils.gl.TRIANGLES, 0, 6);
  }

  rotate(degree: number): void {}

  scale(x: number, y: number): void {}

  translate(x: number, y: number): void {}
}

export class Square extends Shape {
  public static count = 0;
  /**
   * Constructs a rectangle
   *
   * @param startCoordinate The start coordinate of the line relative to GL corodinates
   * @param color
   */
  constructor(startCoordinate: number[], color: number[]) {
    super();
    this.icon = 'square';
    this.type = 'SQUARE';
    Square.count += 1;
    this.id = 'square-' + Square.count;
    this.name = 'square ' + Square.count;
    this.colors.push(color);
    for (let i = 0; i < 2; i++) {
      this.coordinates.push(startCoordinate);
    }
  }

  /**
   * Update the end coordinate
   *
   * @param endCoordinate
   */
  updateEndCoordinate(endCoordinate: number[]) {
    const startCoordinate = this.coordinates[0];

    const width = Math.min(
      Math.abs(startCoordinate[0] - endCoordinate[0]),
      Math.abs(startCoordinate[1] - endCoordinate[1])
    );

    if (endCoordinate[0] < startCoordinate[0]) {
      endCoordinate[0] = startCoordinate[0] - width;
    } else {
      endCoordinate[0] = startCoordinate[0] + width;
    }

    if (endCoordinate[1] < startCoordinate[1]) {
      endCoordinate[1] = startCoordinate[1] - width;
    } else {
      endCoordinate[1] = startCoordinate[1] + width;
    }

    this.coordinates[this.coordinates.length - 1] = endCoordinate;
  }

  render(webglUtils: WebglUtils) {
    if (this.coordinates.length !== 2) {
      return;
    }

    // color for every point
    webglUtils.renderColor(
      new Float32Array(
        flattenMatrix([
          this.colors[0],
          this.colors[0],
          this.colors[0],
          this.colors[0],
          this.colors[0],
          this.colors[0]
        ])
      ),
      4
    );

    const x1 = this.coordinates[0][0];
    const y1 = this.coordinates[0][1];
    const x2 = this.coordinates[1][0];
    const y2 = this.coordinates[1][1];

    // draw two triangle
    const coordinates = new Float32Array([
      x1,
      y1,
      x2,
      y1,
      x1,
      y2,
      x1,
      y2,
      x2,
      y1,
      x2,
      y2
    ]);

    webglUtils.renderVertex(coordinates, 2);
    webglUtils.gl.drawArrays(webglUtils.gl.TRIANGLES, 0, 6);
  }

  rotate(degree: number): void {}

  scale(x: number, y: number): void {}

  translate(x: number, y: number): void {}
}
