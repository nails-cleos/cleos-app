import { IOfficeAll } from '../office/office';

export interface IDocument {
  id: string;
  name: string;
  date: Date;
  type: DocumentTypeEnum;
  office?: IOfficeAll;
}

export enum DocumentTypeEnum {
  expense = 'EXPENSE',
  invoice = 'INVOICE',
  statement = 'STATEMENT',
}
