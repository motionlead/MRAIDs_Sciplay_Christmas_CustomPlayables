import { getContainer, getSliderAndLabel } from '../../controls/elements';

const updateEndTime = (countDown) => (value) => {
  const endDate = new Date(value * 1000);

  countDown.init({
    year: endDate.getFullYear(),
    month: endDate.getMonth() + 1,
    day: endDate.getDate(),
    hours: endDate.getHours(),
    minutes: endDate.getMinutes(),
    seconds: endDate.getSeconds(),
  });
};

export const addControlsCountDown = (countDown) => {
  const container = getContainer();
  const { endDate } = countDown;

  const now = Math.floor(new Date().getTime() / 1000);
  const sliderAndLabelEndTime = getSliderAndLabel(
    'end date',
    updateEndTime(countDown),
    now,
    endDate.getTime() / 1000,
    endDate.getTime() / 1000,
    1,
    true
  );

  [...sliderAndLabelEndTime].forEach((element) =>
    container.appendChild(element)
  );
};
