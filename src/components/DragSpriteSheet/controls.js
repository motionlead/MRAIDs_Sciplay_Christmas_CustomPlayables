import {
  br,
  getContainer,
  getSliderAndLabel,
  getCheckboxAndLabel,
} from "../../controls/elements";

export const addControlsDS = (ds) => {
  const container = getContainer();

  const checkboxAndLabelDebug = getCheckboxAndLabel("debug", ds.doDebug, (e) =>
    ds.debug(e.target.checked)
  );

  const checkboxAndLabelLoop = getCheckboxAndLabel("loop", ds.doLoop, (e) =>
    ds.loop(e.target.checked)
  );

  const checkboxAndLabelIsVertical = getCheckboxAndLabel(
    "isVertical",
    ds.isVertical,
    (e) => (ds.isVertical = e.target.checked)
  );

  const checkboxAndLabelIsOneDirection = getCheckboxAndLabel(
    "isOneDirection",
    ds.isOneDirection,
    (e) => (ds.isOneDirection = e.target.checked)
  );

  const sliderAndLabelSensitivity = getSliderAndLabel(
    "sensitivity",
    (value) => (ds.sensitivity = parseFloat(value)),
    1,
    20,
    ds.sensitivity,
    2
  );

  const sliderAndLabelRegX = getSliderAndLabel(
    "regX",
    (value) => ds.setRegX(value),
    0,
    1,
    ds.regXcoeff,
    0.01
  );

  const sliderAndLabelRegY = getSliderAndLabel(
    "regY",
    (value) => ds.setRegY(value),
    0,
    1,
    ds.regYcoeff,
    0.01
  );

  [
    ...checkboxAndLabelDebug,
    br.cloneNode(),
    ...checkboxAndLabelIsVertical,
    br.cloneNode(),
    ...checkboxAndLabelIsOneDirection,
    br.cloneNode(),
    ...checkboxAndLabelLoop,
    br.cloneNode(),
    br.cloneNode(),
    ...sliderAndLabelSensitivity,
    br.cloneNode(),
    br.cloneNode(),
    ...sliderAndLabelRegX,
    br.cloneNode(),
    ...sliderAndLabelRegY,
  ].forEach((element) => container.appendChild(element));
};
