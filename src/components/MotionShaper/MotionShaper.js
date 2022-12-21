import Track from '../../trackings.js';
import { logError, keepSafe } from '../../helper';

/*
author: Oghel JOYE
for: Adikteev
March 2022

This component is a DisplayObject that allows to customize a simple carousel.

A new CarouselSimple can be invoked by using: new CarouselSimple(args).
args is an object, with the following properties and their default value:

  name: [string] component name, used for tracking (default: 'motionShaper')
  items: [Array of Strings or Array of assets] the names/assets of the images (default: [])
  urls: [], // [Array of Strings] contains the redirection urls for each item if any
  secondaryObjects: 
    all properties that are not assigned a value will not be affected
  // TODO
  width: [number] width of the carousel (default: 100)
  height: [number] height of the carousel (default: 100)
  regX: [number] regX of the carousel (default: 0)
  regY: [number] regY of the carousel (default: 0)
  startIndex: [int] start index the carousel (default: 0)
  duration: [int] duration of the animation in milliseconds (default: 300)
  durationIn: [int] duration of intro animation in milliseconds (default: [duration])
  durationOut: [int] duration of outro animation in milliseconds (default: [duration])
  animation: [ease] animation curve to be used for all animations (default: [c.Ease.quadOut])
  animationIn: [ease] animation to be used when going from unfocus to focus (default: [animation])
  animationOut: [ease] animation to be used when going from focus to unfocus (default: [animation])
  waitIn: [int] wait duration before intro animation in milliseconds (default: [0])
  waitOut: [int] wait duration before outro animation in milliseconds (default: [0])
  sensitivity" [int] horizontal or vertical mouse displacement that triggers a swipe (default: [20])
  onCenteredObject: () => {}, // [function] callback when an item is centered; param is the centered object
*/

// TODO:
// √ suport asset name or Bitmap asset
// support fade objects (secondaryObjects) array of array to deal with several kinds of FO
// √ add easing animations (in & out)
// √ new name: motion shaper
// √ add onCenteredObject prop
// √ redirections!?

// TODO #2
// support sprite sheet in Carousel and particules

const c = createjs;
const images = ad.assets.images;
const track = new Track();

const PREV_IDX = 0;
const CURR_IDX = 1;
const NEXT_IDX = 2;

const X_DEF = 0;
const Y_DEF = 0;
const ALPHA_DEF = 1;
const SCALE_DEF = 1;
const REG_DEF = 0;
const ROT_DEF = 0;
const ANIM_DUR_DEF = 300;
const ANIM_DEF = c.Ease.quadOut;
const WAIT_DEF = 0;

// returns the value to use for a given property
function getProp(
  value,
  firstElementValue,
  index,
  defaultValue,
  isSecondaryObjects = false
) {
  if (value !== undefined) {
    if (typeof value === 'number') {
      return value;
    } else if (Array.isArray(value)) {
      return value[index];
    }
  } else {
    if (typeof firstElementValue === 'number') {
      return firstElementValue;
    } else if (Array.isArray(firstElementValue)) {
      return firstElementValue[index];
    }
  }
  return isSecondaryObjects ? undefined : defaultValue;
}

class MotionShaperComponent extends createjs.Container {
  constructor(args = {}) {
    // invoke Container constructor
    super();

    this.width = args.width || 100;
    this.height = args.height || 100;
    this.regX = args.regX || 0;
    this.regY = args.regY || 0;
    this.currIdx = args.startIndex || 0;
    this.onCenteredObject = args.onCenteredObject || (() => {});
    this.init(args);

    this.isTweenRunning = false;
    this.name = args.name || 'motionShaper';

    const container = new createjs.Container();

    this.items = this.createItems(args, container);
    this.secondaryObjects = (args.secondaryObjects || []).map((qqq) =>
      this.createItems(qqq, container, true)
    );

    this.addChild(container);
    this.debug(args.debug);
    this.setupInteractions();
  }

  init(args) {
    this.isCyclic = args.isCyclic === undefined || args.isCyclic;
    this.isVertical = args.isVertical;
    this.sensitivity = args.sensitivity || 20;
    this.args = args;
  }

  createItems(itemsObject, container, isSecondaryObjects = false) {
    const {
      regX: firstRegX,
      regY: firstRegY,
      x: firstX,
      y: firstY,
      alpha: firstAlpha,
      scale: firstScale,
      rotation: firstRotation,
    } = (itemsObject.items || [])[0];

    const urls = itemsObject.urls || [];
    this.nbItems = (itemsObject.items || []).length;
    return (itemsObject.items || []).map(
      ({ item, regX, regY, x, y, alpha, scale, rotation }, i) => {
        const asset =
          typeof item === 'string' ? new createjs.Bitmap(images[item]) : item;
        if (typeof item !== 'object' && !asset.image) {
          logError(`ERROR: image ${item} is not an image :/`);
          return {};
        }
        if (typeof item === 'string' || asset.parent === null) {
          container.addChild(asset);
        }
        const q = isSecondaryObjects;
        const prevX = getProp(x, firstX, PREV_IDX, X_DEF, q);
        const currX = getProp(x, firstX, CURR_IDX, X_DEF, q);
        const nextX = getProp(x, firstX, NEXT_IDX, X_DEF, q);
        const prevY = getProp(y, firstY, PREV_IDX, Y_DEF, q);
        const currY = getProp(y, firstY, CURR_IDX, Y_DEF, q);
        const nextY = getProp(y, firstY, NEXT_IDX, Y_DEF, q);
        const prevAlpha = getProp(alpha, firstAlpha, PREV_IDX, ALPHA_DEF, q);
        const currAlpha = getProp(alpha, firstAlpha, CURR_IDX, ALPHA_DEF, q);
        const nextAlpha = getProp(alpha, firstAlpha, NEXT_IDX, ALPHA_DEF, q);
        const prevScale = getProp(scale, firstScale, PREV_IDX, SCALE_DEF, q);
        const currScale = getProp(scale, firstScale, CURR_IDX, SCALE_DEF, q);
        const nextScale = getProp(scale, firstScale, NEXT_IDX, SCALE_DEF, q);
        const prevRot = getProp(rotation, firstRotation, PREV_IDX, ROT_DEF, q);
        const currRot = getProp(rotation, firstRotation, CURR_IDX, ROT_DEF, q);
        const nextRot = getProp(rotation, firstRotation, NEXT_IDX, ROT_DEF, q);

        asset.regX = getProp(regX, firstRegX, null, REG_DEF);
        asset.regY = getProp(regY, firstRegY, null, REG_DEF);
        asset.index = i; // useful when returning the asset with onCenteredObject()
        if (i === this.currIdx) {
          if (currX !== undefined) asset.x = currX;
          if (currY !== undefined) asset.y = currY;
          if (currAlpha !== undefined) asset.alpha = currAlpha;
          if (currScale !== undefined) asset.scaleX = currScale;
          if (currScale !== undefined) asset.scaleY = currScale;
          if (currRot !== undefined) asset.rotation = currRot;
        } else if (this.currIdx === keepSafe(i - 1, this.nbItems)) {
          if (nextX !== undefined) asset.x = nextX;
          if (nextY !== undefined) asset.y = nextY;
          if (nextAlpha !== undefined) asset.alpha = nextAlpha;
          if (nextScale !== undefined) asset.scaleX = nextScale;
          if (nextScale !== undefined) asset.scaleY = nextScale;
          if (nextRot !== undefined) asset.rotation = nextRot;
        } else {
          if (prevX !== undefined) asset.x = prevX;
          if (prevY !== undefined) asset.y = prevY;
          if (prevAlpha !== undefined) asset.alpha = prevAlpha;
          if (prevScale !== undefined) asset.scaleX = prevScale;
          if (prevScale !== undefined) asset.scaleY = prevScale;
          if (prevRot !== undefined) asset.rotation = prevRot;
        }

        asset.on('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          this.openUrlAndTrackClick(i, urls[i]);
        });

        return {
          asset,
          waitIn: itemsObject.waitIn || WAIT_DEF,
          waitOut: itemsObject.waitOut || WAIT_DEF,
          durationIn:
            itemsObject.durationIn || itemsObject.duration || ANIM_DUR_DEF,
          durationOut:
            itemsObject.durationOut || itemsObject.duration || ANIM_DUR_DEF,
          animationIn:
            itemsObject.animationIn || itemsObject.animation || ANIM_DEF,
          animationOut:
            itemsObject.animationOut || itemsObject.animation || ANIM_DEF,
          prevX,
          currX,
          nextX,
          prevY,
          currY,
          nextY,
          prevAlpha,
          currAlpha,
          nextAlpha,
          prevScale,
          currScale,
          nextScale,
          prevRot,
          currRot,
          nextRot,
        };
      }
    );
  }

  getMousePosition(e) {
    return e[this.isVertical ? 'localY' : 'localX'];
  }

  setupInteractions() {
    this.on('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      if (this.isTweenRunning) {
        return;
      }
      this.mouseDown = true;
      // if (!this.hasInteracted) {
      //   clearInterval(this.intervalId);
      //   this.hasInteracted = true;
      //   this.hand && this.removeChild(this.hand);
      // }
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
      const { mouseLast1 } = this;
      const mousePosition = this.getMousePosition(e);
      this.mouseLast0 = mouseLast1;
      this.mouseLast1 = mousePosition;

      const prevIdx = this.currIdx;
      if (Math.abs(mousePosition - mouseLast1) > this.sensitivity) {
        const newIdx = this.currIdx + (mousePosition < mouseLast1 ? 1 : -1);
        if (
          this.isCyclic ||
          (!this.isCyclic && newIdx > -1 && newIdx < this.nbItems)
        ) {
          this.currIdx = keepSafe(newIdx, this.nbItems);
          this.swipe(prevIdx, this.currIdx);
        }
      }
    });

    this.on('pressup', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (!this.mouseDown) {
        return;
      }
      this.mouseDown = false;
    });
  }

  openUrlAndTrackClick(idx, url) {
    const now = new Date().getTime();
    if (!this.clickTime || now - this.clickTime > 150) {
      track.track(`${this.name}-click-item-${idx}`);
      if (url) {
        ad.open(url);
      } else {
        ad.open();
      }
      this.clickTime = now;
    }
  }

  swipe(prevIdx, newIdx) {
    // console.log('swipe: ', prevIdx, newIdx);
    this.mouseDown = false;
    this.isTweenRunning = true;
    this.items.forEach((item) => this.animate(item, prevIdx, newIdx));
    this.secondaryObjects.forEach((items) =>
      items.forEach((item) => this.animate(item, prevIdx, newIdx, true))
    );
  }

  animate(item, prevIdx, newIdx, isSecondaryObjects = false) {
    const { asset } = item;
    const { index } = asset;
    if (index !== newIdx && index !== prevIdx) {
      return;
    }

    const { waitIn, waitOut } = item;
    const { durationIn, durationOut } = item;
    const { animationIn, animationOut } = item;
    const { prevX, currX, nextX } = item;
    const { prevY, currY, nextY } = item;
    const { prevAlpha, currAlpha, nextAlpha } = item;
    const { prevScale, currScale, nextScale } = item;
    const { prevRot, currRot, nextRot } = item;

    let targetX, targetY, targetAlpha, targetRot, targetScale;
    let tweenWait, tweenDuration, tweenCurve;
    let onCenteredObject = () => {};

    if (index === newIdx) {
      targetX = currX;
      targetY = currY;
      targetAlpha = currAlpha;
      targetRot = currRot;
      targetScale = currScale;
      tweenWait = waitIn;
      tweenDuration = durationIn;
      tweenCurve = animationIn;
      onCenteredObject = this.onCenteredObject;

      let sourceX, sourceY, sourceAlpha, sourceRot, sourceScale;
      // init source properties for in animation
      if (prevIdx === keepSafe(index - 1, this.nbItems)) {
        sourceX = nextX;
        sourceY = nextY;
        sourceAlpha = nextAlpha;
        sourceRot = nextRot;
        sourceScale = nextScale;
      } else {
        sourceX = prevX;
        sourceY = prevY;
        sourceAlpha = prevAlpha;
        sourceRot = prevRot;
        sourceScale = prevScale;
      }
      if (sourceX !== undefined) asset.x = sourceX;
      if (sourceY !== undefined) asset.y = sourceY;
      if (sourceAlpha !== undefined) asset.alpha = sourceAlpha;
      if (sourceScale !== undefined) asset.scaleX = sourceScale;
      if (sourceScale !== undefined) asset.scaleY = sourceScale;
      if (sourceRot !== undefined) asset.rotation = sourceRot;
    } else {
      tweenWait = waitOut;
      tweenDuration = durationOut;
      tweenCurve = animationOut;
      if (newIdx === keepSafe(index - 1, this.nbItems)) {
        targetX = nextX;
        targetY = nextY;
        targetAlpha = nextAlpha;
        targetRot = nextRot;
        targetScale = nextScale;
      } else {
        targetX = prevX;
        targetY = prevY;
        targetAlpha = prevAlpha;
        targetRot = prevRot;
        targetScale = prevScale;
      }
    }

    c.Tween.get(asset)
      .wait(tweenWait)
      .to(
        {
          x: targetX,
          y: targetY,
          alpha: targetAlpha,
          scaleX: targetScale,
          scaleY: targetScale,
          rotation: targetRot,
        },
        tweenDuration,
        tweenCurve
      )
      .call(() => {
        if (isSecondaryObjects) {
          return;
        }
        onCenteredObject(asset);
        if (
          tweenWait + tweenDuration ===
          Math.max(waitIn + durationIn, waitOut + durationOut)
        ) {
          this.isTweenRunning = false;
        }
      });
  }

  /*
    display a shape that covers the whole component
    parameter:
      [Boolean] doDebug
  */
  debug(doDebug) {
    this.doDebug = doDebug;
    this.removeChildAt(1);
    if (doDebug) {
      const debugShape = new createjs.Shape();
      debugShape.mouseEnabled = false;
      debugShape.graphics
        .beginFill('red') //.drawRect(0, 0, 600, 600);
        .drawRect(0, 0, this.width, this.height);
      debugShape.alpha = 0.2;
      this.addChildAt(debugShape, 1);
    }
  }

  /*
    returns the component current parameters
  */
  getArgs() {
    return {
      ...this.args,
      debug: this.doDebug,
    };
  }
}

export const MotionShaper = createjs.promote(
  MotionShaperComponent,
  'Container'
);
