/**
 * Computes the orientation of an ordered triplet of points in the plane.
 *
 * @param p - The first point in the triplet.
 * @param q - The second point in the triplet.
 * @param r - The third point in the triplet.
 * @returns 0 if the points are collinear, 1 if they make a clockwise turn, and 2 if they make a counterclockwise turn.
 */
export function orientation(p: number[], q: number[], r: number[]): number {
  let val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);
  if (val == 0) return 0;
  return val > 0 ? 1 : 2;
}

/**
 * Computes the square of the Euclidean distance between two points.
 *
 * @param p1 - The first point.
 * @param p2 - The second point.
 * @returns The square of the distance between the points.
 */
export function distSq(p1: number[], p2: number[]): number {
  return (p1[0] - p2[0]) * (p1[0] - p2[0]) + (p1[1] - p2[1]) * (p1[1] - p2[1]);
}
