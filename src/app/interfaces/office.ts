import { IUser } from './user';
import { IRoom } from './room';

export interface IOffice {
  id?: string;
  name?: string;
  deleted?: boolean;
  manager?: IUser;
  managerId?: string;
  rooms?: IRoom[];
}

export interface IOfficeAll {
  id: string;
  name: string;
  manager: IUser;
}

export class Office implements IOffice {
  constructor() {
  }
}
