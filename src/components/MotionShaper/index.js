import { MotionShaper } from './MotionShaper';
import { addControlsMotionShaper } from './controls';
import { MultipleSpriteSheet } from '../MultipleSpriteSheet/MultipleSpriteSheet';

export const launchMotionShaper = (sc, width, height) => {
  const onCenteredObject = (object) => {
    console.log('onCenteredObject object: ', object);
  };

  const so00 = new createjs.Bitmap(ad.assets.images['0']);
  const so10 = new createjs.Bitmap(ad.assets.images['1']);
  const so20 = new createjs.Bitmap(ad.assets.images['2']);
  so00.y = so10.y = so20.y = height - so20.image.height;
  sc.addChild(so00, so10, so20);

  const mss = new MultipleSpriteSheet({
    names: ['fenec68', 'fenec183', 'fenec208'],
    framerate: 40,
    debug: true,
  });

  const params = {
    width: 546,
    height: 444,
    regX: 546 / 2,
    regY: 444,
    // duration: 550,
    durationIn: 300,
    durationOut: 130,
    waitIn: 120,
    sensitivity: 3,
    debug: true,
    animationIn: createjs.Ease.quadIn,
    animationOut: createjs.Ease.linear,
    // isVertical: true,
    // isCyclic: false,
    startIndex: 1,
    onCenteredObject,
    items: [
      {
        item: new createjs.Bitmap(ad.assets.images['nike_1']),
        regX: 546 / 2,
        regY: 130,
        alpha: [0.1, 1, 0.1],
        x: [-111, 546 / 2, 555],
        y: [0, 140, 0],
        scale: [0.4, 1, 0.4],
        rotation: [-360, 0, 360],
      },
      {
        item: mss,
        regX: mss.width / 2,
        regY: mss.height / 2,
        x: [-mss.width / 2, 546 / 2, 546 + mss.width / 2],
        y: 444 / 2,
        rotation: 0,
        scale: 1,
      },
      { item: 'nike_3' },
    ],
    urls: [
      'https://www.google.com/search?q=0',
      'https://www.google.com/search?q=1',
      'https://www.google.com/search?q=2',
    ],
    secondaryObjects: [
      {
        duration: 300,
        waitIn: 120,
        waitOut: 120,
        animationIn: createjs.Ease.bounceOut,
        animationOut: createjs.Ease.quadOut,
        items: [
          {
            item: so00,
            alpha: [0, 1, 0],
            x: [0, width / 2, width],
          },
          {
            item: so10,
            scale: [1, 2, 1],
            y: height - 2 * so10.image.height,
          },
          { item: so20 },
        ],
        urls: [
          'https://www.google.com/search?q=secondary+object+0',
          'https://www.google.com/search?q=secondary+object+1',
          'https://www.google.com/search?q=secondary+object+2',
        ],
      },
      {
        duration: 300,
        animationOut: createjs.Ease.quadOut,
        items: [
          {
            item: 'wording01',
            alpha: [0, 1, 0],
            x: 0,
            scale: 0.5,
          },
          { item: 'wording02' },
          { item: 'wording03' },
        ],
      },
    ],
  };

  const component = new MotionShaper(params);
  component.x = width / 2;
  component.y = height;
  component.alpha = 0;
  createjs.Tween.get(component)
    .wait(1000)
    .to({ alpha: 1 }, 1200, createjs.Ease.quadOut);
  sc.addChild(component);

  // controls
  addControlsMotionShaper(component);

  return component;
};
