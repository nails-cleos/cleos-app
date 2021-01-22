export interface IProduct {
  id?: string;
  name?: string;
  price?: number;
  deleted?: boolean;
  description?: string;
  duration: IDuration;
  durationDate?: Date;
}

export interface IDuration {
  hours?: number;
  minutes?: number;
}

export class Duration implements IDuration {
  constructor() {
  }
}

export class Product implements IProduct {
  duration: IDuration;

  constructor() {
    this.duration = new Duration();
  }
}

export const PAGE_SIZE = 10;
