import { ICurrencyAll } from './currency';
import { IRoomAll } from './room';

export interface IExpense {
  id?: string | null;
  supplyStore?: ISupplyStore;
  supplyStoreString?: string;
  invoice?: string;
  description?: string;
  type?: string;
  gross?: number;
  btw?: number;
  net?: number;
  date?: string;
  timestamp?: number;
  room?: IRoomAll;
  expenseTotals?: ITotalExpense[],
  deleted?: boolean;
}

export interface ITotalExpense {
  type: string;
  gross: number;
  btw?: number;
  description?: string;
}

export interface IExpenseAll {
  id?: string;
  supplyStore: string;
  invoice: string;
  type: string;
  timestamp: number;
  description?: string;
  gross: number;
  btw?: number;
  room: IRoomAll;
  expenseTotals: ITotalExpense[],
  totalNet: number,
  totalGross: number,
  deleted: boolean;
}

export interface IExpenseInfo {
  roomId: string;
  roomName: string;
  currency: ICurrencyAll;
  types: any[];
}

export interface ISupplyStore {
  id: string;
  name: string;
}

export class Expense implements IExpense {
  constructor() {
  }
}
