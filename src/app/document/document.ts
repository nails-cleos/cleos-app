export interface IDocument {
  id: string;
  name: string;
  date: Date;
  type: DocumentTypeEnum
}

export enum DocumentTypeEnum {
  expense = 'expense',
  invoice = 'invoice',
  statement = 'statement',
}
