import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { IApiResponse, IResponseSuccess, PageRequest } from '../interfaces/common';
import { IColorAll } from '../color/color';
import { Pagination } from '../interfaces/pagination';
import { ITreatmentAll, ITreatmentGroup, ITreatmentGroupAll } from '../treatment/treatment';
import { ColorService } from '../services/color.service';
import { TreatmentService } from '../services/treatment.service';
import { ISorted } from '../util/drag-drop-sorting/drag-drop-sorting.component';
import { createStoreInitialState, mapCrudHttpError, StoreState } from './crud-signal-store';

export type TreatmentData =
  | { kind: 'pagination'; value: Pagination<ITreatmentGroupAll> }
  | { kind: 'list'; value: ITreatmentGroupAll[] };

type TreatmentStoreState = StoreState<TreatmentData, ITreatmentGroupAll> & {
  history: ITreatmentAll[] | undefined;
  colors: IColorAll[] | undefined;
};

const initialState: TreatmentStoreState = {
  ...createStoreInitialState<TreatmentData, ITreatmentGroupAll>(),
  history: undefined,
  colors: undefined,
};

export const TreatmentStore = signalStore(
  withState(initialState),
  withMethods((store, treatmentService = inject(TreatmentService), colorService = inject(ColorService),
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
          data: {
            kind: 'pagination',
            value: {
              content: [{}, {}, {}],
              totalElements: 3,
            } as Pagination<ITreatmentGroupAll>,
          },
          subErrors: undefined,
          selected: undefined,
          response: undefined,
          error: undefined,
        });

        treatmentService.getTreatmentsPage(request.page, request.sort, request.direction, request.size).subscribe({
          next: (value) => patchState(store, {
            data: { kind: 'pagination', value },
            subErrors: undefined,
            response: undefined,
            error: undefined,
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
        });

        treatmentService.getAllTreatmentsGroup().subscribe({
          next: (value) => patchState(store, {
            data: { kind: 'list', value },
            subErrors: undefined,
            response: undefined,
            error: undefined,
          }),
          error: patchError,
        });
      },

      loadColors(): void {
        patchState(store, {
          colors: undefined,
          subErrors: undefined,
          response: undefined,
          error: undefined,
        });

        colorService.getAllColors().subscribe({
          next: (colors) => patchState(store, {
            colors: colors || [],
            subErrors: undefined,
            response: undefined,
            error: undefined,
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
        });

        treatmentService.getTreatmentGroup(id).subscribe({
          next: (selected) => patchState(store, { selected }),
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
            selected: undefined,
            subErrors: undefined,
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
            selected: undefined,
            subErrors: undefined,
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
            selected: undefined,
            subErrors: undefined,
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
            selected: undefined,
            subErrors: undefined,
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
            selected: undefined,
            subErrors: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },

      loadHistory(id: string, treatmentId: string): void {
        patchState(store, {
          history: [{} as ITreatmentAll, {} as ITreatmentAll, {} as ITreatmentAll],
          subErrors: undefined,
          response: undefined,
          error: undefined,
        });

        treatmentService.getAllTreatmentsHistory(id, treatmentId).subscribe({
          next: (history) => patchState(store, {
            history,
            subErrors: undefined,
            response: undefined,
            error: undefined,
          }),
          error: patchError,
        });
      },
    };
  }),
);
