import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { IApiResponse, IResponseSuccess, PageRequest } from '../interfaces/common';
import { Pagination } from '../interfaces/pagination';
import { ITreatmentAll, ITreatmentGroup, ITreatmentGroupAll } from '../treatment/treatment';
import { TreatmentService } from '../services/treatment.service';
import { ISorted } from '../util/drag-drop-sorting/drag-drop-sorting.component';
import { createStoreInitialState, patchCrudError, StoreState } from './crud-signal-store';
import { HttpErrorResponse } from '@angular/common/http';

export type TreatmentData =
  | { kind: 'pagination'; value: Pagination<ITreatmentGroupAll> }
  | { kind: 'list'; value: ITreatmentGroupAll[] };

type TreatmentStoreState = StoreState<TreatmentData, ITreatmentGroupAll> & {
  history: ITreatmentAll[] | undefined;
};

const initialState: TreatmentStoreState = {
  ...createStoreInitialState<TreatmentData, ITreatmentGroupAll>(),
  history: undefined,
};

export const TreatmentStore = signalStore(
  withState(initialState),
  withMethods((
    store,
    treatmentService = inject(TreatmentService),
    translate = inject(TranslateService),
  ) => {
    const patchError = (err: HttpErrorResponse): void => patchCrudError(store, err);

    const patchSavingState = (): void => {
      patchState(store, {
        subErrors: undefined,
        response: undefined,
        error: undefined,
        isLoading: true,
      });
    };

    const createSaveResponse = (message: string, response: IApiResponse): IResponseSuccess => ({
      message,
      path: `treatments/${ response.id }/view`,
      redirect: 'treatments',
    });

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

      loadPage(request: PageRequest): void {
        patchState(store, {
          data: undefined,
          subErrors: undefined,
          selected: undefined,
          response: undefined,
          error: undefined,
          isLoading: true,
        });

        treatmentService.getTreatmentsPage(request.page, request.sort, request.direction, request.size).subscribe({
          next: (value) => patchState(store, {
            data: { kind: 'pagination', value },
            isLoading: false,
          }),
          error: patchError,
        });
      },

      loadAllGroups(): void {
        patchState(store, {
          data: undefined,
          subErrors: undefined,
          selected: undefined,
          response: undefined,
          error: undefined,
          isLoading: true,
        });

        treatmentService.getAllTreatmentsGroup().subscribe({
          next: (value) => patchState(store, {
            data: { kind: 'list', value },
            isLoading: false,
          }),
          error: patchError,
        });
      },

      loadById(id: string): void {
        patchState(store, {
          selected: undefined,
          history: undefined,
          subErrors: undefined,
          response: undefined,
          error: undefined,
          isLoading: true,
        });

        treatmentService.getTreatmentGroup(id).subscribe({
          next: (selected) => patchState(store, { selected, isLoading: false }),
          error: patchError,
        });
      },

      create(treatmentGroup: ITreatmentGroup): void {
        patchSavingState();

        treatmentService.createTreatment(treatmentGroup).subscribe({
          next: (response) => patchState(store, {
            response: createSaveResponse(
              translate.instant('TREATMENT.CREATED', { name: response.name }),
              response,
            ),
            isLoading: false,
          }),
          error: patchError,
        });
      },

      update(id: string, treatmentGroup: ITreatmentGroup): void {
        patchSavingState();

        treatmentService.updateTreatmentGroup(id, treatmentGroup).subscribe({
          next: (response) => patchState(store, {
            response: createSaveResponse(
              translate.instant('TREATMENT.UPDATED.MESSAGE', { name: response.name }),
              response,
            ),
            isLoading: false,
          }),
          error: patchError,
        });
      },

      sortTreatments(treatments: ISorted[]): void {
        patchSavingState();

        treatmentService.sortTreatment(treatments).subscribe({
          next: () => patchState(store, {
            response: { message: translate.instant('TREATMENT.SORTED.MESSAGE') },
            isLoading: false,
          }),
          error: patchError,
        });
      },

      sortGroups(groups: ISorted[]): void {
        patchSavingState();

        treatmentService.sortGroupTreatment(groups).subscribe({
          next: () => patchState(store, {
            response: { message: translate.instant('TREATMENT.SORTED.MESSAGE') },
            isLoading: false,
          }),
          error: patchError,
        });
      },

      delete(args: { id: string; name: string }): void {
        patchSavingState();

        treatmentService.deleteTreatmentGroup(args.id).subscribe({
          next: () => patchState(store, {
            response: {
              message: translate.instant('TREATMENT.DELETED.MESSAGE', { name: args.name }),
              reload: true,
              toastType: 'warning',
            },
            isLoading: false,
          }),
          error: patchError,
        });
      },

      loadHistory(id: string, treatmentId: string): void {
        patchState(store, {
          history: undefined,
          subErrors: undefined,
          response: undefined,
          error: undefined,
          isLoading: true,
        });

        treatmentService.getAllTreatmentsHistory(id, treatmentId).subscribe({
          next: (history) => patchState(store, {
            history,
            isLoading: false,
          }),
          error: patchError,
        });
      },
    };
  }),
);
