import { WebglUtils } from '../utils/webgl-utils.ts';
import { flattenMatrix } from '../utils/vector.ts';
import { Shape } from './shape.ts';

export class Line extends Shape {
  public static count = 0;
  /**
   * Constructs a line
   *
   * @param startCoordinate The start coordinate of the line relative to GL coordinates
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

  onDragMove(coordinate: number[]): void {
    if (this.dragPivot === null) {
      return;
    }

    if (
      this.coordinates[0][0] === this.dragPivot[0] &&
      this.coordinates[0][1] === this.dragPivot[1]
    ) {
      this.coordinates[1] = coordinate;
    } else if (
      this.coordinates[1][0] === this.dragPivot[0] &&
      this.coordinates[1][1] === this.dragPivot[1]
    ) {
      this.coordinates[0] = coordinate;
    }
  }

  getEdges(): number[][][] {
    return [];
  }
}
