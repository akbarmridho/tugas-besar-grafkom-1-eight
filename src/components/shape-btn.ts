import { shapeType } from '../utils/interfaces.ts';
import { config } from '../state.ts';
export const onShapeButtonClick = (id: string, typeName: shapeType) => {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.onclick = (e: MouseEvent) => {
    e.preventDefault();
    const isActive = btn.classList.contains('bg-input-active');
    deactivateAllShapeBtns();
    if (!isActive) {
      config.type = typeName;
      btn.classList.add('bg-input-active');
    }
  };
};

export const setupCursorButtonClick = () => {
  const btn = document.getElementById('cursor-btn');
  if (!btn) return;
  btn.onclick = (e: MouseEvent) => {
    e.preventDefault();
    deactivateAllShapeBtns();
  };
};

export const deactivateAllShapeBtns = () => {
  const shapeBtnContainer = document.getElementById('shape-btn-container');
  if (!shapeBtnContainer) return;
  shapeBtnContainer
    .querySelectorAll('.shape-btn')
    .forEach((btn) => btn.classList.remove('bg-input-active'));
  config.type = '';
  config.isMouseDown = false;
};
