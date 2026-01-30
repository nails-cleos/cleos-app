import { IUser } from './user';
import { IRoom, IRoomAll } from './room';

export interface IOffice {
  id?: string;
  name?: string;
  deleted?: boolean;
  manager?: IUser;
  managerId?: string;
  rooms?: IRoom[];

  subject?: string;
  kvk?: string;
  account?: string;
  btw?: string;
  billingAddress?: string;
  driveFolder?: string;
  lastInvoiceNumber?: number;
}

export interface IOfficeAll {
  id: string;
  name: string;
  manager: IUser;
  subject?: string;
  kvk?: string;
  account?: string;
  btw?: string;
  billingAddress?: string;
  driveFolder?: string;
  lastInvoiceNumber?: number;
  rooms?: IRoomAll[];
}

export class Office implements IOffice {
  constructor() {
  }
}
