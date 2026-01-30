import { OverlayContainer } from '@angular/cdk/overlay';
import { CookieService } from 'ngx-cookie-service';
import { ThemeService } from 'ng2-charts';

import { eventState, findStateColor, getStateOrder, getThemeName, isDarkMode, resetTheme, THEME } from './theme';

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
      expect(isDarkMode('dark-theme')).toBeTrue();
    });

    it('should return false if theme is light-theme or undefined', () => {
      expect(isDarkMode('light-theme')).toBeFalse();
      expect(isDarkMode(undefined)).toBeFalse();
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

      expect(lightStates.find(s => s.name === 'PAID')?.color).toBe('#87ceeb');
      expect(darkStates.find(s => s.name === 'PAID')?.color).toBe('#04589a');
    });

    it('should always include DEFAULT state', () => {
      expect(eventState().some(s => s.name === 'DEFAULT')).toBeTrue();
    });
  });

  describe('resetTheme', () => {
    let overlayContainerSpy: jasmine.SpyObj<OverlayContainer>;
    let cookieServiceSpy: jasmine.SpyObj<CookieService>;
    let themeServiceSpy: jasmine.SpyObj<ThemeService>;
    let body: HTMLBodyElement;

    beforeEach(() => {
      body = document.getElementsByTagName('body')[0];

      overlayContainerSpy = jasmine.createSpyObj('OverlayContainer', ['getContainerElement']);
      overlayContainerSpy.getContainerElement.and.returnValue(document.createElement('div'));

      cookieServiceSpy = jasmine.createSpyObj('CookieService', ['get', 'set']);
      cookieServiceSpy.get.and.returnValue('light-theme');

      themeServiceSpy = jasmine.createSpyObj('ThemeService', ['setColorschemesOptions']);
    });

    it('should remove old class, add new theme class and set cookie', () => {
      body.classList.add('old-theme');

      const result = resetTheme(overlayContainerSpy, cookieServiceSpy, themeServiceSpy, 'dark-theme', 'old-theme');

      expect(body.classList.contains('old-theme')).toBeFalse();
      expect(body.classList.contains('dark-theme')).toBeTrue();
      expect(overlayContainerSpy.getContainerElement().classList.contains('dark-theme')).toBeTrue();
      expect(cookieServiceSpy.set).toHaveBeenCalledWith(THEME, 'dark-theme');
      expect(result).toBe('dark-theme');
    });

    it('should use cookie theme if no theme is provided', () => {
      cookieServiceSpy.get.and.returnValue('light-theme');
      const result = resetTheme(overlayContainerSpy, cookieServiceSpy, themeServiceSpy, undefined, undefined);

      expect(result).toBe('light-theme');
    });

    it('should call themeService.setColorschemesOptions with overrides', () => {
      resetTheme(overlayContainerSpy, cookieServiceSpy, themeServiceSpy, 'dark-theme', undefined);
      expect(themeServiceSpy.setColorschemesOptions).toHaveBeenCalledWith(jasmine.objectContaining({
        plugins: jasmine.any(Object),
      }));

      resetTheme(overlayContainerSpy, cookieServiceSpy, themeServiceSpy, 'light-theme', undefined);
      expect(themeServiceSpy.setColorschemesOptions).toHaveBeenCalledWith(jasmine.objectContaining({
        scales: undefined,
      }));
    });
  });
});
