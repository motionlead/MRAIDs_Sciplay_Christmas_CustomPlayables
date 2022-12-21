export const br = document.createElement('br');

export const getCheckboxAndLabel = (name, checked, action) => {
  const label = getLabel(` ${name}`);

  const checkbox = document.createElement('input');
  checkbox.checked = checked;
  checkbox.type = 'checkbox';
  checkbox.id = 'checkbox-' + name;
  checkbox.onclick = action;
  return [checkbox, label];
};

export const getButton = (name, action) => {
  const button = document.createElement('input');
  button.type = 'button';
  button.id = 'button-' + name;
  button.value = name;
  button.style.marginRight = '5px';
  button.style.marginBottom = '3px';
  button.style.width = '135px';
  button.onclick = action;
  return button;
};

export const getSliderAndLabel = (
  name,
  action,
  min,
  max,
  value,
  step,
  isDate
) => {
  const label = getLabel(
    ` ${name}: ${isDate ? new Date(value * 1000).toLocaleString() : value}`
  );

  const slider = document.createElement('input');
  slider.id = 'slider-' + name;
  slider.type = 'range';
  slider.min = min;
  slider.max = max;
  slider.step = step || 1;
  slider.value = value;
  slider.oninput = (e) => {
    e.preventDefault();
    e.stopPropagation;
    e.stopImmediatePropagation();
    action(e.target.value);
    const value = isDate
      ? new Date(e.target.value * 1000).toLocaleString()
      : e.target.value;
    label.innerHTML = ` ${name}: ${value}`;
  };
  return isDate ? [slider, br, label] : [slider, label];
};

export const getListAndLabel = (name, value, values, action) => {
  const label = getLabel(` ${name}`);

  const select = document.createElement('select');
  select.id = 'select-' + name;
  for (const val of values) {
    const option = document.createElement('option');
    option.value = val;
    option.text = val;
    select.appendChild(option);
  }
  select.value = value;
  select.oninput = action;
  return [select, label];
};

const getLabel = (name) => {
  const label = document.createElement('label');
  label.innerHTML = name;
  label.style.marginRight = '20px';
  return label;
};

export const getContainer = (isHome = false) => {
  const container = document.createElement('div');
  container.id = 'controls-container';
  container.style.position = 'fixed';
  container.style.zIndex = 3000000;
  container.style.width = '100vw';
  container.style.paddingTop = '30px';
  container.style.paddingLeft = '30px';
  container.style.paddingBottom = '10px';
  container.style.backgroundColor = 'rgba(255, 255, 255, .5)';
  container.style.overflow = 'hidden';
  container.style.maxHeight = '100vh';
  container.style.transition = 'max-height .5s';
  container.style.borderBottom = '3px solid white';

  if (!isHome) {
    const close = document.createElement('div');
    close.id = 'controls-close';
    close.style.width = '24px';
    close.style.height = '24px';
    close.style.top = '6px';
    close.style.left = '6px';
    close.style.position = 'fixed';
    close.style.borderRadius = '30%';
    close.style.backgroundColor = 'white';
    close.addEventListener(
      'click',
      () =>
        (container.style.maxHeight =
          container.style.maxHeight === '0px' ? '100vh' : '0px')
    );
    container.appendChild(close);
  }
  document.body.appendChild(container);
  document.body.style.margin = 0;
  return container;
};
