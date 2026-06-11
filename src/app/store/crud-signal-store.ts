import { HttpErrorResponse } from '@angular/common/http';
import { patchState, withMethods, withState } from '@ngrx/signals';
import { Observable, type Subscription } from 'rxjs';
import { IError, IResponseSuccess, PageRequest } from '../interfaces/common';
import { Pagination } from '../interfaces/pagination';

export type StoreState<TData = never, TSelected = never> = {
  response: IResponseSuccess | undefined;
  data: TData | undefined;
  error: IError | undefined;
  subErrors: IError[] | undefined;
  selected: TSelected | undefined;
  isLoading: boolean;
};

export const createStoreInitialState = <TData, TSelected>(): StoreState<TData, TSelected> => ({
  response: undefined,
  data: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  isLoading: false,
});

export type CrudStoreState<TEntity, TData = Pagination<TEntity>, TSelected = TEntity> = StoreState<TData, TSelected>;

export const createCrudInitialState = <TEntity, TData = Pagination<TEntity>, TSelected = TEntity>():
CrudStoreState<TEntity, TData, TSelected> => createStoreInitialState<TData, TSelected>();

export const mapCrudHttpError = (err: HttpErrorResponse): IError => ({
  ...err.error,
  status: err.error?.status || (err.status === 404
    ? 'NOT_FOUND'
    : err.status === 0 || err.status >= 500
      ? 'SERVER_ERROR'
      : undefined),
  message: err.status === 0 || err.status >= 500 ? 'COMMON.ERROR.TRY_LATER' : err.error?.message,
});

export const withCrudStoreState = <TEntity, TData = Pagination<TEntity>, TSelected = TEntity>() =>
  withState(createCrudInitialState<TEntity, TData, TSelected>());

type CrudStoreConfig<TEntity, TCreateResponse, TUpdateResponse, TDeleteArgs> = {
  create?: (entity: TEntity) => Observable<TCreateResponse>;
  createResponse?: (response: TCreateResponse, entity: TEntity) => IResponseSuccess;
  delete?: (args: TDeleteArgs) => Observable<unknown>;
  deleteResponse?: (args: TDeleteArgs) => IResponseSuccess;
  loadById?: (id: string) => Observable<TEntity | undefined>;
  loadPage?: (request: PageRequest) => Observable<Pagination<TEntity>>;
  update?: (id: string, entity: TEntity) => Observable<TUpdateResponse>;
  updateResponse?: (response: TUpdateResponse, id: string, entity: TEntity) => IResponseSuccess;
  sort?: (items: unknown) => Observable<unknown>;
  sortResponse?: (items: unknown) => IResponseSuccess;
};

export const withCrudStoreMethods =
  <TEntity, TCreateResponse, TUpdateResponse, TDeleteArgs>(
    configFactory: () => CrudStoreConfig<TEntity, TCreateResponse, TUpdateResponse, TDeleteArgs>,
  ) => withMethods(
    (store) => {
      const config = configFactory();
      let loadPageSubscription: Subscription | undefined;
      let loadByIdSubscription: Subscription | undefined;
      let createSubscription: Subscription | undefined;
      let updateSubscription: Subscription | undefined;
      let deleteSubscription: Subscription | undefined;
      let sortSubscription: Subscription | undefined;

      const cancelAllRequests = (): void => {
        loadPageSubscription?.unsubscribe();
        loadByIdSubscription?.unsubscribe();
        createSubscription?.unsubscribe();
        updateSubscription?.unsubscribe();
        deleteSubscription?.unsubscribe();
        sortSubscription?.unsubscribe();
      };

      const patchError = (err: HttpErrorResponse): void => {
        const error = mapCrudHttpError(err);
        patchState(store, {
          error,
          subErrors: error.subErrors,
          response: undefined,
          isLoading: false,
        });
      };

      return {
        clean(): void {
          cancelAllRequests();
          patchState(store, createCrudInitialState<TEntity>());
        },

        clearResponse(): void {
          patchState(store, { response: undefined });
        },

        clearError(): void {
          patchState(store, { error: undefined, subErrors: undefined });
        },

        loadPage(request: PageRequest): void {
          if (!config.loadPage) {
            return;
          }

          loadPageSubscription?.unsubscribe();

          patchState(store, {
            data: undefined,
            subErrors: undefined,
            selected: undefined,
            response: undefined,
            error: undefined,
            isLoading: true,
          });

          loadPageSubscription = config.loadPage(request).subscribe({
            next: (data) => {
              patchState(store, {
                data,
                error: undefined,
                subErrors: undefined,
                response: undefined,
                isLoading: false,
              });
            },
            error: patchError,
          });
        },

        loadById(id: string): void {
          if (!config.loadById) {
            return;
          }

          loadByIdSubscription?.unsubscribe();

          patchState(store, {
            subErrors: undefined,
            selected: undefined,
            response: undefined,
            isLoading: true,
          });

          loadByIdSubscription = config.loadById(id).subscribe({
            next: (selected) => {
              patchState(store, { selected, isLoading: false });
            },
            error: patchError,
          });
        },

        create(entity: TEntity): void {
          if (!config.create || !config.createResponse) {
            return;
          }
          const create = config.create;
          const createResponse = config.createResponse;
          createSubscription?.unsubscribe();

          patchState(store, {
            subErrors: undefined,
            response: undefined,
            isLoading: true,
            selected: undefined,
          });

          createSubscription = create(entity).subscribe({
            next: (response) => {
              patchState(store, {
                response: createResponse(response, entity),
                selected: undefined,
                subErrors: undefined,
                isLoading: false,
              });
            },
            error: patchError,
          });
        },

        update(id: string, entity: TEntity): void {
          if (!config.update || !config.updateResponse) {
            return;
          }
          const update = config.update;
          const updateResponse = config.updateResponse;
          updateSubscription?.unsubscribe();

          patchState(store, {
            subErrors: undefined,
            response: undefined,
            isLoading: true,
            selected: undefined,
          });

          updateSubscription = update(id, entity).subscribe({
            next: (response) => {
              patchState(store, {
                response: updateResponse(response, id, entity),
                selected: undefined,
                subErrors: undefined,
                isLoading: false,
              });
            },
            error: patchError,
          });
        },

        delete(args: TDeleteArgs): void {
          if (!config.delete || !config.deleteResponse) {
            return;
          }
          const remove = config.delete;
          const deleteResponse = config.deleteResponse;
          deleteSubscription?.unsubscribe();

          patchState(store, {
            subErrors: undefined,
            response: undefined,
            isLoading: true,
            selected: undefined,
          });

          deleteSubscription = remove(args).subscribe({
            next: () => {
              patchState(store, {
                response: deleteResponse(args),
                selected: undefined,
                subErrors: undefined,
                isLoading: false,
              });
            },
            error: patchError,
          });
        },

        sort(items: unknown): void {
          if (!config.sort || !config.sortResponse) {
            return;
          }
          const sort = config.sort;
          const sortResponse = config.sortResponse;
          sortSubscription?.unsubscribe();

          patchState(store, {
            subErrors: undefined,
            response: undefined,
            isLoading: true,
            selected: undefined,
          });

          sortSubscription = sort(items).subscribe({
            next: () => {
              patchState(store, {
                response: sortResponse(items),
                subErrors: undefined,
                isLoading: false,
              });
            },
            error: patchError,
          });
        },
      };
    });
