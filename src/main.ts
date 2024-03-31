import './style.css';
import { initializeIcons } from './utils/lucide-icons.ts';

import { Tweakpane } from './utils/tweakpane.ts';
import { WebglUtils } from './utils/webgl-utils.ts';
import {
  FRAGMENT_SHADER_SOURCE,
  VERTEX_SHADER_SOURCE
} from './constant/gl-script.ts';
import { Line, Shape, shapeType } from './shape.ts';
import { getCoordinate } from './utils';

document.addEventListener('DOMContentLoaded', function () {
  onDocumentReady();
});

initializeIcons();

const shapes: Shape[] = [];

const onDocumentReady = () => {
  // init variables
  let type: shapeType = '';
  let isMouseDown = false;
  const tweakpane = new Tweakpane(shapes);
  const lineBtn = document.getElementById('line-btn');
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

  // Start the rendering loop
  render();

  if (lineBtn) {
    lineBtn.onclick = (e: MouseEvent) => {
      e.preventDefault();
      type = 'LINE';
    };
  }

  // canvas logic
  canvas.onmousedown = (e: MouseEvent) => {
    isMouseDown = true;

    const coordinate = getCoordinate(canvas, e);
    switch (type) {
      case 'LINE':
        shapes.push(new Line(coordinate, tweakpane.selectedColor));
        break;
    }
  };

  canvas.onmousemove = (e: MouseEvent) => {
    if (!isMouseDown) return;
    const coordinate = getCoordinate(canvas, e);
    const lastShape = shapes[shapes.length - 1];
    if (type == 'LINE' && lastShape instanceof Line) {
      const line = lastShape as Line;
      line.updateEndCoordinate(coordinate);
    }
  };

  canvas.onmouseup = () => {
    isMouseDown = false;
  };
};
