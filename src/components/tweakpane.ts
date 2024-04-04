import { ButtonApi, Pane } from 'tweakpane';
import { BindingApi } from '@tweakpane/core';
import { Shape } from '../shape.ts';
import {
  arrayToRgbAndDenormalize,
  normalizeRgbColor,
  RGB,
  rgbToHex
} from '../utils';
import { changeShapeSvgColor, handleOnShapeAdded } from './shapes-list.ts';
import { deserializeData, serializeData } from '../utils/serializer.ts';
import { shapes } from '../state.ts';

const SAVE_BUTTON_PARAMS = {
  title: 'Save to file'
};

const LOAD_BUTTON_PARAMS = {
  title: 'Load from file'
};

export class Tweakpane {
  pane: Pane;
  colorBinding: BindingApi;
  translateBinding: BindingApi;
  scaleBinding: BindingApi;
  loadButton: ButtonApi;
  saveButton: ButtonApi;
  shapes: Shape[];
  // @ts-ignore
  selectedColor: RGB;
  translateParams = {
    translate: { x: 0, y: 0 }
  };
  colorParams = {
    color: { r: 255, g: 0, b: 55 }
  };
  scaleFactor = 1;
  public prevActive = '';

  constructor(shapes: Shape[]) {
    this.shapes = shapes;
    const tweakpaneContainer = document.getElementById('tweakpane-container');
    this.pane = new Pane({
      // @ts-ignore
      container: tweakpaneContainer
    });

    this.prevActive = '';

    this.colorBinding = this.pane
      .addBinding(this.colorParams, 'color', {
        picker: 'inline',
        expanded: true
      })
      .on('change', (ev) => {
        // @ts-ignore
        this.changeColor(ev.value);
      });

    this.changeColor(this.colorParams.color);

    this.translateBinding = this.pane
      .addBinding(this.translateParams, 'translate', {
        picker: 'inline',
        expanded: true,
        x: { min: -400, max: 400, step: 0.01 },
        y: { min: -400, max: 400, step: 0.01 }
      })
      .on('change', (ev) => {
        // @ts-ignore
        this.translate(ev.value.x, ev.value.y);
      });

    this.scaleBinding = this.pane
      .addBinding(this, 'scaleFactor', {
        view: 'slider',
        label: 'scale',
        min: 0.1,
        max: 3,
        value: 0.1
      })
      .on('change', (ev) => {
        // @ts-ignore
        this.scale(ev.value);
      });

    this.loadButton = this.pane.addButton(LOAD_BUTTON_PARAMS);
    this.saveButton = this.pane.addButton(SAVE_BUTTON_PARAMS);

    this.registerSaveHandler();
    this.registerLoadHandler();
  }

  registerSaveHandler() {
    this.saveButton.on('click', () => {
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
  }

  registerLoadHandler() {
    this.loadButton.on('click', () => {
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
                  shapes
                );
              }
            });
          });
        })
        .catch((e) => {
          // ignore
        });
    });
  }

  changeColor = (color: RGB) => {
    this.selectedColor = color;
    this.changeShapeProperties((shape) => {
      if (shape.getName() !== this.prevActive) {
        this.prevActive = shape.getName();
        return;
      }

      if (shape.activeVertex !== null) {
        shape.setActiveVertexColor(normalizeRgbColor(color));
      } else {
        shape.setColor(normalizeRgbColor(color));
      }

      changeShapeSvgColor(shape);
    });
  };

  translate = (x: number, y: number) => {
    this.changeShapeProperties((shape) => {
      shape.translate(x, y);
    });
  };

  scale = (newScale: number) => {
    this.changeShapeProperties((shape) => {
      shape.scale(newScale);
    });
  };

  changeShapeProperties = (callback: (shape: Shape) => void) => {
    this.shapes.forEach((shape: Shape) => {
      if (shape.getIsActive()) callback(shape);
    });
  };

  saveLastActive() {
    const activeShape = this.shapes.find((s) => s.getIsActive());

    if (!activeShape) {
      this.prevActive = '';
    } else {
      this.prevActive = activeShape.getName();
    }
  }

  refreshParams() {
    const activeShape = this.shapes.find((s) => s.getIsActive());

    if (activeShape) {
      const centroid = activeShape.getCentroid();
      this.translateParams.translate = {
        x: centroid[0] - 400,
        y: centroid[1] - 400
      };
      this.translateBinding.refresh();
      this.scaleFactor = activeShape.getScaleFactor();
      this.scaleBinding.refresh();

      const colors = activeShape.getColor();

      const colorIdx = activeShape.activeVertexIndex || 0;

      this.colorParams.color = {
        r: colors[colorIdx][0] * 255,
        g: colors[colorIdx][1] * 255,
        b: colors[colorIdx][2] * 255
      };
      this.colorBinding.refresh();
    } else {
      this.translateParams.translate = {
        x: 0,
        y: 0
      };
      this.translateBinding.refresh();
      this.scaleFactor = 1;
      this.scaleBinding.refresh();
    }
  }
}
