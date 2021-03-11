export interface IFlag {
  icon: string;
  value: string;
  text: string;
}

export interface IState {
  name: string;
  color: string;
}

export function Maps(): IFlag[] {
  return [{
    icon: 'ar',
    value: 'es-AR',
    text: 'ES'
  }, {
    icon: 'us',
    value: 'en',
    text: 'EN'
  }];
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
