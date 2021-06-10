export interface IFlag {
  icon: string;
  value: string;
  text: string;
}

export interface IState {
  name: string;
  color: string;
}

export const flags = (): IFlag[] => [{
  icon: 'ar',
  value: 'es-AR',
  text: 'ES'
}, {
  icon: 'es',
  value: 'es',
  text: 'ES'
}, {
  icon: 'gb',
  value: 'en-GB',
  text: 'EN'
}, {
  icon: 'us',
  value: 'en',
  text: 'EN'
}];

export const findFlag = (flagList: IFlag[], lang: string): IFlag => {
  let value = flagList.find(flag => flag.value === lang);
  if (!value) {
    const index = lang.indexOf('-');
    const locale = index === -1 ? lang : lang.substr(0, index);
    value = flagList.find(flag => flag.value === locale);
    if (!value) {
      value = flagList.find(flag => flag.value.startsWith(navigator.language) || navigator.language.startsWith(flag.value));
    }
  }
  return value ? value : findFlag(flagList, 'en');
};

export const stateColor = (): IState[] => [{
  name: 'CREATED',
  color: '#fdf8f3' // accent-lighter
}, {
  name: 'COMPLETED',
  color: '#dcedc8'
}, {
  name: 'STARTED',
  color: '#b3e5fc'
}, {
  name: 'APPROVED',
  color: '#e3d3c5' // primary-lighter
}, {
  name: 'DEFAULT',
  color: '#ffb3b3' // warn-lighter
}];

export const findStateColor = (state: string): string => {
  const value = stateColor().find(color => color.name === state);
  return value ? value.color : findStateColor('DEFAULT');
};
