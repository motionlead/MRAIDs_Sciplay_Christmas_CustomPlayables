import { Particles } from './Particles';
import { addControlsParticles } from './controls';

export const launchParticles = (sc, width, height) => {
  const params = {
    width: width * 0.7,
    height: height * 0.7,
    debug: true,
    masked: true,
    preset: 'firework',
    nb: 60,
  };

  const component = new Particles(params);
  component.regX = component.width / 2;
  component.regY = component.height / 2;
  component.x = width / 2;
  component.y = height / 2;
  sc.addChild(component);

  addControlsParticles(component);

  return component;
};
