import { CountDown } from "./CountDown";
import { addControlsCountDown } from "./controls";

export const launchCountDown = (sc, width, height) => {
  const now = new Date();
  const countDownParameters = {
    debug: false,
    images: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "separator"],
    year: now.getFullYear(), // 2020
    month: now.getMonth() + 1, // 12
    day: now.getDate(), // 19
    hours: now.getHours() + 25, // 22
    minutes: now.getMinutes(), // 34
    seconds: now.getSeconds(), // 0
    gap: 4,
  };

  const component = new CountDown(countDownParameters);
  component.x = width / 2;
  component.y = height / 2;
  sc.addChild(component);

  addControlsCountDown(component);

  return component;
};
