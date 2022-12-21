import {
  br,
  getContainer,
  getSliderAndLabel,
  getCheckboxAndLabel,
} from '../../controls/elements';

export const addControlsMotionShaper = (cs) => {
  const container = getContainer();

  const checkboxAndLabelDebug = getCheckboxAndLabel('debug', cs.doDebug, (e) =>
    cs.debug(e.target.checked)
  );

  const checkboxAndLabelIsCyclic = getCheckboxAndLabel(
    'isCyclic',
    cs.isCyclic,
    (e) => {
      const { args } = cs;
      cs.init({ ...args, isCyclic: e.target.checked });
    }
  );

  const checkboxAndLabelIsVertical = getCheckboxAndLabel(
    'isVertical',
    cs.isVertical,
    (e) => {
      const { args } = cs;
      cs.init({ ...args, isVertical: e.target.checked });
    }
  );

  const sliderAndLabelSensitivity = getSliderAndLabel(
    'sensitivity',
    (value) => {
      const { args } = cs;
      cs.init({ ...args, sensitivity: parseInt(value, 10) });
    },
    1,
    40,
    cs.sensitivity
  );

  [
    ...checkboxAndLabelDebug,
    ...checkboxAndLabelIsCyclic,
    ...checkboxAndLabelIsVertical,
    br.cloneNode(),
    br.cloneNode(),
    ...sliderAndLabelSensitivity,
  ].forEach((element) => container.appendChild(element));
};
