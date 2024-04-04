import { WebglUtils } from '../utils/webgl-utils.ts';
import { flattenMatrix } from '../utils/vector.ts';
import { computeConvexHull } from '../utils/geometry.ts';
import { Shape } from './shape.ts';

export class Polygon extends Shape {
  public static count = 0;
  private isDrawing: boolean;
  /**
   * Constructs a polygon
   *
   * @param startCoordinate The start coordinate of the line relative to GL corodinates
   * @param color
   */
  constructor(startCoordinate: number[], color?: number[]) {
    super();
    this.icon = 'pentagon';
    this.type = 'POLYGON';
    Polygon.count += 1;
    this.id = 'polygon-' + Polygon.count;
    this.name = 'Polygon ' + Polygon.count;
    if (color) {
      this.colors.push([...color]);
      this.colors.push([...color]);
    }
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
    this.colors.push([this.colors[0][0], this.colors[0][1], this.colors[0][2]]);
  }

  computeConvexHull() {
    this.coordinates = computeConvexHull(this.coordinates);
    if (
      this.coordinates.length > this.colors.length &&
      this.colors.length > 0
    ) {
      const color = this.colors[0];
      this.setColor(color);
    }
  }

  finishDrawing() {
    this.removeLastCoordinate();
    this.removeLastCoordinate();
    // Compute the convex hull of the coordinates
    this.computeConvexHull();
    this.isDrawing = false;
    const color = this.colors[0];
    this.colors = [];

    for (let i = 0; i < this.coordinates.length; i++) {
      this.colors.push([...color]);
    }
  }

  removeLastCoordinate() {
    if (this.coordinates.length > 2) {
      this.coordinates.pop();
    }
  }

  removeCoordinate(coordinate: number[]): void {
    const index = this.coordinates.findIndex(
      (coord) => coord[0] === coordinate[0] && coord[1] === coordinate[1]
    );
    if (index !== -1) {
      this.coordinates.splice(index, 1);
      this.colors.splice(index, 1);
      this.computeConvexHull();
    } else {
      console.log('Coordinate not found');
    }
  }

  setIsDrawing(isDrawing: boolean) {
    this.isDrawing = isDrawing;
  }

  render(webglUtils: WebglUtils) {
    // If there are no coordinates, return
    if (this.coordinates.length === 0) {
      return;
    }

    // Set the color for every point
    webglUtils.renderColor(new Float32Array(flattenMatrix(this.colors)), 4);

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
      // Convert the coordinates to a flat array for rendering
      const coordinates = new Float32Array(this.coordinates.flat());

      // Render the convex hull
      webglUtils.renderVertex(coordinates, 2);
      webglUtils.gl.drawArrays(
        webglUtils.gl.TRIANGLE_FAN,
        0,
        this.coordinates.length
      );
    }
  }

  getEdges(): number[][][] {
    const edges: number[][][] = [];
    this.coordinates.forEach((coordinate, index) => {
      if (index < this.coordinates.length - 1) {
        edges.push([this.coordinates[index], this.coordinates[index + 1]]);
      } else {
        edges.push([this.coordinates[index], this.coordinates[0]]);
      }
    });
    return edges;
  }

  onDragMove(coordinate: number[]): void {
    if (this.activeVertexIndex !== null) {
      this.coordinates[this.activeVertexIndex] = coordinate;
    }
  }
}
