export interface IFlag {
  icon: string;
  value: string;
  text: string;
}

export function Flags(): IFlag[] {
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
