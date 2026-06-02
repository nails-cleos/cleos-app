import { HttpErrorResponse } from '@angular/common/http';
import { patchState, withMethods, withState } from '@ngrx/signals';
import { Observable } from 'rxjs';
import { IError, IResponseSuccess, PageRequest } from '../interfaces/common';
import { Pagination } from '../interfaces/pagination';

export type CrudStoreState<TEntity> = {
  response: IResponseSuccess | undefined;
  data: Pagination<TEntity> | undefined;
  error: IError | undefined;
  subErrors: IError[] | undefined;
  selected: TEntity | undefined;
  isLoading: boolean;
};

export const createCrudInitialState = <TEntity>(): CrudStoreState<TEntity> => ({
  response: undefined,
  data: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  isLoading: false,
});

export const mapCrudHttpError = (err: HttpErrorResponse): IError => ({
  ...err.error,
  status: err.error?.status || (err.status === 404
    ? 'NOT_FOUND'
    : err.status === 0 || err.status >= 500
      ? 'SERVER_ERROR'
      : undefined),
  message: err.status === 0 || err.status >= 500 ? 'COMMON.ERROR.TRY_LATER' : err.error?.message,
});

export const withCrudStoreState = <TEntity>() => withState(createCrudInitialState<TEntity>());

type CrudStoreConfig<TEntity, TCreateResponse, TUpdateResponse, TDeleteArgs> = {
  create?: (entity: TEntity) => Observable<TCreateResponse>;
  createResponse?: (response: TCreateResponse, entity: TEntity) => IResponseSuccess;
  delete?: (args: TDeleteArgs) => Observable<unknown>;
  deleteResponse?: (args: TDeleteArgs) => IResponseSuccess;
  loadById?: (id: string) => Observable<TEntity | undefined>;
  loadPage?: (request: PageRequest) => Observable<Pagination<TEntity>>;
  placeholder?: TEntity;
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

          patchState(store, {
            data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<TEntity>,
            subErrors: undefined,
            selected: undefined,
            response: undefined,
          });

          config.loadPage(request).subscribe({
            next: (data) => {
              patchState(store, {
                data,
                subErrors: undefined,
                response: undefined,
              });
            },
            error: patchError,
          });
        },

        loadById(id: string): void {
          if (!config.loadById) {
            return;
          }

          patchState(store, {
            subErrors: undefined,
            selected: config.placeholder,
            response: undefined,
          });

          config.loadById(id).subscribe({
            next: (selected) => {
              patchState(store, { selected });
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

          patchState(store, {
            subErrors: undefined,
            response: undefined,
            isLoading: true,
            selected: undefined,
          });

          create(entity).subscribe({
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

          patchState(store, {
            subErrors: undefined,
            response: undefined,
            isLoading: true,
            selected: undefined,
          });

          update(id, entity).subscribe({
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

          patchState(store, {
            subErrors: undefined,
            response: undefined,
            isLoading: true,
            selected: undefined,
          });

          remove(args).subscribe({
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

          patchState(store, {
            subErrors: undefined,
            response: undefined,
            isLoading: true,
            selected: undefined,
          });

          sort(items).subscribe({
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
