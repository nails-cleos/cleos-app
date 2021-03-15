export interface IFlag {
  icon: string;
  value: string;
  text: string;
}

export interface IState {
  name: string;
  color: string;
}

export function Flags(): IFlag[] {
  return [{
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
}

export function FindFlag(flags: IFlag[], lang: string): IFlag {
  let value = flags.find(flag => flag.value === lang);
  if (!value) {
    const index = lang.indexOf('-');
    const locale = index === -1 ? lang : lang.substr(0, index);
    value = flags.find(flag => flag.value === locale);
    if (!value) {
      value = flags.find(flag => flag.value.startsWith(navigator.language) || navigator.language.startsWith(flag.value));
    }
  }
  return value ? value : FindFlag(flags, 'en');
}

export function StateColor(): IState[] {
  return [{
    name: 'CREATED',
    color: '#ffecb3'
  }, {
    name: 'COMPLETED',
    color: '#d1c4e9' // TODO change color
  }, {
    name: 'STARTED',
    color: '#b3e5fc'
  }, {
    name: 'APPROVED',
    color: '#dcedc8'
  }, {
    name: 'DEFAULT',
    color: '#ffcdd2'
  }];
}

export function FindStateColor(state: string): string {
  const value = StateColor().find(stateColor => stateColor.name === state);
  return value ? value.color : FindStateColor('DEFAULT');
}
