import {
  br,
  getButton,
  getContainer,
  getSliderAndLabel,
  getCheckboxAndLabel,
} from "../../controls/elements";

export const addControlsMS = (ms) => {
  const container = getContainer();

  const checkboxAndLabelDebug = getCheckboxAndLabel("debug", ms.doDebug, (e) =>
    ms.debug(e.target.checked)
  );

  const checkboxAndLabelLoop = getCheckboxAndLabel("loop", ms.doLoop, (e) =>
    ms.loop(e.target.checked)
  );

  const buttGotoAndPlay = getButton("gotoAndPlay", () => ms.gotoAndPlay(120));
  const buttGotoAndStop = getButton("gotoAndStop", () => ms.gotoAndStop(120));
  const buttPlay = getButton("play", () => ms.play());
  const buttStop = getButton("stop", () => ms.stop());

  const sliderAndLabelFps = getSliderAndLabel(
    "framerate",
    (value) => ms.framerate(value),
    1,
    100,
    ms.currFramerate
  );

  const sliderAndLabelRegX = getSliderAndLabel(
    "regX",
    (value) => ms.setRegX(value),
    0,
    1,
    ms.regXcoeff,
    0.01
  );

  const sliderAndLabelRegY = getSliderAndLabel(
    "regY",
    (value) => ms.setRegY(value),
    0,
    1,
    ms.regYcoeff,
    0.01
  );

  const checkboxAndLabelReverse = getCheckboxAndLabel("reverse", false, (e) =>
    ms.reverse(e.target.checked)
  );

  [
    ...checkboxAndLabelDebug,
    br.cloneNode(),
    ...checkboxAndLabelLoop,
    br.cloneNode(),
    br.cloneNode(),
    buttGotoAndPlay,
    buttGotoAndStop,
    br.cloneNode(),
    buttPlay,
    buttStop,
    br.cloneNode(),
    br.cloneNode(),
    ...sliderAndLabelFps,
    br.cloneNode(),
    br.cloneNode(),
    ...sliderAndLabelRegX,
    br.cloneNode(),
    ...sliderAndLabelRegY,
    br.cloneNode(),
    br.cloneNode(),
    ...checkboxAndLabelReverse,
  ].forEach((element) => container.appendChild(element));
};
