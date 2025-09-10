import { Observable } from 'rxjs';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastActionType = 'button' | 'link' | 'none';

export interface ToastData {
  message: string;
  type: ToastType;
  duration: number;
  actionType: ToastActionType;
  action?: string;
}

export interface ToastRef {
  onAction(): Observable<void>;
  onDismiss(): Observable<void>;
}
