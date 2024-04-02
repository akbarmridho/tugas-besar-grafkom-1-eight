import { shapeType, Config } from '../utils/interfaces.ts';
export const onShapeButtonClick = (
  id: string,
  typeName: shapeType,
  config: Config
) => {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.onclick = (e: MouseEvent) => {
    e.preventDefault();
    const isActive = btn.classList.contains('bg-input-active');
    deactiveAllShapeBtns(config);
    config.type = typeName;
    if (!isActive) btn.classList.add('bg-input-active');
  };
};

export const setupCursorButtonClick = (config: Config) => {
  const btn = document.getElementById('cursor-btn');
  if (!btn) return;
  btn.onclick = (e: MouseEvent) => {
    e.preventDefault();
    deactiveAllShapeBtns(config);
  };
};

export const deactiveAllShapeBtns = (config: Config) => {
  const shapeBtnContainer = document.getElementById('shape-btn-container');
  if (!shapeBtnContainer) return;
  shapeBtnContainer
    .querySelectorAll('.shape-btn')
    .forEach((btn) => btn.classList.remove('bg-input-active'));
  config.type = '';
  config.isMouseDown = false;
};
