/*
author: Oghel JOYE
for: Adikteev
july 2021

This component is a DisplayObject that allows to control several spritesheets with mouse drag.

A new dragSpritesheet can be invoked by using: new DragSpriteSheet(args).
args is an object, with the following properties and their default value (in addition to the 
original MultipleSpriteSheet properties):

  isVertical: [Boolean] whether the drag is vertical (or horizontal) (default: [false])
  isOneDirection: [Boolean] whether the drag can only go forwards (or also backwards) (default: [false])
  sensitivity: [Number] number of pixels to drag to go the next frame (default: 2),
  startFrame: [Int] frame number on which to start the spritesheet (default: 0),
  onAnimationEnd: [Function] called when the last image of the last spritesheet has been displayed (default: noop)
  callbackFrames: [Array or Int] the frames on which to trigger a callback if reached (default: [])
  onFrameReached: [Function] called when one of the callbackFrames is reached, with the frame as a parameter (default: noop)

WARNING: DO NOT ADD ANY CHILD TO THIS COMPONENT
*/

import { MultipleSpriteSheet } from '../MultipleSpriteSheet/MultipleSpriteSheet';

class DragSpriteSheetComponent extends MultipleSpriteSheet {
  constructor(args = {}) {
    super(args);

    const {
      isVertical = false,
      isOneDirection = false,
      sensitivity = 2,
      startFrame = 0,
      callbackFrames = [],
      onFrameReached = () => {},
    } = args;
    this.gotoAndStop(startFrame);

    this.isVertical = isVertical;
    this.isOneDirection = isOneDirection;
    this.sensitivity = sensitivity;
    this.prev = undefined;
    this.dragFrame = startFrame;

    this.on('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      this.prev = e[this.isVertical ? 'localY' : 'localX'];
    });

    this.on('pressmove', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const curr = e[this.isVertical ? 'localY' : 'localX'];
      const delta = Math.round(curr - this.prev);

      if (this.isOneDirection && delta < 0) {
        this.prev = curr;
      } else if (Math.abs(delta) >= this.sensitivity) {
        const prevDragFrame = this.dragFrame;
        const newDragFrame =
          prevDragFrame + Math.round(delta / this.sensitivity);

        if (!this.doLoop && (newDragFrame < 0 || newDragFrame > this.count)) {
          this.dragFrame = Math.max(Math.min(newDragFrame, this.count), 0);
        } else {
          this.dragFrame = newDragFrame;
        }
        this.gotoAndStop(this.dragFrame);
        [...callbackFrames, this.count].forEach((callbackFrame) => {
          if (
            prevDragFrame < callbackFrame &&
            callbackFrame <= this.dragFrame
          ) {
            if (callbackFrame === this.count) {
              this.onAnimationEnd();
            } else {
              onFrameReached(callbackFrame);
            }
          }
        });

        this.prev = curr;
      }
    });

    this.on('pressup', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      this.prev = undefined;
    });
  }

  /*
    returns the dragSpriteSheet current parameters
  */
  getArgs() {
    return {
      ...this.args,
      regX: parseFloat(this.regXcoeff),
      regY: parseFloat(this.regYcoeff),
      loop: this.doLoop,
      debug: this.doDebug,
      sensitivity: this.sensitivity,
      isVertical: this.isVertical,
    };
  }
}

export const DragSpriteSheet = createjs.promote(
  DragSpriteSheetComponent,
  'Container'
);
