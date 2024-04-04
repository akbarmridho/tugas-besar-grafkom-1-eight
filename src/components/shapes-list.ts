import { Shape } from '../shape.ts';
import { rgbToHex } from '../utils';
import { deactivateAllShapeBtns } from './shape-btn.ts';
import { shapes, tweakpane } from '../state.ts';

export const clearShapeList = () => {
  const shapesContainer = document.getElementById('shapes-container');
  if (!shapesContainer) return;

  shapesContainer.innerHTML = '';
};

export const handleOnShapeAdded = (shape: Shape, color: string) => {
  const shapesContainer = document.getElementById('shapes-container');
  if (!shapesContainer) return;

  const shapeDiv = document.createElement('div');
  shapeDiv.className =
    'shape bg-input p-2 rounded-md text-primary-fg text-sm cursor-pointer hover:bg-input-hover flex flex-row gap-x-2 items-center';
  shapeDiv.id = shape.getId();

  shapeDiv.addEventListener('click', function () {
    tweakpane.saveLastActive();
    const isActive = this.classList.contains('bg-input-active');
    shapesContainer.querySelectorAll('.shape').forEach((otherShape) => {
      otherShape.classList.remove('bg-input-active');
      otherShape.classList.add('bg-input');
    });
    shapes.forEach((otherShape) => {
      otherShape.setIsActive(false);
    });
    if (!isActive) {
      this.classList.add('bg-input-active');
      this.classList.remove('bg-input');
      shape.setIsActive(true);
    }

    deactivateAllShapeBtns();
    tweakpane.refreshParams();
  });

  const iconElement = document.createElement('div');

  if (shape.getIcon() === 'slash') {
    iconElement.innerHTML = `
    <svg color="${color}" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="${color}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-slash" id="svg-${shape.getId()}">
        <path d="M22 2 2 22"/>
    </svg>
    `;
  } else if (shape.getIcon() === 'square') {
    iconElement.innerHTML = `
    <svg color="${color}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${color}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square"><rect width="18" height="18" x="3" y="3" rx="2" id="svg-${shape.getId()}"/></svg>`;
  } else if (shape.getIcon() === 'rectangle-horizontal') {
    iconElement.innerHTML = `
    <svg color="${color}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${color}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rectangle-horizontal"><rect width="20" height="12" x="2" y="6" rx="2"/></svg>`;
  } else if (shape.getIcon() === 'pentagon') {
    iconElement.innerHTML = `
    <svg color="${color}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${color}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pentagon"><path d="M3.5 8.7c-.7.5-1 1.4-.7 2.2l2.8 8.7c.3.8 1 1.4 1.9 1.4h9.1c.9 0 1.6-.6 1.9-1.4l2.8-8.7c.3-.8 0-1.7-.7-2.2l-7.4-5.3a2.1 2.1 0 0 0-2.4 0Z"/></svg>
    `;
  }

  iconElement.classList.add(
    'size-6',
    'bg-tertiary',
    'p-1',
    'rounded-md',
    'flex',
    'items-center',
    'justify-center'
  );

  const channel = new BroadcastChannel('container-button-channel');

  channel.addEventListener('message', function (e) {
    const shapeName = (e.data as string) || null;

    if (shape.getName() === shapeName) {
      shapeDiv.classList.add('bg-input-active');
      shapeDiv.classList.remove('bg-input');
    } else {
      shapeDiv.classList.remove('bg-input-active');
      shapeDiv.classList.add('bg-input');
    }
  });

  const nameElement = document.createElement('p');
  nameElement.textContent = shape.getName();

  shapeDiv.appendChild(iconElement);
  shapeDiv.appendChild(nameElement);

  shapesContainer.appendChild(shapeDiv);
};

export const changeShapeSvgColor = (shape: Shape) => {
  const svgElement = document.getElementById(`svg-${shape.getId()}`);
  if (svgElement) {
    const color = shape.getColor()[0];
    const rgb = { r: color[0] * 255, g: color[1] * 255, b: color[2] * 255 };
    svgElement.setAttribute('color', rgbToHex(rgb));
    svgElement.setAttribute('fill', rgbToHex(rgb));
  }
};
