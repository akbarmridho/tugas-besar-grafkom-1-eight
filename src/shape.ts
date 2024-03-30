abstract class Shape {
  protected positions: number[];
  protected colors: number[][];
  protected translation: number[];
  protected scaleVector: number[];
  protected rotation: number;
  protected centroid: number[];
  protected isActive: boolean;

  constructor(
    positions: number[],
    colors: number[][],
    translation: number[],
    scaleVector: number[],
    rotation: number,
    centroid: number[],
    isActive: boolean
  ) {
    this.positions = positions || [];
    this.colors = colors || [];
    this.translation = translation || [0, 0];
    this.scaleVector = scaleVector || [0, 0];
    this.rotation = rotation || 0;
    this.centroid = centroid || [0, 0];
    this.isActive = isActive || false;
  }
  abstract translate(x: number, y: number): void;
  abstract scale(x: number, y: number): void;
  abstract rotate(degree: number): void;
  abstract setActive(active: boolean): void;
}
