import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, tap } from 'rxjs/operators';
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
import { IPaymentAll } from '../../interfaces/payment';
import { IApiResponse } from '../../interfaces/common';
import { IReview } from '../../interfaces/review';
import { IColorAll } from '../../interfaces/color';
import { ToastType } from '../../shared/toast/toast.model';
import { effectRequest } from '../../util/rxjs';

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
    switchMap(({ page, sort, direction, size, all, roomId, professionalId }) => effectRequest(
      this.reservationService.getPage(page, sort, direction, size, all, roomId, professionalId),
      (page: Pagination<IReservationAll>) =>
        reservationPageSuccess(page ? { page } : { page: { content: [] } } as any),
      reservationFailure,
    )),
  ));

  getCustomerReservations$ = createEffect(() => this.actions.pipe(
    ofType(getCustomerReservations),
    switchMap(({ page, sort, direction, size }) => effectRequest(
      this.reservationService.getCustomerReservations(sort, direction, page, size),
      (customerReservation: ICustomerReservation) => reservationsCustomerSuccess({ customerReservation }),
      reservationFailure,
    )),
  ));

  getAllFilterReservationsPage$ = createEffect(() => this.actions.pipe(
    ofType(getAllFilterReservations),
    switchMap(({ page, sort, direction, size, userId, states }) => effectRequest(
      this.reservationService.getAllFilterReservations(sort, direction, page, size, userId, states),
      (filter: Pagination<IReservationAll>) =>
        reservationFilterPageSuccess(filter ? { filter } : { filter: { content: [] } } as any),
      reservationFailure,
    )),
  ));

  getAllGroupingByRoom$ = createEffect(() => this.actions.pipe(
    ofType(getAllGroupingByRoom),
    switchMap(({ days, date, roomId, professionalId }) => effectRequest(
      this.reservationService.getAllGroupingByRoom(days, date, roomId, professionalId),
      (response: IRoomReservation[]) => reservationSuccess(
        response ? { data: response } : { data: [] as IRoomReservation[] }),
      reservationFailure,
    )),
  ));

  search$ = createEffect(() => this.actions.pipe(
    ofType(searchAvailability),
    switchMap(({ roomId, days, dates, professionalId }) => effectRequest(
      this.reservationService.searchAvailability(roomId, days, dates, professionalId),
      (data: IRoomReservation[]) => reservationSuccess(data ? { data } : { data: [] }),
      reservationFailure,
    )),
  ));

  customerSearch$ = createEffect(() => this.actions.pipe(
    ofType(customerSearchReservation),
    switchMap(({ roomId, treatmentId, date, professionalId, additionalIds }) => effectRequest(
      this.reservationService.customerSearch(roomId, treatmentId, date, professionalId, additionalIds),
      (data: IAvailableDTO[]) => reservationSuccess(data ? { data } : { data: [] }),
      reservationFailure,
    )),
  ));

  getAllCustomers$ = createEffect(() => this.actions.pipe(
    ofType(getCustomers),
    switchMap(() => effectRequest(
      this.userService.getCustomers(),
      (customers: IUserAll[]) => customersSuccess({ customers }),
      reservationFailure,
    )),
  ));

  getCustomerInfo$ = createEffect(() => this.actions.pipe(
    ofType(getCustomerInformation),
    switchMap(({ id }) => effectRequest(
      this.userService.getCustomerInformation(id),
      (customer: ICustomerLastReservation) => customerSuccess({ customer }),
      reservationFailure,
    )),
  ));

  getAllTreatments$ = createEffect(() => this.actions.pipe(
    ofType(getAllTreatments),
    switchMap(({ roomId, customerId }) => effectRequest(
      this.treatmentService.getAllTreatments(roomId, customerId),
      (treatmentDiscount: ITreatmentDiscountDTO) => reservationTreatmentsSuccess({ treatmentDiscount }),
      reservationFailure,
    )),
  ));

  getAllRooms$ = createEffect(() => this.actions.pipe(
    ofType(getAllRooms),
    switchMap(({ customerId }) => effectRequest(
      this.roomService.getAllRooms(customerId),
      (rooms: IRoomAll[]) => reservationRoomsSuccess({ rooms }),
      reservationFailure,
    )),
  ));

  getAllAdditional$ = createEffect(() => this.actions.pipe(
    ofType(getAllAdditionalByGroupId),
    switchMap(({ roomId, groupId }) => effectRequest(
      this.additionalService.getAllAdditionalByGroupId(roomId, groupId),
      (additional: IAdditionalAll[]) => reservationAdditionalSuccess({ additional }),
      reservationFailure,
    )),
  ));

  getUpcomingReservation$ = createEffect(() => this.actions.pipe(
    ofType(getUpcomingReservation),
    switchMap(() => effectRequest(
      this.reservationService.getUpcomingReservation(),
      (customerReservation: ICustomerReservation) => reservationsCustomerSuccess({ customerReservation }),
      reservationFailure,
    )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(getReservation, getEditReservation),
    switchMap(({ id, editPath }) => effectRequest(
      this.reservationService.getReservation(id, editPath),
      (selected?: IUpcomingAll) => reservationSelected({ selected }),
      reservationFailure,
    )),
  ));

  findPayments$ = createEffect(() => this.actions.pipe(
    ofType(reservationFindPayments),
    switchMap(({ id }) => effectRequest(
      this.paymentService.getPaymentByResourceId(id, 'reservation'),
      (payments: IPaymentAll[]) => reservationPaymentsSuccess(payments ? { payments } : { payments: [] }),
      reservationFailure,
    )),
  ));

  findHistory$ = createEffect(() => this.actions.pipe(
    ofType(getReservationHistory),
    switchMap(({ id }) => effectRequest(
      this.reservationService.getReservationHistory(id),
      (history: IReservationAll[]) => reservationHistorySuccess(history ? { history } : { history: [] }),
      reservationFailure,
    )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(createReservation),
    switchMap(({ reservation, role }) => effectRequest(
      this.reservationService.createReservation(reservation),
      (response: IReservation[]) => response.map(res =>
        this.requestSuccess(
          'COMMON.RESERVATION.CREATED',
          true,
          role,
          res.id,
          newDateTimestamp(res.timestamp, res.room?.timeZone),
          res.paymentLink,
        )),
      reservationFailure,
    )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(deleteReservation),
    switchMap(({ id, timeZone, timestamp }) => effectRequest(
      this.reservationService.deleteReservation(id),
      () => this.requestSuccess(
        'RESERVATION.DELETED.MESSAGE',
        true,
        Role.professional,
        undefined,
        newDateTimestamp(timestamp, timeZone),
        undefined,
        true,
        'warning',
      ),
      reservationFailure,
    )),
  ));

  edit$ = createEffect(() => this.actions.pipe(
    ofType(updateReservationById),
    switchMap(({ id, reservation, role }) => effectRequest(
      this.reservationService.updateReservationById(id, reservation),
      (response: IApiResponse) => this.requestSuccess(
        'COMMON.RESERVATION.UPDATED.MESSAGE',
        true,
        role,
        response.id,
        newDateTimestamp(response.timestamp, response.timeZone),
        response.paymentLink,
      ),
      reservationFailure,
    )),
  ));

  changeState$ = createEffect(() => this.actions.pipe(
    ofType(approveReservation, startReservation, completeReservation,
      cancelReservation, customerCancelReservation, paymentCompleteReservation),
    switchMap(({ id, event, key, extras, isDashboard, state }) => effectRequest(
      this.reservationService.changeState(id, event, extras),
      (response: IReservation | void) => stateSuccess({
        message: this.translate.instant(`COMMON.RESERVATION.STATE.${ key }`),
        id,
        paymentLink: response?.paymentLink,
        isDashboard,
        state,
      }),
      reservationFailure,
    )),
  ));

  changeCustomer$ = createEffect(() => this.actions.pipe(
    ofType(updateReservationCustomer),
    switchMap(({ id, customerId }) => effectRequest(
      this.reservationService.updateReservationCustomer(id, customerId),
      (response: IApiResponse) => stateSuccess({
        message: this.translate.instant('RESERVATION.STATE.CHANGE_CUSTOMER'),
        id: response.id,
      }),
      reservationFailure,
    )),
  ));

  changeColor$ = createEffect(() => this.actions.pipe(
    ofType(updateReservationColor),
    switchMap(({ id, colorId }) => effectRequest(
      this.reservationService.updateReservationColor(id, colorId),
      (response: IApiResponse) => stateSuccess({
        message: this.translate.instant('RESERVATION.STATE.CHANGE_COLOR'),
        id: response.id,
      }),
      reservationFailure,
    )),
  ));

  findTracking$ = createEffect(() => this.actions.pipe(
    ofType(getTrackingByReservationId),
    switchMap(({ id }) => effectRequest(
      this.trackingService.getTrackingByReservationId(id),
      (tracking: ITracking) => trackingSuccess({ tracking }),
      reservationFailure,
    )),
  ));

  executeTracking$ = createEffect(() => this.actions.pipe(
    ofType(executeTrackingByReservationId),
    switchMap(({ id }) => effectRequest(
      this.trackingService.executeTrackingByReservationId(id),
      (tracking: ITracking) => trackingSuccess({ tracking }),
      reservationFailure,
    )),
  ));

  updateByReservationId$ = createEffect(() => this.actions.pipe(
    ofType(updateTrackingByReservationId),
    switchMap(({ id, started, completed }) => effectRequest(
      this.trackingService.updateTrackingByReservationId(id, started, completed),
      (tracking: ITracking) => trackingSuccess({ tracking }),
      reservationFailure,
    )),
  ));

  review$ = createEffect(() => this.actions.pipe(
    ofType(createReview),
    switchMap(({ review }) => effectRequest(
      this.reservationService.createReview(review),
      () => this.requestSuccess('ME.REVIEW.CREATED', true, Role.customer),
      reservationFailure,
    )),
  ));

  findReview$ = createEffect(() => this.actions.pipe(
    ofType(getReview),
    switchMap(({ id }) => effectRequest(
      this.reservationService.getReview(id),
      (review?: IReview) => reservationReviewSuccess({ review }),
      reservationFailure,
    )),
  ));

  getAllColorsByTreatmentId$ = createEffect(() => this.actions.pipe(
    ofType(getColorsByTreatmentId),
    switchMap(({ treatmentId }) => effectRequest(
      this.colorService.getColorsByTreatmentId(treatmentId),
      (colors: IColorAll[]) => colorsCompleteSuccess({ colors }),
      reservationFailure,
    )),
  ));

  updateNote$ = createEffect(() => this.actions.pipe(
    ofType(updateReservationNote),
    switchMap(({ id, note, customerNote, role, timestamp, timeZone, paymentLink }) => effectRequest(
      this.reservationService.updateReservationNote(id, note, customerNote),
      (response: IApiResponse) => this.requestSuccess(
        'COMMON.RESERVATION.UPDATED.MESSAGE',
        true,
        role,
        response.id,
        newDateTimestamp(timestamp, timeZone),
        response.paymentLink || paymentLink,
      ),
      reservationFailure,
    )),
  ));

  updateDiscount$ = createEffect(() => this.actions.pipe(
    ofType(updateReservationDiscount),
    switchMap(({ id, discountId }) => effectRequest(
      this.reservationService.updateReservationDiscount(id, discountId),
      (response: IApiResponse) => this.requestSuccess(
        'COMMON.RESERVATION.UPDATED.MESSAGE',
        true,
        Role.professional,
        response.id,
        newDateTimestamp(response.timestamp, response.timeZone),
        response.paymentLink,
      ),
      reservationFailure,
    )),
  ));

  updateTimestamp$ = createEffect(() => this.actions.pipe(
    ofType(updateReservationTimestamp),
    switchMap(({ id, start }) => effectRequest(
      this.reservationService.updateReservationTimestamp(id, start),
      (response: IApiResponse) => this.requestSuccess(
        'COMMON.RESERVATION.UPDATED.MESSAGE',
        false,
        Role.professional,
        id,
        newDateTimestamp(response.timestamp, response.timeZone),
        response.paymentLink,
      ),
      reservationFailure,
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

  private requestSuccess(
    key: string, navigate: boolean, role: Role, id?: string, date?: Date,
    paymentLink?: string, deleted?: boolean, toastType?: ToastType,
  ) {
    const message = this.translate.instant(key, { date });
    const path = id ? `reservation/${ id }` : undefined;

    return reservationSaveSuccess({ message, navigate, path, role, paymentLink, deleted, id, toastType });
  }
}
