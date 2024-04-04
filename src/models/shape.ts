import { WebglUtils } from '../utils/webgl-utils.ts';
import { flattenMatrix } from '../utils/vector.ts';
import { shapeType } from '../utils/interfaces.ts';

export abstract class Shape {
  protected coordinates: number[][];
  protected colors: number[][];
  protected scaleFactor: number;
  protected rotation: number;
  protected isActive: boolean;
  public activeVertex: number[] | null;
  public activeVertexIndex: number | null;
  protected type: shapeType;
  protected id: string = '';
  protected name: string = '';
  protected icon:
    | 'square'
    | 'slash'
    | 'rectangle-horizontal'
    | 'pentagon'
    | '' = '';
  protected dragPivot: number[] | null;
  protected dragQuadrant:
    | 'TOP_LEFT'
    | 'TOP_RIGHT'
    | 'BOTTOM_LEFT'
    | 'BOTTOM_RIGHT'
    | '';

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
    this.activeVertexIndex = null;
    this.dragPivot = null;
    this.dragQuadrant = '';
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

  getCoordinates() {
    return this.coordinates;
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
    this.colors = [];
    for (let i = 0; i < this.coordinates.length; i++) {
      this.colors.push(newColor);
    }
  }

  setActiveVertexColor(newColor: number[]) {
    if (this.activeVertexIndex !== null) {
      this.colors[this.activeVertexIndex] = newColor;
    }
  }

  getIsActive() {
    return this.isActive;
  }

  setIsActive(isActive: boolean) {
    this.isActive = isActive;

    if (!isActive) {
      this.activeVertex = null;
      this.activeVertexIndex = null;
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
    let closestIndex: number | null = null;

    for (const [i, coordinate] of this.coordinates.entries()) {
      const dist =
        (coordinate[0] - clickCoordinate[0]) ** 2 +
        (coordinate[1] - clickCoordinate[1]) ** 2;

      if (dist < threshold) {
        closest = coordinate;
        closestIndex = i;
        break;
      }
    }

    this.activeVertex = closest;
    this.activeVertexIndex = closestIndex;

    return this.activeVertex !== null;
  }

  onDragStart(coordinate: number[]) {
    const [xCentroid, yCentroid] = this.getCentroid();
    let x: number = xCentroid;
    let y: number = yCentroid;

    if (coordinate[0] < xCentroid) {
      if (coordinate[1] < yCentroid) {
        // the pivot is bottom right

        this.coordinates.forEach((c) => {
          if (x < c[0]) {
            x = c[0];
          }

          if (y < c[1]) {
            y = c[1];
          }
        });

        this.dragPivot = [x, y];
        this.dragQuadrant = 'TOP_LEFT';
      } else {
        // the pivot is top right

        this.coordinates.forEach((c) => {
          if (x < c[0]) {
            x = c[0];
          }

          if (c[1] < y) {
            y = c[1];
          }
        });

        this.dragPivot = [x, y];
        this.dragQuadrant = 'BOTTOM_LEFT';
      }
    } else {
      if (coordinate[1] < yCentroid) {
        // the pivot is bottom left

        this.coordinates.forEach((c) => {
          if (c[0] < x) {
            x = c[0];
          }

          if (y < c[1]) {
            y = c[1];
          }
        });

        this.dragPivot = [x, y];
        this.dragQuadrant = 'TOP_RIGHT';
      } else {
        // the pivot is top left

        this.coordinates.forEach((c) => {
          if (c[0] < x) {
            x = c[0];
          }

          if (c[1] < y) {
            y = c[1];
          }
        });

        this.dragPivot = [x, y];
        this.dragQuadrant = 'BOTTOM_RIGHT';
      }
    }
  }

  onDragEnd() {
    this.dragPivot = null;
  }

  abstract onDragMove(coordinate: number[]): void;
  isContained(coordinate: number[]): boolean {
    const numVertices = this.coordinates.length;
    const x = coordinate[0];
    const y = coordinate[1];
    let isContained = false;

    let p1 = this.coordinates[0];
    let p2;

    for (let i = 1; i <= numVertices; i++) {
      p2 = this.coordinates[i % numVertices];

      if (y > Math.min(p1[1], p2[1])) {
        if (y <= Math.max(p1[1], p2[1])) {
          if (x <= Math.max(p1[0], p2[0])) {
            const xIntersection =
              ((y - p1[1]) * (p2[0] - p1[0])) / (p2[1] - p1[1]) + p1[0];

            if (p1[0] === p2[0] || x <= xIntersection) {
              isContained = !isContained;
            }
          }
        }
      }

      p1 = p2;
    }

    return isContained;
  }
  abstract render(webglUtils: WebglUtils): void;
  abstract getEdges(): number[][][];
}
