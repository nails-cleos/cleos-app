import { ICurrencyAll } from './currency';
import { IRoomAll } from './room';

export interface IExpense {
  id?: string | null;
  storeSupply?: string;
  invoice?: string;
  description?: string;
  type?: string;
  gross?: number;
  btw?: number;
  net?: number;
  date?: string;
  timestamp?: number;
  room?: IRoomAll;
  deleted?: boolean;
}

export interface IExpenseAll {
  id?: string;
  storeSupply: string;
  invoice: string;
  type: string;
  timestamp: number;
  description?: string;
  gross: number;
  btw?: number;
  room: IRoomAll;
  deleted: boolean;
}

export interface IExpenseInfo {
  roomId: string;
  roomName: string;
  currency: ICurrencyAll;
  types: any[];
}

export class Expense implements IExpense {
  constructor() {
  }
}
