import { IService } from './room';

export interface IAdditional {
  id?: string;
  name?: string;
  description?: string;
  deleted?: boolean;
  price?: number;
  duration?: string;
  durationDate?: Date;
}

export interface IAdditionalAll extends IService {
  duration: string;
  description?: string;
}

export class Additional implements IAdditional {
  constructor() {
  }
}
