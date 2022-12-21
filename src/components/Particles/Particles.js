/*
author: Oghel JOYE
for: Adikteev
december 2020

This is a Particles component.

A new particles can be invoked by using: new Particles(args).
args is an object, with the following properties and their default value:

  debug: [Boolean] (whether a red shape is displayed over the video) (default: false)
  preset: [String] one of 'snow', 'rain', 'firework', 'hive', 'brandon' (default: snow)
  width: [float] width of the component in pixels
  height: [float] height of the component in pixels
  masked: [Boolean] whether the component is masked (overflow: hidden)
  opacityMin: [float] min opacity of each particle
  opacityMax: [float] max opacity of each particle
  scaleMin: [float] min scale of each particle
  scaleMax: [float] max scale of each particle
  nb: [int] number of particles
  sourceX: [float] BRANDON preset, x position of the source of emission (0 to 1, from left to right)
  sourceY: [float] BRANDON preset, y position of the source of emission (0 to 1, from top to bottom)
  speedMin: [float] min speed of each particle
  speedMax: [float] min speed of each particle
  lifeMin: [float] FIREWORK preset, min life span of each particle
  lifeMax: [float] FIREWORK preset, max life span of each particle
  speedDeceleration:
*/

import {
  PRESET_SNOW,
  PRESET_RAIN,
  PRESET_HIVE,
  PRESET_BRANDON,
  PRESET_FIREWORK,
} from './controls.js';
import { logError, map } from '../../helper';

const MAX_SPEED = 100;
const COEFF_SPEED = 0.98;

const DEFAULT_VALUES = {
  debug: true,
  preset: PRESET_SNOW,
  width: 444,
  height: 777,
  masked: false,
  opacityMin: 0.5,
  opacityMax: 1,
  speedMin: 1.2,
  speedMax: 2.5,
  nb: 444,
};

const PRESETS = {
  [PRESET_SNOW]: {
    scaleMin: 0.2,
    scaleMax: 1,
    nb: 444,
    speedMin: 0.6,
    speedMax: 0.1,
    images: ['snowflake'],
  },
  [PRESET_RAIN]: {
    scaleMin: 0.2,
    scaleMax: 0.6,
    opacityMin: 0.3,
    opacityMax: 0.7,
    speedMin: 6,
    speedMax: 10,
    nb: 333,
    images: ['drop'],
  },
  [PRESET_HIVE]: {
    scaleMin: 0.2,
    scaleMax: 0.8,
    images: ['king'],
  },
  [PRESET_BRANDON]: {
    scaleMin: 0,
    scaleMax: 0.8,
    images: ['part1', 'part2'],
    sourceX: 0,
    sourceY: 1,
    speedMin: 0.3,
    speedMax: 0.8,
    nb: 122,
  },
  [PRESET_FIREWORK]: {
    scaleMin: 0.4,
    scaleMax: 0.8,
    images: ['part1', 'part2', 'king'],
    nb: 222,
    lifeMin: 40,
    lifeMax: 55,
    speedMin: 8,
    speedMax: 15,
    speedDeceleration: 0.96,
  },
};

class ParticlesComponent extends createjs.Container {
  constructor(args = {}) {
    // invoke Container constructor
    super();

    this.init(args);

    // if (preset === PRESET_HIVE) {
    this.setupInteractions();
    // }

    this.lastClick = 0; // used to make sure a single interaction is not counted twice
    createjs.Ticker.addEventListener('tick', () => this.update());
  }

  init(args = {}) {
    console.log('init', args);
    this.parts = [];
    this.container && this.container.removeAllChildren();

    let preset = args.preset;
    if (!PRESETS[preset]) {
      logError(`your preset: '${preset}' is not valid :/`);
      return;
    }

    const params = { preset };
    Object.keys(DEFAULT_VALUES).forEach(
      (key) => (params[key] = DEFAULT_VALUES[key])
    );
    Object.keys(PRESETS[preset]).forEach(
      (key) => (params[key] = PRESETS[preset][key])
    );
    Object.keys(args).forEach((key) => (params[key] = args[key]));
    Object.keys(params).forEach((key) => (this[key] = params[key]));
    params.preset = this.preset = preset;

    const { images, debug, masked, width, height } = this;
    this.controlParams = { preset, masked, debug };

    this.images = [];
    images.forEach((image) => {
      const asset = new createjs.Bitmap(ad.assets.images[image]);
      if (asset.image) {
        this.images.push(asset);
      } else {
        logError(`ERROR: particle image ${image} was not found :/`);
      }
    });

    this.removeAllChildren();

    // container is used to mask the whole component
    this.container = new createjs.Container();
    this.addChild(this.container);

    this.initParts();

    const dummyScreen = new createjs.Shape();
    dummyScreen.graphics.beginFill('#99000022').drawRect(0, 0, width, height);

    if (masked) {
      this.container.mask = dummyScreen;
    }
    debug && this.addChild(dummyScreen);
  }

  //////////////////////////////////////////////////////////////////
  //////////////////////// PRIVATE FUNCTIONS ///////////////////////
  //////////////////////////////////////////////////////////////////

  // use this function if you wish to modify the drawing of this component
  // p.draw = function (ctx, ignoreCache) {
  //   this.Container_draw(ctx, ignoreCache);
  // };

  /*
    private function
  */
  initParts(x, y) {
    const { preset, width, height, nb, images, speedMin, speedMax } = this;
    if (preset === PRESET_FIREWORK && !x) {
      return;
    }
    for (let i = 0; i < nb; i++) {
      const part =
        this.images[Math.floor(Math.random() * images.length)].clone();
      part.regX = part.image.width / 2;
      part.regY = part.image.height / 2;
      part.x = x || Math.random() * width;
      part.y = y || Math.random() * height;

      part.vx = part.vy = 0;
      if (preset === PRESET_SNOW) {
        part.vx =
          (Math.random() < 0.5 ? 1 : -1) * map(Math.random(), 0, 1, 0.1, 0.8);
        part.vy = map(Math.random(), 0, 1, speedMin, speedMax);
      } else if (preset === PRESET_RAIN) {
        part.vx = map(Math.random(), 0, 1, 0.3, 0.3);
        part.vy = map(Math.random(), 0, 1, speedMin, speedMax);
      } else if (preset === PRESET_HIVE) {
        part.rotation = Math.random() * 360;
        part.coeff = map(Math.random(), 0, 1, 0.3, 0.9);
      } else if (preset === PRESET_BRANDON) {
        const { sourceX, sourceY } = this;
        part.vx = map(Math.random(), 0, 1, speedMin, speedMax);
        part.vy = map(Math.random(), 0, 1, speedMin, speedMax);
        part.offsetAlpha = Math.random() * 1000;
        part.offsetScale = Math.random() * 1000;
        part.offsetAlphaSpeed = map(Math.random(), 0, 1, 0.001, 0.005);
        part.offsetScaleSpeed = map(Math.random(), 0, 1, 0.001, 0.005);

        if (sourceX >= 1) {
          part.vx *= -1;
        } else if (sourceX > 0) {
          part.vx *= Math.random() < 0.5 ? 1 : -1;
        }
        if (sourceY >= 1) {
          part.vy *= -1;
        } else if (sourceY > 0) {
          part.vy *= Math.random() < 0.5 ? 1 : -1;
        }
      } else if (preset === PRESET_FIREWORK) {
        const angle = Math.random() * 3.14159 * 2;
        const mag = map(Math.random(), 0, 1, speedMin, speedMax);
        part.vx = mag * Math.cos(angle);
        part.vy = mag * Math.sin(angle);
        part.life = (Math.random() * this.lifeMin) / 3;
      }
      part.scaleX = map(Math.random(), 0, 1, this.scaleMin, this.scaleMax);
      part.scaleY = part.scaleX;
      part.alpha = map(Math.random(), 0, 1, this.opacityMin, this.opacityMax);
      this.parts.push(part);
      this.container.addChild(part);
    }
  }

  /*
    private function
  */
  setupInteractions() {
    const { width, height } = this;
    this.mouseX = width / 2;
    this.mouseY = height / 2;
    this.on('pressmove', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (this.preset === PRESET_HIVE) {
        this.mouseX = e.localX;
        this.mouseY = e.localY;
      }
    });
    this.on('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const now = new Date().getTime();
      if (now - this.lastClick > 250) {
        if (this.preset === PRESET_HIVE) {
          this.bomb(e.localX, e.localY);
        } else if (this.preset === PRESET_FIREWORK) {
          this.firework(e.localX, e.localY);
        }
        this.lastClick = now;
      }
    });
  }

  /*
    private function
  */
  update() {
    const { width, height, preset } = this;
    this.parts.forEach((part) => {
      part.x += part.vx;
      part.y += part.vy;

      const partWidth = part.image.width * part.scaleX;
      const partHeight = part.image.height * part.scaleY;

      let isPartOutside =
        preset === PRESET_HIVE
          ? false
          : part.x < -partWidth / 2 ||
            part.x > width + partWidth / 2 ||
            part.y > height + partHeight / 2 ||
            (PRESET_BRANDON && part.y < -partHeight / 2);

      switch (preset) {
        case PRESET_SNOW:
        case PRESET_RAIN:
          if (isPartOutside) {
            part.x = Math.random() * width;
            part.y = -partHeight / 2;
          }
          break;
        case PRESET_HIVE:
          let { coeff, x, y, vx, vy } = part;
          let dx = this.mouseX - x - partWidth / 2;
          let dy = this.mouseY - y - partHeight / 2;
          const d = Math.sqrt(dx ** 2 + dy ** 2);

          dx *= coeff / d;
          dy *= coeff / d;

          vx += dx;
          vy += dy;

          if (vx ** 2 + vy ** 2 > MAX_SPEED) {
            vx *= COEFF_SPEED;
            vy *= COEFF_SPEED;
          }

          part.vx = vx;
          part.vy = vy;
          break;
        case PRESET_BRANDON:
          part.offsetAlpha += part.offsetAlphaSpeed;
          part.offsetScale += part.offsetScaleSpeed;
          part.alpha = Math.abs(Math.sin(part.offsetAlpha * 3.14159));
          part.scaleX = part.scaleY = map(
            Math.abs(Math.sin(part.offsetScale * 3.14159)),
            0,
            1,
            this.scaleMin,
            this.scaleMax
          );
          if (isPartOutside) {
            part.x = Math.random() * width;
            part.y = Math.random() * height;
            part.offsetAlpha = -part.offsetAlphaSpeed;
            part.offsetScale = -part.offsetScaleSpeed;
            part.alpha = 0;
            part.scaleX = part.scaleY = 0;
          }
          break;
        case PRESET_FIREWORK:
          part.vx *= this.speedDeceleration;
          part.vy *= this.speedDeceleration;
          part.vy += 0.1;
          if (part.life > this.lifeMin) {
            part.alpha = map(part.life, this.lifeMin, this.lifeMax, 1, 0);
          }
          part.life += 1;
          break;
      }
    });

    if (preset === PRESET_FIREWORK) {
      for (let i = this.parts.length - 1; i > -1; i--) {
        const part = this.parts[i];
        if (part.life > this.lifeMax) {
          this.parts.splice(i, 1);
          this.container.removeChild(part);
        }
      }
    }
  }

  //////////////////////////////////////////////////////////////////
  //////////////////////// PUBLIC FUNCTIONS ////////////////////////
  //////////////////////////////////////////////////////////////////

  bomb(eventX, eventY) {
    this.mouseX = eventX;
    this.mouseY = eventY;
    this.parts.forEach((part) => {
      let { coeff, x, y, scaleX, scaleY, image } = part;
      const partWidth = image.width * scaleX;
      const partHeight = image.height * scaleY;
      let dx = this.mouseX - x - partWidth / 2;
      let dy = this.mouseY - y - partHeight / 2;
      const d = 0.02 * Math.sqrt(dx ** 2 + dy ** 2);

      dx *= coeff / d;
      dy *= coeff / d;

      part.vx -= dx;
      part.vy -= dy;
    });
  }

  /*
    triggers a firework
    parameters:
      [float] x, y: coordinates of the firework
  */
  firework(eventX, eventY) {
    this.initParts(eventX, eventY);
  }

  /*
    returns the particles current parameters
  */
  getArgs() {
    return this.controlParams;
  }
}

export const Particles = createjs.promote(ParticlesComponent, 'Container');
