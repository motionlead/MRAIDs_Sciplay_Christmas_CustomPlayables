import { getButton, getContainer, br } from './elements';

export const addControlsHome = (components = []) => {
  const container = getContainer(true);

  components.forEach((component) => {
    const { name, action } = component;
    const button = getButton(name, action);
    container.appendChild(button);
    container.appendChild(br.cloneNode());
  });
};
