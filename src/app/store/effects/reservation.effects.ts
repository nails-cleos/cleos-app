import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import {
  approveReservation,
  cancelReservation,
  colorsCompleteSuccess,
  completeReservation,
  createReservation,
  createReview,
  customerCancelReservation,
  customerSearchReservation,
  customersSuccess,
  customerSuccess,
  deleteReservation,
  executeTrackingByReservationId,
  getAllAdditionalByGroupId,
  getAllFilterReservations,
  getAllGroupingByRoom,
  getAllRooms,
  getAllTreatments,
  getColorsByTreatmentId,
  getCustomerInformation,
  getCustomerReservations,
  getCustomers,
  getEditReservation,
  getPage,
  getReservation,
  getReservationHistory,
  getReview,
  getTrackingByReservationId,
  getUpcomingReservation,
  paymentCompleteReservation,
  paymentOptions,
  paymentOptionsSuccess,
  reservationAdditionalSuccess,
  reservationFailure,
  reservationFilterPageSuccess,
  reservationFindPayments,
  reservationHistorySuccess,
  reservationPageSuccess,
  reservationPaymentsSuccess,
  reservationReviewSuccess,
  reservationRoomsSuccess,
  reservationSaveSuccess,
  reservationsCustomerSuccess,
  reservationSelected,
  reservationSuccess,
  reservationTreatmentsSuccess,
  searchAvailability,
  startReservation,
  stateSuccess,
  trackingSuccess,
  updateReservationById,
  updateReservationColor,
  updateReservationCustomer,
  updateReservationDiscount,
  updateReservationNote,
  updateReservationTimestamp,
  updateTrackingByReservationId,
} from '../reservation.actions';
import { TranslateService } from '@ngx-translate/core';
import { ReservationService } from '../../services/reservation.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { TreatmentService } from '../../services/treatment.service';
import { RoomService } from '../../services/room.service';
import { TrackingService } from '../../services/tracking.service';
import { PaymentService } from '../../services/payment.service';
import { AdditionalService } from '../../services/additional.service';
import { newDateTimestamp } from '../../util/dates';
import { Role } from '../../interfaces/token';
import { ColorService } from '../../services/color.service';
import { Pagination } from '../../interfaces/pagination';
import {
  IAvailableDTO,
  ICustomerLastReservation,
  ICustomerReservation,
  IReservation,
  IReservationAll,
  IRoomReservation,
  ITracking,
  IUpcomingAll,
} from '../../interfaces/reservation';
import { IUserAll } from '../../interfaces/user';
import { ITreatmentDiscountDTO } from '../../interfaces/treatment';
import { IRoomAll } from '../../interfaces/room';
import { IAdditionalAll } from '../../interfaces/additional';
import { IPaymentAll, IPaymentOption } from '../../interfaces/payment';
import { IApiResponse } from '../../interfaces/common';
import { IReview } from '../../interfaces/review';
import { IColorAll } from '../../interfaces/color';
import { ToastType } from '../../shared/toast/toast.model';

@Injectable()
export class ReservationEffects {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly actions: Actions = inject(Actions);
  private readonly router: Router = inject(Router);
  private readonly reservationService: ReservationService = inject(ReservationService);
  private readonly userService: UserService = inject(UserService);
  private readonly treatmentService: TreatmentService = inject(TreatmentService);
  private readonly roomService: RoomService = inject(RoomService);
  private readonly additionalService: AdditionalService = inject(AdditionalService);
  private readonly trackingService: TrackingService = inject(TrackingService);
  private readonly paymentService: PaymentService = inject(PaymentService);
  private readonly colorService: ColorService = inject(ColorService);

  getAllPage$ = createEffect(() => this.actions.pipe(
    ofType(getPage),
    switchMap(({ page, sort, direction, size, all, roomId, professionalId }) =>
      this.reservationService.getPage(page, sort, direction, size, all, roomId, professionalId).pipe(
        map((page: Pagination<IReservationAll>) =>
          reservationPageSuccess(page ? { page } : { page: { content: [] } } as any)),
        catchError((err: HttpErrorResponse) => of(reservationFailure({ error: err.error }))),
      )),
  ));

  getCustomerReservations$ = createEffect(() => this.actions.pipe(
    ofType(getCustomerReservations),
    switchMap(({ page, sort, direction, size }) =>
      this.reservationService.getCustomerReservations(sort, direction, page, size).pipe(
        map((customerReservation: ICustomerReservation) => reservationsCustomerSuccess({ customerReservation })),
        catchError((err: HttpErrorResponse) => of(reservationFailure({ error: err.error }))),
      )),
  ));

  getAllFilterReservationsPage$ = createEffect(() => this.actions.pipe(
    ofType(getAllFilterReservations),
    switchMap(({ page, sort, direction, size, userId, states }) =>
      this.reservationService.getAllFilterReservations(sort, direction, page, size, userId, states).pipe(
        map((filter: Pagination<IReservationAll>) =>
          reservationFilterPageSuccess(filter ? { filter } : { filter: { content: [] } } as any)),
        catchError((err: HttpErrorResponse) => of(reservationFailure({ error: err.error }))),
      )),
  ));

  getAllGroupingByRoom$ = createEffect(() => this.actions.pipe(
    ofType(getAllGroupingByRoom),
    switchMap(({ days, date, roomId, professionalId }) =>
      this.reservationService.getAllGroupingByRoom(days, date, roomId, professionalId).pipe(
        map((response: IRoomReservation[]) => reservationSuccess(
          response ? { data: response } : { data: [] as IRoomReservation[] })),
        catchError((err: HttpErrorResponse) => of(reservationFailure({ error: err.error }))),
      )),
  ));

  search$ = createEffect(() => this.actions.pipe(
    ofType(searchAvailability),
    switchMap(({ roomId, days, dates, professionalId }) =>
      this.reservationService.searchAvailability(roomId, days, dates, professionalId).pipe(
        map((data: IRoomReservation[]) => reservationSuccess(data ? { data } : { data: [] })),
        catchError((err: HttpErrorResponse) => of(reservationFailure({ error: err.error }))),
      )),
  ));

  customerSearch$ = createEffect(() => this.actions.pipe(
    ofType(customerSearchReservation),
    switchMap(({ roomId, treatmentId, date, professionalId, additionalIds }) =>
      this.reservationService.customerSearch(roomId, treatmentId, date, professionalId, additionalIds).pipe(
        map((data: IAvailableDTO[]) => reservationSuccess(data ? { data } : { data: [] })),
        catchError((err: HttpErrorResponse) => of(reservationFailure({ error: err.error }))),
      )),
  ));

  getAllCustomers$ = createEffect(() => this.actions.pipe(
    ofType(getCustomers),
    switchMap(() => this.userService.getCustomers().pipe(
      map((customers: IUserAll[]) => customersSuccess({ customers })),
      catchError((err: HttpErrorResponse) => of(reservationFailure({ error: err.error }))),
    )),
  ));

  getCustomerInfo$ = createEffect(() => this.actions.pipe(
    ofType(getCustomerInformation),
    switchMap(({ id }) => this.userService.getCustomerInformation(id).pipe(
      map((customer: ICustomerLastReservation) => customerSuccess({ customer })),
      catchError((err: HttpErrorResponse) => of(reservationFailure({ error: err.error }))),
    )),
  ));

  getAllTreatments$ = createEffect(() => this.actions.pipe(
    ofType(getAllTreatments),
    switchMap(({ roomId, customerId }) => this.treatmentService.getAllTreatments(roomId, customerId).pipe(
      map((treatmentDiscount: ITreatmentDiscountDTO) => reservationTreatmentsSuccess({ treatmentDiscount })),
      catchError((err: HttpErrorResponse) => of(reservationFailure({ error: err.error }))),
    )),
  ));

  getAllRooms$ = createEffect(() => this.actions.pipe(
    ofType(getAllRooms),
    switchMap(({ customerId }) => this.roomService.getAllRooms(customerId).pipe(
      map((rooms: IRoomAll[]) => reservationRoomsSuccess({ rooms })),
      catchError((err: HttpErrorResponse) => of(reservationFailure({ error: err.error }))),
    )),
  ));

  getAllAdditional$ = createEffect(() => this.actions.pipe(
    ofType(getAllAdditionalByGroupId),
    switchMap(({ roomId, groupId }) => this.additionalService.getAllAdditionalByGroupId(roomId, groupId).pipe(
      map((additional: IAdditionalAll[]) => reservationAdditionalSuccess({ additional })),
      catchError((err: HttpErrorResponse) => of(reservationFailure({ error: err.error }))),
    )),
  ));

  getUpcomingReservation$ = createEffect(() => this.actions.pipe(
    ofType(getUpcomingReservation),
    switchMap(() => this.reservationService.getUpcomingReservation().pipe(
      map((customerReservation: ICustomerReservation) => reservationsCustomerSuccess({ customerReservation })),
      catchError((err: HttpErrorResponse) => of(reservationFailure({ error: err.error }))),
    )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(getReservation, getEditReservation),
    switchMap(({ id, editPath }) =>
      this.reservationService.getReservation(id, editPath).pipe(
        map((selected?: IUpcomingAll) => reservationSelected({ selected })),
        catchError((err: HttpErrorResponse) => of(reservationFailure({ error: err.error }))),
      )),
  ));

  findPayments$ = createEffect(() => this.actions.pipe(
    ofType(reservationFindPayments),
    switchMap(({ id }) =>
      this.paymentService.getPaymentByResourceId(id, 'reservation').pipe(
        map((payments: IPaymentAll[]) => reservationPaymentsSuccess(payments ? { payments } : { payments: [] })),
        catchError((err: HttpErrorResponse) => of(reservationFailure({ error: err.error }))),
      )),
  ));

  findHistory$ = createEffect(() => this.actions.pipe(
    ofType(getReservationHistory),
    switchMap(({ id }) => this.reservationService.getReservationHistory(id).pipe(
      map((history: IReservationAll[]) => reservationHistorySuccess(history ? { history } : { history: [] })),
      catchError((err: HttpErrorResponse) => of(reservationFailure({ error: err.error }))),
    )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(createReservation),
    switchMap(({ reservation, role }) => this.reservationService.createReservation(reservation).pipe(
      mergeMap((response: IReservation[]) =>
        response.map(res => this.requestSuccess('COMMON.RESERVATION.CREATED', true,
          role, res.id, newDateTimestamp(res.timestamp, res.room?.timeZone), res.paymentLink),
        )),
      catchError((err: HttpErrorResponse) => of(reservationFailure({ error: err.error }))),
    )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(deleteReservation),
    switchMap(({ id, timeZone, timestamp }) => this.reservationService.deleteReservation(id).pipe(
      map(() => this.requestSuccess('RESERVATION.DELETED.MESSAGE', true,
        Role.professional, undefined, newDateTimestamp(timestamp, timeZone), undefined, true, 'warning')),
      catchError((err: HttpErrorResponse) => of(reservationFailure({ error: err.error }))),
    )),
  ));

  edit$ = createEffect(() => this.actions.pipe(
    ofType(updateReservationById),
    switchMap(({ id, reservation, role }) => this.reservationService.updateReservationById(id, reservation).pipe(
      map((response: IApiResponse) => this.requestSuccess('COMMON.RESERVATION.UPDATED.MESSAGE', true,
        role, response.id, newDateTimestamp(response.timestamp, response.timeZone), response.paymentLink)),
      catchError((err: HttpErrorResponse) => of(reservationFailure({ error: err.error }))),
    )),
  ));

  changeState$ = createEffect(() => this.actions.pipe(
    ofType(approveReservation, startReservation, completeReservation,
      cancelReservation, customerCancelReservation, paymentCompleteReservation),
    switchMap((
      { id, event, key, extras, isDashboard, state },
    ) => this.reservationService.changeState(id, event, extras).pipe(
      map((response: IReservation | void) => stateSuccess({
        message: this.translate.instant(`COMMON.RESERVATION.STATE.${key}`),
        id,
        paymentLink: response?.paymentLink,
        isDashboard,
        state,
      })),
      catchError((err: HttpErrorResponse) => of(reservationFailure({ error: err.error }))),
    )),
  ));

  changeCustomer$ = createEffect(() => this.actions.pipe(
    ofType(updateReservationCustomer),
    switchMap(({ id, customerId }) => this.reservationService.updateReservationCustomer(id, customerId).pipe(
      map((response: IApiResponse) => stateSuccess(
        { message: this.translate.instant('RESERVATION.STATE.CHANGE_CUSTOMER'), id: response.id })),
      catchError((err: HttpErrorResponse) => of(reservationFailure({ error: err.error }))),
    )),
  ));

  changeColor$ = createEffect(() => this.actions.pipe(
    ofType(updateReservationColor),
    switchMap(({ id, colorId }) => this.reservationService.updateReservationColor(id, colorId).pipe(
      map((response: IApiResponse) => stateSuccess(
        { message: this.translate.instant('RESERVATION.STATE.CHANGE_COLOR'), id: response.id })),
      catchError((err: HttpErrorResponse) => of(reservationFailure({ error: err.error }))),
    )),
  ));

  findTracking$ = createEffect(() => this.actions.pipe(
    ofType(getTrackingByReservationId),
    switchMap(({ id }) => this.trackingService.getTrackingByReservationId(id).pipe(
      map((tracking: ITracking) => trackingSuccess({ tracking })),
      catchError((err: HttpErrorResponse) => of(reservationFailure({ error: err.error }))),
    )),
  ));

  executeTracking$ = createEffect(() => this.actions.pipe(
    ofType(executeTrackingByReservationId),
    switchMap(({ id }) => this.trackingService.executeTrackingByReservationId(id).pipe(
      map((tracking: ITracking) => trackingSuccess({ tracking })),
      catchError((err: HttpErrorResponse) => of(reservationFailure({ error: err.error }))),
    )),
  ));

  updateByReservationId$ = createEffect(() => this.actions.pipe(
    ofType(updateTrackingByReservationId),
    switchMap(({ id, started, completed }) =>
      this.trackingService.updateTrackingByReservationId(id, started, completed).pipe(
        map((tracking: ITracking) => trackingSuccess({ tracking })),
        catchError((err: HttpErrorResponse) => of(reservationFailure({ error: err.error }))),
      )),
  ));

  review$ = createEffect(() => this.actions.pipe(
    ofType(createReview),
    switchMap(({ review }) => this.reservationService.createReview(review).pipe(
      map(() => this.requestSuccess('ME.REVIEW.CREATED', true, Role.customer)),
      catchError((err: HttpErrorResponse) => of(reservationFailure({ error: err.error }))),
    )),
  ));

  findReview$ = createEffect(() => this.actions.pipe(
    ofType(getReview),
    switchMap(({ id }) => this.reservationService.getReview(id).pipe(
      map((review?: IReview) => reservationReviewSuccess({ review })),
      catchError((err: HttpErrorResponse) => of(reservationFailure({ error: err.error }))),
    )),
  ));

  getAllColorsByTreatmentId$ = createEffect(() => this.actions.pipe(
    ofType(getColorsByTreatmentId),
    switchMap(({ treatmentId }) => this.colorService.getColorsByTreatmentId(treatmentId).pipe(
      map((colors: IColorAll[]) => colorsCompleteSuccess({ colors })),
      catchError((err: HttpErrorResponse) => of(reservationFailure({ error: err.error }))),
    )),
  ));

  paymentOptions$ = createEffect(() => this.actions.pipe(
    ofType(paymentOptions),
    switchMap(() => this.paymentService.getPaymentOptions().pipe(
      map((paymentOptions?: IPaymentOption[]) => paymentOptionsSuccess({ paymentOptions })),
      catchError((err: HttpErrorResponse) => of(reservationFailure({ error: err.error }))),
    )),
  ));

  updateNote$ = createEffect(() => this.actions.pipe(
    ofType(updateReservationNote),
    switchMap(({ id, note, customerNote, role, timestamp, timeZone, paymentLink }) =>
      this.reservationService.updateReservationNote(id, note, customerNote).pipe(
        map((response: IApiResponse) => this.requestSuccess('COMMON.RESERVATION.UPDATED.MESSAGE', true, role,
          response.id, newDateTimestamp(timestamp, timeZone), response.paymentLink || paymentLink)),
        catchError((err: HttpErrorResponse) => of(reservationFailure({ error: err.error }))),
      )),
  ));

  updateDiscount$ = createEffect(() => this.actions.pipe(
    ofType(updateReservationDiscount),
    switchMap(({ id, discountId }) => this.reservationService.updateReservationDiscount(id, discountId).pipe(
      map((response: IApiResponse) => this.requestSuccess('COMMON.RESERVATION.UPDATED.MESSAGE', true, Role.professional,
        response.id, newDateTimestamp(response.timestamp, response.timeZone), response.paymentLink)),
      catchError((err: HttpErrorResponse) => of(reservationFailure({ error: err.error }))),
    )),
  ));

  updateTimestamp$ = createEffect(() => this.actions.pipe(
    ofType(updateReservationTimestamp),
    switchMap(({ id, start }) => this.reservationService.updateReservationTimestamp(id, start).pipe(
      map((response: IApiResponse) => this.requestSuccess('COMMON.RESERVATION.UPDATED.MESSAGE', false,
        Role.professional, id, newDateTimestamp(response.timestamp, response.timeZone), response.paymentLink)),
      catchError((err: HttpErrorResponse) => of(reservationFailure({ error: err.error }))),
    )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(reservationSelected),
    tap(({ selected }) => {
      if (selected?.paymentLink) {
        window.open(selected.paymentLink, '_self');
        return;
      }
      this.router.navigate([this.router.url]);
    }),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(reservationSuccess),
  ), { dispatch: false });

  dataPageSuccess$ = createEffect(() => this.actions.pipe(
    ofType(reservationPageSuccess),
  ), { dispatch: false });

  filterPageSuccess$ = createEffect(() => this.actions.pipe(
    ofType(reservationFilterPageSuccess),
  ), { dispatch: false });

  customersSuccess$ = createEffect(() => this.actions.pipe(
    ofType(customersSuccess),
  ), { dispatch: false });

  customerSuccess$ = createEffect(() => this.actions.pipe(
    ofType(customerSuccess),
  ), { dispatch: false });

  treatmentsSuccess$ = createEffect(() => this.actions.pipe(
    ofType(reservationTreatmentsSuccess),
  ), { dispatch: false });

  roomsSuccess$ = createEffect(() => this.actions.pipe(
    ofType(reservationRoomsSuccess),
  ), { dispatch: false });

  reviewSuccess$ = createEffect(() => this.actions.pipe(
    ofType(reservationReviewSuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(reservationSaveSuccess),
    tap(({ navigate, role, paymentLink, deleted, id }) => {
      if (navigate) {
        let navigation = [this.translate.getCurrentLang()];
        switch (role) {
          case Role.customer:
            if (paymentLink) {
              window.open(paymentLink, '_self');
            }
            navigation = [...navigation, 'me', 'reservations'];
            break;
          case Role.professional:
            navigation =
              deleted ? [...navigation, 'dashboard'] : [...navigation, 'reservation', id!];
            break;
          case Role.roomAdmin:
            navigation = [...navigation, 'dashboard', 'events'];
            break;
        }
        this.router.navigate(navigation);
      }
    }),
  ), { dispatch: false });

  stateSuccess$ = createEffect(() => this.actions.pipe(
    ofType(stateSuccess),
    tap(({ paymentLink, isDashboard, id }) => {
      if (paymentLink) {
        window.open(paymentLink, '_self');
        return;
      }
      if (isDashboard) {
        this.router.navigate([this.translate.getCurrentLang(), 'dashboard', 'events']);
        return;
      }
      this.router.navigate([this.translate.getCurrentLang(), 'reservation', id]);
    }),
  ), { dispatch: false });

  reservationCustomersSuccess$ = createEffect(() => this.actions.pipe(
    ofType(reservationsCustomerSuccess),
  ), { dispatch: false });

  reservationAdditionalSuccess$ = createEffect(() => this.actions.pipe(
    ofType(reservationAdditionalSuccess),
  ), { dispatch: false });

  trackingSuccess$ = createEffect(() => this.actions.pipe(
    ofType(trackingSuccess),
  ), { dispatch: false });

  paymentsSuccess$ = createEffect(() => this.actions.pipe(
    ofType(reservationPaymentsSuccess),
  ), { dispatch: false });

  private requestSuccess(
    key: string, navigate: boolean, role: Role, id?: string, date?: Date,
    paymentLink?: string, deleted?: boolean, toastType?: ToastType,
  ) {
    const message = this.translate.instant(key, { date });
    const path = id ? `reservation/${id}` : undefined;

    return reservationSaveSuccess({ message, navigate, path, role, paymentLink, deleted, id, toastType });
  }
}
