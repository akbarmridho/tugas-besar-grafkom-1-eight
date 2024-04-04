import './style.css';
import { initializeIcons } from './utils/lucide-icons.ts';

import { WebglUtils } from './utils/webgl-utils.ts';
import { Line, Rectangle, Shape, Square, Polygon } from './shape.ts';
import { getCoordinate, normalizeRgbColor, rgbToHex } from './utils';
import { handleOnShapeAdded } from './components/shapes-list.ts';
import {
  onShapeButtonClick,
  setupCursorButtonClick
} from './components/shape-btn.ts';
// @ts-ignore
import vertexShaderSource from './glsl/vertex.glsl';
// @ts-ignore
import fragmentShaderSource from './fragment/fragment.frag';
import { shapes, config, tweakpane } from './state.ts';

document.addEventListener('DOMContentLoaded', function () {
  onDocumentReady();
});

initializeIcons();

const onDocumentReady = () => {
  // init variables
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  if (!canvas) return;

  const channel = new BroadcastChannel('container-button-channel');

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
      shape.renderOutline(webglUtils);
    });
    window.requestAnimationFrame(render);
  };

  render();

  // set uniform resolution
  const resolutionUniformLocation = gl.getUniformLocation(
    webglUtils.program,
    'u_resolution'
  );

  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

  setupCursorButtonClick();
  onShapeButtonClick('line-btn', 'LINE');
  onShapeButtonClick('square-btn', 'SQUARE');
  onShapeButtonClick('rectangle-btn', 'RECTANGLE');
  onShapeButtonClick('polygon-btn', 'POLYGON');

  // canvas logic
  canvas.addEventListener('mousedown', (e: MouseEvent) => {
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
            (newShape = new Polygon(
              coordinate,
              normalizeRgbColor(selectedColor)
            ))
          );
          config.isDrawingPolygon = true;
        }
        break;
    }
    if (!!newShape) {
      handleOnShapeAdded(newShape, rgbToHex(selectedColor), shapes);
    }
  });

  canvas.addEventListener('mousemove', (e: MouseEvent) => {
    const coordinate = getCoordinate(canvas, e);
    const lastShape = shapes[shapes.length - 1];

    if (
      config.isDrawingPolygon &&
      config.type == 'POLYGON' &&
      lastShape instanceof Polygon
    ) {
      const polygon = lastShape as Polygon;
      polygon.updateEndCoordinate(coordinate);
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
  });

  canvas.addEventListener('mouseup', () => {
    config.isMouseDown = false;
  });

  canvas.addEventListener('click', (e) => {
    if (config.type !== '') {
      return;
    }

    e.preventDefault();

    const coordinate = getCoordinate(canvas, e);

    let shapeFound = false;
    let newActiveSet = false;

    for (const shape of shapes) {
      if (shape.getIsActive() && shape.setActiveVertex(coordinate)) {
        // the if statement has side effect
        shapeFound = true;
      } else if (shape.isContained(coordinate) && !newActiveSet) {
        shape.setIsActive(true);
        newActiveSet = true;
        shape.setActiveVertex(coordinate);
        channel.postMessage(shape.getName());
        shapeFound = true;
      } else {
        shape.setIsActive(false);
      }
    }

    if (newActiveSet) {
      tweakpane.refreshParams();
    }

    if (!shapeFound) {
      channel.postMessage(null);
    }
  });

  canvas.addEventListener('click', (e) => {
    if (config.type == 'POLYGON' && config.isDrawingPolygon) {
      const coordinate = getCoordinate(canvas, e);
      const lastShape = shapes[shapes.length - 1];

      const polygon = lastShape as Polygon;
      polygon.addCoordinate(coordinate);
    }
  });

  canvas.addEventListener('dblclick', () => {
    if (config.type == 'POLYGON' && config.isDrawingPolygon) {
      const lastShape = shapes[shapes.length - 1];
      const polygon = lastShape as Polygon;

      polygon.finishDrawing();
      config.isDrawingPolygon = false;
    }
  });

  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (
      e.key === 'Backspace' &&
      config.type == 'POLYGON' &&
      config.isDrawingPolygon
    ) {
      const lastShape = shapes[shapes.length - 1];
      const polygon = lastShape as Polygon;

      polygon.removeLastCoordinate();
    }
  });

  canvas.addEventListener('contextmenu', (e) => {
    const activePolygon = shapes.find(
      (shape) => shape.getType() === 'POLYGON' && shape.getIsActive()
    ) as Polygon;

    if (activePolygon) {
      e.preventDefault();

      const coordinate = getCoordinate(canvas, e);

      activePolygon.appendCoordinate(coordinate);
    }
  });
};
