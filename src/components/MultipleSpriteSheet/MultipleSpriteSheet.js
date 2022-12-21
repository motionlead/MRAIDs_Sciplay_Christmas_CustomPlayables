/*
author: Oghel JOYE
for: Adikteev
october 2020

This component is a DisplayObject that allows to seamlessly play several spritesheets one after another.

A new multipleSpritesheet can be invoked by using: new MultipleSpritesheet(args).
args is an object, with the following properties and their default value:

  names: [Array or Strings] the names of the spritesheets (default: [])
  regX: [Number] from 0 (left) to 1 (right) (default: 0),
  regY: [Number] from 0 (top) to 1 (bottom) (default: 0),
  framerate: [Int] from 1 to whatever (default: 20),
  loop: [Boolean] whether the sprites start over when they reach their very last frame (default: 0),
  onAnimationEnd: [Function] called when the last image of the last spritesheet has been displayed (default: noop)

WARNING: DO NOT ADD ANY CHILD TO THIS COMPONENT
*/

class MultipleSpriteSheetComponent extends createjs.Container {
  constructor(args = {}) {
    // invoke Container constructor
    super();

    this.args = args;
    const {
      names = [],
      regX = 0,
      regY = 0,
      framerate: currFramerate = 20,
      loop: doLoop = true,
      debug: doDebug = false,
      onAnimationEnd = () => {},
    } = args;

    this.sprites = []; // all the spritesheets
    this.count = 0; // total number of frames
    this.doLoop = doLoop; // whether the whole spritesheet loops
    this.width = 0; // width of the whole spritesheet
    this.height = 0; // height of the whole spritesheet
    this.regXcoeff = regX; // regX from 0 (left) to 1 (right)
    this.regYcoeff = regY; // regY from 0 (top) to 1 (bottom)
    this.doDebug = doDebug; // when true, display a shape covering the whole spritesheet
    this.onAnimationEnd = onAnimationEnd; // callback. Called when the whole spritesheet is over

    // variables that are necessary to the reverse mode
    this.raf = undefined; // requestAnimationFrame reference
    this.isReverse = false;
    this.currFrame = 0; // current frame
    this.currFramerate = currFramerate;
    this.previousTime = new Date().getTime();

    names.forEach((name, i) => {
      const sprite = new createjs.Sprite(ad.assets.spritesheets[name], name);
      sprite.count = sprite.spriteSheet._frames.length;
      this.count += sprite.count;
      sprite.index = i;

      sprite.on("animationend", (e) => {
        const sprite = e.target;
        let index = sprite.index;
        // console.log('end: ', index);
        const currSprite = this.sprites[index];
        currSprite.stop();

        index = (index + 1) % names.length;
        if (index === 0) {
          this.onAnimationEnd();
          if (!this.doLoop) {
            currSprite.gotoAndStop(currSprite.spriteSheet._frames.length - 1);
            return;
          }
        }
        this.removeChild(currSprite);
        const nextSprite = this.sprites[index];
        nextSprite.gotoAndPlay(0);
        this.addChildAt(nextSprite, 0);
      });
      this.sprites.push(sprite);

      if (i === 0) {
        this.addChildAt(sprite, 0);
      }

      if (i !== 0) {
        sprite.stop();
      }
      // sprite.addEventListener('change', function () {});

      ////// prepare regX/regY
      this.sprites.forEach((sprite) => {
        sprite.spriteSheet._frames.forEach((element) => {
          element.originalRegX = element.regX;
          element.originalRegY = element.regY;
          if (element.rect.width - element.regX > this.width) {
            this.width = element.rect.width - element.regX;
          }
          if (element.rect.height - element.regY > this.height) {
            this.height = element.rect.height - element.regY;
          }
        });
      });
    });

    this.framerate(currFramerate);

    this._setReg("regX", "originalRegX", this.width * regX);
    this._setReg("regY", "originalRegY", this.height * regY);
  }

  // use this function if you wish to modify the drawing of this component
  // p.draw = function (ctx, ignoreCache) {
  //   this.Container_draw(ctx, ignoreCache);
  // };

  /*
    private function
    parameters:
      Boolean force: if true, the next frame will be displayed
  */
  _drawReverse(force) {
    let now = new Date().getTime();
    if (force || now - this.previousTime >= 1000 / this.currFramerate) {
      this.gotoAndStop(this.currFrame);
      this.currFrame = (this.currFrame - 1 + this.count) % this.count;
      this.previousTime = now;
      if (this.currFrame === this.count - 1) {
        this.onAnimationEnd();
        if (!this.doLoop) {
          return;
        }
      }
    }
    this.raf = window.requestAnimationFrame(() => this._drawReverse());
  }

  /*
    private function
    display the expected spritesheet and frame. Then play the spritesheet or not.
    parameters:
      int frame: the frame number of the TOTAL spritesheet
      Boolean play: whether the spritesheet should play after being on the expected frame
  */
  _gotoAnd(frame, play) {
    this.removeChildAt(0);

    const sprites = this.sprites;
    let k = 0;
    frame = ((frame % this.count) + this.count) % this.count;
    for (let i = 0; i < sprites.length; i++) {
      k += sprites[i].count;
      if (k >= frame) {
        const sprite = sprites[i];
        this.addChildAt(sprite, 0);
        frame = frame - k + sprite.count;
        play ? sprite.gotoAndPlay(frame) : sprite.gotoAndStop(frame);
        return;
      }
    }
  }

  /*
    private function
    parameters:
      String property1: the sprite property that will be modified ('regX' or 'regY')
      String property2: the sprite original reg property that will be used ('originalRegX' or 'originalRegY')
  */
  _setReg(property1, property2, delta) {
    this.sprites.forEach((sprite) => {
      sprite.spriteSheet._frames.forEach(
        (element) => (element[property1] = element[property2] + delta)
      );
    });
    this.debug(this.doDebug);
  }

  //////////////////////////////////////////////////////////////////
  //////////////////////// PUBLIC FUNCTIONS ////////////////////////
  //////////////////////////////////////////////////////////////////

  /*	
  set the regX for ALL the images of ALL the spritesheets	
  parameter:	
    float value: the percent of the image width where the regX should be placed	
    usually from 0 (0%) to 1(100%)	
  */
  setRegX(value) {
    this.regXcoeff = value;
    this._setReg("regX", "originalRegX", this.width * value);
  }

  /*	
  set the regY for ALL the images of ALL the spritesheets	
  parameter:	
    float value: the percent of the image height where the regY should be placed	
    usually from 0 (0%) to 1(100%)	
*/
  setRegY(value) {
    this.regYcoeff = value;
    this._setReg("regY", "originalRegY", this.height * value);
  }

  /*
    set the frame and play the spritesheet
    parameter:
      int frame: the frame number of the TOTAL spritesheet
  */
  gotoAndPlay(frame) {
    if (frame === undefined) {
      return;
    }

    if (this.isReverse) {
      this.currFrame = frame;
      this._drawReverse(true);
    } else {
      this._gotoAnd(frame, true);
    }
  }

  /*
    set the frame and stop the spritesheet
    parameter:
      int frame: the frame number of the TOTAL spritesheet
  */
  gotoAndStop(frame) {
    if (frame === undefined) {
      return;
    }

    if (this.isReverse) {
      this.currFrame = frame;
      window.cancelAnimationFrame(this.raf);
    }
    this._gotoAnd(frame, false);
  }

  /*
    set the framerate for the whole spritesheet
    parameter:
      float value: the frame rate
  */
  framerate(value) {
    this.currFramerate = value;
    this.sprites.forEach((sprite) => (sprite.framerate = value));
  }

  /*
    play the spritesheet
  */
  play() {
    if (this.isReverse) {
      this._drawReverse(true);
    } else {
      this.children[0].play();
    }
  }

  /*
    stop/pause the spritesheet
  */
  stop() {
    if (this.isReverse) {
      window.cancelAnimationFrame(this.raf);
    } else {
      this.children[0].stop();
    }
  }

  /*
    display a shape that covers the whole spritesheet
    parameter:
      [Boolean] doDebug
  */
  debug(doDebug) {
    this.doDebug = doDebug;
    this.removeChildAt(1);
    if (doDebug) {
      const debugShape = new createjs.Shape();
      debugShape.graphics
        .beginFill("red")
        .drawRect(
          -this.regXcoeff * this.width,
          -this.regYcoeff * this.height,
          this.width,
          this.height
        );
      debugShape.alpha = 0.2;
      this.addChildAt(debugShape, 1);
    }
  }

  /*
    loop/do not loop the spritesheet
    parameter:
      [Boolean] doLoop
  */
  loop(doLoop) {
    this.doLoop = doLoop;
  }

  /*
    reverse the speed of the spritesheet
    parameter:
      [Boolean] doReverse: optional, true or undefined for backwards, false for forwards
  */
  reverse(doReverse) {
    if (!this.isReverse && (doReverse || doReverse === undefined)) {
      const sprite = this.getChildAt(0);
      const frame = sprite.currentFrame;
      this.currFrame = frame;
      for (let i = 0; i < sprite.index; i++) {
        this.currFrame += this.sprites[i].count;
      }
      this.isReverse = true;
      this._drawReverse(true);
    } else if (this.isReverse && !doReverse) {
      window.cancelAnimationFrame(this.raf);
      this.isReverse = false;
      this.gotoAndPlay(this.currFrame + 1);
    }
  }

  /*
    returns the multipleSpriteSheet current parameters
  */
  getArgs() {
    return {
      ...this.args,
      isReverse: this.isReverse,
      regX: parseFloat(this.regXcoeff),
      regY: parseFloat(this.regYcoeff),
      loop: this.doLoop,
      debug: this.doDebug,
      framerate: parseInt(this.currFramerate),
    };
  }
}

export const MultipleSpriteSheet = createjs.promote(
  MultipleSpriteSheetComponent,
  "Container"
);
