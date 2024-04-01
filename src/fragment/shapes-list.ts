import { Shape } from '../shape.ts';
import { rgbToHex } from '../utils';
import { Config } from '../utils/interfaces';
import { deactiveAllShapeBtns } from './shape-btn.ts';
export const handleOnShapeAdded = (
  shape: Shape,
  color: string,
  allShapes: Shape[],
  config: Config
) => {
  const shapesContainer = document.getElementById('shapes-container');
  if (!shapesContainer) return;

  const shapeDiv = document.createElement('div');
  shapeDiv.className =
    'shape bg-input p-2 rounded-md text-primary-fg text-sm cursor-pointer hover:bg-input-hover flex flex-row gap-x-2 items-center';
  shapeDiv.id = shape.getId();

  shapeDiv.addEventListener('click', function () {
    const isActive = this.classList.contains('bg-input-active');
    shapesContainer.querySelectorAll('.shape').forEach((otherShape) => {
      otherShape.classList.remove('bg-input-active');
      otherShape.classList.add('bg-input');
    });
    allShapes.forEach((otherShape) => {
      otherShape.setIsActive(false);
    });
    if (!isActive) {
      this.classList.add('bg-input-active');
      this.classList.remove('bg-input');
      shape.setIsActive(true);
      deactiveAllShapeBtns(config);
    }
  });

  const iconElement = document.createElement('div');
  iconElement.innerHTML = `
    <svg color="${color}" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${shape.getIcon()}" id="svg-${shape.getId()}">
        <path d="M22 2 2 22"/>
    </svg>
`;
  iconElement.classList.add(
    'size-6',
    'bg-tertiary',
    'p-1',
    'rounded-md',
    'flex',
    'items-center',
    'justify-center'
  );

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
  }
};
