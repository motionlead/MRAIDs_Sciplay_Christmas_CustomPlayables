import { logError } from '../../helper';
import { addControlsDS } from './controls';
import { DragSpriteSheet } from './DragSpriteSheet';

export const launchDragSpritesheet = (sc, width, height) => {
  const onAnimationEnd = () => logError('animation EENENNENENNNNNND');
  const onFrameReached = (frame) => logError(`FRAME ${frame} REACHED`);

  const msParameters = {
    names: ['fenec68', 'fenec183', 'fenec208'],
    regX: 0.5,
    regY: 0.5,
    debug: true,
    startFrame: 20,
    loop: true,
    onAnimationEnd,
    callbackFrames: [34, 120],
    onFrameReached,
  };

  const component = new DragSpriteSheet(msParameters);
  component.x = width / 2;
  component.y = height / 2;
  sc.addChild(component);

  // controls
  addControlsDS(component);

  return component;
};
