import { IService } from './room';
import { ITreatmentGroupAll } from './treatment';

export interface IAdditional {
  id?: string;
  name?: string;
  description?: string;
  deleted?: boolean;
  price?: number;
  duration?: string;
  durationDate?: Date;
  groupIds?: string[];
}

export interface IAdditionalAll extends IService {
  groups?: ITreatmentGroupAll[];
}

export class Additional implements IAdditional {
  constructor() {
  }
}
