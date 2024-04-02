import './style.css';
import { initializeIcons } from './utils/lucide-icons.ts';

import { Tweakpane } from './utils/tweakpane.ts';
import { WebglUtils } from './utils/webgl-utils.ts';
import { Line, Rectangle, Shape, Square, Polygon } from './shape.ts';
import { getCoordinate, normalizeRgbColor, rgbToHex } from './utils';
import { handleOnShapeAdded } from './components/shapes-list.ts';
import { Config } from './utils/interfaces.ts';
import {
  onShapeButtonClick,
  setupCursorButtonClick
} from './components/shape-btn.ts';
// @ts-ignore
import vertexShaderSource from './glsl/vertex.glsl';
// @ts-ignore
import fragmentShaderSource from './fragment/fragment.frag';

document.addEventListener('DOMContentLoaded', function () {
  onDocumentReady();
});

initializeIcons();

const shapes: Shape[] = [];

const onDocumentReady = () => {
  // init variables
  const config: Config = {
    type: '',
    isMouseDown: false,
    isDrawingPolygon: false
  };
  const tweakpane = new Tweakpane(shapes);
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  if (!canvas) return;

  // init gl
  const gl = canvas.getContext('webgl');
  if (!gl) return;
  const webglUtils = new WebglUtils(gl);
  const vertexShader = webglUtils.compileShader(
    vertexShaderSource,
    gl.VERTEX_SHADER
  );
  const fragmentShader = webglUtils.compileShader(
    fragmentShaderSource,
    gl.FRAGMENT_SHADER
  );
  webglUtils.createProgram(vertexShader, fragmentShader);

  // loop render
  const render = () => {
    webglUtils.clear();
    shapes.forEach((shape) => {
      shape.render(webglUtils);
    });
    window.requestAnimationFrame(render);
  };

  render();

  setupCursorButtonClick(config);
  onShapeButtonClick('line-btn', 'LINE', config);
  onShapeButtonClick('square-btn', 'SQUARE', config);
  onShapeButtonClick('rectangle-btn', 'RECTANGLE', config);
  onShapeButtonClick('polygon-btn', 'POLYGON', config);

  // canvas logic
  canvas.onmousedown = (e: MouseEvent) => {
    config.isMouseDown = true;
    let newShape: Shape | null = null;
    const coordinate = getCoordinate(canvas, e);
    const selectedColor = tweakpane.selectedColor;
    switch (config.type) {
      case 'LINE':
        shapes.push(
          (newShape = new Line(coordinate, normalizeRgbColor(selectedColor)))
        );
        break;
      case 'RECTANGLE':
        shapes.push(
          (newShape = new Rectangle(
            coordinate,
            normalizeRgbColor(selectedColor)
          ))
        );
        break;
      case 'SQUARE':
        shapes.push(
          (newShape = new Square(coordinate, normalizeRgbColor(selectedColor)))
        );
        break;
      case 'POLYGON':
        if (!config.isDrawingPolygon) {
          shapes.push(
              (newShape = new Polygon(coordinate, normalizeRgbColor(selectedColor)))
          )
          config.isDrawingPolygon = true
        }
        break;
    }
    if (!!newShape) {
      handleOnShapeAdded(newShape, rgbToHex(selectedColor), shapes, config);
    }
  };

  canvas.onmousemove = (e: MouseEvent) => {
    const coordinate = getCoordinate(canvas, e);
    const lastShape = shapes[shapes.length - 1];

    if (config.isDrawingPolygon && config.type == 'POLYGON' && lastShape instanceof Polygon) {
      const polygon = lastShape as Polygon;
      polygon.updateEndCoordinate(coordinate)
    }

    if (!config.isMouseDown) return;

    if (config.type == 'LINE' && lastShape instanceof Line) {
      const line = lastShape as Line;
      line.updateEndCoordinate(coordinate);
    } else if (config.type == 'RECTANGLE' && lastShape instanceof Rectangle) {
      const rectangle = lastShape as Rectangle;
      rectangle.updateEndCoordinate(coordinate);
    } else if (config.type == 'SQUARE' && lastShape instanceof Square) {
      const square = lastShape as Square;
      square.updateEndCoordinate(coordinate);
    }
  };

  canvas.onmouseup = () => {
    config.isMouseDown = false;
  };

  canvas.onclick = (e: MouseEvent) => {
    if (config.type == 'POLYGON' && config.isDrawingPolygon) {
      const coordinate = getCoordinate(canvas, e);
      const lastShape = shapes[shapes.length - 1];

      const polygon = lastShape as Polygon
      polygon.addCoordinate(coordinate)
    }
  }

  canvas.ondblclick = (e: MouseEvent) => {
    if (config.type == 'POLYGON' && config.isDrawingPolygon) {
      const lastShape = shapes[shapes.length - 1];
      const polygon = lastShape as Polygon

      polygon.finishDrawing()
      config.isDrawingPolygon = false
    }
  }
};
