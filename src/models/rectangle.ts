import { WebglUtils } from '../utils/webgl-utils.ts';
import { flattenMatrix } from '../utils/vector.ts';
import { Shape } from './shape.ts';

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
    /**
     * Elements order:
     * top-left, bottom-left, top-right, bottom-right
     */
    for (let i = 0; i < 4; i++) {
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

    /**
     * Elements order:
     * top-left, bottom-left, top-right, bottom-right
     */

    // color for every point
    webglUtils.renderColor(
      new Float32Array(
        flattenMatrix([
          this.colors[0],
          this.colors[2],
          this.colors[1],
          this.colors[1],
          this.colors[2],
          this.colors[3]
        ])
      ),
      4
    );

    const x1 = this.coordinates[0][0];
    const y1 = this.coordinates[0][1];
    const x2 = this.coordinates[3][0];
    const y2 = this.coordinates[3][1];

    // draw two triangle
    const coordinates = new Float32Array([
      x1,
      y1, // top left
      x2,
      y1, // top right
      x1,
      y2, // bottom left
      x1,
      y2, // bottom left
      x2,
      y1, // top right
      x2,
      y2 // bottom right
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

  onDragMove(coordinate: number[]): void {
    if (this.dragPivot === null) {
      return;
    }
    /**
     * Elements order:
     * top-left, bottom-left, top-right, bottom-right
     */
    if (this.dragQuadrant === 'TOP_LEFT') {
      this.coordinates[0] = [coordinate[0], coordinate[1]];
      this.coordinates[1] = [coordinate[0], this.dragPivot[1]];
      this.coordinates[2] = [this.dragPivot[0], coordinate[1]];
      this.coordinates[3] = [this.dragPivot[0], this.dragPivot[1]];
    } else if (this.dragQuadrant === 'TOP_RIGHT') {
      this.coordinates[0] = [this.dragPivot[0], coordinate[1]];
      this.coordinates[1] = [this.dragPivot[0], this.dragPivot[1]];
      this.coordinates[2] = [coordinate[0], coordinate[1]];
      this.coordinates[3] = [coordinate[0], this.dragPivot[1]];
    } else if (this.dragQuadrant === 'BOTTOM_LEFT') {
      this.coordinates[0] = [coordinate[0], this.dragPivot[1]];
      this.coordinates[1] = [coordinate[0], coordinate[1]];
      this.coordinates[2] = [this.dragPivot[0], this.dragPivot[1]];
      this.coordinates[3] = [this.dragPivot[0], coordinate[1]];
    } else if (this.dragQuadrant === 'BOTTOM_RIGHT') {
      this.coordinates[0] = [this.dragPivot[0], this.dragPivot[1]];
      this.coordinates[1] = [this.dragPivot[0], coordinate[1]];
      this.coordinates[2] = [coordinate[0], this.dragPivot[1]];
      this.coordinates[3] = [coordinate[0], coordinate[1]];
    }
  }

  getEdges(): number[][][] {
    return [
      [this.coordinates[0], this.coordinates[1]],
      [this.coordinates[0], this.coordinates[2]],
      [this.coordinates[1], this.coordinates[3]],
      [this.coordinates[2], this.coordinates[3]]
    ];
  }
}
