import './style.css';
import { initializeIcons } from './utils/lucide-icons.ts';

import { Tweakpane } from './utils/tweakpane.ts';
import { WebglUtils } from './utils/webgl-utils.ts';
import {
  FRAGMENT_SHADER_SOURCE,
  VERTEX_SHADER_SOURCE
} from './constant/gl-script.ts';
import { Line, Shape } from './shape.ts';
import { getCoordinate, normalizeRgbColor, rgbToHex } from './utils';
import { handleOnShapeAdded } from './fragment/shapes-list.ts';
import { Config } from './utils/interfaces.ts';
import { onShapeButtonClick } from './fragment/shape-btn.ts';

document.addEventListener('DOMContentLoaded', function () {
  onDocumentReady();
});

initializeIcons();

const shapes: Shape[] = [];

const onDocumentReady = () => {
  // init variables
  const config: Config = {
    type: '',
    isMouseDown: false
  };
  const tweakpane = new Tweakpane(shapes);
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  if (!canvas) return;

  // init gl
  const gl = canvas.getContext('webgl');
  if (!gl) return;
  const webglUtils = new WebglUtils(gl);
  const vertexShader = webglUtils.compileShader(
    VERTEX_SHADER_SOURCE,
    gl.VERTEX_SHADER
  );
  const fragmentShader = webglUtils.compileShader(
    FRAGMENT_SHADER_SOURCE,
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
    }
    if (!!newShape) {
      handleOnShapeAdded(newShape, rgbToHex(selectedColor), shapes, config);
    }
  };

  canvas.onmousemove = (e: MouseEvent) => {
    if (!config.isMouseDown) return;
    const coordinate = getCoordinate(canvas, e);
    const lastShape = shapes[shapes.length - 1];
    if (config.type == 'LINE' && lastShape instanceof Line) {
      const line = lastShape as Line;
      line.updateEndCoordinate(coordinate);
    }
  };

  canvas.onmouseup = () => {
    config.isMouseDown = false;
  };
};
