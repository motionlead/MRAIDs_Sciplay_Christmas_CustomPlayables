import {
  br,
  getButton,
  getContainer,
  getSliderAndLabel,
  getCheckboxAndLabel,
} from '../../controls/elements';

export const addControlsVideo = (video) => {
  const container = getContainer();

  const checkboxAndLabelDebug = getCheckboxAndLabel(
    'debug',
    video.doDebug,
    (e) => video.debug(e.target.checked)
  );

  const checkboxAndLabelLoop = getCheckboxAndLabel('loop', video.doLoop, (e) =>
    video.loop(e.target.checked)
  );

  const buttGotoAndPlay = getButton('gotoAndPlay', () => video.gotoAndPlay(10));
  const buttGotoAndStop = getButton('gotoAndStop', () => video.gotoAndStop(10));
  const buttPlayAndStopAt = getButton('playAndStopAt', () =>
    video.playAndStopAt(4)
  );
  const buttPlay = getButton('play', () => video.play());
  const buttStop = getButton('stop', () => video.stop());

  const sliderAndLabelRegX = getSliderAndLabel(
    'regX',
    (value) => video.setRegX(value),
    0,
    1,
    video.regXcoeff,
    0.01
  );

  const sliderAndLabelRegY = getSliderAndLabel(
    'regY',
    (value) => video.setRegY(value),
    0,
    1,
    video.regYcoeff,
    0.01
  );

  [
    ...checkboxAndLabelDebug,
    br.cloneNode(),
    ...checkboxAndLabelLoop,
    br.cloneNode(),
    br.cloneNode(),
    buttGotoAndPlay,
    buttGotoAndStop,
    buttPlayAndStopAt,
    br.cloneNode(),
    buttPlay,
    buttStop,
    br.cloneNode(),
    br.cloneNode(),
    ...sliderAndLabelRegX,
    br.cloneNode(),
    ...sliderAndLabelRegY,
  ].forEach((element) => container.appendChild(element));
};
