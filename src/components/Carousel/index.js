import { Carousel } from './Carousel';
import { addControlsCarousel } from './controls';

const images = ad.assets.images;

export const launchCarousel = (sc, width, height) => {
  const onCenteredFadeObjects = (objects) => {
    console.log('onCenteredFadeObjects objects: ', objects);
  };
  const onCenteredObject = (object) => {
    console.log('onCenteredObject object: ', object);
  };
  const fadeObjects = [
    new createjs.Bitmap(images.wording01),
    new createjs.Bitmap(images.wording02),
    new createjs.Bitmap(images.wording03),
    new createjs.Bitmap(images.wording02),
    new createjs.Bitmap(images.wording03),
  ];
  const wordings = new createjs.Container();
  fadeObjects.forEach((fadeObject) => {
    fadeObject.regX = fadeObject.image.width / 2;
    fadeObject.regY = fadeObject.image.height / 2;
    wordings.addChild(fadeObject);
  });
  wordings.x = width / 2;
  wordings.y = height - 50;

  const carouselParameters = {
    images: [
      'asset_1',
      'https://cdn.motionlead.com/video/ebayCelebrationNov2018.mp4',
      'https://cdn.motionlead.com/video/ebayOkeNov2018.mp4',
      'asset_2',
      'https://cdn.motionlead.com/video/ebayCelebrationNov2018.mp4',
      'https://cdn.motionlead.com/video/ebayOkeNov2018.mp4',
    ],
    urls: [
      'https://www.google.com/?q=1',
      'https://www.google.com/?q=2',
      'https://www.google.com/?q=3',
      'https://www.google.com/?q=1',
      'https://www.google.com/?q=2',
      'https://www.google.com/?q=3',
    ],
    // videoWidth: 640,
    // videoHeight: 360,
    splashScreens: ['', 'asset_1', '', 'asset_2', '', 'asset_1'],
    // debug: true,
    isCyclic: true,
    // startIndex: 1,
    masked: false,
    scaleUnfocus: 0.6,
    alignFocusV: 50, // vertically align the focused element. From 0 (top) to 100 (bottom)
    alignUnfocus: 50, // vertically align the unfocused elements. From 0 (top) to 100 (bottom)
    alignFocusH: 50, // horizontally align the focused element. From 0 (left) to 100 (right)
    opacityUnfocus: 0.3, // from 0 to 1
    speedDeceleration: 0.92,
    width: width,
    height: height * 0.45,
    // showSoundButtons: false,
    // gap: 20,
    name: 'testCarousel', // useful for tracking when several carousels at once
    speedThreshold: 0.02,
    fadeObjects: fadeObjects.map((fadeObject) => [fadeObject]),
    onCenteredFadeObjects,
    onCenteredObject,
    // autoPlay: 1.5, // period in seconds
    // languageSuffix: 'en', // getMobileLanguage(),
    // isVertical: true,
    tooltip: 'hand',
    layout: '2d', // '2d', '3d', 'android'
  };

  const component = new Carousel(carouselParameters);
  component.x = width * 0.5;
  component.y = height * 0.65;
  component.regX = component.width / 2;
  component.regY = component.height / 2;
  sc.addChild(component, wordings);

  addControlsCarousel(component);

  return component;
};
