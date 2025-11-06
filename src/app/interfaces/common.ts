import { SortDirection } from '@angular/material/sort';
import { Observable, of } from 'rxjs';
import { ToastType } from '../shared/toast/toast.model';
import { PAGE_SIZE } from './pagination';

export interface IApiResponse {
  id: string;
  name?: string;
  paymentLink?: string;
  timestamp?: number;
  timeZone?: string;
}

export interface IError {
  message?: string;
  subErrors?: IError[];
}

export class ResponseSuccess implements IResponseSuccess {
  message: string;
  path?: string;
  reload: boolean;
  toastType: ToastType;

  constructor(message: string, path?: string, reload: boolean = false, toastType: ToastType = 'success') {
    this.message = message;
    this.path = path;
    this.reload = reload;
    this.toastType = toastType;
  }
}

export interface IResponseSuccess {
  message: string;
  path?: string;
}

export class PageRequest {
  page: number;
  sort: string;
  direction: SortDirection;
  size: number;

  constructor(page: number, sort: string, direction: SortDirection, size: number = PAGE_SIZE) {
    this.page = page;
    this.sort = sort;
    this.direction = direction;
    this.size = size;
  }
}

export const success = <T extends (...args: any[]) => any>(
  actionCreator: T,
  message: string,
  path?: string,
  reload: boolean = false,
  toastType: ToastType = 'success',
  ...additionalActions: any[]
): Observable<ReturnType<T>> => {
  const mainAction = actionCreator({ message, path, reload, toastType });
  return of(mainAction, ...additionalActions);
};
