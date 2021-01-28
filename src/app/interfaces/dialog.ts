export interface IDialog {
  title: string;
  content: string;
  value: any;
}

export interface IDialogSearch {
  title: string;
  list: any[];
  label: string;
  required: string;
  invalid: string;
  value: any;
}
