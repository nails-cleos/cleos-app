import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  eventState,
  findStateColor,
  getStateOrder,
  getThemeName,
  isDarkMode,
  resetTheme,
  THEME,
} from './theme';

describe('Theme Utils', () => {
  describe('findStateColor', () => {
    it('should return color for a known state', () => {
      const color = findStateColor('BIRTHDAY', false);
      expect(color).toBe('#ffb6c1');
    });

    it('should return dark color when isDark = true', () => {
      const color = findStateColor('BIRTHDAY', true);
      expect(color).toBe('#eb70a5');
    });

    it('should fallback to DEFAULT if state not found', () => {
      const color = findStateColor('UNKNOWN');
      expect(color).toBe('#d28d8c');
    });
  });

  describe('isDarkMode', () => {
    it('should return true if theme is dark-theme', () => {
      expect(isDarkMode('dark-theme')).toBe(true);
    });

    it('should return false if theme is light-theme or undefined', () => {
      expect(isDarkMode('light-theme')).toBe(false);
      expect(isDarkMode(undefined)).toBe(false);
    });
  });

  describe('getThemeName', () => {
    it('should return dark theme when isDark is true', () => {
      expect(getThemeName(true)).toBe('dark-theme');
    });

    it('should return light theme when isDark is false', () => {
      expect(getThemeName(false)).toBe('light-theme');
    });
  });

  describe('getStateOrder', () => {
    it('should return the correct order for a known state', () => {
      expect(getStateOrder('APPROVED')).toBe(6);
    });

    it('should return 100 if state is not found', () => {
      expect(getStateOrder('UNKNOWN')).toBe(100);
    });
  });

  describe('eventState', () => {
    it('should return different colors depending on dark mode', () => {
      const lightStates = eventState(false);
      const darkStates = eventState(true);

      expect(lightStates.find((s) => s.name === 'PAID')?.color).toBe('#87ceeb');
      expect(darkStates.find((s) => s.name === 'PAID')?.color).toBe('#04589a');
    });

    it('should always include DEFAULT state', () => {
      expect(eventState().some((s) => s.name === 'DEFAULT')).toBe(true);
    });
  });

  describe('resetTheme', () => {
    const overlayContainerElement = document.createElement('div');

    const overlayContainerSpy = {
      getContainerElement: vi.fn(() => overlayContainerElement),
    };

    const cookieServiceSpy = {
      get: vi.fn(() => 'light-theme'),
      set: vi.fn(),
    };

    const themeServiceSpy = {
      setColorschemesOptions: vi.fn(),
    };

    let body: HTMLBodyElement;

    beforeEach(() => {
      body = document.getElementsByTagName('body')[0];

      body.className = '';

      overlayContainerElement.className = '';

      overlayContainerSpy.getContainerElement.mockReturnValue(
        overlayContainerElement,
      );

      cookieServiceSpy.get.mockReturnValue('light-theme');

      vi.clearAllMocks();
    });

    it('should remove old class, add new theme class and set cookie', () => {
      body.classList.add('old-theme');

      const result = resetTheme(
        overlayContainerSpy,
        cookieServiceSpy,
        themeServiceSpy,
        'dark-theme',
        'old-theme',
      );

      expect(body.classList.contains('old-theme')).toBe(false);
      expect(body.classList.contains('dark-theme')).toBe(true);

      expect(overlayContainerElement.classList.contains('dark-theme')).toBe(
        true,
      );

      expect(cookieServiceSpy.set).toHaveBeenCalledWith(THEME, 'dark-theme');

      expect(result).toBe('dark-theme');
    });

    it('should use cookie theme if no theme is provided', () => {
      cookieServiceSpy.get.mockReturnValue('light-theme');
      const result = resetTheme(
        overlayContainerSpy,
        cookieServiceSpy,
        themeServiceSpy,
        undefined,
        undefined,
      );

      expect(result).toBe('light-theme');
    });

    it('should call themeService.setColorschemesOptions with overrides', () => {
      resetTheme(
        overlayContainerSpy,
        cookieServiceSpy,
        themeServiceSpy,
        'dark-theme',
        undefined,
      );
      expect(themeServiceSpy.setColorschemesOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          plugins: expect.any(Object),
        }),
      );

      resetTheme(
        overlayContainerSpy,
        cookieServiceSpy,
        themeServiceSpy,
        'light-theme',
        undefined,
      );
      expect(themeServiceSpy.setColorschemesOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          scales: undefined,
        }),
      );
    });
  });
});
