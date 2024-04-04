import { WebglUtils } from './utils/webgl-utils.ts';
import { flattenMatrix } from './utils/vector.ts';
import { shapeType } from './utils/interfaces.ts';
import { computeConvexHull } from './utils/geometry.ts';

export abstract class Shape {
  protected coordinates: number[][];
  protected colors: number[][];
  protected scaleFactor: number;
  protected rotation: number;
  protected isActive: boolean;
  public activeVertex: number[] | null;
  protected type: shapeType;
  protected id: string = '';
  protected name: string = '';
  protected icon:
    | 'square'
    | 'slash'
    | 'rectangle-horizontal'
    | 'pentagon'
    | '' = '';

  protected constructor(
    coordinates?: number[][],
    colors?: number[][],
    rotation?: number,
    isActive?: boolean
  ) {
    this.coordinates = coordinates || [];
    this.colors = colors || [];
    this.scaleFactor = 1;
    this.rotation = rotation || 0;
    this.isActive = isActive || false;
    this.type = '';
    this.activeVertex = null;
  }

  getType() {
    return this.type;
  }

  getColor() {
    return this.colors;
  }

  getScaleFactor() {
    return this.scaleFactor;
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

    if (!isActive) {
      this.activeVertex = null;
    }
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

  renderOutline(webglUtils: WebglUtils): void {
    if (!this.isActive) {
      return;
    }

    // color for every point
    const colors = [];

    for (const coordinate of this.coordinates) {
      if (
        this.activeVertex !== null &&
        this.activeVertex[0] === coordinate[0] &&
        this.activeVertex[1] === coordinate[1]
      ) {
        colors.push([0, 0, 1, 1]); // blue
      } else {
        colors.push([0, 0, 0, 1]); // black
      }
    }

    webglUtils.renderColor(new Float32Array(flattenMatrix(colors)), 4);
    webglUtils.renderVertex(
      new Float32Array(flattenMatrix(this.coordinates)),
      2
    );
    webglUtils.gl.drawArrays(webglUtils.gl.POINTS, 0, this.coordinates.length);
  }

  /**
   * Return true if there is a vertex that close enough
   * @param clickCoordinate
   */
  setActiveVertex(clickCoordinate: number[]): boolean {
    const threshold = 100; // 10^2
    let closest: number[] | null = null;

    for (const coordinate of this.coordinates) {
      const dist =
        (coordinate[0] - clickCoordinate[0]) ** 2 +
        (coordinate[1] - clickCoordinate[1]) ** 2;

      if (dist < threshold) {
        closest = coordinate;
        break;
      }
    }

    this.activeVertex = closest;

    return this.activeVertex !== null;
  }

  abstract isContained(coordinate: number[]): boolean;
  abstract render(webglUtils: WebglUtils): void;
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

  isContained(coordinate: number[]): boolean {
    const threshold = 5; // 5px

    // distance of a point to line
    // d = |Ax1 + By1 + C| / (A2 + B2)½

    const x = coordinate[0];
    const y = coordinate[1];
    const x1 = this.coordinates[0][0];
    const y1 = this.coordinates[0][1];
    const x2 = this.coordinates[1][0];
    const y2 = this.coordinates[1][1];

    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq != 0)
      //in case of 0 length line
      param = dot / len_sq;

    let xx, yy: number;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;

    return Math.sqrt(dx * dx + dy * dy) <= threshold;
  }
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

  isContained(coordinate: number[]): boolean {
    return (
      ((this.coordinates[0][0] < coordinate[0] &&
        coordinate[0] < this.coordinates[3][0]) ||
        (this.coordinates[3][0] < coordinate[0] &&
          coordinate[0] < this.coordinates[0][0])) &&
      ((this.coordinates[0][1] < coordinate[1] &&
        coordinate[1] < this.coordinates[3][1]) ||
        (this.coordinates[3][1] < coordinate[1] &&
          coordinate[1] < this.coordinates[0][1]))
    );
  }
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

  isContained(coordinate: number[]): boolean {
    return (
      ((this.coordinates[0][0] < coordinate[0] &&
        coordinate[0] < this.coordinates[3][0]) ||
        (this.coordinates[3][0] < coordinate[0] &&
          coordinate[0] < this.coordinates[0][0])) &&
      ((this.coordinates[0][1] < coordinate[1] &&
        coordinate[1] < this.coordinates[3][1]) ||
        (this.coordinates[3][1] < coordinate[1] &&
          coordinate[1] < this.coordinates[0][1]))
    );
  }
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
    this.appendCoordinate(newCoordinate);
  }

  appendCoordinate(newCoordinate: number[]) {
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
      // Compute the convex hull of the coordinates
      const hullCoordinates = computeConvexHull(this.coordinates);

      // Convert the coordinates to a flat array for rendering
      const coordinates = new Float32Array(hullCoordinates.flat());

      // Render the convex hull
      webglUtils.renderVertex(coordinates, 2);
      webglUtils.gl.drawArrays(
        webglUtils.gl.TRIANGLE_FAN,
        0,
        hullCoordinates.length
      );
    }
  }

  isContained(coordinate: number[]): boolean {
    return false;
  }
}
