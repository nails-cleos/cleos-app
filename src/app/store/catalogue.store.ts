import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { ICatalogue, ICatalogueAll } from '../catalogue/catalogue';
import { IApiResponse } from '../interfaces/common';
import { CatalogueService } from '../services/catalogue.service';
import {
  cleanCrudCreate,
  cleanCrudDelete,
  cleanCrudUpdate,
  createStoreInitialState,
  patchCrudError,
} from './crud-signal-store';
import { HttpErrorResponse } from '@angular/common/http';

const initialState = createStoreInitialState<ICatalogueAll[], ICatalogueAll>();

export const CatalogueStore = signalStore(
  withState(initialState),
  withMethods((
    store,
    catalogueService = inject(CatalogueService),
    translate = inject(TranslateService),
  ) => {
    const patchError = (err: HttpErrorResponse): void => patchCrudError(store, err);

    return {
      clean(): void {
        patchState(store, initialState);
      },

      clearResponse(): void {
        patchState(store, { response: undefined });
      },

      clearError(): void {
        patchState(store, { error: undefined, subErrors: undefined });
      },

      loadAllCatalogues(): void {
        patchState(store, { data: undefined, isLoading: true });

        catalogueService.getAllCatalogues().subscribe({
          next: (data) => patchState(store, { data, isLoading: false }),
          error: patchError,
        });
      },

      loadCatalogs(): void {
        patchState(store, { data: undefined, isLoading: true });

        catalogueService.getAllCatalogs().subscribe({
          next: (data) => patchState(store, { data: data, isLoading: false }),
          error: patchError,
        });
      },

      loadById(id: string): void {
        patchState(store, { selected: undefined, isLoading: true });

        catalogueService.getCatalogue(id).subscribe({
          next: (selected) => patchState(store, { selected }),
          error: patchError,
        });
      },

      create(catalogue: ICatalogue, resizedImageDataUrl: string): void {
        cleanCrudCreate(store);

        catalogueService.createCatalogue(catalogue, resizedImageDataUrl).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: {
              message: translate.instant('CATALOGUE.CREATED', { name: response.name }),
              path: `catalogues/${ response.id }`,
              redirect: 'catalogues',
            },
            isLoading: false,
          }),
          error: patchError,
        });
      },

      update(id: string, catalogue: ICatalogue, resizedImageDataUrl: string): void {
        cleanCrudUpdate(store);

        catalogueService.updateCatalogue(id, catalogue, resizedImageDataUrl).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: {
              message: translate.instant('CATALOGUE.UPDATED.MESSAGE', { name: response.name }),
              path: `catalogues/${ response.id }`,
              redirect: 'catalogues',
            },
            isLoading: false,
          }),
          error: patchError,
        });
      },

      sort(catalogues: ICatalogueAll[]): void {
        patchState(store, { data: undefined, response: undefined, isLoading: true });

        catalogueService.updateCatalogueOrder(catalogues).subscribe({
          next: () => patchState(store, {
            response: {
              message: 'CATALOGUE.UPDATED.ALL.MESSAGE',
            },
            subErrors: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },

      delete(id: string, name: string): void {
        cleanCrudDelete(store);

        catalogueService.deleteCatalogue(id).subscribe({
          next: () => patchState(store, {
            response: {
              message: translate.instant('CATALOGUE.DELETED.MESSAGE', { name }),
              reload: true,
              toastType: 'warning',
            },
            isLoading: false,
          }),
          error: patchError,
        });
      },
    };
  }),
);
