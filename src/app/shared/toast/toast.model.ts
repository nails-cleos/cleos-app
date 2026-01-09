import { Observable } from 'rxjs';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastActionType = 'button' | 'link' | 'none' | 'file';

export type ToastOptions =
  | { actionType: 'none'; action?: never }
  | { actionType: 'button'; action?: string }
  | { actionType: 'link'; action: string }
  | { actionType: 'file'; action: Blob };

export interface ToastData {
  message: string;
  type: ToastType;
  duration: number;
  actionType: ToastActionType;
  action?: string | Blob;
}

export interface ToastRef {
  onAction(): Observable<void>;

  onDismiss(): Observable<void>;
}
