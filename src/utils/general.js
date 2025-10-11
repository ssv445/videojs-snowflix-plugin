import { ASPECT_RATIOS } from '../constants';
import { saveLogData, clientId, mediaId } from './index';
import { isDebugEnabled } from './logger';

export const logSnowflix = (event, value) => {
  saveLogData({ event, value, mediaid: mediaId, clientid: clientId, timestamp: Date.now() });

  if (isDebugEnabled()) {
    let message = `%cSnowflixLog: ${event} `;
    if (value !== undefined) {
      message += JSON.stringify(value);
    }
    console.log(message, 'color: orange;');
  }
};

export const getUrlParams = () => {
  const vars = {};
  window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => (vars[key] = value));
  return vars;
};

export const findAspectRatio = (aspect) => {
  const size = {
    aspectRatio: ASPECT_RATIOS.ASPECT_16x9,
    height: 4.5,
    width: 8,
  };

  if (2.38 < aspect && aspect < 2.39) {
    size.aspectRatio = ASPECT_RATIOS.ASPECT_21x10;
    size.height = 5;
    size.width = 10.5;
  } else if (1.3 < aspect && aspect < 1.4) {
    size.aspectRatio = ASPECT_RATIOS.ASPECT_4x3;
    size.height = 1.5;
    size.width = 2;
  }

  return size;
};
