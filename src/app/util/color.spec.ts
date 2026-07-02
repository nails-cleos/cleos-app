import { getProfessionalColor, lightenDarkenColor, createEventColor } from './color';
import { ColorEvent } from '../dashboard/dashboard';

describe('Color Utils', () => {

  describe('lightenDarkenColor', () => {
    it('should lighten a color', () => {
      const result = lightenDarkenColor('#000000', 20);
      expect(result).toBe('#141414'); // #000000 + 20 for RGB each channel
    });

    it('should darken a color', () => {
      const result = lightenDarkenColor('#ffffff', -20);
      expect(result).toBe('#ebebeb'); // #ffffff - 20 for RGB each channel
    });

    it('should clamp values at 0 and 255', () => {
      expect(lightenDarkenColor('#000000', -50)).toBe('#000000');
      expect(lightenDarkenColor('#ffffff', 50)).toBe('#ffffff');
    });
  });

  describe('createEventColor', () => {
    it('should create a ColorEvent in dark mode', () => {
      const color = '#123456';
      const eventColor = createEventColor(color, true);
      expect(eventColor).toBeInstanceOf(ColorEvent);
      expect(eventColor.primary).not.toBe(color);
      expect(eventColor.secondary).toBe(color);
    });

    it('should create a ColorEvent in light mode', () => {
      const color = '#123456';
      const eventColor = createEventColor(color, false);
      expect(eventColor).toBeInstanceOf(ColorEvent);
      expect(eventColor.primary).toBe(color);
      expect(eventColor.secondary).not.toBe(color);
    });
  });

  describe('getProfessionalColor', () => {
    it('should return dark color when isDark is true', () => {
      const colorEvent = getProfessionalColor(true, '#111111', '#aaaaaa');
      expect(colorEvent).toBeInstanceOf(ColorEvent);
      expect(colorEvent.secondary).toBe('#111111');
    });

    it('should return light color when isDark is false', () => {
      const colorEvent = getProfessionalColor(false, '#111111', '#aaaaaa');
      expect(colorEvent).toBeInstanceOf(ColorEvent);
      expect(colorEvent.primary).toBe('#aaaaaa');
    });
  });

  describe('randomColor', () => {
    it('should generate a valid hex color', () => {
      const color = getProfessionalColor(false).primary; // Using your function indirectly
      expect(/^#[0-9a-f]{6}$/i.test(color)).toBeTrue();
    });
  });

});
