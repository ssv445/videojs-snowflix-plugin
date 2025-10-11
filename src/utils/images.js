import flashlightBtn from '../../public/images/flashlight-btn.svg';
import poweredByLink from '../../public/images/powered-by-link.svg';
import billboardBtn from '../../public/images/billboard-btn.svg';
import minimizeBtn from '../../public/images/minimize-btn.svg';
import cartoonBtn from '../../public/images/toon-cartoon.svg';
import unmuteBtn from '../../public/images/unmute-btn.svg';
import brightBtn from '../../public/images/toon-bright.svg';
import desatBtn from '../../public/images/desat-btn.svg';
import powerBtn from '../../public/images/power-btn.svg';
import darkBtn from '../../public/images/toon-dark.svg';
import toonBtn from '../../public/images/toon-btn.svg';
import muteBtn from '../../public/images/mute-btn.svg';
import tvBtn from '../../public/images/tv-btn.svg';

import one from '../../public/images/one.svg';
import two from '../../public/images/two.svg';
import three from '../../public/images/three.svg';
import four from '../../public/images/four.svg';

import rgbBtn from '../../public/images/rgb-btn.svg';
import rgbGreenBlue from '../../public/images/rgb-green-blue.svg';
import rgbGreenRed from '../../public/images/rgb-green-red.svg';
import rgbRedBlue from '../../public/images/rgb-red-blue.svg';
import rgbBlue from '../../public/images/rgb-blue.svg';
import rgbRed from '../../public/images/rgb-red.svg';
import rgbGreen from '../../public/images/rgb-green.svg';

import tv from '../../public/images/tv.svg';
import tvPosition from '../../public/images/tv-position.svg';
import flashlightPosition from '../../public/images/flashlight-position.svg';

import loader from '../../public/images/loader.gif';

import sun from '../../public/images/sun.svg';
import moon from '../../public/images/moon.svg';
import less from '../../public/images/less.svg';
import more from '../../public/images/more.svg';
import small from '../../public/images/small.svg';
import big from '../../public/images/big.svg';
import slow from '../../public/images/slow.svg';
import fast from '../../public/images/fast.svg';
import desatLess from '../../public/images/desat-less.svg';
import desatMore from '../../public/images/desat-more.svg';
import backgroundOff from '../../public/images/background-off.svg';
import backgroundOn from '../../public/images/background-on.svg';

//*** Export all images as base64 data URLs for use in the plugin
export const images = {
  flashlightBtn,
  poweredByLink,
  billboardBtn,
  minimizeBtn,
  cartoonBtn,
  unmuteBtn,
  brightBtn,
  desatBtn,
  powerBtn,
  darkBtn,
  toonBtn,
  muteBtn,
  tvBtn,
  one,
  two,
  three,
  four,
  rgbBtn,
  rgbGreenBlue,
  rgbGreenRed,
  rgbRedBlue,
  rgbBlue,
  rgbRed,
  rgbGreen,
  tv,
  tvPosition,
  flashlightPosition,
  loader,
  sun,
  moon,
  less,
  more,
  small,
  big,
  slow,
  fast,
  desatLess,
  desatMore,
  backgroundOff,
  backgroundOn,
};

//*** Map of HTML src paths to imported base64 data URLs
const imageMap = {
  'images/loader.gif': loader,
  'images/minimize-btn.svg': minimizeBtn,
  'images/mute-btn.svg': muteBtn,
  'images/unmute-btn.svg': unmuteBtn,
  'images/moon.svg': moon,
  'images/sun.svg': sun,
  'images/slow.svg': slow,
  'images/fast.svg': fast,
  'images/one.svg': one,
  'images/two.svg': two,
  'images/three.svg': three,
  'images/more.svg': more,
  'images/less.svg': less,
  'images/tv-position.svg': tvPosition,
  'images/tv.svg': tv,
  'images/flashlight-position.svg': flashlightPosition,
  'images/small.svg': small,
  'images/big.svg': big,
  'images/desat-more.svg': desatMore,
  'images/desat-less.svg': desatLess,
  'images/four.svg': four,
  'images/toon-bright.svg': brightBtn,
  'images/toon-dark.svg': darkBtn,
  'images/toon-cartoon.svg': cartoonBtn,
  'images/rgb-green.svg': rgbGreen,
  'images/rgb-blue.svg': rgbBlue,
  'images/rgb-red.svg': rgbRed,
  'images/rgb-green-red.svg': rgbGreenRed,
  'images/rgb-green-blue.svg': rgbGreenBlue,
  'images/rgb-red-blue.svg': rgbRedBlue,
  'images/billboard-btn.svg': billboardBtn,
  'images/tv-btn.svg': tvBtn,
  'images/flashlight-btn.svg': flashlightBtn,
  'images/desat-btn.svg': desatBtn,
  'images/toon-btn.svg': toonBtn,
  'images/rgb-btn.svg': rgbBtn,
  'images/powered-by-link.svg': poweredByLink,
  'images/background-off.svg': backgroundOff,
  'images/background-on.svg': backgroundOn,
};

/**
 * Replaces all image src attributes in the given container with base64 data URLs
 * @param {HTMLElement} container - The container element with images to replace
 */
export const replaceImageSources = (container) => {
  const imgElements = container.querySelectorAll('img[src]');
  imgElements.forEach((img) => {
    const src = img.getAttribute('src');
    if (imageMap[src]) {
      img.setAttribute('src', imageMap[src]);
    }
  });
};
