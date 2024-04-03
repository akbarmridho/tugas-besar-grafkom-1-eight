import { orientation, distSq } from './math.ts';

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
