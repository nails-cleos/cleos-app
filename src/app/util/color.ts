import { ColorEvent } from '../interfaces/dashboard';

export const getProfessionalColor = (isDark: boolean, darkColor?: string, lightColor?: string): ColorEvent =>
  isDark ? getDarkColor(darkColor) : getLightColor(lightColor);

export const lightenDarkenColor = (color: string, amount: number): string => {
  color = color.replace(/#/g, '');

  // Parse the hexadecimal color string to a number
  const num = parseInt(color, 16);

  // Shift the red, green, and blue components by 'amount'
  let r = (num >> 16) + amount;
  let b = ((num >> 8) & 0x00FF) + amount;
  let g = (num & 0x0000FF) + amount;

  // Ensure that the values are within the valid range [0, 255]
  r = Math.min(Math.max(r, 0), 255);
  g = Math.min(Math.max(g, 0), 255);
  b = Math.min(Math.max(b, 0), 255);

  // Convert the adjusted RGB components back to a hexadecimal string
  return '#' + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
};

const createColor = (color: string, isDarkMode: boolean): ColorEvent => {
  const lightenDarken = lightenDarkenColor(color, 20);
  if (isDarkMode) {
    return new ColorEvent(lightenDarken, color);
  }
  return new ColorEvent(color, lightenDarken);
};

export const createEventColor = (hex: string, isDarkMode: boolean): ColorEvent => createColor(hex, isDarkMode);

const getDarkColor = (hex?: string): ColorEvent => hex ? createColor(hex, true) : createColor(randomColor(true), true);

const getLightColor = (hex?: string): ColorEvent => hex ? createColor(hex, false) :
  createColor(randomColor(false), false);

const convertRGBToHex = (red: number, green: number, blue: number): string =>
  '#' + getRGBColor(red) + getRGBColor(green) + getRGBColor(blue);

const getRGBColor = (value: number): string => `0${ value.toString(16) }`.slice(-2);

export const randomColor = (dark: boolean): string => {
  const factor = dark ? 1.5 : 0.5;
  const red = Math.floor(Math.random() * 128 * factor);
  const green = Math.floor(Math.random() * 128 * factor);
  const blue = Math.floor(Math.random() * 128 * factor);

  return convertRGBToHex(red, green, blue);
};
