import './style.css';
import { initializeIcons } from './utils/lucide-icons.ts';

import { Tweakpane } from './components/tweakpane.ts';
import { WebglUtils } from './utils/webgl-utils.ts';
import { Line, Rectangle, Shape, Square, Polygon } from './shape.ts';
import {
  arrayToRgbAndDenormalize,
  getCoordinate,
  normalizeRgbColor,
  rgbToHex
} from './utils';
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
import { deserializeData, serializeData } from './utils/serializer.ts';

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
      handleOnShapeAdded(
        newShape,
        rgbToHex(selectedColor),
        shapes,
        config,
        tweakpane
      );
    }
  };

  canvas.onmousemove = (e: MouseEvent) => {
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
  };

  canvas.onmouseup = () => {
    config.isMouseDown = false;
  };

  canvas.onclick = (e) => {
    //
  };

  // save load behavior
  tweakpane.registerSaveHandler(() => {
    showSaveFilePicker({
      types: [
        {
          description: 'Saved model data',
          accept: {
            'application/json': ['.json']
          }
        }
      ]
    })
      .then((handle) => {
        handle.createWritable().then((writeable) => {
          writeable.write(serializeData(shapes)).then(() => {
            void writeable.close();
          });
        });
      })
      .catch((e) => {
        // ignore
      });
  });

  tweakpane.registerLoadHandler(() => {
    showOpenFilePicker({
      multiple: false,
      types: [
        {
          description: 'Saved model data',
          accept: {
            'application/json': ['.json']
          }
        }
      ]
    })
      .then((handlers) => {
        const handle = handlers[0];

        handle.getFile().then((file) => {
          file.text().then((rawResult) => {
            const loadedShapes = deserializeData(rawResult);

            // clear old shapes
            shapes.splice(0, shapes.length);

            // load
            for (const shape of loadedShapes) {
              shapes.push(shape);
              handleOnShapeAdded(
                shape,
                rgbToHex(arrayToRgbAndDenormalize(shape.getColor()[0])),
                shapes,
                config,
                tweakpane
              );
            }
          });
        });
      })
      .catch((e) => {
        // ignore
      });
  });

  canvas.onclick = (e: MouseEvent) => {
    if (config.type == 'POLYGON' && config.isDrawingPolygon) {
      const coordinate = getCoordinate(canvas, e);
      const lastShape = shapes[shapes.length - 1];

      const polygon = lastShape as Polygon;
      polygon.addCoordinate(coordinate);
    }
  };

  canvas.ondblclick = (e: MouseEvent) => {
    if (config.type == 'POLYGON' && config.isDrawingPolygon) {
      const lastShape = shapes[shapes.length - 1];
      const polygon = lastShape as Polygon;

      polygon.finishDrawing();
      config.isDrawingPolygon = false;
    }
  };

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

  canvas.oncontextmenu = (e: MouseEvent) => {
    const activePolygon = shapes.find(
      (shape) => shape.getType() === 'POLYGON' && shape.getIsActive()
    ) as Polygon;

    if (activePolygon) {
      e.preventDefault();

      const coordinate = getCoordinate(canvas, e);

      activePolygon.appendCoordinate(coordinate);
    }
  };
};
