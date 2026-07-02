export interface IDialog {
  title: string;
  content: string;
  value: any;
  variant?: 'info' | 'warning';
}
