export function flattenMatrix<T>(matrix: (T | T[])[]): T[] {
  const result: T[] = [];

  matrix.forEach((element) => {
    if (Array.isArray(element)) {
      result.push(...element);
    } else {
      result.push(element);
    }
  });

  return result;
}
