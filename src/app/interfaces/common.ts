import { SortDirection } from '@angular/material/sort';
import { Observable, of } from 'rxjs';
import { ToastType } from '../shared/toast/toast.model';
import { PAGE_SIZE } from './pagination';

export interface ICommon {
  title: string;
  button: {
    icon: string;
    label: string;
    showDelete?: boolean;
  };
}

export interface IApiResponse {
  id: string;
  name?: string;
  paymentLink?: string;
  timestamp?: number;
  timeZone?: string;
}

export interface IError {
  object?: string;
  field?: string;
  rejectedValue?: any;
  message?: string;
  status?: string;
  subErrors?: IError[];
}

interface IBaseResponseMeta {
  path?: string;
  reload?: boolean;
  toastType?: ToastType;
  redirect?: string;
}

interface IResponseWithMessage extends IBaseResponseMeta {
  message: string;
  blob?: undefined;
  fileName?: undefined;
}

interface IResponseWithFile extends IBaseResponseMeta {
  blob: Blob;
  fileName: string;
  message?: undefined;
}

export type IResponseSuccess = IResponseWithMessage | IResponseWithFile;

export class PageRequest {
  page: number;
  sort: string;
  direction: SortDirection;
  size: number;

  constructor(
    page: number,
    sort: string,
    direction: SortDirection,
    size: number = PAGE_SIZE,
  ) {
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
  ...extraActions: any[]
): Observable<ReturnType<T>> =>
  successResponse(
    actionCreator,
    message,
    path,
    undefined,
    reload,
    toastType,
    ...extraActions,
  );

export const successResponse = <T extends (...args: any[]) => any>(
  actionCreator: T,
  message: string,
  path?: string,
  redirect?: string,
  reload: boolean = false,
  toastType: ToastType = 'success',
  ...additionalActions: any[]
): Observable<ReturnType<T>> => {
  const mainAction = actionCreator({
    message,
    path,
    reload,
    toastType,
    redirect,
  });
  return of(mainAction, ...additionalActions);
};

export const isString = (x: unknown): x is string => typeof x === 'string';
