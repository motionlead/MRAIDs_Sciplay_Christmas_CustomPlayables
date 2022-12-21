import { addControlsMS } from './controls';
import { MultipleSpriteSheet } from './MultipleSpriteSheet';

export const launchMultipleSpriteSheet = (sc, width, height) => {
  const onAnimationEnd = () => {
    createjs.Tween.get(component)
      .to({ rotation: 10 }, 100, createjs.Ease.quadOut)
      .to({ rotation: -8 }, 100, createjs.Ease.linear)
      .to({ rotation: 0 }, 80, createjs.Ease.quadOut);
  };

  const msParameters = {
    names: ['fenec68', 'fenec183', 'fenec208'],
    regX: 0,
    regY: 1,
    framerate: 40,
    onAnimationEnd,
  };

  const component = new MultipleSpriteSheet(msParameters);
  component.y = height;
  sc.addChild(component);

  createjs.Tween.get(component, { loop: true })
    .to({ x: width - component.width }, 5500, createjs.Ease.quadOut)
    .to({ x: 0 }, 5500, createjs.Ease.quadOut);

  // controls
  addControlsMS(component);

  return component;
};
