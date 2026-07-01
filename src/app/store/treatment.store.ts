import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { IApiResponse, IResponseSuccess, PageRequest } from '../interfaces/common';
import { Pagination } from '../interfaces/pagination';
import { ITreatmentAll, ITreatmentDiscountDTO, ITreatmentGroup, ITreatmentGroupAll } from '../treatment/treatment';
import { TreatmentService } from '../services/treatment.service';
import { ISorted } from '../util/drag-drop-sorting/drag-drop-sorting.component';
import {
  cleanCrudCreate,
  cleanCrudDelete,
  cleanCrudUpdate,
  createStoreInitialState,
  patchCrudError,
  StoreState,
} from './crud-signal-store';
import { HttpErrorResponse } from '@angular/common/http';
import type { Subscription } from 'rxjs';

export type TreatmentData =
  | { kind: 'pagination'; value: Pagination<ITreatmentGroupAll> }
  | { kind: 'list'; value: ITreatmentGroupAll[] };

type TreatmentStoreState = StoreState<TreatmentData, ITreatmentGroupAll> & {
  history: ITreatmentAll[] | undefined;
  treatmentDiscount: ITreatmentDiscountDTO | undefined;
};

const initialState: TreatmentStoreState = {
  ...createStoreInitialState<TreatmentData, ITreatmentGroupAll>(),
  history: undefined,
  treatmentDiscount: undefined,
};

export const TreatmentStore = signalStore(
  withState(initialState),
  withMethods((
    store,
    treatmentService = inject(TreatmentService),
    translateService = inject(TranslateService),
  ) => {
    let loadPageSubscription: Subscription | undefined;
    let loadAllGroupsSubscription: Subscription | undefined;
    let loadByIdSubscription: Subscription | undefined;
    let createSubscription: Subscription | undefined;
    let updateSubscription: Subscription | undefined;
    let sortTreatmentsSubscription: Subscription | undefined;
    let sortGroupsSubscription: Subscription | undefined;
    let deleteSubscription: Subscription | undefined;
    let loadHistorySubscription: Subscription | undefined;
    let getAllTreatmentsSubscription: Subscription | undefined;

    const cancelAll = (): void => {
      loadPageSubscription?.unsubscribe();
      loadAllGroupsSubscription?.unsubscribe();
      loadByIdSubscription?.unsubscribe();
      createSubscription?.unsubscribe();
      updateSubscription?.unsubscribe();
      sortTreatmentsSubscription?.unsubscribe();
      sortGroupsSubscription?.unsubscribe();
      deleteSubscription?.unsubscribe();
      loadHistorySubscription?.unsubscribe();
      getAllTreatmentsSubscription?.unsubscribe();
    };

    const patchError = (err: HttpErrorResponse): void => patchCrudError(store, err);

    const createSaveResponse = (message: string, response: IApiResponse): IResponseSuccess => ({
      message,
      path: `treatments/${ response.id }/view`,
      redirect: 'treatments',
    });

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

      loadPage(request: PageRequest): void {
        loadPageSubscription?.unsubscribe();
        patchState(store, { data: undefined, isLoading: true });

        loadPageSubscription = treatmentService.getTreatmentsPage(
          request.page,
          request.sort,
          request.direction,
          request.size,
        ).subscribe({
          next: (value) => patchState(store, { data: { kind: 'pagination', value }, isLoading: false }),
          error: patchError,
        });
      },

      loadAllGroups(): void {
        loadAllGroupsSubscription?.unsubscribe();
        patchState(store, { data: undefined, isLoading: true });

        loadAllGroupsSubscription = treatmentService.getAllTreatmentsGroup().subscribe({
          next: (value) => patchState(store, { data: { kind: 'list', value }, isLoading: false }),
          error: patchError,
        });
      },

      loadById(id: string): void {
        loadByIdSubscription?.unsubscribe();
        patchState(store, { selected: undefined, isLoading: true });

        loadByIdSubscription = treatmentService.getTreatmentGroup(id).subscribe({
          next: (selected) => patchState(store, { selected, isLoading: false }),
          error: patchError,
        });
      },

      create(treatmentGroup: ITreatmentGroup): void {
        createSubscription?.unsubscribe();
        cleanCrudCreate(store);

        createSubscription = treatmentService.createTreatment(treatmentGroup).subscribe({
          next: (response) => patchState(store, {
            response: createSaveResponse(
              translateService.instant('TREATMENT.CREATED', { name: response.name }),
              response,
            ),
            isLoading: false,
          }),
          error: patchError,
        });
      },

      update(id: string, treatmentGroup: ITreatmentGroup): void {
        updateSubscription?.unsubscribe();
        cleanCrudUpdate(store);

        updateSubscription = treatmentService.updateTreatmentGroup(id, treatmentGroup).subscribe({
          next: (response) => patchState(store, {
            response: createSaveResponse(
              translateService.instant('TREATMENT.UPDATED.MESSAGE', { name: response.name }),
              response,
            ),
            isLoading: false,
          }),
          error: patchError,
        });
      },

      sortTreatments(treatments: ISorted[]): void {
        sortTreatmentsSubscription?.unsubscribe();
        patchState(store, { data: undefined, response: undefined, isLoading: true });

        sortTreatmentsSubscription = treatmentService.sortTreatment(treatments).subscribe({
          next: () => patchState(store, {
            response: { message: translateService.instant('TREATMENT.SORTED.MESSAGE') },
            isLoading: false,
          }),
          error: patchError,
        });
      },

      sortGroups(groups: ISorted[]): void {
        sortGroupsSubscription?.unsubscribe();
        patchState(store, { data: undefined, response: undefined, isLoading: true });

        sortGroupsSubscription = treatmentService.sortGroupTreatment(groups).subscribe({
          next: () => patchState(store, {
            response: { message: translateService.instant('TREATMENT.SORTED.MESSAGE') },
            isLoading: false,
          }),
          error: patchError,
        });
      },

      delete(args: { id: string; name: string }): void {
        deleteSubscription?.unsubscribe();
        cleanCrudDelete(store);

        deleteSubscription = treatmentService.deleteTreatmentGroup(args.id).subscribe({
          next: () => patchState(store, {
            response: {
              message: translateService.instant('TREATMENT.DELETED.MESSAGE', { name: args.name }),
              reload: true,
              toastType: 'warning',
            },
            isLoading: false,
          }),
          error: patchError,
        });
      },

      loadHistory(id: string, treatmentId: string): void {
        loadHistorySubscription?.unsubscribe();
        patchState(store, { history: undefined, isLoading: true });

        loadHistorySubscription = treatmentService.getAllTreatmentsHistory(id, treatmentId).subscribe({
          next: (history) => patchState(store, { history, isLoading: false }),
          error: patchError,
        });
      },

      getAllTreatments(roomId: string, customerId?: string): void {
        getAllTreatmentsSubscription?.unsubscribe();
        patchState(store, { treatmentDiscount: undefined, isLoading: true });

        getAllTreatmentsSubscription = treatmentService.getAllTreatments(roomId, customerId).subscribe({
          next: (treatmentDiscount) => patchState(store, { treatmentDiscount, isLoading: false }),
          error: patchError,
        });
      },
    };
  }),
);
