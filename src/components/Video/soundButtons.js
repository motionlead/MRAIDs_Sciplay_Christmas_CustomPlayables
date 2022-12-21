/*
author: Oghel JOYE
for: Adikteev
october 2020

This is a component that is used with a video or a carousel of videos.

A new soundButtons component can be invoked by using: new soundButtons(args).
args is an object, with the following properties:

  action: [Function] what to do when toggling the buttons,
*/

import { logError } from '../../helper';

class SoundButtonsComponent extends createjs.Container {
  constructor(args = {}) {
    // invoke Container constructor
    super();

    this.soundButtonOn = new createjs.Bitmap(ad.assets.images.soundOn);
    this.soundButtonOff = new createjs.Bitmap(ad.assets.images.soundOff);

    if (!this.soundButtonOn.image || !this.soundButtonOff.image) {
      logError(
        `ERROR: sound buttons asset 'soundOn.png' or 'soundOff.png' is missing`
      );
      return;
    }

    const { action = () => {} } = args;

    this.lastClick = 0; // used to make sure a single interaction is not counted twice
    this.isMuted = true;

    [this.soundButtonOn, this.soundButtonOff].forEach((soundButton, i) => {
      this.width = soundButton.image.width;
      this.height = soundButton.image.height;
      this.regX = this.width;
      this.regY = this.height;
      soundButton.visible = i === 1;
      this.addChild(soundButton);
    });

    const soundShape = new createjs.Shape();
    soundShape.alpha = 0.01;
    this.addChild(soundShape);

    soundShape.graphics
      .beginFill('white')
      .drawRect(0, 0, this.width, this.height);

    soundShape.on('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const now = new Date().getTime();
      if (now - this.lastClick > 250) {
        this.isMuted = !this.isMuted;
        this.soundButtonOn.visible = !this.isMuted;
        this.soundButtonOff.visible = this.isMuted;
        this.lastClick = now;
        action(this.isMuted);
      }
    });

    // pevents an unwanted asset redirection when used in Carousel
    this.on('pressup', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    });
  }

  // allow users to reset the soundButton to its original state (muted)
  reset() {
    this.isMuted = true;
    this.soundButtonOn.visible = false;
    this.soundButtonOff.visible = true;
  }
}

export const SoundButtons = createjs.promote(
  SoundButtonsComponent,
  'Container'
);
