import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { ICatalogue, ICatalogueAll } from '../interfaces/catalogue';
import { IApiResponse, IResponseSuccess } from '../interfaces/common';
import { ITreatmentGroupAll } from '../interfaces/treatment';
import { CatalogueService } from '../services/catalogue.service';
import { TreatmentService } from '../services/treatment.service';
import { mapCrudHttpError } from './crud-signal-store';

type CatalogueStoreState = {
  response: IResponseSuccess | undefined;
  data: ICatalogueAll[] | undefined;
  groups: ITreatmentGroupAll[] | undefined;
  error: any;
  subErrors: any;
  selected: ICatalogueAll | undefined;
  isLoading: boolean;
};

const initialState: CatalogueStoreState = {
  response: undefined,
  data: undefined,
  groups: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  isLoading: false,
};

export const CatalogueStore = signalStore(
  withState(initialState),
  withMethods((store, catalogueService = inject(CatalogueService), treatmentService = inject(TreatmentService),
    translate = inject(TranslateService)) => ({
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
        data: [{} as ICatalogueAll, {} as ICatalogueAll, {} as ICatalogueAll],
        response: undefined,
        subErrors: undefined,
        selected: undefined,
      });

      catalogueService.getAllCatalogues().subscribe({
        next: (data) => patchState(store, {
          data: data ?? [],
          response: undefined,
          subErrors: undefined,
        }),
        error: (err) => {
          const error = mapCrudHttpError(err);
          patchState(store, {
            error,
            subErrors: error.subErrors,
            response: undefined,
            isLoading: false,
          });
        },
      });
    },

    loadCatalogs(): void {
      patchState(store, {
        data: [{} as ICatalogueAll, {} as ICatalogueAll, {} as ICatalogueAll],
        response: undefined,
        subErrors: undefined,
        selected: undefined,
      });

      catalogueService.getAllCatalogs().subscribe({
        next: (data) => patchState(store, {
          data: data ?? [],
          response: undefined,
          subErrors: undefined,
        }),
        error: (err) => {
          const error = mapCrudHttpError(err);
          patchState(store, {
            error,
            subErrors: error.subErrors,
            response: undefined,
            isLoading: false,
          });
        },
      });
    },

    loadById(id: string): void {
      patchState(store, {
        selected: {} as ICatalogueAll,
        response: undefined,
        subErrors: undefined,
      });

      catalogueService.getCatalogue(id).subscribe({
        next: (selected) => patchState(store, { selected }),
        error: (err) => {
          const error = mapCrudHttpError(err);
          patchState(store, {
            error,
            subErrors: error.subErrors,
            response: undefined,
            isLoading: false,
          });
        },
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
        error: (err) => {
          const error = mapCrudHttpError(err);
          patchState(store, {
            error,
            subErrors: error.subErrors,
            response: undefined,
            isLoading: false,
          });
        },
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
        error: (err) => {
          const error = mapCrudHttpError(err);
          patchState(store, {
            error,
            subErrors: error.subErrors,
            response: undefined,
            isLoading: false,
          });
        },
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
        error: (err) => {
          const error = mapCrudHttpError(err);
          patchState(store, {
            error,
            subErrors: error.subErrors,
            response: undefined,
            isLoading: false,
          });
        },
      });
    },

    updateOrder(catalogues: ICatalogueAll[]): void {
      patchState(store, {
        data: [{} as ICatalogueAll, {} as ICatalogueAll, {} as ICatalogueAll],
        response: undefined,
        subErrors: undefined,
      });

      catalogueService.updateCatalogueOrder(catalogues).subscribe({
        next: () => patchState(store, {
          response: {
            message: 'CATALOGUE.UPDATED.ALL.MESSAGE',
          },
          subErrors: undefined,
          isLoading: false,
        }),
        error: (err) => {
          const error = mapCrudHttpError(err);
          patchState(store, {
            error,
            subErrors: error.subErrors,
            response: undefined,
            isLoading: false,
          });
        },
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
        error: (err) => {
          const error = mapCrudHttpError(err);
          patchState(store, {
            error,
            subErrors: error.subErrors,
            response: undefined,
            isLoading: false,
          });
        },
      });
    },
  })),
);
