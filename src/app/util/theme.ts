const dark = 'dark-theme';
const light = 'light-theme';

interface IState {
  name: string;
  color: string;
}

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

export const THEME = 'theme';

export const isDarkMode = (theme: string | undefined): boolean => theme === dark;

export const getThemeName = (isDark: boolean): string => isDark ? dark : light;

export const findStateColor = (state: string, isDark: boolean): string => {
  const value = stateColor(isDark).find(color => color.name === state);
  return value ? value.color : findStateColor('DEFAULT', isDark);
};
