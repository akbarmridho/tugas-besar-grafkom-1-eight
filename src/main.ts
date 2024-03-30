import './style.css';
import { initializeIcons } from './utils/lucide-icons.ts';

import { Tweakpane } from './utils/tweakpane.ts';
import { WebglUtils } from './utils/webgl-utils.ts';
import {
  FRAGMENT_SHADER_SOURCE,
  VERTEX_SHADER_SOURCE
} from './constant/gl-script.ts';

document.addEventListener('DOMContentLoaded', function () {
  onDocumentReady();
});

initializeIcons();

const shapes: Shape[] = [];

const onDocumentReady = () => {
  // init variables
  const tweakpane = new Tweakpane();
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

  const positions: number[] = [
    -0.1, 0.1, -0.1, -0.1, 0.1, 0.1, -0.1, -0.1, 0.1, -0.1, 0.1, 0.1
  ];

  webglUtils.render('a_position', positions, 2);

  // loop render
  const render = () => {
    // coba coba doang
    webglUtils.clear();
    webglUtils.render('a_position', positions, 2);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    window.requestAnimationFrame(render);
  };

  // Start the rendering loop
  render();
};
