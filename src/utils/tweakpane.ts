import { BladeApi, ButtonApi, Pane } from 'tweakpane';
import { BindingApi } from '@tweakpane/core';
import { Shape } from '../shape.ts';

const COLOR_PARAMS = {
  color: { r: 255, g: 0, b: 55 }
};

const TRANSLATE_PARAMS = {
  translate: { x: 50, y: 50 }
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
  selectedColor: number[];

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

    this.translateBinding = this.pane.addBinding(
      TRANSLATE_PARAMS,
      'translate',
      {
        picker: 'inline',
        expanded: true
      }
    );
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

  changeColor = ({ r, g, b }: { r: number; g: number; b: number }) => {
    const color = [r / 255, g / 255, b / 255, 1];
    this.selectedColor = color;
    this.changeShapeProperties((shape) => {
      shape.setColor(color);
    });
  };

  changeShapeProperties = (callback: (shape: Shape) => void) => {
    this.shapes.forEach((shape: Shape) => {
      if (shape.getIsActive()) callback(shape);
    });
  };
}
