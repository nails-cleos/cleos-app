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

// tslint:disable-next-line:no-bitwise
  let r = (num >> 16) + amt;

  if (r > 255) {
    r = 255;
  } else if (r < 0) {
    r = 0;
  }

  // tslint:disable-next-line:no-bitwise
  let b = ((num >> 8) & 0x00FF) + amt;

  if (b > 255) {
    b = 255;
  } else if (b < 0) {
    b = 0;
  }

  // tslint:disable-next-line:no-bitwise
  let g = (num & 0x0000FF) + amt;

  if (g > 255) {
    g = 255;
  } else if (g < 0) {
    g = 0;
  }

  // tslint:disable-next-line:no-bitwise
  return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16);
};

export const createColor = ({ red, green, blue }: any, isDarkMode: boolean): ColorEvent => {
  const color = convertRGBToHex(red, green, blue);
  const lightenDarken = lightenDarkenColor(color, isDarkMode ? 50 : -50);
  return new ColorEvent(lightenDarken, color);
};

export const createEventColor = (hex: string, isDarkMode: boolean): ColorEvent =>
  createColor(convertHexToRGB(hex), isDarkMode);

export const convertRGBToHex = (red: number, green: number, blue: number): string =>
  '#' + getRGBColor(red) + getRGBColor(green) + getRGBColor(blue);

const getDarkColor = (rgb?: string): ColorEvent => rgb ? createColorEvent(rgb, true) : createColor(randomColor(true), true);

const getLightColor = (rgb?: string): ColorEvent => rgb ? createColorEvent(rgb, false) : createColor(randomColor(false), false);

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

const randomColor = (dark: boolean): { red: number; green: number; blue: number } => {
  const value = dark ? 1 : 0;
  const red = Math.floor((value + Math.random()) * 256 / 2);
  const green = Math.floor((value + Math.random()) * 256 / 2);
  const blue = Math.floor((value + Math.random()) * 256 / 2);

  return { red, green, blue };
};

const createColorEvent = (color: string, isDark: boolean): ColorEvent => {
  const rgb = color.split(',');
  return createColor({ red: Number(rgb[0]), green: Number(rgb[1]), blue: Number(rgb[2]) }, isDark);
};
