export interface ICurrency {
  id?: string;
  name?: string;
  code?: string;
  icon?: string;
  deleted?: boolean;
}

export interface ICurrencyAll {
  id: string;
  name: string;
  code: string;
  icon: string;
}

export class Currency implements ICurrency {
  constructor() {
  }
}
