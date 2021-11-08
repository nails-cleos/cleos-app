export interface IAdditional {
  id?: string;
  name?: string;
  description?: string;
  deleted?: boolean;
  price?: number;
  duration?: string;
  durationDate?: Date;
}

export interface IAdditionalAll {
  id: string;
  name: string;
  price: number;
  duration: string;
  description?: string;
}

export class Additional implements IAdditional {
  constructor() {
  }
}
