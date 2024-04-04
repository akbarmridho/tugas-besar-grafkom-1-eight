import { orientation, distSq } from './math.ts';
import { Shape } from '../models/shape.ts';

/**
 * Computes the convex hull of a set of points using the Graham's scan algorithm.
 * Reference: https://www.geeksforgeeks.org/convex-hull-using-graham-scan/
 *
 * @param points - An array of points, where each point is represented as a two-element number array [x, y].
 * @returns An array of points that make up the convex hull, in counterclockwise order.
 */
export function computeConvexHull(points: number[][]): number[][] {
  let n = points.length;
  let minY = points[0][1];
  let min = 0;

  for (let i = 1; i < n; i++) {
    let y = points[i][1];

    if (y < minY || (minY == y && points[i][0] < points[min][0])) {
      minY = points[i][1];
      min = i;
    }
  }

  [points[0], points[min]] = [points[min], points[0]];

  let p0 = points[0];
  points.sort((p1, p2) => compare(p1, p2, p0));

  let m = 1;
  for (let i = 1; i < n; i++) {
    while (i < n - 1 && orientation(p0, points[i], points[i + 1]) == 0) {
      i++;
    }
    points[m] = points[i];
    m++;
  }

  if (m < 3) return [];

  let S: number[][] = [points[0], points[1], points[2]];
  for (let i = 3; i < m; i++) {
    while (
      S.length >= 2 &&
      orientation(nextToTop(S), S[S.length - 1], points[i]) != 2
    ) {
      S.pop();
    }
    S.push(points[i]);
  }

  return S;
}

/**
 * Returns the next-to-top point in the stack.
 *
 * @param S - The stack of points.
 * @returns The next-to-top point in the stack.
 */
function nextToTop(S: number[][]): number[] {
  return S[S.length - 2];
}

/**
 * Compares two points with respect to their polar angle and distance from a reference point.
 *
 * @param p1 - The first point.
 * @param p2 - The second point.
 * @param p0 - The reference point.
 * @returns -1 if p1 has a smaller polar angle or is closer to p0, 1 otherwise.
 */
function compare(p1: number[], p2: number[], p0: number[]): number {
  let o = orientation(p0, p1, p2);
  if (o == 0) return distSq(p0, p2) >= distSq(p0, p1) ? -1 : 1;
  return o == 2 ? -1 : 1;
}

export function getShapeIntersections(shape1: Shape, shape2: Shape) {
  const vertices1 = shape1.getCoordinates();
  const vertices2 = shape2.getCoordinates();
  let vertices: number[][] = [];

  // find the vertices that are inside the shapes
  vertices1.forEach((vertice) => {
    if (shape2.isContained(vertice)) vertices.push([...vertice]);
  });
  vertices2.forEach((vertice) => {
    if (shape1.isContained(vertice)) vertices.push([...vertice]);
  });

  const edges1 = shape1.getEdges();
  const edges2 = shape2.getEdges();

  let i = 0;
  for (const edge1 of edges1) {
    for (const edge2 of edges2) {
      i += 1;
      const intersection = lineIntersection(edge1, edge2);
      if (!intersection) continue;
      vertices.push([...intersection]);
    }
  }

  return vertices;
}

function comparePointByY(a: number[], b: number[]) {
  if (a[1] == b[1]) return a[0] - b[0];
  return a[1] - b[1];
}

function comparePointByX(a: number[], b: number[]) {
  if (a[0] == b[0]) return a[1] - b[1];
  return a[0] - b[0];
}

function lineIntersection(
  line1: number[][],
  line2: number[][]
): number[] | null {
  const xdiff = [line1[0][0] - line1[1][0], line2[0][0] - line2[1][0]];
  const ydiff = [line1[0][1] - line1[1][1], line2[0][1] - line2[1][1]];

  function det(a: number[], b: number[]): number {
    return a[0] * b[1] - a[1] * b[0];
  }

  const div = det(xdiff, ydiff);
  if (div === 0) {
    return null;
  }

  const d = [det(line1[0], line1[1]), det(line2[0], line2[1])];
  const x = det(d, xdiff) / div;
  const y = det(d, ydiff) / div;

  // check if x and y is within one of the lines' vertice
  // pick 1 line, sort by Y
  line1.sort(comparePointByY); // we will get line1 sorted from smallest y to largest y
  line2.sort(comparePointByY);
  // also sort by X
  const line1ByX = line1.map((points) => [...points]).sort(comparePointByX);
  const line2ByX = line2.map((points) => [...points]).sort(comparePointByX);
  if (
    y >= line1[0][1] - 0.1 &&
    y <= line1[1][1] + 0.1 &&
    x >= line1ByX[0][0] - 0.1 &&
    x <= line1ByX[1][0] + 0.1 &&
    y >= line2[0][1] - 0.1 &&
    y <= line2[1][1] + 0.1 &&
    x >= line2ByX[0][0] - 0.1 &&
    x <= line2ByX[1][0] + 0.1
  )
    return [x, y];
  return null;
}
