/*
author: Oghel JOYE
for: Adikteev
october 2020

This is a Video component with overlapping sound buttons.

A new video can be invoked by using: new Video(args).
args is an object, with the following properties and their default value:

  loop: [Boolean] (whether the video loops when it ends) (default: false)
  src: [String] (video source url)
  debug: [Boolean] (whether a red shape is displayed over the video) (default: false)
  regX: [Number] from 0 (left) to 1 (right) (default: 0),
  regY: [Number] from 0 (top) to 1 (bottom) (default: 0),
  onEnded: [Function] (called when the video has ended),
  onError: [Function] (called when the video triggers an error),
  splashScreen: [String] (image name of the splashScreen if any),
  playbackRate: [Number] (default: 1),
  showSoundButtons: [Boolean] display or not the sound buttons (default: true)
*/

import Track from '../../trackings.js';
import { SoundButtons } from './soundButtons.js';
import { logError, isChrome } from '../../helper.js';
const track = new Track();

class VideoComponent extends createjs.Container {
  constructor(args = {}) {
    // invoke Container constructor
    super();

    this.args = args;
    const {
      loop = false,
      src,
      debug: doDebug = false,
      regX: regXcoeff = 0,
      regY: regYcoeff = 0,
      onEnded = () => {},
      onError = () => {},
      splashScreen,
      playbackRate = 1,
      showSoundButtons = true,
      isAutoPlay = true,
    } = args;

    this.doDebug = doDebug; // when true, display a shape covering the whole video component
    this.width = 0;
    this.height = 0;
    this.regXcoeff = regXcoeff; // regX from 0 (left) to 1 (right)
    this.regYcoeff = regYcoeff; // regY from 0 (top) to 1 (bottom)
    this.doLoop = loop;
    this.video = undefined;
    this.hasInteracted = false;

    const video = document.createElement('video');
    video.id = 'ak-video';
    video.style.pointerEvents = 'none';
    video.setAttribute('playsinline', null);
    video.setAttribute('webkit-playsinline', null);
    video.setAttribute('preload', true);
    video.setAttribute('crossorigin', 'anonymous');
    video.muted = true;
    video.src = src;
    this.video = video;

    const videoBitmap = new createjs.Bitmap(video);
    this.addChild(videoBitmap);

    // when the video is over, hide the elements from this array
    this.toRemove = [videoBitmap];

    // wait for the video to be loaded
    video.addEventListener('loadedmetadata', () => {
      if (!!video.canPlayType('video/mp4')) {
        this.width = video.videoWidth;
        this.height = video.videoHeight;
        this.setRegX(this.regXcoeff);
        this.setRegY(this.regYcoeff);
        this.debug(this.doDebug);
        showSoundButtons && this._initButtons();
      }
    });

    // this code is necessary to be functional on iOS
    const promise = video.pause();
    if (promise) {
      promise.catch((error) => logError('Error', error)).then(onError);
    } else {
      video.playbackRate = playbackRate;
      video.currentTime = 0.01;
      this.play();
      !isAutoPlay && this.stop();
      isAutoPlay && track.track('Video start');
    }

    video.onerror = () => {
      logError('video loading error');
      onError();
    };

    // when video ends, either loop or display the splashScreen if any
    video.onended = () => {
      track.track('Video viewed: 100%');
      onEnded();
      if (this.doLoop && !splashScreen) {
        video.play();
      } else {
        this.toRemove.forEach((element) =>
          createjs.Tween.get(element).to({ alpha: 0 }, 300)
        );

        if (splashScreen && ad.assets.images[splashScreen]) {
          const splash = new createjs.Bitmap(ad.assets.images[splashScreen]);
          splash.regX = splash.image.width / 2;
          splash.regY = splash.image.height / 2;
          splash.x = this.width / 2;
          splash.y = this.height / 2;
          splash.alpha = 0;

          // make sure the splashScreen does not overflow the video component
          const mask = new createjs.Shape();
          mask.graphics
            .beginFill('blue')
            .drawRect(0, 0, this.width, this.height);
          splash.mask = mask;

          // scale up to make sure that the splashScreen asset is in cover mode
          const xScale = this.width / splash.image.width;
          const yScale = this.height / splash.image.height;
          if (xScale > yScale) {
            splash.scaleX = splash.scaleY = xScale;
          } else if (xScale < yScale) {
            splash.scaleX = splash.scaleY = yScale;
          }
          this.addChild(splash);
          createjs.Tween.get(splash).to({ alpha: 1 }, 300);
        }

        // make sure the debug shape is still visible if needed
        this.debug(this.doDebug);
      }
    };

    // percentiles tracking
    const videoTrackings = [false, false, false];
    video.ontimeupdate = () => {
      const { duration } = video;
      videoTrackings.forEach((tracking, i) => {
        if (!tracking && (i + 1) * 0.25 < video.currentTime / duration) {
          videoTrackings[i] = true;
          track.track(`Video viewed: ${(i + 1) * 25}%`);
        }
      });
      if (this.stopAt && video.currentTime >= this.stopAt) {
        this.stop();
      }
    };
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
    Add the sound buttons to the video
  */
  _initButtons() {
    const soundButtons = new SoundButtons({
      action: (doMute) => {
        if (isChrome() && !this.hasInteracted) {
          // if user uses Chrome, first interaction is discarded
          this.hasInteracted = true;
          soundButtons.reset();
        } else {
          this.video.muted = doMute;
        }
      },
    });
    soundButtons.x = this.width;
    soundButtons.y = this.height;
    this.toRemove.push(soundButtons);
    this.addChild(soundButtons);
  }

  //////////////////////////////////////////////////////////////////
  //////////////////////// PUBLIC FUNCTIONS ////////////////////////
  //////////////////////////////////////////////////////////////////

  /*
  set the regX for the video component
  parameter:
    [Float] value: the percent of the image width where the regX should be placed
                   usually from 0 (0%) to 1(100%)
  */
  setRegX(value) {
    this.regXcoeff = value;
    this.regX = value * this.width;
  }

  /*
  set the regY for the video component
  parameter:
    [Float] value: the percent of the image width where the regX should be placed
                   usually from 0 (0%) to 1(100%)
  */
  setRegY(value) {
    this.regYcoeff = value;
    this.regY = value * this.height;
  }

  /*
    display a shape that covers the whole video component
    parameter:
      [Boolean] doDebug
  */
  debug(doDebug) {
    this.doDebug = doDebug;
    this.removeChild(this.debugShape);
    if (doDebug) {
      const debugShape = new createjs.Shape();
      debugShape.graphics
        .beginFill('red')
        .drawRect(0, 0, this.width, this.height);
      debugShape.alpha = 0.2;
      this.addChild(debugShape);
      this.debugShape = debugShape;
    }
  }

  /*
    loop/do not loop the video
    parameter:
      [Boolean] doLoop
  */
  loop(doLoop) {
    this.doLoop = doLoop;
  }

  /*
    play the video
  */
  play() {
    this.stopAt = null;
    this.video && this.video.play();
  }

  /*
    stop/pause the video
  */
  stop() {
    this.stopAt = null;
    this.video && this.video.pause();
  }

  /*
    set the current time and play the video
    parameter:
      [Int] time: the time in seconds
  */
  gotoAndPlay(time) {
    if (!this.video || time === undefined) {
      return;
    }

    this.video.currentTime = time;
    this.play();
  }

  /*
    set the current time and stop the video
    parameter:
      [Int] time: the time in seconds
  */
  gotoAndStop(time) {
    if (!this.video || time === undefined) {
      return;
    }

    this.video.currentTime = time;
    this.stop();
  }

  /*
    play the video till the time is reached then stop the video
    parameter:
      [Int] time: the time in seconds
  */
  playAndStopAt(time) {
    if (!this.video || time === undefined) {
      return;
    }

    this.play();
    this.stopAt = time;
  }

  /*
    returns the video current parameters
  */
  getArgs() {
    return {
      ...this.args,
      regX: parseFloat(this.regXcoeff),
      regY: parseFloat(this.regYcoeff),
      loop: this.doLoop,
      debug: this.doDebug,
    };
  }
}

export const Video = createjs.promote(VideoComponent, 'Container');
