import Track from "./trackings.js";
import tracking from "./tracking"; // Automatically tracks the seconds
import { logError } from "./helper";
import { Video } from "./components/video/Video";
import { Carousel } from "./components/Carousel/Carousel";
import { CountDown } from "./components/CountDown/CountDown";
import { MultipleSpriteSheet } from "./components/MultipleSpriteSheet/MultipleSpriteSheet";
import { DragSpriteSheet } from "./components/DragSpriteSheet/DragSpriteSheet";
import { Particles } from "./components/Particles/Particles";
import { MotionShaper } from "./components/MotionShaper/MotionShaper";
import { getMobileLanguage } from "./helper";

// Get the width and height of the canvas
let width = stage.canvas.width;
let height = stage.canvas.height;

// console.log("width :", width);
// console.log("height :", height);
// Shorthands
const c = createjs;
const images = ad.assets.images;

// Create scaled container, the scaled container is used to avoid scaling each
// element one by one
const sc = new c.Container();
// - Scale it
sc.scaleX = width / 640;
sc.scaleY = sc.scaleX;
// - Add it to the stage
stage.addChild(sc);
// - Update the width and height to be scaled according to the scaled container
width /= sc.scaleX;
height /= sc.scaleY;

// Create the close button
const cc = sc.clone();
// stage.addChild(cc); // Handle close button

if (window.mraid && window.mraid.useCustomClose) {
  // Disable default close button
  window.mraid.useCustomClose(true);

  // Setup close button
  const closeButton = new c.Bitmap(images.cross);
  closeButton.regX = images.cross.width;
  closeButton.regY = images.cross.height / 2;
  closeButton.scaleX = closeButton.scaleY = 0.75;
  closeButton.x = width - images.cross.width * closeButton.scaleX;
  closeButton.y = images.cross.width * closeButton.scaleY;
  cc.addChild(closeButton);

  closeButton.on("click", function () {
    ad.close();
  });
} else {
  // Nothing to do here, non-mraid interstitials already have a close button
}

const track = new Track();
tracking.setupFirstInteractionTracking(sc);

/*~~~~~~~~~~~ START CODE HERE ~~~~~~~~~~~*/
track.track("display");

///////////////////////////////////////////
//////////// GLOBAL VARIABLES /////////////
///////////////////////////////////////////
const logComponentArgs = (currComponent) => {
  const now = new Date().getTime();
  if (now - clickTime > 200) {
    const componentArgs = currComponent.getArgs();
    let params = "{\n";
    Object.keys(componentArgs).forEach((key) => {
      let value = componentArgs[key];
      if (typeof value === "string") {
        value = `"${value}"`;
      } else if (typeof value === "object") {
        value = `[${value}]`;
      }
      params += `   ${key}: ${value},\n`;
    });
    params += "}";
    logError("component params: ");
    console.dir(params);
    clickTime = now;
  }
};
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////

const suffix = getMobileLanguage();

let clickTime = 0;
let clickable = []; //[bg];

const bg = new c.Bitmap(images.bg);
bg.name = "bg";

////////////////////////////////////////////////
/////////////////// VIDEO //////////////////////
////////////////////////////////////////////////

// const onEnded = () => logError("video Ended");
// const onError = () => logError("video Error");

const videoParameters = {
  src: "https://dsp-creatives.s3.amazonaws.com/mraid_videos/MyGames_LeftToSurvive_Multiplecampaigns_v1_May22.mp4",
  regX: 0.5,
  regY: 0.5,
  // onEnded,
  // onError,
  // playbackRate: 5,
  // splashScreen: "splashScreen",
};

const myVideo = new Video(videoParameters);
myVideo.x = width / 2;
myVideo.y = height / 2;

// CONTROLS :

myVideo.play();
// myVideo.stop();
// logComponentArgs(myVideo);
// myVideo.gotoAndPlay(5);
// myVideo.gotoAndStop(5);
// myVideo.playAndStopAt(5);

///////////////////////////////////////////////
///////////////////  carousel /////////////////
///////////////////////////////////////////////

// const onCenteredFadeObjects = (objects) => {
//   console.log("onCenteredFadeObjects objects: ", objects);
// };
// const onCenteredObject = (object) => {
//   console.log("onCenteredObject object: ", object);
// };

const fadeItems = [];

const wording_fadeItems = [
  new c.Bitmap(images["wording01"]),
  new c.Bitmap(images["wording02"]),
  new c.Bitmap(images["wording03"]),
];

const wordingObjCont = new c.Container();
wordingObjCont.name = "bg";
wordingObjCont.alpha = 1;

for (var i = 0; i < wording_fadeItems.length; i++) {
  const wording = wording_fadeItems[i];
  wording.regX = wording.image.width / 2;
  wording.regY = wording.image.height;
  wording.y = height * 1.05;
  wording.x = width * 0.5;

  wordingObjCont.addChild(wording);
  fadeItems.push([wording]);
}

const carouselParameters = {
  images: [
    "asset_1",
    "https://dsp-creatives.s3.amazonaws.com/mraid_videos/MyGames_LeftToSurvive_Multiplecampaigns_v1_May22.mp4",
    "asset_2",
  ],
  // urls: [
  //   "https://www.google.com/?q=1",
  //   "https://www.google.com/?q=2",
  //   "https://www.google.com/?q=3",
  // ],
  // videoWidth: 640,
  // videoHeight: 360,
  splashScreens: ["", "asset_1", ""],
  // debug: true,
  isCyclic: true,
  // startIndex: 1,
  masked: false,
  scaleUnfocus: 0.5,
  alignFocusV: 50, // vertically align the focused element. From 0 (top) to 100 (bottom)
  alignUnfocus: 50, // vertically align the unfocused elements. From 0 (top) to 100 (bottom)
  alignFocusH: 50, // horizontally align the focused element. From 0 (left) to 100 (right)
  opacityUnfocus: 0.3, // from 0 to 1
  speedDeceleration: 0.92,
  width: width,
  height: height * 0.45,
  // showSoundButtons: false,
  // gap: 20,
  name: "carousel_1", // useful for tracking when several carousels at once
  speedThreshold: 0.02,
  fadeObjects: fadeItems,
  // onCenteredFadeObjects,
  // onCenteredObject,
  // autoPlay: 1.5, // period in seconds
  // languageSuffix: 'en', // getMobileLanguage(),
  // isVertical: true,
  tooltip: "hand",
  layout: "2d", // '2d', '3d', 'android'
};

const myCarousel = new Carousel(carouselParameters);
myCarousel.x = width * 0.5;
myCarousel.y = height * 0.65;
myCarousel.regX = myCarousel.width / 2;
myCarousel.regY = myCarousel.height / 2;

// carousel controls

// setTimeout(function () {
//   // myCarousel.moveFocus(-1);
//   myCarousel.moveFocus(+1);
// }, 2000);

////////////////////////////////////////////////
///////////////// countDown ////////////////////
////////////////////////////////////////////////

const now = new Date();
const countDownParameters = {
  debug: false,
  images: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "separator"],
  year: now.getFullYear(), // 2022
  month: now.getMonth() + 1, // 12
  day: now.getDate(), // 19
  hours: now.getHours() + 25, // 22
  minutes: now.getMinutes(), // 34
  seconds: now.getSeconds(), // 0
  gap: 10,
};

const myCountDown = new CountDown(countDownParameters);
myCountDown.x = width / 2;
myCountDown.y = height / 2;

////////////////////////////////////////////////
///////////////// MultipleSpriteSheet //////////
////////////////////////////////////////////////

const MultipleSpriteSheetParameters = {
  names: ["fenec68", "fenec183", "fenec208"],
  debug: false,
  regX: 0,
  regY: 0,
  framerate: 40,
  // onAnimationEnd,
};

const myMultipleSpriteSheet = new MultipleSpriteSheet(
  MultipleSpriteSheetParameters
);
myMultipleSpriteSheet.y = height / 2;
myMultipleSpriteSheet.x = width / 2;

// MultipleSpriteSheet controls

// myMultipleSpriteSheet.play();
myMultipleSpriteSheet.stop();
// myMultipleSpriteSheet.doLoop = false;
// myMultipleSpriteSheet.gotoAndPlay(120);
// myMultipleSpriteSheet.gotoAndStop(120);
// myMultipleSpriteSheet.reverse;

////////////////////////////////////////////////
///////////////// DragSpriteSheet //////////////
////////////////////////////////////////////////

// const onAnimationEnd = () => logError("animation EENENNENENNNNNND");
// const onFrameReached = (frame) => logError(`FRAME ${frame} REACHED`);

const myDragSpriteSheetParameters = {
  names: ["fenec68", "fenec183", "fenec208"],
  regX: 0.5,
  regY: 0.5,
  debug: true,
  startFrame: 1,
  loop: true,
  isVertical: false,
  isOneDirection: false,
  // sensitivity: 30,
  // onAnimationEnd,
  // callbackFrames: [34, 120],
  // onFrameReached,
};

const myDragSpriteSheet = new DragSpriteSheet(myDragSpriteSheetParameters);
myDragSpriteSheet.x = width / 2;
myDragSpriteSheet.y = height / 2;

////////////////////////////////////////////////
///////////////// Particles //////////////
////////////////////////////////////////////////

const myParticlesParams = {
  width: width * 0.7,
  height: height * 0.7,
  debug: true,
  masked: true,
  preset: "rain",
  nb: 60,
};

const myParticles = new Particles(myParticlesParams);
myParticles.regX = myParticles.width / 2;
myParticles.regY = myParticles.height / 2;
myParticles.x = width / 2;
myParticles.y = height / 2;

////////////////////////////////////////////////
///////////////// MotionShaper //////////////
////////////////////////////////////////////////

// const onCenteredObjectExample = (object) => {
//   console.log("onCenteredObject object: ", object);
// };

const so00 = new c.Bitmap(ad.assets.images["0"]);
const so10 = new c.Bitmap(ad.assets.images["1"]);
const so20 = new c.Bitmap(ad.assets.images["2"]);
so00.y = so10.y = so20.y = height - so20.image.height;
sc.addChild(so00, so10, so20);

const mss = new MultipleSpriteSheet({
  names: ["fenec68", "fenec183", "fenec208"],
  framerate: 40,
  debug: true,
});

const MotionShaperParams = {
  width: 546,
  height: 444,
  regX: 546 / 2,
  regY: 444,
  // duration: 550,
  durationIn: 300,
  durationOut: 130,
  waitIn: 120,
  sensitivity: 3,
  debug: true,
  animationIn: c.Ease.quadIn,
  animationOut: c.Ease.linear,
  // isVertical: true,
  // isCyclic: false,
  startIndex: 1,
  // onCenteredObject,
  items: [
    {
      // item: new c.Bitmap(ad.assets.images["nike_1"]),
      item: new c.Bitmap(images.nike_1),
      regX: 546 / 2,
      regY: 130,
      alpha: [0.1, 1, 0.1],
      x: [-111, 546 / 2, 555],
      y: [0, 140, 0],
      scale: [0.4, 1, 0.4],
      rotation: [-360, 0, 360],
    },
    {
      item: mss,
      regX: mss.width / 2,
      regY: mss.height / 2,
      x: [-mss.width / 2, 546 / 2, 546 + mss.width / 2],
      y: 444 / 2,
      rotation: 0,
      scale: 1,
    },
    { item: "nike_3" },
  ],
  urls: [
    "https://www.google.com/search?q=0",
    "https://www.google.com/search?q=1",
    "https://www.google.com/search?q=2",
  ],
  secondaryObjects: [
    {
      duration: 300,
      waitIn: 120,
      waitOut: 120,
      animationIn: c.Ease.bounceOut,
      animationOut: c.Ease.quadOut,
      items: [
        {
          item: so00,
          alpha: [0, 1, 0],
          x: [0, width / 2, width],
        },
        {
          item: so10,
          scale: [1, 2, 1],
          y: height - 2 * so10.image.height,
        },
        { item: so20 },
      ],
      urls: [
        "https://www.google.com/search?q=secondary+object+0",
        "https://www.google.com/search?q=secondary+object+1",
        "https://www.google.com/search?q=secondary+object+2",
      ],
    },
    {
      duration: 300,
      animationOut: c.Ease.quadOut,
      items: [
        {
          item: "wording01",
          alpha: [0, 1, 0],
          x: 0,
          scale: 0.5,
        },
        { item: "wording02" },
        { item: "wording03" },
      ],
    },
  ],
};

const myMotionShaper = new MotionShaper(MotionShaperParams);
myMotionShaper.x = width / 2;
myMotionShaper.y = height / 2;

////////////////////////////////////////////////
///////////////// ADD TO STAGE  ////////////////
////////////////////////////////////////////////

sc.addChild(
  bg,

  // add myVideo :
  myVideo

  // add myCarousel :
  // myCarousel,
  // wordingObjCont

  // add myCountDown :
  // myCountDown

  // add myMultipleSpriteSheet :
  // myMultipleSpriteSheet

  // add myDragSpriteSheet :
  // myDragSpriteSheet

  // add myParticles :
  // myParticles

  // add myParticles :
  // myParticles

  // add myMotionShaper :
  // myMotionShaper
);

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

clickable.forEach((element) => {
  element.on("click", () => {
    const now = new Date().getTime();
    if (now - clickTime > 200) {
      track.track("adOpen_click_on_" + element.name);
      ad.open();
      clickTime = now;
    }
  });
});

// time tracks
[5, 10, 15].map((time) =>
  setTimeout(() => track.track("time" + time), time * 1000)
);

/*~~~~~~~~~~~ End Matter engine ~~~~~~~~~~~*/
// Restarts the ad on resize event
ad.on("resize", function () {
  ad.restart();
});

// Remove all event listeners added on DOM objects in here (e.g. accelerometer,
// etc)
ad.on("cleanup", function () {
  // No need to remove events listeners on EaselJS objects
});
