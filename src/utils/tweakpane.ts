import { BladeApi, ButtonApi, Pane } from 'tweakpane';
import { BindingApi } from '@tweakpane/core';

const BACKGROUND_PARAM = {
  background: { r: 255, g: 0, b: 55 }
};

const TRANSLATE_PARAM = {
  translate: { x: 50, y: 50 }
};

const SAVE_BUTTON_PARAM = {
  title: 'Save to file'
};

const LOAD_BUTTON_PARAM = {
  title: 'Load from file'
};

export class Tweakpane {
  pane: Pane;
  backgroundBinding: BindingApi;
  translateBinding: BindingApi;
  scaleBlade: BladeApi;
  loadButton: ButtonApi;
  saveButton: ButtonApi;
  constructor() {
    const tweakpaneContainer = document.getElementById('tweakpane-container');
    this.pane = new Pane({
      // @ts-ignore
      container: tweakpaneContainer
    });
    this.backgroundBinding = this.pane.addBinding(
      BACKGROUND_PARAM,
      'background',
      {
        picker: 'inline',
        expanded: true
      }
    );

    this.translateBinding = this.pane.addBinding(TRANSLATE_PARAM, 'translate', {
      picker: 'inline',
      expanded: true
    });
    this.scaleBlade = this.pane.addBlade({
      view: 'slider',
      label: 'scale',
      min: 0.1,
      max: 10,
      value: 0.1
    });
    this.loadButton = this.pane.addButton(LOAD_BUTTON_PARAM);
    this.saveButton = this.pane.addButton(SAVE_BUTTON_PARAM);
  }
}
