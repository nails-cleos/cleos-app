import { ICurrencyAll } from '../../../currency/currency';
import { IRoomAll } from '../../room';
import { IDocument } from '../../../document/document';
import { fieldChange } from '../../../util/validators';
import { FormArray, FormControl } from '@angular/forms';
import { API_LOCALE, createNewDateZonedTime } from '../../../util/dates';

export type ExpenseForm = {
  invoice: FormControl<string>;
  supplyStore: FormControl<string | ISupplyStore>;
  date: FormControl<Date | undefined>;
  totals: FormArray;
}

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
  expenseTotals: ITotalExpense[];
  totalNet: number;
  totalGross: number;
  deleted: boolean;
  document?: IDocument;
}

export interface IExpenseInfo {
  roomId: string;
  roomName: string;
  timeZone: string;
  currency: ICurrencyAll;
  types: any[];
  supplyStores?: ISupplyStore[];
}

export interface ISupplyStore {
  id: string;
  name: string;
}

export class Expense {
  static fromForm(
    expenseForm: ExpenseForm,
    date: Date,
    currentExpense?: IExpenseAll,
    expenseTotals?: ITotalExpense[],
  ): IExpense {
    const supplyStore = fieldChange(expenseForm.supplyStore, currentExpense?.supplyStore);
    return {
      invoice: fieldChange(expenseForm.invoice, currentExpense?.invoice),
      supplyStoreString: supplyStore?.id ? supplyStore.id : supplyStore.name,
      expenseTotals,
      date: createNewDateZonedTime(date, currentExpense?.room?.timeZone).toLocaleString(API_LOCALE),
    };
  }
}
