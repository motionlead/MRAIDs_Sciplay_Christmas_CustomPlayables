/**
 * Determine the mobile operating system.
 * This function returns one of 'iOS', 'Android', 'Windows Phone', or 'unknown'.
 * returns a string
 **/
export const getMobileOperatingSystem = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // Windows Phone must come first because its UA also contains "Android"
  if (/windows phone/i.test(userAgent)) {
    //console.log("windows");
    return 'Windows';
  }

  if (/android/i.test(userAgent)) {
    //console.log("android");
    return 'Android';
  }

  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    //console.log("iphone ");
    return 'iOS';
  }

  return 'unknown';
};

export const getMobileLanguage = () => {
  const lang = navigator.language || navigator.userLanguage;
  console.log('lang: ', lang);
  const suffixes = ['fr', 'de', 'ja', 'es'];
  let suffix = 'en';
  for (let i = 0; i < suffixes.length; i++) {
    if (lang.startsWith(suffixes[i])) {
      suffix = suffixes[i];
      break;
    }
  }
  return suffix;
};

export const isGyroscopeAvailable = () => {
  return (
    getMobileOperatingSystem() === 'Android' && window.DeviceOrientationEvent
  );
};

// this function transforms a number to an array of figures
// example: 457 => [4, 5, 7]
export const numberToArray = (value) => {
  if (value === 0) {
    return [0];
  }

  const digits = [];
  let started = false;
  for (let i = 10; i > -1; i--) {
    if (value >= Math.pow(10, i) || started) {
      const digit = Math.floor(value / Math.pow(10, i));
      digits.push(digit);
      value -= digit * Math.pow(10, i);
      started = true;
    }
  }
  return digits;
};

export const keepSafe = (idx, nb) => ((idx % nb) + nb) % nb;

export const map = (value, start1, stop1, start2, stop2) =>
  start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));

export const logError = (error) =>
  console.log(`%c ${error} `, 'background: brown; color: yellow');

export const stringifyObject = (obj = {}) => {
  let params = '{\n';
  Object.keys(obj).forEach((key) => {
    params += `   ${key}: ${obj[key]},\n`;
  });
  params += '}';
  return params;
};

export const isChrome = () => {
  const isChromium = window.chrome;
  const winNav = window.navigator;
  const vendorName = winNav.vendor;
  const isOpera = typeof window.opr !== 'undefined';
  const isIEedge = winNav.userAgent.indexOf('Edge') > -1;
  const isIOSChrome = winNav.userAgent.match('CriOS');

  if (isIOSChrome) {
    // is Google Chrome on IOS
    return true;
  } else if (
    isChromium !== null &&
    typeof isChromium !== 'undefined' &&
    vendorName === 'Google Inc.' &&
    isOpera === false &&
    isIEedge === false
  ) {
    return true;
    // is Google Chrome
  } else {
    // not Google Chrome
    return false;
  }
};
