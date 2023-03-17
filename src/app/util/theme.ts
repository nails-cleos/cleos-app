import { OverlayContainer } from '@angular/cdk/overlay';
import { CookieService } from 'ngx-cookie-service';
import { ChartOptions } from 'chart.js';
import { ThemeService } from "ng2-charts";

export type Theme = 'light-theme' | 'dark-theme';

const dark = 'dark-theme';
const light = 'light-theme';

interface IState {
  name: string;
  color: string;
}

export const findStateColor = (state: string, isDark: boolean = false): string => {
  const value = stateColor(isDark).find(color => color.name === state);
  return value ? value.color : findStateColor('DEFAULT', isDark);
};

export const THEME = 'theme';

export const isDarkMode = (theme: Theme | undefined): boolean => theme === dark;

export const getThemeName = (isDark: boolean): Theme => isDark ? dark : light;

export const resetTheme = (theme: Theme | undefined, cssClass: string | undefined, overlayContainer: OverlayContainer,
                           cookieService: CookieService, themeService: ThemeService): string => {
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

const stateColor = (isDark: boolean): IState[] => [{
  name: 'CREATED',
  color: isDark ? '#fafafa' : '#ABABAB'// accent-lighter
}, {
  name: 'PARTIALLY_COMPLETED',
  color: '#f7e6d8'
}, {
  name: 'COMPLETED',
  color: isDark ? '#90EE90' : '#44A244'
}, {
  name: 'PAID',
  color: isDark ? 'rgb(0, 158, 227)' : 'rgba(0, 158, 227, 0.4)'
}, {
  name: 'PARTIALLY_PAID',
  color: isDark ? 'rgb(0, 158, 227)' : 'rgba(0, 158, 227, 0.4)'
}, {
  name: 'STARTED',
  color: isDark ? '#E6B9FF' : '#673ab7'
}, {
  name: 'APPROVED',
  color: isDark ? '#e3d3c5' : '#a06c3f' // primary-lighter
}, {
  name: 'DEFAULT',
  color: isDark ? '#ffb3b3' : '#f08080' // warn-lighter
}];

const selectedTheme = (value: Theme | undefined, themeService: ThemeService): void => {
  let overrides: ChartOptions;
  if (isDarkMode(value)) {
    overrides = {
      plugins: {
        title: {
          color: 'white'
        },
        legend: {
          labels: {
            color: 'white'
          }
        }
      }
    };
  } else {
    overrides = {
      scales: undefined
    };
  }
  themeService.setColorschemesOptions(overrides);
};
