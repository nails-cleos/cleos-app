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
  color: isDark ? '#ceb4ac' : '#dcc8c2'// accent-dark
}, {
  name: 'EDITING',
  color: isDark ? '#ffd078' : '#ffd991'// primary-A-dark
}, {
  name: 'PARTIALLY_COMPLETED',
  color: '#a9a397'
}, {
  name: 'COMPLETED',
  color: isDark ? '#44a244' : '#90ee90'
}, {
  name: 'PAID',
  color: isDark ? '#04589a' : '#009ee3'
}, {
  name: 'PARTIALLY_PAID',
  color: isDark ? '#04589a' : '#009ee3'
}, {
  name: 'STARTED',
  color: isDark ? '#673ab7' : '#e6b9ff'
}, {
  name: 'APPROVED',
  color: isDark ? '#8f887a' : '#a9a397' // primary-dark
}, {
  name: 'DEFAULT',
  color: isDark ? '#f08080' : '#ffb3b3' // warn-dark-lighter
}, {
  name: 'BIRTHDAY',
  color: isDark ? '#eb70a5' : '#f18dbc'
}, {
  name: 'NOTE',
  color: isDark ? '#e7d255' : '#eedf72'
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
