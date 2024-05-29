import { ColorEvent } from '../interfaces/dashboard';

export const getProfessionalColor = (isDark: boolean, darkColor?: string, lightColor?: string): ColorEvent =>
  isDark ? getDarkColor(darkColor) : getLightColor(lightColor);

export const lightenDarkenColor = (col: string, amt: number): string => {
  let usePound = false;

  if (col[0] === '#') {
    col = col.slice(1);
    usePound = true;
  }

  const num: number = parseInt(col, 16);

  let r = (num >> 16) + amt;

  if (r > 255) {
    r = 255;
  } else if (r < 0) {
    r = 0;
  }

  let b = ((num >> 8) & 0x00FF) + amt;

  if (b > 255) {
    b = 255;
  } else if (b < 0) {
    b = 0;
  }

  let g = (num & 0x0000FF) + amt;

  if (g > 255) {
    g = 255;
  } else if (g < 0) {
    g = 0;
  }

  return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16);
};

const createColor = (color: string, isDarkMode: boolean): ColorEvent => {
  const lightenDarken = lightenDarkenColor(color, isDarkMode ? 50 : -50);
  return new ColorEvent(lightenDarken, color);
};

export const createEventColor = (hex: string, isDarkMode: boolean): ColorEvent => createColor(hex, isDarkMode);

const getDarkColor = (hex?: string): ColorEvent => hex ? createColor(hex, true) : createColor(randomColor(true), true);

const getLightColor = (hex?: string): ColorEvent => hex ? createColor(hex, false) : createColor(randomColor(false), false);

const convertRGBToHex = (red: number, green: number, blue: number): string =>
  '#' + getRGBColor(red) + getRGBColor(green) + getRGBColor(blue);
const convertHexToRGB = (h: string): { red: number; green: number; blue: number } => {
  let r = '0';
  let g = '0';
  let b = '0';

  if (h.length === 4) {
    r = '0x' + h[1] + h[1];
    g = '0x' + h[2] + h[2];
    b = '0x' + h[3] + h[3];
  } else if (h.length === 7) {
    r = '0x' + h[1] + h[2];
    g = '0x' + h[3] + h[4];
    b = '0x' + h[5] + h[6];
  }

  return { red: +r, green: +g, blue: +b };
};

const getRGBColor = (value: number): string => `0${ value.toString(16) }`.slice(-2);

export const randomColor = (dark: boolean): string => {
  const factor = dark ? 1.5 : 0.5;
  const red = Math.floor(Math.random() * 128 * factor);
  const green = Math.floor(Math.random() * 128 * factor);
  const blue = Math.floor(Math.random() * 128 * factor);

  return convertRGBToHex(red, green, blue);
};
