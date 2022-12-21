/*
author: Oghel JOYE
for: Adikteev
december 2020

This is a CountDown component.

  debug: [Boolean] (whether a red shape is displayed over the video) (default: false)
  gap: [Int] [Int] the space in pixels between each digit
  year: [Int] the year of the end date
  month: [Int] the month of the end date
  day: [Int] the day of the end date
  hours: [Int] the hours of the end date
  minutes: [Int] the minutes of the end date
  seconds: [Int] the seconds of the end date
  images: [Array of String] the name of each digit (exactly 10 of them, from 0 to 9), plus an optional separator
*/

import { logError, numberToArray } from '../../helper';

class CountDownComponent extends createjs.Container {
  constructor(args = {}) {
    // invoke Container constructor
    super();

    const { images = [], gap = 10, debug = false } = args;

    this.gap = gap;
    this.debug = debug;

    this.images = [];
    this.imageUrls = images;
    images.forEach((image) => {
      const asset = new createjs.Bitmap(ad.assets.images[image]);
      if (asset.image) {
        this.images.push(asset);
      } else {
        logError(`ERROR: image '${image}' was not found :/`);
      }
    });
    if (images.length < 10) {
      logError(`ERROR: not enough assets were provided :o`);
      return;
    }
    if (this.images[10]) {
      this.separator = this.images[10];
    } else {
      logError(`ERROR: no separator was provided`);
    }

    this.init(args);
    createjs.Ticker.addEventListener('tick', () => this.update());
  }

  init(args = {}) {
    this.args = args;
    const now = new Date();
    const {
      year = now.getFullYear(),
      month = now.getMonth() + 1,
      day = now.getDate(),
      hours = now.getHours() + 1,
      minutes = now.getMinutes(),
      seconds = now.getSeconds(),
    } = args;

    this.endDate = new Date(year, month - 1, day, hours, minutes, seconds);

    this.deltaSecond = 0;

    this.removeAllChildren();

    this.dummyScreen = new createjs.Shape();
    this.dummyScreen.graphics.beginFill('#99000022').drawRect(0, 0, 120, 120);

    this.debug && this.addChild(this.dummyScreen);
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
  update() {
    // get total seconds between the times
    let delta = (this.endDate - new Date()) / 1000;
    const timeIsUp = delta < 0;
    // calculate (and subtract) whole days
    // const days = Math.floor(delta / 86400);
    // delta -= days * 86400;
    // calculate (and subtract) whole hours
    const deltaHours = timeIsUp ? 0 : Math.floor(delta / 3600); // % 24;
    delta -= deltaHours * 3600;
    // calculate (and subtract) whole minutes
    const deltaMinutes = timeIsUp ? 0 : Math.floor(delta / 60) % 60;
    delta -= deltaMinutes * 60;
    // what's left is seconds, in theory the modulus is not required
    const deltaSeconds = timeIsUp ? 0 : delta % 60;

    if (deltaSeconds !== this.deltaSeconds) {
      this.removeAllChildren();
      let x = 0;
      [deltaHours, deltaMinutes, deltaSeconds].forEach((delta, i) => {
        const digits = numberToArray(delta);
        if (digits.length < 2) {
          digits.unshift(0);
        }
        if (digits.length < 2) {
          digits.unshift(0);
        }
        digits.forEach((digit) => {
          const asset = this.images[digit].clone();
          asset.x = x;
          this.addChild(asset);
          x += asset.image.width + this.gap;
        });
        if (this.separator && i < 2) {
          const separator = this.separator.clone();
          separator.x = x;
          this.addChild(separator);
          x += separator.image.width + this.gap;
        }
      });
      this.deltaSeconds = deltaSeconds;

      this.debug && this.addChild(this.dummyScreen);
    }
  }

  //////////////////////////////////////////////////////////////////
  ///////////////////////// PUBLIC FUNCTIONS ///////////////////////
  //////////////////////////////////////////////////////////////////

  /*
    returns true if the specified end date is passed already, false otherwise
  */
  isTimeUp() {
    return this.endDate - new Date() < 0;
  }

  /*
    returns the countDown current parameters
  */
  getArgs() {
    return { ...this.args, images: this.imageUrls };
  }
}

export const CountDown = createjs.promote(CountDownComponent, 'Container');
