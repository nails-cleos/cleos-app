export interface IColor {
  id?: string;
  name?: string;
  description?: string;
  deleted?: boolean;
}

export interface IColorAll {
  id: string;
  name: string;
  description?: string;
  deleted?: boolean;
}

export class Color implements IColor {
  constructor() {
  }
}
