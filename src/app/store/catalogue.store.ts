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
import type { Subscription } from 'rxjs';

const initialState = createStoreInitialState<ICatalogueAll[], ICatalogueAll>();

export const CatalogueStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((
    store,
    catalogueService = inject(CatalogueService),
    translateService = inject(TranslateService),
  ) => {
    let loadAllCataloguesSubscription: Subscription | undefined;
    let getAllHomeSubscription: Subscription | undefined;
    let loadCatalogsSubscription: Subscription | undefined;
    let loadByIdSubscription: Subscription | undefined;
    let createSubscription: Subscription | undefined;
    let updateSubscription: Subscription | undefined;
    let sortSubscription: Subscription | undefined;
    let deleteSubscription: Subscription | undefined;

    const cancelAll = (): void => {
      loadAllCataloguesSubscription?.unsubscribe();
      getAllHomeSubscription?.unsubscribe();
      loadCatalogsSubscription?.unsubscribe();
      loadByIdSubscription?.unsubscribe();
      createSubscription?.unsubscribe();
      updateSubscription?.unsubscribe();
      sortSubscription?.unsubscribe();
      deleteSubscription?.unsubscribe();
    };

    const patchError = (err: HttpErrorResponse): void => patchCrudError(store, err);

    return {
      clean(): void {
        cancelAll();
        patchState(store, initialState);
      },

      clearResponse(): void {
        patchState(store, { response: undefined });
      },

      clearError(): void {
        patchState(store, { error: undefined, subErrors: undefined });
      },

      loadAllCatalogues(): void {
        loadAllCataloguesSubscription?.unsubscribe();
        patchState(store, { data: undefined, isLoading: true });

        loadAllCataloguesSubscription = catalogueService.getAllCatalogues().subscribe({
          next: (data) => patchState(store, { data, isLoading: false }),
          error: patchError,
        });
      },

      getAllHome(): void {
        getAllHomeSubscription?.unsubscribe();
        patchState(store, { data: undefined, isLoading: true });

        getAllHomeSubscription = catalogueService.getAllHome().subscribe({
          next: (data) => patchState(store, { data, isLoading: false }),
          error: patchError,
        });
      },

      loadCatalogs(): void {
        loadCatalogsSubscription?.unsubscribe();
        patchState(store, { data: undefined, isLoading: true });

        loadCatalogsSubscription = catalogueService.getAllCatalogs().subscribe({
          next: (data) => patchState(store, { data, isLoading: false }),
          error: patchError,
        });
      },

      loadById(id: string): void {
        loadByIdSubscription?.unsubscribe();
        patchState(store, { selected: undefined, isLoading: true });

        loadByIdSubscription = catalogueService.getCatalogue(id).subscribe({
          next: (selected) => patchState(store, { selected }),
          error: patchError,
        });
      },

      create(catalogue: ICatalogue, resizedImageDataUrl: string): void {
        createSubscription?.unsubscribe();
        cleanCrudCreate(store);

        createSubscription = catalogueService.createCatalogue(catalogue, resizedImageDataUrl).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: {
              message: translateService.instant('CATALOGUE.CREATED', { name: response.name }),
              path: `catalogues/${ response.id }`,
              redirect: 'catalogues',
            },
            isLoading: false,
          }),
          error: patchError,
        });
      },

      update(id: string, catalogue: ICatalogue, resizedImageDataUrl: string): void {
        updateSubscription?.unsubscribe();
        cleanCrudUpdate(store);

        updateSubscription = catalogueService.updateCatalogue(id, catalogue, resizedImageDataUrl).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: {
              message: translateService.instant('CATALOGUE.UPDATED.MESSAGE', { name: response.name }),
              path: `catalogues/${ response.id }`,
              redirect: 'catalogues',
            },
            isLoading: false,
          }),
          error: patchError,
        });
      },

      sort(catalogues: ICatalogueAll[]): void {
        sortSubscription?.unsubscribe();
        patchState(store, { data: undefined, response: undefined, isLoading: true });

        sortSubscription = catalogueService.updateCatalogueOrder(catalogues).subscribe({
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
        deleteSubscription?.unsubscribe();
        cleanCrudDelete(store);

        deleteSubscription = catalogueService.deleteCatalogue(id).subscribe({
          next: () => patchState(store, {
            response: {
              message: translateService.instant('CATALOGUE.DELETED.MESSAGE', { name }),
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
