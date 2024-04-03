import { BladeApi, ButtonApi, Pane } from 'tweakpane';
import { BindingApi } from '@tweakpane/core';
import { Shape } from '../shape.ts';
import { normalizeRgbColor, RGB } from '../utils';
import { changeShapeSvgColor } from './shapes-list.ts';

const COLOR_PARAMS = {
  color: { r: 255, g: 0, b: 55 }
};

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
  scaleBlade: BladeApi;
  loadButton: ButtonApi;
  saveButton: ButtonApi;
  shapes: Shape[];
  // @ts-ignore
  selectedColor: RGB;
  translateParams = {
    translate: { x: 0, y: 0 }
  };

  constructor(shapes: Shape[]) {
    this.shapes = shapes;
    const tweakpaneContainer = document.getElementById('tweakpane-container');
    this.pane = new Pane({
      // @ts-ignore
      container: tweakpaneContainer
    });

    this.colorBinding = this.pane
      .addBinding(COLOR_PARAMS, 'color', {
        picker: 'inline',
        expanded: true
      })
      .on('change', (ev) =>
        // @ts-ignore
        this.changeColor(ev.value)
      );
    this.changeColor(COLOR_PARAMS.color);

    this.translateBinding = this.pane
      .addBinding(this.translateParams, 'translate', {
        picker: 'inline',
        expanded: true,
        x: { min: -1, max: 1, step: 0.01 },
        y: { inverted: true, min: -1, max: 1, step: 0.01 }
      })
      .on('change', (ev) => {
        // @ts-ignore
        this.translate(ev.value.x, ev.value.y);
      });

    this.scaleBlade = this.pane.addBlade({
      view: 'slider',
      label: 'scale',
      min: 0.1,
      max: 10,
      value: 0.1
    });
    this.loadButton = this.pane.addButton(LOAD_BUTTON_PARAMS);
    this.saveButton = this.pane.addButton(SAVE_BUTTON_PARAMS);
  }

  registerSaveHandler(fn: () => void) {
    this.saveButton.on('click', fn);
  }

  registerLoadHandler(fn: () => void) {
    this.loadButton.on('click', fn);
  }

  changeColor = (color: RGB) => {
    this.selectedColor = color;
    this.changeShapeProperties((shape) => {
      shape.setColor(normalizeRgbColor(color));
      changeShapeSvgColor(shape);
    });
  };

  translate = (x: number, y: number) => {
    this.changeShapeProperties((shape) => {
      shape.translate(x, y);
    });
  };

  changeShapeProperties = (callback: (shape: Shape) => void) => {
    this.shapes.forEach((shape: Shape) => {
      if (shape.getIsActive()) callback(shape);
    });
  };
}
