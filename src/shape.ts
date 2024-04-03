import { WebglUtils } from './utils/webgl-utils.ts';
import { flattenMatrix } from './utils/vector.ts';
import { shapeType } from './utils/interfaces.ts';

export abstract class Shape {
  protected coordinates: number[][];
  protected colors: number[][];
  protected translation: number[];
  protected scaleFactor: number;
  protected rotation: number;
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
    isActive?: boolean
  ) {
    this.coordinates = coordinates || [];
    this.colors = colors || [];
    this.translation = translation || [0, 0];
    this.scaleFactor = 1;
    this.rotation = rotation || 0;
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

  getScaleFactor() {
    return this.scaleFactor;
  }

  getRotation() {
    return this.rotation;
  }

  getCentroid() {
    let sumX = 0;
    let sumY = 0;

    this.coordinates.forEach(([x, y]) => {
      sumX += x;
      sumY += y;
    });

    const centroidX = sumX / this.coordinates.length;
    const centroidY = sumY / this.coordinates.length;

    return [centroidX, centroidY];
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

  getFlattenedColor() {
    return new Float32Array(flattenMatrix(this.colors));
  }

  translate(newCentroidX: number, newCentroidY: number) {
    const centroid = this.getCentroid();

    // Calculate the translation values
    const translateX = newCentroidX + 400 - centroid[0];
    const translateY = newCentroidY + 400 - centroid[1];

    // Translate all points
    for (let i = 0; i < this.coordinates.length; i++) {
      this.coordinates[i][0] += translateX;
      this.coordinates[i][1] += translateY;
    }
  }

  scale(newScale: number) {
    // Calculate the relative scale factor
    const relativeScale = newScale / this.scaleFactor;

    const centroid = this.getCentroid();

    // Translate the shape so that the centroid is at the origin
    const translatedCoordinates = this.coordinates.map((coord) => [
      coord[0] - centroid[0],
      coord[1] - centroid[1]
    ]);

    // Scale the shape
    const scaledCoordinates = translatedCoordinates.map((coord) => [
      coord[0] * relativeScale,
      coord[1] * relativeScale
    ]);

    // Translate the shape back to the original position
    this.coordinates = scaledCoordinates.map((coord) => [
      coord[0] + centroid[0],
      coord[1] + centroid[1]
    ]);

    // Update the current scale factor
    this.scaleFactor = newScale;
  }

  abstract render(webglUtils: WebglUtils): void;
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
    webglUtils.renderColor(this.getFlattenedColor(), 4);
    webglUtils.renderVertex(
      new Float32Array(flattenMatrix(this.coordinates)),
      2
    );
    for (let i = 0; i < this.coordinates.length; i += 2) {
      webglUtils.gl.drawArrays(webglUtils.gl.LINES, i, 2);
    }
  }

  rotate(degree: number): void {}
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
    for (let i = 0; i < 6; i++) {
      this.colors.push(color);
    }
    /**
     * Elements order:
     * top-left, bottom-left, top-right, bottom-right
     */
    for (let i = 0; i < 4; i++) {
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

    // update left-bottom coordinate
    this.coordinates[1] = [startCoordinate[0], endCoordinate[1]];

    // update right-top coordinate
    this.coordinates[2] = [endCoordinate[0], startCoordinate[1]];

    this.coordinates[this.coordinates.length - 1] = endCoordinate;
  }

  render(webglUtils: WebglUtils) {
    if (this.coordinates.length !== 4) {
      return;
    }

    // color for every point
    webglUtils.renderColor(this.getFlattenedColor(), 4);

    const x1 = this.coordinates[0][0];
    const y1 = this.coordinates[0][1];
    const x2 = this.coordinates[3][0];
    const y2 = this.coordinates[3][1];

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
    this.name = 'Square ' + Square.count;
    for (let i = 0; i < 6; i++) {
      this.colors.push(color);
    }
    for (let i = 0; i < 4; i++) {
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

    // update left-bottom coordinate
    this.coordinates[1] = [startCoordinate[0], endCoordinate[1]];

    // update right-top coordinate
    this.coordinates[2] = [endCoordinate[0], startCoordinate[1]];

    this.coordinates[this.coordinates.length - 1] = endCoordinate;
  }

  render(webglUtils: WebglUtils) {
    if (this.coordinates.length !== 4) {
      return;
    }

    // color for every point
    webglUtils.renderColor(this.getFlattenedColor(), 4);

    const x1 = this.coordinates[0][0];
    const y1 = this.coordinates[0][1];
    const x2 = this.coordinates[3][0];
    const y2 = this.coordinates[3][1];

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
}

export class Polygon extends Shape {
  public static count = 0;
  private isDrawing: boolean;
  /**
   * Constructs a polygon
   *
   * @param startCoordinate The start coordinate of the line relative to GL corodinates
   * @param color
   */
  constructor(startCoordinate: number[], color: number[]) {
    super();
    this.icon = 'pentagon';
    this.type = 'POLYGON';
    Polygon.count += 1;
    this.id = 'polygon-' + Polygon.count;
    this.name = 'polygon ' + Polygon.count;
    this.colors.push(color);
    this.coordinates.push(startCoordinate);
    this.isDrawing = true;
  }

  /**
   * Update the end coordinate
   *
   * @param endCoordinate
   */
  updateEndCoordinate(endCoordinate: number[]) {
    this.coordinates[this.coordinates.length - 1] = endCoordinate;
  }

  addCoordinate(newCoordinate: number[]) {
    this.coordinates[this.coordinates.length - 1] = newCoordinate;
    this.coordinates.push(newCoordinate);
  }

  finishDrawing() {
    this.removeLastCoordinate();
    this.removeLastCoordinate();
    this.isDrawing = false;
  }

  removeLastCoordinate() {
    if (this.coordinates.length > 2) {
      this.coordinates.pop();
    }
  }

  render(webglUtils: WebglUtils) {
    // If there are no coordinates, return
    if (this.coordinates.length === 0) {
      return;
    }

    // Set the color for every point
    const colors = new Array(this.coordinates.length).fill(this.colors[0]);
    webglUtils.renderColor(new Float32Array(flattenMatrix(colors)), 4);

    // If the polygon is still being drawn
    if (this.isDrawing) {
      // Draw a line between all coordinates
      for (let i = 0; i < this.coordinates.length - 1; i++) {
        const coordinates = new Float32Array([
          this.coordinates[i][0],
          this.coordinates[i][1],
          this.coordinates[i + 1][0],
          this.coordinates[i + 1][1]
        ]);
        webglUtils.renderVertex(coordinates, 2);
        webglUtils.gl.drawArrays(webglUtils.gl.LINES, 0, 2);
      }
    } else {
      // If the polygon is finished being drawn, draw the polygon
      const coordinates = new Float32Array(this.coordinates.flat());
      webglUtils.renderVertex(coordinates, 2);
      webglUtils.gl.drawArrays(
        webglUtils.gl.TRIANGLE_FAN,
        0,
        this.coordinates.length
      );
    }
  }

  rotate(degree: number): void {}
}
