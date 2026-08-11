import { getLocale } from './helper';
import { flagEs, flagGb, flagNl } from '@ng-icons/flag-icons';

export interface IFlag {
  icon: string;
  value: string;
  text: string;
  flag: string;
}

export const flags = (): IFlag[] => [
  {
    icon: 'es',
    value: 'es',
    text: 'ES',
    flag: flagEs,
  },
  {
    icon: 'gb',
    value: 'en_GB',
    text: 'EN',
    flag: flagGb,
  },
  {
    icon: 'nl',
    value: 'nl',
    text: 'NL',
    flag: flagNl,
  },
];

export const findFlag = (lang: string): IFlag => {
  const flagList = flags();
  let value = flagList.find((flag) => flag.value === lang);
  if (!value) {
    const locale = getLocale(lang).flag;
    value = flagList.find((flag) => flag.value === locale);
    if (!value) {
      value = flagList.find(
        (flag) =>
          flag.value.startsWith(navigator.language) ||
          navigator.language.startsWith(flag.value),
      );
    }
  }
  return value ? value : findFlag('en');
};
