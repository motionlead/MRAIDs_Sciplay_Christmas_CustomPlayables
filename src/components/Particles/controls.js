export const PRESET_SNOW = 'snow';
export const PRESET_RAIN = 'rain';
export const PRESET_FIREWORK = 'firework';
export const PRESET_HIVE = 'hive';
export const PRESET_BRANDON = 'brandon';

import {
  br,
  getContainer,
  getListAndLabel,
  getCheckboxAndLabel,
} from '../../controls/elements';

const updateCheckParticlesProperty = (particles, propertyName) => (e) => {
  const { controlParams } = particles;
  controlParams[propertyName] = e.target.checked;
  particles.init(controlParams);
};

const updateListParticlesProperty = (particles, propertyName) => (e) => {
  const { controlParams } = particles;
  controlParams[propertyName] = e.target.value;
  particles.init(controlParams);
};

export const addControlsParticles = (particles) => {
  const container = getContainer();

  const { controlParams } = particles;

  const checkboxAndLabelDebug = getCheckboxAndLabel(
    'debug',
    controlParams.debug,
    updateCheckParticlesProperty(particles, 'debug')
  );

  const checkboxAndLabelMasked = getCheckboxAndLabel(
    'masked',
    controlParams.masked,
    updateCheckParticlesProperty(particles, 'masked')
  );

  const listAndLabelPreset = getListAndLabel(
    'preset',
    controlParams.preset,
    [PRESET_SNOW, PRESET_RAIN, PRESET_FIREWORK, PRESET_HIVE, PRESET_BRANDON],
    updateListParticlesProperty(particles, 'preset')
  );

  [
    ...checkboxAndLabelDebug,
    ...checkboxAndLabelMasked,
    br.cloneNode(),
    ...listAndLabelPreset,
  ].forEach((element) => container.appendChild(element));
};
