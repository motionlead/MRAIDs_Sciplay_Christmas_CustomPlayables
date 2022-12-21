export const LAYOUT_2D = '2d';
export const LAYOUT_3D = '3d';
export const LAYOUT_ANDROID = 'android';

const CAROUSEL_MEDIA_SQUARES = 'squares';
const CAROUSEL_MEDIA_MIXED = 'mixed';
const CAROUSEL_MEDIA_ALPHA = 'alpha';

const CAROUSEL_MEDIA = [
  {
    name: CAROUSEL_MEDIA_SQUARES,
    media: ['product_1-en', 'product_2-en', 'product_3-en', 'product_4-en'],
  },
  {
    name: CAROUSEL_MEDIA_MIXED,
    media: [
      'asset_1',
      'https://cdn.motionlead.com/video/ebayCelebrationNov2018.mp4',
      'asset_2',
      'https://cdn.motionlead.com/video/ebayOkeNov2018.mp4',
    ],
  },
  {
    name: CAROUSEL_MEDIA_ALPHA,
    media: ['shoe_0', 'shoe_1', 'shoe_2', 'shoe_3', 'shoe_4'],
  },
];

import {
  br,
  getButton,
  getContainer,
  getListAndLabel,
  getSliderAndLabel,
  getCheckboxAndLabel,
} from '../../controls/elements';

const updateSliderCarouselProperty =
  (carousel, propertyName, isInt = true) =>
  (value) => {
    const { controlParams } = carousel;
    controlParams[propertyName] = isInt
      ? parseInt(value, 10)
      : parseFloat(value);
    carousel.init(controlParams);
  };

const updateCheckCarouselProperty = (carousel, propertyName) => (e) => {
  const { controlParams } = carousel;
  controlParams[propertyName] = e.target.checked;
  carousel.init(controlParams);
};

const updateListCarouselProperty = (carousel, propertyName) => (e) => {
  const { controlParams } = carousel;
  controlParams[propertyName] = e.target.value;
  carousel.init(controlParams);
};

const updateMediaCarouselProperty = (carousel, propertyName) => (e) => {
  const { controlParams } = carousel;
  const media = CAROUSEL_MEDIA.find((q) => q.name === e.target.value).media;
  controlParams[propertyName] = media;
  carousel.init(controlParams);
};

export const addControlsCarousel = (carousel) => {
  const container = getContainer();

  const listAndLabelLayout = getListAndLabel(
    'layout',
    carousel.controlParams.layout,
    [LAYOUT_2D, LAYOUT_3D, LAYOUT_ANDROID],
    updateListCarouselProperty(carousel, 'layout')
  );

  const listAndLabelMedia = getListAndLabel(
    'media',
    carousel.controlParams.media,
    [CAROUSEL_MEDIA_SQUARES, CAROUSEL_MEDIA_ALPHA, CAROUSEL_MEDIA_MIXED],
    updateMediaCarouselProperty(carousel, 'media')
  );

  const checkboxAndLabelDebug = getCheckboxAndLabel(
    'debug',
    carousel.controlParams.debug,
    updateCheckCarouselProperty(carousel, 'debug')
  );

  const checkboxAndLabelMasked = getCheckboxAndLabel(
    'masked',
    carousel.controlParams.masked,
    updateCheckCarouselProperty(carousel, 'masked')
  );

  const checkboxAndLabelIsCyclic = getCheckboxAndLabel(
    'isCyclic',
    carousel.controlParams.isCyclic,
    updateCheckCarouselProperty(carousel, 'isCyclic')
  );

  const checkboxAndLabelIsVertical = getCheckboxAndLabel(
    'isVertical',
    carousel.controlParams.isVertical,
    updateCheckCarouselProperty(carousel, 'isVertical')
  );

  const checkboxAndLabelIsAutoPlay = getCheckboxAndLabel(
    'autoPlay',
    carousel.controlParams.autoPlay,
    (e) => carousel.setAutoPlay(e.target.checked)
  );

  const checkboxAndLabelIsDragEnabled = getCheckboxAndLabel(
    'dragEnabled',
    carousel.controlParams.dragEnabled,
    updateCheckCarouselProperty(carousel, 'dragEnabled')
  );

  const sliderAndLabelGap = getSliderAndLabel(
    'gap',
    updateSliderCarouselProperty(carousel, 'gap'),
    0,
    100,
    carousel.controlParams.gap,
    1
  );

  const sliderAndLabelAlignFocusH = getSliderAndLabel(
    'alignFocusH',
    updateSliderCarouselProperty(carousel, 'alignFocusH'),
    0,
    100,
    carousel.controlParams.alignFocusH,
    1
  );

  const sliderAndLabelAlignFocusV = getSliderAndLabel(
    'alignFocusV',
    updateSliderCarouselProperty(carousel, 'alignFocusV'),
    0,
    100,
    carousel.controlParams.alignFocusV,
    1
  );

  const sliderAndLabelAlignUnfocus = getSliderAndLabel(
    'alignUnfocus',
    updateSliderCarouselProperty(carousel, 'alignUnfocus'),
    0,
    100,
    carousel.controlParams.alignUnfocus,
    1
  );

  const sliderAndLabelOpacity = getSliderAndLabel(
    'opacityUnfocus',
    updateSliderCarouselProperty(carousel, 'opacityUnfocus', false),
    0,
    1,
    carousel.opacityUnfocus,
    0.01
  );

  const sliderAndLabelScaleUnfocus = getSliderAndLabel(
    'scaleUnfocus',
    updateSliderCarouselProperty(carousel, 'scaleUnfocus', false),
    0.01,
    2,
    carousel.scaleUnfocus,
    0.01
  );

  const sliderAndLabelScaleFocus = getSliderAndLabel(
    'scaleFocus',
    updateSliderCarouselProperty(carousel, 'scaleFocus', false),
    1,
    1.5,
    carousel.scaleFocus,
    0.01
  );

  const prevButton = getButton('prev', () => carousel.moveFocus(-1));
  const nextButton = getButton('next', () => carousel.moveFocus(+1));

  [
    ...listAndLabelLayout,
    ...listAndLabelMedia,
    br.cloneNode(),
    ...checkboxAndLabelDebug,
    ...checkboxAndLabelMasked,
    ...checkboxAndLabelIsCyclic,
    br.cloneNode(),
    ...checkboxAndLabelIsVertical,
    ...checkboxAndLabelIsAutoPlay,
    ...checkboxAndLabelIsDragEnabled,
    br.cloneNode(),
    ...sliderAndLabelGap,
    br.cloneNode(),
    ...sliderAndLabelAlignFocusH,
    br.cloneNode(),
    ...sliderAndLabelAlignFocusV,
    br.cloneNode(),
    ...sliderAndLabelAlignUnfocus,
    br.cloneNode(),
    ...sliderAndLabelOpacity,
    br.cloneNode(),
    ...sliderAndLabelScaleUnfocus,
    br.cloneNode(),
    ...sliderAndLabelScaleFocus,
    br.cloneNode(),
    prevButton,
    nextButton,
    br.cloneNode(),
  ].forEach((element) => container.appendChild(element));
};
