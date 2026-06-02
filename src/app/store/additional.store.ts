import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { IAdditional, IAdditionalAll } from '../interfaces/additional';
import { IApiResponse, IError, IResponseSuccess, PageRequest } from '../interfaces/common';
import { Pagination } from '../interfaces/pagination';
import { ITreatmentGroupAll } from '../interfaces/treatment';
import { AdditionalService } from '../services/additional.service';
import { TreatmentService } from '../services/treatment.service';
import { ISorted } from '../util/drag-drop-sorting/drag-drop-sorting.component';
import { mapCrudHttpError } from './crud-signal-store';

export type AdditionalData =
  | { kind: 'pagination'; value?: Pagination<IAdditionalAll> }
  | { kind: 'list'; value?: IAdditionalAll[] };

type AdditionalStoreState = {
  response: IResponseSuccess | undefined;
  data: AdditionalData | undefined;
  groups: ITreatmentGroupAll[] | undefined;
  error: IError | undefined;
  subErrors: IError[] | undefined;
  selected: IAdditional | undefined;
  isLoading: boolean;
};

const initialState: AdditionalStoreState = {
  response: undefined,
  data: undefined,
  groups: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  isLoading: false,
};

export const AdditionalStore = signalStore(
  withState(initialState),
  withMethods((store, additionalService = inject(AdditionalService), treatmentService = inject(TreatmentService),
    translate = inject(TranslateService)) => {
    const patchError = (err: any): void => {
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
        patchState(store, initialState);
      },

      clearResponse(): void {
        patchState(store, { response: undefined });
      },

      clearError(): void {
        patchState(store, { error: undefined, subErrors: undefined });
      },

      loadPage({ sort, direction, page, size }: PageRequest): void {
        patchState(store, {
          data: {
            kind: 'pagination',
            value: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IAdditionalAll>,
          },
          subErrors: undefined,
          selected: undefined,
          response: undefined,
        });

        additionalService.getAdditionalPage(sort, direction, page, size).subscribe({
          next: (value) => patchState(store, {
            data: { kind: 'pagination', value },
            subErrors: undefined,
            response: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },

      loadList(): void {
        patchState(store, {
          data: { kind: 'list', value: [] },
          subErrors: undefined,
          response: undefined,
        });

        additionalService.getAdditionalList().subscribe({
          next: (value) => patchState(store, {
            data: { kind: 'list', value },
            subErrors: undefined,
            response: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },

      loadById(id: string): void {
        patchState(store, {
          selected: {} as IAdditional,
          subErrors: undefined,
          response: undefined,
        });

        additionalService.getAdditional(id).subscribe({
          next: (selected) => patchState(store, { selected }),
          error: patchError,
        });
      },

      loadGroups(): void {
        patchState(store, {
          groups: undefined,
          subErrors: undefined,
          response: undefined,
        });

        treatmentService.getAllTreatmentsGroup().subscribe({
          next: (groups) => patchState(store, {
            groups,
            subErrors: undefined,
            response: undefined,
          }),
          error: patchError,
        });
      },

      create(additional: IAdditional): void {
        patchState(store, {
          subErrors: undefined,
          response: undefined,
          isLoading: true,
          selected: undefined,
          data: undefined,
        });

        additionalService.createAdditional(additional).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: {
              message: translate.instant('ADDITIONAL.CREATED', { name: response.name }),
              path: `additional/${ response.id }`,
              redirect: 'additional',
            },
            selected: undefined,
            subErrors: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },

      update(id: string, additional: IAdditional): void {
        patchState(store, {
          subErrors: undefined,
          response: undefined,
          isLoading: true,
          selected: undefined,
          data: undefined,
        });

        additionalService.updateAdditional(id, additional).subscribe({
          next: (response: IAdditional) => patchState(store, {
            response: {
              message: translate.instant('ADDITIONAL.UPDATED.MESSAGE', { name: response.name }),
              path: `additional/${ response.id }`,
              redirect: 'additional',
            },
            selected: undefined,
            subErrors: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },

      sort(additionalList: ISorted[]): void {
        patchState(store, {
          subErrors: undefined,
          response: undefined,
          isLoading: true,
          data: undefined,
        });

        additionalService.sortAdditional(additionalList).subscribe({
          next: () => patchState(store, {
            response: { message: 'ADDITIONAL.SORTED.MESSAGE' },
            subErrors: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },

      delete(id: string, name: string): void {
        patchState(store, {
          subErrors: undefined,
          response: undefined,
          isLoading: true,
          data: undefined,
        });

        additionalService.deleteAdditional(id).subscribe({
          next: () => patchState(store, {
            response: {
              message: translate.instant('ADDITIONAL.DELETED.MESSAGE', { name }),
              reload: true,
              toastType: 'warning',
            },
            subErrors: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },
    };
  }),
);
