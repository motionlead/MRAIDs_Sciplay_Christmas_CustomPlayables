/*
author: Oghel JOYE
for: Adikteev
november 2020

This is a customizable Horizontal Carousel component

A new carousel can be invoked by using: new Carousel(args).
args is an object, with the following properties and their default value:
*/

const DEFAULT_VALUES = {
  debug: false, // [Boolean] whether a red shape should cover the whole component
  width: 100, // [Number] of pixels for the width of the carousel
  height: 100, // [Number] of pixels for the height of the carousel
  isVertical: false, //[Boolean] whether the carousel is vertical (or horizontal)
  gap: 0, // [Number] horizontal gap between assets, in pixels
  alignFocusH: 50, // [Number] horizontal alignment for the focused item, from 0 (left) to 100 (right)
  alignFocusV: 50, // [Number] vertical alignment for the focused item, from 0 (top) to 100 (bottom)
  alignUnfocus: 50, // [Number] vertical alignment for the unfocused item, from 0 (top) to 100 (bottom)
  opacityUnfocus: 1, // [Number] opacity of the unfocused elements
  scaleUnfocus: 1, // [Number] scale of the unfocused elements
  scaleFocus: 1, // [Number] scale of the focused element
  images: [], // [Array of Strings] contains the name of the carousel items
  splashScreens: [], // [Array of Strings] names of the video splashscreens if any
  languageSuffix: '', // [String] the language code to use for the assets if any (en, fr, ...). Asset name should be 'name-fr'
  isCyclic: true, // [Boolean] whether the carousel is cyclic
  startIndex: 0, // [Int] which item is focused when carousel starts
  fadeObjects: [], // [Array of Array of createjs objects] contains the fadeObject items
  urls: [], // [Array of Strings] contains the redirection urls for each item if any
  masked: true, // [Boolean] whether the component is masked
  name: 'carousel', // [string] component name, used for tracking
  autoPlay: 0, // [Float] the period for the autoplay, in seconds
  speedDeceleration: 0.7, // [Float] factor used when magnet is NOT active to slow down the speed
  magnetFactor: 0.15, // [Float] factor used when magnet is active to smooth to targetIds
  speedThreshold: 0.2, // [Float] when speed is lower than this, magnet is activated
  showSoundButtons: true, // [Boolean] show soundButtons when a video is detected
  videoWidth: 1, // [Int] the width of the videos inside the carousel, MANDATORY when no image is present in the carousel
  videoHeight: 1, // [Int] the height of the videos inside the carousel, MANDATORY when no image is present in the carousel
  tooltip: null, // [String] the name of the asset to use for the tooltip
  layout: '2d', // [String] the carousel layout type; one of: '2d', '3d', 'android'
  dragEnabled: true, // [Boolean] whether the user can trigger actually drag the elements or just trigger a swipe
  onCenteredObject: () => {}, // [function] callback when an item is centered; param is the centered object
  onCenteredFadeObjects: () => {}, //[function] callback when fadeObjects are fully visible; param is an Array of these fadeObjects
};

import { Video } from '../Video/Video';
import Track from '../../trackings.js';
import { SoundButtons } from '../Video/soundButtons';
import { map, keepSafe, logError } from '../../helper';
import { LAYOUT_2D, LAYOUT_3D, LAYOUT_ANDROID } from './controls';

const images = ad.assets.images;

const TARGET_DETECTION = 0.005;
const track = new Track();

class CarouselComponent extends createjs.Container {
  constructor(args = {}) {
    // invoke Container constructor
    super();

    this.init(args);
    this.setupInteractions();
  }

  getMousePosition(e) {
    return e[this.isVertical ? 'localY' : 'localX'];
  }

  setupInteractions() {
    this.on('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      this.startIndex = this.currIdx;
      this.mouseDown = true;
      this.magnet = false;
      if (!this.hasInteracted) {
        clearInterval(this.intervalId);
        this.hasInteracted = true;
        this.hand && this.removeChild(this.hand);
      }
      this.mouseStart =
        this.mouseLast0 =
        this.mouseLast1 =
          this.getMousePosition(e);
    });

    this.on('pressmove', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (!this.mouseDown) {
        return;
      }
      const { startIndex, mouseStart, mouseLast1, isVertical, dragEnabled } =
        this;
      const mousePosition = this.getMousePosition(e);
      this.currIdx =
        startIndex +
        (mouseStart - mousePosition) /
          (isVertical ? this.imageHeight : this.imageWidth);
      this.mouseLast0 = mouseLast1;
      this.mouseLast1 = mousePosition;

      if (!dragEnabled && Math.abs(mousePosition - mouseLast1) > 20) {
        this.moveFocus(mousePosition < mouseLast1 ? 1 : -1);
        return;
      }
      if (!this.isCyclic) {
        this.currIdx = Math.min(Math.max(this.currIdx, 0), this.nbMedia - 1);
      }
    });

    this.on('pressup', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (!this.mouseDown) {
        return;
      }
      this.speed = 0;
      const { mouseStart, mouseLast0, mouseLast1, speedThreshold } = this;
      if (mouseStart === this.getMousePosition(e)) {
        this.openUrlAndTrackClick();
      } else {
        if (mouseStart === mouseLast0) {
          this.openUrlAndTrackClick();
        } else {
          track.track(`${this.name}-swipe`);
          this.speed = (mouseLast0 - mouseLast1) / 200;
        }

        if (Math.abs(this.speed) < speedThreshold) {
          this.getToMagnetState();
        }
      }

      this.magnet = false;
      this.mouseDown = false;
    });

    createjs.Ticker.addEventListener('tick', () => this.update());
  }

  init(args) {
    // used to update params from the controlsCarousel
    this.controlParams = { ...DEFAULT_VALUES, ...args };

    Object.keys(DEFAULT_VALUES).forEach(
      (key) => (this[key] = DEFAULT_VALUES[key])
    );
    Object.keys(args).forEach((key) => (this[key] = args[key]));

    // check for media coming from the controls
    if (this.media && this.media.length > 0) {
      this.images = this.media;
    }
    this.mediaUrls = this.images.map(
      (image = '') =>
        image +
        (image.includes('.mp4')
          ? ''
          : this.languageSuffix
          ? '-' + this.languageSuffix
          : '')
    );
    this.nbMedia = this.mediaUrls.length;
    this.currIdx = this.startIndex;

    for (let i = 0; i < this.nbMedia; i++) {
      if (!this.mediaUrls[i].includes('.mp4')) {
        const dummyAsset = new createjs.Bitmap(images[this.mediaUrls[i]]);
        if (!dummyAsset.image) {
          logError(`ERROR: image ${this.mediaUrls[i]} was not found :/`);
          return;
        }
        this.imageWidth = dummyAsset.image.width;
        this.imageHeight = dummyAsset.image.height;
        break;
      }
    }
    if (!this.imageWidth || !this.imageHeight) {
      if (args.videoWidth && args.videoHeight) {
        this.imageWidth = args.videoWidth;
        this.imageHeight = args.videoHeight;
      } else {
        logError(
          `ERROR: please provide the videos dimensions using videoWidth and videoHeight parameters`
        );
        return;
      }
    }

    this.autoPlay && this.setAutoPlay(true, this.autoPlay);

    //////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////

    const {
      width,
      height,
      imageWidth,
      imageHeight,
      isVertical,
      scaleFocus,
      scaleUnfocus,
      alignFocusV,
      alignFocusH,
      gap,
      debug = DEFAULT_VALUES.debug,
      masked = DEFAULT_VALUES.masked,
    } = this;

    // private variables
    this.mouseDown = false;
    this.hasInteracted = false;
    this.targetIdx = 0;
    this.mouseStart = 0;
    this.mouseLast0 = 0;
    this.mouseLast1 = 0;
    this.magnet = false;
    this.speed = 0;
    this.boundFocus = isVertical // x or y (if isVertical) position of the focused asset
      ? Math.round(((height - imageHeight * scaleFocus) * alignFocusV) / 100)
      : Math.round(((width - imageWidth * scaleFocus) * alignFocusH) / 100);
    const imageSize1 = isVertical ? imageHeight : imageWidth;

    // number of unfocused elements BEFORE the focused element
    this.deltaBefore = Math.ceil(
      this.boundFocus / (imageSize1 * scaleUnfocus + gap)
    );
    // number of unfocused elements AFTER the focused element
    this.deltaAfter =
      Math.ceil(
        ((isVertical ? height : width) -
          this.boundFocus -
          imageSize1 * scaleFocus) /
          (imageSize1 * scaleUnfocus + gap)
      ) + 1;

    this.removeAllChildren();
    this.container = new createjs.Container();
    this.addChild(this.container);

    const dummyScreen = new createjs.Shape();
    dummyScreen.graphics
      .beginFill('#99000070')
      .drawRect(0, 0, this.width, this.height);
    // container is used to mask the whole component

    if (masked) {
      this.container.mask = dummyScreen;
    }
    debug && this.addChild(dummyScreen);

    this.setupClones();
    this.setupTooltip();

    this.update();
  }

  resetCloneImages() {
    this.allMedia.forEach((clones) =>
      clones.forEach((clone) => {
        clone.mouseEnabled = false; // when a clone is used, mouseEnabled is true
        clone.alpha = 0;
      })
    );
  }

  resetFadeObjects() {
    this.fadeObjects.forEach((objects, i) => {
      objects &&
        objects.forEach((object) => {
          object.alpha = 0;
          object.index = i;
        });
    });
  }

  update() {
    switch (this.layout) {
      case LAYOUT_2D:
      default:
        this.update2d();
        break;
      case LAYOUT_3D:
        this.update3d();
        break;
      case LAYOUT_ANDROID:
        this.updateAndroid();
    }
    this.refresh();
  }

  update3d() {
    const PI = 3.14159;
    const TWO_PI = PI * 2;
    const { currIdx, nbMedia, scaleFocus, scaleUnfocus, opacityUnfocus } = this;
    const { alignUnfocus, width, height, isVertical } = this;
    const { alignFocusH, alignFocusV, imageHeight, imageWidth } = this;
    const items = [];
    for (let i = 0; i < nbMedia; i++) {
      const currImage = this.getCloneImage(i);
      const angle =
        (((((i - currIdx) * TWO_PI) / nbMedia) % TWO_PI) + TWO_PI) % TWO_PI;
      let d = 1;
      if (angle < PI) {
        d = map(angle, 0, PI, 0, 1);
      } else if (angle > PI) {
        d = map(angle, TWO_PI, PI, 0, 1);
      }
      if (isVertical) {
        currImage.y =
          height / 2 +
          (((height / 2) * (50 + alignUnfocus)) / 100) * Math.sin(angle);
        currImage.x =
          width / 2 +
          ((50 - alignFocusH) / 100) *
            map(d, 0, 1, -1, 1) *
            imageWidth *
            scaleFocus;
      } else {
        currImage.x =
          width / 2 +
          (((width / 2) * (50 + alignUnfocus)) / 100) * Math.sin(angle);
        currImage.y =
          height / 2 +
          ((50 - alignFocusV) / 100) *
            map(d, 0, 1, -1, 1) *
            imageHeight *
            scaleFocus;
      }
      currImage.scaleX = currImage.scaleY = map(
        d,
        0,
        1,
        scaleFocus,
        scaleUnfocus
      );
      currImage.alpha = map(d, 0, 1, 1, opacityUnfocus);
      items.push(currImage);
    }

    const sortedItems = items.sort((a, b) => a.scaleX - b.scaleX);
    sortedItems.forEach((item) =>
      this.container.setChildIndex(item, this.container.getNumChildren() - 1)
    );
  }

  update2d() {
    const { scaleUnfocus, scaleFocus, width, currIdx, nbMedia } = this;
    const { opacityUnfocus, isCyclic, isVertical, height, gap } = this;
    const { alignFocusH, alignFocusV, alignUnfocus, fadeObjects } = this;

    const imageSize1 = isVertical ? this.imageHeight : this.imageWidth;
    const imageSize2 = isVertical ? this.imageWidth : this.imageHeight;
    const unfocusSize = scaleUnfocus * imageSize1 + gap;

    let iMin = Math.floor(currIdx) - this.deltaBefore;
    let iMax = Math.ceil(currIdx) + this.deltaAfter;

    // console.log('iMin: ', iMin, ', iMax: ', iMax);
    if (!isCyclic) {
      iMin = Math.min(Math.max(iMin, 0), nbMedia);
      iMax = Math.min(Math.max(iMax, 0), nbMedia);
    }

    this.resetCloneImages();
    this.resetFadeObjects();

    const prop1 = isVertical ? 'y' : 'x';
    const prop2 = isVertical ? 'x' : 'y';
    const alignFocus = isVertical ? alignFocusH : alignFocusV;
    for (let i = iMin; i < iMax; i++) {
      let position1 = this.boundFocus + (i - currIdx) * (unfocusSize + gap);
      const position2 =
        (((isVertical ? width : height) - imageSize2 * scaleFocus) *
          alignFocus) /
        100;
      const d = Math.min(Math.abs(i - currIdx), 1);
      if (i >= currIdx) {
        position1 += imageSize1 * map(d, 0, 1, 0, scaleFocus - scaleUnfocus);
      }
      const magnify = map(Math.abs(d), 0, 1, scaleFocus, scaleUnfocus);
      let opacity = map(Math.abs(d), 0, 1, 1, opacityUnfocus);
      const safeIdx = keepSafe(i, nbMedia);
      const currImage = this.getCloneImage(safeIdx);
      currImage[prop1] = position1;
      currImage[prop2] =
        position2 + ((scaleFocus - magnify) * imageSize2 * alignUnfocus) / 100;
      currImage.alpha = opacity;
      currImage.scaleX = currImage.scaleY = magnify;

      const objects = fadeObjects[safeIdx];
      if (objects && objects.length > 0) {
        opacity = map(Math.abs(d), 0, 1, 1, 0);
        objects.forEach(
          (object) =>
            (object.alpha = opacity > object.alpha ? opacity : object.alpha)
        );
      }
    }
  }

  updateAndroid() {
    const {
      scaleUnfocus,
      scaleFocus,
      fadeObjects,
      currIdx,
      nbMedia,
      isVertical,
    } = this;

    let iMin = Math.floor(currIdx) - 1;
    let iMax = Math.ceil(currIdx) + 1;

    this.resetCloneImages();
    this.resetFadeObjects();

    for (let i = iMin; i < iMax; i++) {
      const safeIdx = keepSafe(i, nbMedia);
      const currImage = this.getCloneImage(safeIdx);
      const d = i - currIdx;

      let x = isVertical ? this.width / 2 : this.boundFocus;
      let y = isVertical ? this.boundFocus : this.height / 2;
      let magnify = scaleFocus;
      let opacity = 0;
      if (d > -1 && d <= 0) {
        this.container.setChildIndex(currImage, 0);
        if (isVertical) {
          y += d * this.imageHeight;
        } else {
          x += d * this.imageWidth;
        }
        opacity = map(d, -1, 0, 0, 1);
      }
      if (d >= 0 && d <= 0.7) {
        this.container.setChildIndex(currImage, 0);
        opacity = map(d, 0, 0.7, 1, 0);
        magnify = map(d, 0, 0.7, scaleFocus, scaleUnfocus);
      }
      currImage.x = x;
      currImage.y = y;
      currImage.alpha = opacity;
      currImage.scaleX = currImage.scaleY = magnify;

      const objects = fadeObjects[safeIdx];
      if (objects && objects.length > 0) {
        opacity = map(Math.abs(d), 0, 1, 1, 0);
        objects.forEach(
          (object) =>
            (object.alpha = opacity > object.alpha ? opacity : object.alpha)
        );
      }
    }
  }

  refresh() {
    const { mouseDown, magnet, targetIdx, speed, speedDeceleration } = this;
    const { nbMedia, currIdx, speedThreshold, magnetFactor } = this;
    if (!mouseDown) {
      if (magnet) {
        if (
          targetIdx !== currIdx &&
          Math.abs(targetIdx - currIdx) < TARGET_DETECTION
        ) {
          this.currIdx = targetIdx;
          this.triggerOnCentered();
        } else {
          this.currIdx += (targetIdx - currIdx) * magnetFactor;
        }
      } else if (Math.abs(speed) < speedThreshold) {
        this.getToMagnetState();
      } else {
        this.currIdx += speed;
        this.speed *= speedDeceleration;
      }
      if (!this.isCyclic) {
        const prevIdx = this.currIdx;
        this.currIdx = Math.min(Math.max(this.currIdx, 0), nbMedia - 1);
        // check that the carousel stopped on the first or last media element
        if (prevIdx !== this.currIdx) {
          this.targetIdx = this.currIdx;
          this.magnet = true;
          this.triggerOnCentered();
        }
      }
    }
  }

  triggerOnCentered() {
    const itemIdx = keepSafe(this.currIdx, this.nbMedia);
    this.allMedia.forEach((media) =>
      media.forEach((video) => video.stop && video.stop())
    );
    const clones = this.allMedia[itemIdx];
    clones.forEach((centeredObject) => {
      if (centeredObject.alpha > 0.99) {
        this.onCenteredObject(centeredObject);
        centeredObject.play && centeredObject.play();
      }
    });
    this.onCenteredFadeObjects(this.fadeObjects[itemIdx]);
  }

  getToMagnetState() {
    const { speed, currIdx } = this;
    let targetIdx =
      speed > 0 ? Math.floor(currIdx + 1) : Math.ceil(currIdx - 1);
    if (speed === 0) {
      targetIdx = Math.round(currIdx);
    }
    this.magnet = true;
    this.targetIdx = targetIdx;
  }

  setupTooltip() {
    const { tooltip, width, height, isVertical } = this;
    if (tooltip) {
      const hand = new createjs.Bitmap(images[tooltip]);
      if (hand.image) {
        this.hand = hand;
        hand.regX = hand.image.width / 2;
        hand.regY = hand.image.height / 2;
        hand.x = isVertical ? width * 0.5 : width * 0.7;
        hand.y = isVertical ? height * 0.7 : height * 0.5;
        hand.mouseEnabled = false;
        hand.alpha = 0;
        this.addChild(hand);

        createjs.Tween.get(hand, { loop: true })
          .wait(350)
          .to({ alpha: 1 }, 300, createjs.Ease.linear)
          .to(
            isVertical ? { y: height * 0.3 } : { x: width * 0.3 },
            350,
            createjs.Ease.linear
          )
          .to({ alpha: 0 }, 500, createjs.Ease.linear);
      } else {
        logError(`ERROR: tooltip image '${tooltip}' was not found :/`);
      }
    }
  }

  setupClones() {
    const { nbMedia, imageWidth, imageHeight, splashScreens } = this;
    const { width, height, mediaUrls, showSoundButtons, layout } = this;
    const imageSize = this.isVertical ? imageHeight : imageWidth;
    const size = this.isVertical ? height : width;
    this.nbClones =
      layout !== LAYOUT_2D
        ? 1
        : (this.nbClones = Math.ceil(
            1 +
              Math.ceil(
                (size - imageSize * this.scaleFocus) /
                  (this.scaleUnfocus * imageSize + this.gap)
              ) /
                nbMedia
          ));
    let videoDetected = false;
    // contains the carousel assets/videos
    this.allMedia = mediaUrls.map((imageUrl, i) => {
      const regX = this.getReg('x');
      const regY = this.getReg('y');
      if (imageUrl.includes('.mp4')) {
        const video = new Video({
          src: imageUrl,
          showSoundButtons: false,
          isAutoPlay: i === this.startIndex,
          loop: true,
          splashScreen: splashScreens[i],
          regX,
          regY,
        });
        this.container.addChild(video);
        video.index = i;
        videoDetected = true;
        return [video];
      } else {
        const asset = new createjs.Bitmap(images[imageUrl]);
        return new Array(this.nbClones).fill(0).map((_, i) => {
          const clone = asset.clone();
          this.container.addChild(clone);
          clone.mouseEnabled = false;
          clone.index = i;
          clone.regX = regX * asset.image.width;
          clone.regY = regY * asset.image.height;
          return clone;
        });
      }
    });
    if (videoDetected && showSoundButtons) {
      const soundButtons = new SoundButtons({
        action: (doMute) => {
          this.allMedia.forEach((media) => {
            if (media[0] && media[0] && media[0].video) {
              media[0].video.muted = doMute;
            }
          });
        },
      });
      soundButtons.x = this.width;
      soundButtons.y = this.height;
      this.addChild(soundButtons);
    }
  }

  getReg(property) {
    switch (this.layout) {
      case LAYOUT_2D:
      default:
        return 0;
      case LAYOUT_3D:
        return 0.5;
      case LAYOUT_ANDROID:
        if (this.isVertical) {
          return property === 'y' ? 0 : 0.5;
        } else {
          return property === 'x' ? 0 : 0.5;
        }
    }
  }

  getCloneImage(index) {
    for (let i = 0; i < this.nbClones; i++) {
      const asset = this.allMedia[index][i];
      if (asset && !asset.mouseEnabled) {
        asset.mouseEnabled = true;
        return asset;
      }
    }
    return this.allMedia[index][0];
  }

  openUrlAndTrackClick() {
    const now = new Date().getTime();
    if (!this.clickTime || now - this.clickTime > 150) {
      const idx = keepSafe(Math.round(this.currIdx), this.nbMedia);
      track.track(`${this.name}-click-item-${idx}`);
      if (this.urls[idx]) {
        ad.open(this.urls[idx]);
      } else {
        ad.open();
      }
      this.clickTime = now;
    }
  }

  setAutoPlay(doAutoPlay, frequency = 1.5) {
    if (!doAutoPlay) {
      clearInterval(this.intervalId);
    } else {
      this.hasInteracted = false;
      this.intervalId = setInterval(
        () => this.moveFocus(1, true),
        frequency * 1000
      );
    }
  }

  //////////////////////////////////////////////////////////////////
  //////////////////////// PUBLIC FUNCTIONS ////////////////////////
  //////////////////////////////////////////////////////////////////

  /*
    set the regX for the video component
    parameter:
      [Int] delta: the number of assets you want to move by
                  +1 to move to the next item, -1 to move to the previous one
  */
  moveFocus(delta, isAutoPlay = false) {
    track.track(`${this.name}-button-${delta > 0 ? 'next' : 'previous'}`);
    this.magnet = true;
    this.mouseDown = false;
    this.targetIdx += delta;
    if (!this.isCyclic) {
      this.targetIdx = Math.min(Math.max(this.targetIdx, 0), this.nbMedia - 1);
    }

    if (!isAutoPlay && !this.hasInteracted) {
      clearInterval(this.intervalId);
      this.hasInteracted = true;
      this.hand && this.removeChild(this.hand);
    }
  }

  /*
    returns the currently focused index
  */
  getFocusIndex() {
    return keepSafe(Math.round(this.currIdx), this.nbMedia);
  }

  /*
    returns the carousel current parameters
  */
  getArgs() {
    return this.controlParams;
  }
}

export const Carousel = createjs.promote(CarouselComponent, 'Container');
