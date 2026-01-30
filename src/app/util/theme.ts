import { OverlayContainer } from '@angular/cdk/overlay';
import { CookieService } from 'ngx-cookie-service';
import { ChartOptions } from 'chart.js';
import { ThemeService } from 'ng2-charts';

export type Theme = 'light-theme' | 'dark-theme';

const dark = 'dark-theme';
const light = 'light-theme';

interface IState {
  name: string;
  color: string;
  order: number;
}

export const findStateColor = (state: string, isDark: boolean = false): string => {
  const value = eventState(isDark).find(color => color.name === state);
  return value ? value.color : findStateColor('DEFAULT', isDark);
};

export const THEME = 'theme';

export const isDarkMode = (theme: Theme | undefined): boolean => theme === dark;

export const getThemeName = (isDark: boolean): Theme => isDark ? dark : light;

export const resetTheme = (
  overlayContainer: OverlayContainer,
  cookieService: CookieService,
  themeService: ThemeService,
  theme?: Theme,
  cssClass?: string,
): string => {
  const body = document.getElementsByTagName('body')[0];

  if (cssClass) {
    body.classList.remove(cssClass);
    overlayContainer.getContainerElement().classList.remove(cssClass);
  }

  cssClass = getTheme(theme ? theme : cookieService.get(THEME));
  body.classList.add(cssClass);
  overlayContainer.getContainerElement().classList.add(cssClass);

  selectedTheme(theme, themeService);
  cookieService.set(THEME, cssClass);

  return cssClass;
};

const getTheme = (theme: string | undefined): Theme => theme === dark ? dark : light;

export const getStateOrder = (state?: string): number => eventState().find(color => color.name === state)?.order || 100;

export const eventState = (isDark: boolean = false): IState[] => [{
  name: 'BIRTHDAY',
  // color: isDark ? '#eb70a5' : '#ffb6c1',
  color: isDark ? '#eb70a5' : '#ffb6c1',
  order: 1,
}, {
  name: 'NOTE',
  color: isDark ? '#e7d255' : '#eedf72',
  order: 2,
}, {
  name: 'TRANSACTION',
  color: isDark ? '#fe8d02' : '#ffa53e',
  order: 3,
}, {
  name: 'CREATED',
  color: isDark ? '#708090' : '#c0c0c0',
  order: 4,
}, {
  name: 'EDITING',
  color: isDark ? '#ffd38c' : '#ffdca6', // primary-A-dark
  order: 5,
}, {
  name: 'APPROVED',
  color: isDark ? '#8d8270' : '#b5ac9e', // primary
  order: 6,
}, {
  name: 'PARTIALLY_PAID',
  color: isDark ? '#04589a' : '#87ceeb',
  order: 7,
}, {
  name: 'PAID',
  color: isDark ? '#04589a' : '#87ceeb',
  order: 8,
}, {
  name: 'STARTED',
  color: isDark ? '#673ab7' : '#e6b9ff',
  order: 9,
}, {
  name: 'PARTIALLY_COMPLETED',
  color: '#b5ac9e',
  order: 10,
}, {
  name: 'COMPLETED',
  color: isDark ? '#44a244' : '#90ee90',
  order: 11,
}, {
  name: 'DEFAULT',
  color: isDark ? '#f08080' : '#d28d8c', // warn-dark-lighter
  order: 100,
}];

const selectedTheme = (value: Theme | undefined, themeService: ThemeService): void => {
  let overrides: ChartOptions;
  if (isDarkMode(value)) {
    overrides = {
      plugins: {
        title: {
          color: 'white',
        },
        legend: {
          labels: {
            color: 'white',
          },
        },
      },
    };
  } else {
    overrides = {
      scales: undefined,
    };
  }
  themeService.setColorschemesOptions(overrides);
};
