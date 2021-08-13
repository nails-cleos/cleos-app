export interface IFlag {
  icon: string;
  value: string;
  text: string;
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
