import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import {
  cleanCrudCreate,
  cleanCrudDelete,
  createStoreInitialState,
  patchCrudError,
  StoreState,
} from './crud-signal-store';
import type { Subscription } from 'rxjs';
import { ReservationService } from '../services/reservation.service';
import { PageRequest } from '../interfaces/common';
import {
  IAvailableDTO,
  ICustomerReservation,
  IReservation,
  IReservationAll,
  IRoomReservation,
  IUpcomingAll,
  States,
} from '../reservation/reservation';
import { Pagination } from '../interfaces/pagination';
import { HttpErrorResponse } from '@angular/common/http';
import { newDateTimestamp } from '../util/dates';
import { TranslateService } from '@ngx-translate/core';
import { NavigationService } from '../services/navigation.service';
import { IReview } from '../me/reservation/list/review';
import { Role } from '../interfaces/token';
import { ToastType } from '../shared/toast/toast.model';
import { DashboardStore } from './dashboard.store';

export type ReservationData =
  | { kind: 'pagination'; value: Pagination<IReservationAll> }
  | { kind: 'list'; value: IReservationAll[] }
  | { kind: 'customerReservation'; value: ICustomerReservation };

type ReservationState = StoreState<ReservationData, IUpcomingAll> & {
  calendar: IRoomReservation[] | undefined;
  availability: IAvailableDTO[] | undefined;
  review: IReview | undefined;
};

type ReservationPageRequest = PageRequest & {
  roomId?: string;
  all?: boolean;
  professionalId?: string;
}

type ReservationFilteredRequest = PageRequest & {
  userId?: string;
  states?: string[];
}

const initialState: ReservationState = {
  ...createStoreInitialState<ReservationData, IUpcomingAll>(),
  calendar: undefined,
  availability: undefined,
  review: undefined,
};

const ACTIONS = {
  approve: {
    event: 'approve',
    messageKey: 'APPROVE',
    state: States.approved,
  },
  start: {
    event: 'start',
    messageKey: 'START',
    state: States.started,
  },
  complete: {
    event: 'complete',
    messageKey: 'COMPLETE',
    state: States.completed,
  },
  cancel: {
    event: 'cancel',
    messageKey: 'CANCEL',
    state: States.cancelled,
  },
  customerCancel: {
    event: 'cancel/customer',
    messageKey: 'CANCEL',
    state: States.cancelled,
  },
  paymentComplete: {
    event: 'payment/complete',
    messageKey: 'COMPLETE',
    state: States.completed,
  },
} as const;

type ChangeStateParams = {
  id: string;
  event: string;
  messageKey: string;
  extras?: Record<string, unknown>;
  isDashboard?: boolean;
  state?: States;
  date?: Date;
};

export const ReservationStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((
    store,
    reservationService = inject(ReservationService),
    navigationService = inject(NavigationService),
    dashboardStore = inject(DashboardStore),
    translateService = inject(TranslateService),
  ) => {
    let loadPageSubscription: Subscription | undefined;
    let loadAllFilteredSubscription: Subscription | undefined;
    let loadUpcomingSubscription: Subscription | undefined;
    let loadAllByCustomerSubscription: Subscription | undefined;
    let loadAllByRoomSubscription: Subscription | undefined;
    let loadCalendarSubscription: Subscription | undefined;
    let loadAvailabilitySubscription: Subscription | undefined;
    let loadByIdSubscription: Subscription | undefined;
    let loadHistorySubscription: Subscription | undefined;
    let createSubscription: Subscription | undefined;
    let updateByIdSubscription: Subscription | undefined;
    let changeStateSubscription: Subscription | undefined;
    let deleteSubscription: Subscription | undefined;
    let createReviewSubscription: Subscription | undefined;
    let loadReviewSubscription: Subscription | undefined;
    let updateNoteSubscription: Subscription | undefined;
    let updateDiscountSubscription: Subscription | undefined;
    let updateTimestampSubscription: Subscription | undefined;
    let updateColorSubscription: Subscription | undefined;
    let updateCustomerSubscription: Subscription | undefined;

    const cancelAll = (): void => {
      loadPageSubscription?.unsubscribe();
      loadAllFilteredSubscription?.unsubscribe();
      loadUpcomingSubscription?.unsubscribe();
      loadAllByCustomerSubscription?.unsubscribe();
      loadAllByRoomSubscription?.unsubscribe();
      loadCalendarSubscription?.unsubscribe();
      loadAvailabilitySubscription?.unsubscribe();
      loadByIdSubscription?.unsubscribe();
      loadHistorySubscription?.unsubscribe();
      createSubscription?.unsubscribe();
      updateByIdSubscription?.unsubscribe();
      changeStateSubscription?.unsubscribe();
      deleteSubscription?.unsubscribe();
      createReviewSubscription?.unsubscribe();
      loadReviewSubscription?.unsubscribe();
      updateNoteSubscription?.unsubscribe();
      updateDiscountSubscription?.unsubscribe();
      updateTimestampSubscription?.unsubscribe();
      updateColorSubscription?.unsubscribe();
      updateCustomerSubscription?.unsubscribe();
    };

    const patchError = (err: HttpErrorResponse): void => patchCrudError(store, err);

    const navigate = (
      role: Role,
      message: string,
      id?: string,
      paymentLink?: string,
      deleted: boolean = false,
      toastType: ToastType = 'success',
    ) => {
      const path = id ? `reservation/${ id }` : undefined;
      patchState(store, { response: { message, toastType, path }, isLoading: false });
      let navigation: string[] = [];
      switch (role) {
        case Role.customer:
          if (paymentLink) {
            window.open(paymentLink, '_self');
          }
          navigation = ['me', 'reservations'];
          break;
        case Role.professional:
          navigation = deleted ? ['dashboard'] : ['reservation', id!];
          break;
        case Role.roomAdmin:
          navigation = ['dashboard', 'events'];
          break;
      }
      navigationService.navigate(navigation);
    };

    const stateSuccess = (
      id: string,
      key: string,
      isDashboard: boolean = false,
      paymentLink?: string,
      state?: States,
      date?: Date,
    ) => {
      const message = translateService.instant(key);
      const currentSelected = store.selected();
      patchState(store, {
        response: { message },
        isLoading: false,
        ...(state && currentSelected && {
          selected: {
            ...currentSelected,
            state,
          },
        }),
      });
      if (paymentLink) {
        window.open(paymentLink, '_self');
        return;
      }
      if (isDashboard) {
        if (state && [States.started, States.completed].includes(state)) {
          dashboardStore.getMyEvent(date ?? new Date());
        }
        navigationService.navigate(['dashboard', 'events']);
      } else {
        navigationService.navigate(['reservation', id]);
      }
    };

    const changeState = (
      {
        id,
        event,
        messageKey,
        extras,
        isDashboard = false,
        state,
        date,
      }: ChangeStateParams,
    ): void => {
      changeStateSubscription?.unsubscribe();
      patchState(store, { response: undefined, isLoading: true });

      changeStateSubscription = reservationService.changeState(id, event, extras).subscribe({
        next: (response) => {
          const message = `COMMON.RESERVATION.STATE.${ messageKey }`;
          stateSuccess(id, message, isDashboard, response?.paymentLink, state, date);
        },

        error: patchError,
      });
    };

    return {
      clean(): void {
        cancelAll();
        patchState(store, initialState);
      },

      clearResponse(): void {
        patchState(store, { response: undefined });
      },

      clearError(): void {
        patchState(store, { error: undefined });
      },

      loadPage({ sort, direction, page, size, roomId, all, professionalId }: ReservationPageRequest): void {
        loadPageSubscription?.unsubscribe();
        patchState(store, { data: undefined, isLoading: true });

        loadPageSubscription =
          reservationService.loadPage(page, sort, direction, size, all, roomId, professionalId).subscribe({
            next: (value) => patchState(store, { data: { kind: 'pagination', value }, isLoading: false }),
            error: patchError,
          });
      },

      loadAllFiltered({ sort, direction, page, size, userId, states }: ReservationFilteredRequest): void {
        loadAllFilteredSubscription?.unsubscribe();
        patchState(store, { data: undefined, isLoading: true });

        loadAllFilteredSubscription =
          reservationService.loadAllFiltered(page, sort, direction, size, userId, states).subscribe({
            next: (value) => patchState(store, { data: { kind: 'pagination', value }, isLoading: false }),
            error: patchError,
          });
      },

      loadUpcoming(): void {
        loadUpcomingSubscription?.unsubscribe();
        patchState(store, { data: undefined, isLoading: true });

        loadUpcomingSubscription = reservationService.loadUpcoming().subscribe({
          next: (value) => patchState(store, { data: { kind: 'customerReservation', value }, isLoading: false }),
          error: patchError,
        });
      },

      loadAllByCustomer({ sort, direction, page, size }: PageRequest): void {
        loadAllByCustomerSubscription?.unsubscribe();
        patchState(store, { data: undefined, isLoading: true });

        loadAllByCustomerSubscription =
          reservationService.loadAllByCustomer(page, sort, direction, size).subscribe({
            next: (value) => patchState(store, { data: { kind: 'customerReservation', value }, isLoading: false }),
            error: patchError,
          });
      },

      loadAllByRoom(
        days: number,
        date: Date,
        roomId: string,
        professionalId?: string,
      ): void {
        loadAllByRoomSubscription?.unsubscribe();
        patchState(store, { data: undefined, isLoading: true });

        loadAllByRoomSubscription =
          reservationService.loadAllByRoom(days, date, roomId, professionalId).subscribe({
            next: (calendar) => patchState(store, { calendar, isLoading: false }),
            error: patchError,
          });
      },

      loadCalendar(
        roomId: string,
        days: number,
        dates: Date[],
        professionalId?: string,
      ): void {
        loadCalendarSubscription?.unsubscribe();
        patchState(store, { calendar: undefined, isLoading: true });

        loadCalendarSubscription =
          reservationService.loadCalendar(roomId, days, dates, professionalId).subscribe({
            next: (calendar) => patchState(store, { calendar, isLoading: false }),
            error: patchError,
          });
      },

      loadAvailability(
        roomId: string,
        treatmentId: string,
        date: Date,
        professionalId: string,
        additionalIds?: string[],
      ): void {
        loadAvailabilitySubscription?.unsubscribe();
        patchState(store, { availability: undefined, isLoading: true });

        loadAvailabilitySubscription =
          reservationService.customerSearch(roomId, treatmentId, date, professionalId, additionalIds).subscribe({
            next: (availability) => patchState(store, { availability, isLoading: false }),
            error: patchError,
          });
      },

      loadById(id: string): void {
        loadByIdSubscription?.unsubscribe();
        patchState(store, { selected: undefined, isLoading: true });

        loadByIdSubscription =
          reservationService.getReservation(id).subscribe({
            next: (selected) => {
              patchState(store, { selected, isLoading: false });
              if (selected?.paymentLink) {
                window.open(selected.paymentLink, '_self');
                return;
              }
              navigationService.navigate();
            },
            error: patchError,
          });
      },

      loadHistory(id: string): void {
        loadHistorySubscription?.unsubscribe();
        patchState(store, { data: undefined, isLoading: true });

        loadHistorySubscription =
          reservationService.loadHistory(id).subscribe({
            next: (value) => patchState(store, { data: { kind: 'list', value }, isLoading: false }),
            error: patchError,
          });
      },

      create(reservation: IReservation, role: Role): void {
        createSubscription?.unsubscribe();
        cleanCrudCreate(store);

        createSubscription = reservationService.createReservation(reservation).subscribe({
          next: (responses) => {
            responses.forEach(response => {
              const message = translateService.instant('COMMON.RESERVATION.CREATED',
                { date: newDateTimestamp(response.timestamp, response.timeZone) });
              navigate(role, message, response.id, response.paymentLink);
            });
          },

          error: patchError,
        });
      },

      updateById(id: string, reservation: IReservation, role: Role): void {
        updateByIdSubscription?.unsubscribe();
        cleanCrudCreate(store);

        updateByIdSubscription = reservationService.updateReservationById(id, reservation).subscribe({
          next: (response) => {
            const message = translateService.instant('COMMON.RESERVATION.UPDATED.MESSAGE',
              { date: newDateTimestamp(response.timestamp, response.timeZone) });
            navigate(role, message, response.id, response.paymentLink);
          },

          error: patchError,
        });
      },

      approve(id: string, extras?: Record<string, unknown>, isDashboard: boolean = false, date?: Date): void {
        changeState({ id, extras, isDashboard, date, ...ACTIONS.approve });
      },

      start(id: string, extras?: Record<string, unknown>, isDashboard: boolean = false, date?: Date): void {
        changeState({ id, extras, isDashboard, date, ...ACTIONS.start });
      },

      complete(id: string, extras?: Record<string, unknown>, isDashboard: boolean = false, date?: Date): void {
        changeState({ id, extras, isDashboard, date, ...ACTIONS.complete });
      },

      cancel(id: string, extras?: Record<string, unknown>, isDashboard: boolean = false, date?: Date): void {
        changeState({ id, extras, isDashboard, date, ...ACTIONS.cancel });
      },

      customerCancel(id: string, extras?: Record<string, unknown>, isDashboard: boolean = false, date?: Date): void {
        changeState({ id, extras, isDashboard, date, ...ACTIONS.customerCancel });
      },

      paymentComplete(id: string, extras?: Record<string, unknown>, isDashboard: boolean = false, date?: Date): void {
        changeState({ id, extras, isDashboard, date, ...ACTIONS.paymentComplete });
      },

      delete(id: string, timestamp: string, timeZone: string): void {
        deleteSubscription?.unsubscribe();
        cleanCrudDelete(store);

        deleteSubscription = reservationService.deleteReservation(id).subscribe({
          next: () => {
            const message = translateService.instant('RESERVATION.DELETED.MESSAGE',
              { date: newDateTimestamp(timestamp, timeZone) });
            navigate(Role.professional, message, id, undefined, true, 'warning');
          },

          error: patchError,
        });
      },

      createReview(review: IReview): void {
        createReviewSubscription?.unsubscribe();
        patchState(store, { response: undefined, isLoading: true });

        createReviewSubscription =
          reservationService.createReview(review).subscribe({
            next: () => navigate(Role.customer, translateService.instant('ME.REVIEW.CREATED')),
            error: patchError,
          });
      },

      loadReview(id: string): void {
        loadReviewSubscription?.unsubscribe();
        patchState(store, { data: undefined, isLoading: true });

        loadReviewSubscription =
          reservationService.getReview(id).subscribe({
            next: (review) => patchState(store, { review, isLoading: false }),
            error: patchError,
          });
      },

      updateNote(
        id: string,
        role: Role,
        note?: string,
        customerNote?: string,
        paymentLink?: string,
        timestamp?: number,
        timeZone?: string,
      ): void {
        updateNoteSubscription?.unsubscribe();
        patchState(store, { response: undefined, isLoading: true });

        updateNoteSubscription =
          reservationService.updateReservationNote(id, note, customerNote).subscribe({
            next: (response) => {
              const message = translateService.instant('COMMON.RESERVATION.UPDATED.MESSAGE',
                { date: newDateTimestamp(timestamp, timeZone) });
              navigate(role, message, response.id, response.paymentLink || paymentLink);
              const currentSelected = store.selected();
              if (currentSelected) {
                patchState(store, {
                  selected: {
                    ...currentSelected,
                    ...(currentSelected.note !== note && {
                      note,
                    }),
                    ...(currentSelected.customerNote !== customerNote && {
                      customerNote,
                    }),
                  },
                });
              }
            },
            error: patchError,
          });
      },

      updateDiscount(id: string, discountId: string): void {
        updateDiscountSubscription?.unsubscribe();
        patchState(store, { response: undefined, isLoading: true });

        updateDiscountSubscription =
          reservationService.updateReservationDiscount(id, discountId).subscribe({
            next: (response) => {
              const message = translateService.instant('COMMON.RESERVATION.UPDATED.MESSAGE',
                { date: newDateTimestamp(response.timestamp, response.timeZone) });
              navigate(Role.professional, message, response.id, response.paymentLink);
            },
            error: patchError,
          });
      },

      updateTimestamp(id: string, start: string, role: Role = Role.professional, timeZone?: string): void {
        updateTimestampSubscription?.unsubscribe();
        patchState(store, { response: undefined, isLoading: true });

        updateTimestampSubscription =
          reservationService.updateReservationTimestamp(id, start).subscribe({
            next: (response) => {
              const message = translateService.instant('COMMON.RESERVATION.UPDATED.MESSAGE',
                { date: newDateTimestamp(response.timestamp, timeZone ?? response.timeZone) });
              navigate(role, message, response.id, response.paymentLink);
            },
            error: patchError,
          });
      },

      updateColor(id: string, colorId: string): void {
        updateColorSubscription?.unsubscribe();
        patchState(store, { response: undefined, isLoading: true });

        updateColorSubscription =
          reservationService.updateReservationColor(id, colorId).subscribe({
            next: (response) => stateSuccess(response.id, 'RESERVATION.STATE.CHANGE_COLOR'),
            error: patchError,
          });
      },

      updateCustomer(id: string, colorId: string): void {
        updateCustomerSubscription?.unsubscribe();
        patchState(store, { response: undefined, isLoading: true });

        updateCustomerSubscription =
          reservationService.updateReservationCustomer(id, colorId).subscribe({
            next: (response) => stateSuccess(response.id, 'RESERVATION.STATE.CHANGE_CUSTOMER'),
            error: patchError,
          });
      },
    };
  }),
);
