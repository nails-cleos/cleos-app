import { getLocale } from './helper';
import { flagEs, flagGb } from '@ng-icons/flag-icons';

export interface IFlag {
  icon: string;
  value: string;
  text: string;
  flag: string;
}

export const flags = (): IFlag[] => [
  // {
  //   icon: 'ar',
  //   value: 'es_AR',
  //   text: 'ES',
  //   flag: flagAr
  // },
  {
    icon: 'es',
    value: 'es',
    text: 'ES',
    flag: flagEs
  },
  {
    icon: 'gb',
    value: 'en_GB',
    text: 'EN',
    flag: flagGb
  // },
  // {
  //   icon: 'nl',
  //   value: 'nl',
  //   text: 'NL',
  //   flag: flagNl
  // },
  // {
  //   icon: 'us',
  //   value: 'en',
  //   text: 'EN',
  //   flag: flagUs
  }
];

export const findFlag = (flagList: IFlag[], lang: string): IFlag => {
  let value = flagList.find(flag => flag.value === lang);
  if (!value) {
    const locale = getLocale(lang).flag;
    value = flagList.find(flag => flag.value === locale);
    if (!value) {
      value = flagList.find(
        flag => flag.value.startsWith(navigator.language) || navigator.language.startsWith(flag.value)
      );
    }
  }
  return value ? value : findFlag(flagList, 'en');
};
