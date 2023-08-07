import { IUser, IUserAll } from './user';
import { FrequencyEnum } from '../util/helper';

export interface INote {
  id?: string;
  description?: string;
  professionalId?: string;
  professional?: IUser;
  repeat?: FrequencyEnum;
  date?: string;
  completed?: boolean;
  deleted?: boolean;
}

export interface INoteAll {
  id: string;
  description: string;
  professional: IUserAll;
  repeat: FrequencyEnum;
  date: string;
  completed: boolean;
  deleted: boolean;
}

export class Note implements INote {
  constructor() {
  }
}
