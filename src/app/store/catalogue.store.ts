import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { ICatalogue, ICatalogueAll } from '../catalogue/catalogue';
import { IApiResponse } from '../interfaces/common';
import { ITreatmentGroupAll } from '../treatment/treatment';
import { CatalogueService } from '../services/catalogue.service';
import { TreatmentService } from '../services/treatment.service';
import { createStoreInitialState, patchCrudError, StoreState } from './crud-signal-store';
import { HttpErrorResponse } from '@angular/common/http';

type CatalogueStoreState = StoreState<ICatalogueAll[], ICatalogueAll> & {
  groups: ITreatmentGroupAll[] | undefined;
};

const initialState: CatalogueStoreState = {
  ...createStoreInitialState<ICatalogueAll[], ICatalogueAll>(),
  groups: undefined,
};

export const CatalogueStore = signalStore(
  withState(initialState),
  withMethods((store, catalogueService = inject(CatalogueService), treatmentService = inject(TreatmentService),
    translate = inject(TranslateService)) => {
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
        patchState(store, {
          data: undefined,
          response: undefined,
          subErrors: undefined,
          selected: undefined,
          error: undefined,
          isLoading: true,
        });

        catalogueService.getAllCatalogues().subscribe({
          next: (data) => patchState(store, {
            data: data ?? [],
            isLoading: false,
          }),
          error: patchError,
        });
      },

      loadCatalogs(): void {
        patchState(store, {
          data: undefined,
          response: undefined,
          subErrors: undefined,
          selected: undefined,
          error: undefined,
          isLoading: true,
        });

        catalogueService.getAllCatalogs().subscribe({
          next: (data) => patchState(store, {
            data: data ?? [],
            isLoading: false,
          }),
          error: patchError,
        });
      },

      loadById(id: string): void {
        patchState(store, {
          selected: undefined,
          response: undefined,
          subErrors: undefined,
          isLoading: true,
        });

        catalogueService.getCatalogue(id).subscribe({
          next: (selected) => patchState(store, { selected }),
          error: patchError,
        });
      },

      loadGroups(): void {
        patchState(store, {
          response: undefined,
          groups: undefined,
          subErrors: undefined,
        });

        treatmentService.getAllTreatmentsGroup().subscribe({
          next: (groups) => patchState(store, {
            groups,
            response: undefined,
            subErrors: undefined,
          }),
          error: patchError,
        });
      },

      create(catalogue: ICatalogue, resizedImageDataUrl: string): void {
        patchState(store, {
          response: undefined,
          subErrors: undefined,
          isLoading: true,
          selected: undefined,
        });

        catalogueService.createCatalogue(catalogue, resizedImageDataUrl).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: {
              message: translate.instant('CATALOGUE.CREATED', { name: response.name }),
              path: `catalogues/${ response.id }`,
              redirect: 'catalogues',
            },
            selected: undefined,
            subErrors: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },

      update(id: string, catalogue: ICatalogue, resizedImageDataUrl: string): void {
        patchState(store, {
          response: undefined,
          subErrors: undefined,
          isLoading: true,
          selected: undefined,
        });

        catalogueService.updateCatalogue(id, catalogue, resizedImageDataUrl).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: {
              message: translate.instant('CATALOGUE.UPDATED.MESSAGE', { name: response.name }),
              path: `catalogues/${ response.id }`,
              redirect: 'catalogues',
            },
            selected: undefined,
            subErrors: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },

      sort(catalogues: ICatalogueAll[]): void {
        patchState(store, {
          data: undefined,
          response: undefined,
          subErrors: undefined,
          error: undefined,
          isLoading: true,
        });

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
        patchState(store, {
          response: undefined,
          subErrors: undefined,
          isLoading: true,
          selected: undefined,
        });

        catalogueService.deleteCatalogue(id).subscribe({
          next: () => patchState(store, {
            response: {
              message: translate.instant('CATALOGUE.DELETED.MESSAGE', { name }),
              reload: true,
              toastType: 'warning',
            },
            selected: undefined,
            subErrors: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },
    };
  }),
);
