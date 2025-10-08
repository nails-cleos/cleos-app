import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { catchError, switchMap, tap, mergeMap } from 'rxjs/operators';
import {
  ApproveReservation,
  CancelReservation,
  ColorSuccess,
  CompleteReservation,
  CreateReservation,
  CreateReview,
  CustomerCancelReservation,
  CustomerSearchReservation,
  CustomersSuccess,
  CustomerSuccess,
  DeleteReservation,
  ExecuteTrackingByReservationId,
  GetAllAdditionalByGroupId,
  GetColorsByTreatmentId,
  GetPage,
  GetReservationHistory,
  GetReview,
  GetTrackingByReservationId,
  GetAllFilterReservations,
  GetAllGroupingByRoom,
  GetAllRooms,
  GetAllTreatments,
  GetCustomerInformation,
  GetCustomerReservations,
  PaymentCompleteReservation,
  PaymentOptionsSuccess,
  ReservationActionTypes,
  ReservationAdditionalSuccess,
  ReservationCustomerSuccess,
  ReservationFailure,
  ReservationFilterPageSuccess,
  GetReservation,
  ReservationFindPayments,
  ReservationHistorySuccess,
  ReservationPageSuccess,
  ReservationPaymentsSuccess,
  ReservationReviewSuccess,
  ReservationRoomsSuccess,
  ReservationSaveSuccess,
  ReservationSelected,
  ReservationSuccess,
  ReservationTreatmentsSuccess,
  SearchAvailability,
  Start,
  StateSuccess,
  TrackingSuccess,
  UpdateReservationColor,
  UpdateReservationCustomer,
  UpdateReservationDiscount,
  UpdateReservationNote,
  UpdateReservationById,
  UpdateReservationTimestamp,
  UpdateTrackingByReservationId, GetEditReservation,
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
  ICustomerLastReservation,
  ICustomerReservation,
  IReservation,
  IRoomReservation,
  ITracking,
} from '../../interfaces/reservation';
import { IUser } from '../../interfaces/user';
import { ITreatmentDiscountDTO } from '../../interfaces/treatment';
import { IRoom } from '../../interfaces/room';
import { IAdditional } from '../../interfaces/additional';
import { IPayment, IPaymentOption } from '../../interfaces/payment';
import { IApiResponse } from '../../interfaces/common';
import { IReview } from '../../interfaces/review';
import { IColor } from '../../interfaces/color';
import { ToastType } from '../../shared/toast/toast.model';

@Injectable()
export class ReservationEffects {

  getAllPage$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.getPage),
    switchMap((action: GetPage) =>
      this.reservationService.getPage(action.page, action.sort, action.direction, action.size, action.all,
        action.roomId, action.professionalId).pipe(
        switchMap((response: Pagination<IReservation>) => of(
          new ReservationPageSuccess(response ? response : { content: [] } as unknown as Pagination<IReservation>))),
        catchError((err: HttpErrorResponse) => of(new ReservationFailure(err.error))),
      )),
  ));

  getCustomerReservations$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.getCustomerReservations),
    switchMap((action: GetCustomerReservations) =>
      this.reservationService.getCustomerReservations(action.sort, action.direction, action.page, action.size).pipe(
        switchMap((response: ICustomerReservation) => of(
          new ReservationCustomerSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new ReservationFailure(err.error))),
      )),
  ));

  getAllFilterReservationsPage$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.getAllFilterReservations),
    switchMap((action: GetAllFilterReservations) =>
      this.reservationService.getAllFilterReservations(action.sort, action.direction, action.page, action.size,
        action.userId, action.states).pipe(
        switchMap((response: Pagination<IReservation>) => of(
          new ReservationFilterPageSuccess(
            response ? response : { content: [] } as unknown as Pagination<IReservation>))),
        catchError((err: HttpErrorResponse) => of(new ReservationFailure(err.error))),
      )),
  ));

  getAllGroupingByRoom$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.getAllGroupingByRoom),
    switchMap((action: GetAllGroupingByRoom) =>
      this.reservationService.getAllGroupingByRoom(action.days, action.date, action.roomId,
        action.professionalId).pipe(
        switchMap((response: IRoomReservation[]) => of(
          new ReservationSuccess(response ? response[0] : []))),
        catchError((err: HttpErrorResponse) => of(new ReservationFailure(err.error))),
      )),
  ));

  search$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.searchAvailability),
    switchMap((action: SearchAvailability) =>
      this.reservationService.searchAvailability(action.roomId, action.days, action.dates, action.professionalId).pipe(
        switchMap((response: IRoomReservation[]) => of(
          new ReservationSuccess(response ? response : []))),
        catchError((err: HttpErrorResponse) => of(new ReservationFailure(err.error))),
      )),
  ));

  customerSearch$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.customerSearchReservation),
    switchMap((action: CustomerSearchReservation) =>
      this.reservationService.customerSearch(action.roomId, action.treatmentId, action.date, action.professionalId,
        action.additionalIds).pipe(
        switchMap((response: IRoomReservation) => of(
          new ReservationSuccess(response ? response : []))),
        catchError((err: HttpErrorResponse) => of(new ReservationFailure(err.error))),
      )),
  ));

  getAllCustomers$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.getCustomers),
    switchMap(() =>
      this.userService.getCustomers().pipe(
        switchMap((response: IUser[]) => of(new CustomersSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new ReservationFailure(err.error))),
      )),
  ));

  getCustomerInfo$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.getCustomerInformation),
    switchMap((action: GetCustomerInformation) =>
      this.userService.getCustomerInformation(action.id).pipe(
        switchMap((response: ICustomerLastReservation) => of(new CustomerSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new ReservationFailure(err.error))),
      )),
  ));

  getAllTreatments$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.getAllTreatments),
    switchMap((action: GetAllTreatments) =>
      this.treatmentService.getAllTreatments(action.roomId, action.customerId).pipe(
        switchMap((response: ITreatmentDiscountDTO[]) => of(new ReservationTreatmentsSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new ReservationFailure(err.error))),
      )),
  ));

  getAllRooms$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.getAllRooms, ReservationActionTypes.findRooms),
    switchMap((action?: GetAllRooms) =>
      this.roomService.getAllRooms(action?.customerId).pipe(
        switchMap((response: IRoom[]) => of(new ReservationRoomsSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new ReservationFailure(err.error))),
      )),
  ));

  getAllAdditional$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.getAllAdditionalByGroupId),
    switchMap((action: GetAllAdditionalByGroupId) =>
      this.additionalService.getAllAdditionalByGroupId(action.roomId, action.groupId).pipe(
        switchMap((response: IAdditional[]) => of(new ReservationAdditionalSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new ReservationFailure(err.error))),
      )),
  ));

  getUpcomingReservation$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.getUpcomingReservation),
    switchMap(() =>
      this.reservationService.getUpcomingReservation().pipe(
        switchMap((response: ICustomerReservation) => of(new ReservationCustomerSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new ReservationFailure(err.error))),
      )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.getReservation, ReservationActionTypes.getEditReservation),
    switchMap((action: GetReservation | GetEditReservation) =>
      this.reservationService.getReservation(action.id, action.editPath).pipe(
        switchMap((response?: IReservation) => of(new ReservationSelected(response))),
        catchError((err: HttpErrorResponse) => of(new ReservationFailure(err.error))),
      )),
  ));

  findPayments$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.reservationFindPayments),
    switchMap((action: ReservationFindPayments) =>
      this.paymentService.getPaymentByResourceId(action.id, 'reservation').pipe(
        switchMap((response: IPayment[]) => of(new ReservationPaymentsSuccess(response ? response : []))),
        catchError((err: HttpErrorResponse) => of(new ReservationFailure(err.error))),
      )),
  ));

  findHistory$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.getReservationHistory),
    switchMap((action: GetReservationHistory) =>
      this.reservationService.getReservationHistory(action.id).pipe(
        switchMap((response: IReservation[]) => of(new ReservationHistorySuccess(response ? response : []))),
        catchError((err: HttpErrorResponse) => of(new ReservationFailure(err.error))),
      )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.createReservation),
    switchMap((action: CreateReservation) =>
      this.reservationService.createReservation(action.reservation).pipe(
        mergeMap((response: IReservation[]) =>
          response.map(res => this.requestSuccess('COMMON.RESERVATION.CREATED', true,
            action.role, res.id, newDateTimestamp(res.timestamp, res.room?.timeZone), res.paymentLink),
          )),
        catchError((err: HttpErrorResponse) => of(new ReservationFailure(err.error))),
      )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.deleteReservation),
    switchMap((action: DeleteReservation) =>
      this.reservationService.deleteReservation(action.id).pipe(
        switchMap(() => of(this.requestSuccess('RESERVATION.DELETED.MESSAGE', true,
          Role.professional, undefined, newDateTimestamp(action.timestamp, action.timeZone), undefined, true,
          'warning'))),
        catchError((err: HttpErrorResponse) => of(new ReservationFailure(err.error))),
      )),
  ));

  edit$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.updateReservationById),
    switchMap((action: UpdateReservationById) =>
      this.reservationService.updateReservationById(action.id, action.reservation).pipe(
        switchMap((response: IReservation) => of(this.requestSuccess('COMMON.RESERVATION.UPDATED.MESSAGE', true,
          action.role, response.id, newDateTimestamp(response.timestamp, response.room?.timeZone),
          response.paymentLink))),
        catchError((err: HttpErrorResponse) => of(new ReservationFailure(err.error))),
      )),
  ));

  changeStateOne$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.approveReservation,
      ReservationActionTypes.start,
      ReservationActionTypes.completeReservation),
    switchMap((action: ApproveReservation | Start | CompleteReservation) => this.changeState(action)),
  ));

  changeStateTwo$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.cancelReservation,
      ReservationActionTypes.customerCancelReservation,
      ReservationActionTypes.paymentCompleteReservation),
    switchMap(
      (action: CancelReservation | CustomerCancelReservation | PaymentCompleteReservation) => this.changeState(action)),
  ));

  changeCustomer$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.updateReservationCustomer),
    switchMap((action: UpdateReservationCustomer) =>
      this.reservationService.updateReservationCustomer(action.id, action.customerId).pipe(
        switchMap((response: IApiResponse) => of(
          new StateSuccess(this.translate.instant('RESERVATION.STATE.CHANGE_CUSTOMER'), response.id))),
        catchError((err: HttpErrorResponse) => of(new ReservationFailure(err.error))),
      )),
  ));

  changeColor$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.updateReservationColor),
    switchMap((action: UpdateReservationColor) =>
      this.reservationService.updateReservationColor(action.id, action.colorId).pipe(
        switchMap((response: IApiResponse) => of(
          new StateSuccess(this.translate.instant('RESERVATION.STATE.CHANGE_COLOR'), response.id))),
        catchError((err: HttpErrorResponse) => of(new ReservationFailure(err.error))),
      )),
  ));

  findTracking$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.getTrackingByReservationId),
    switchMap((action: GetTrackingByReservationId) =>
      this.trackingService.getTrackingByReservationId(action.id).pipe(
        switchMap((response: ITracking) => of(new TrackingSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new ReservationFailure(err.error))),
      )),
  ));

  executeTracking$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.executeTrackingByReservationId),
    switchMap((action: ExecuteTrackingByReservationId) =>
      this.trackingService.executeTrackingByReservationId(action.id).pipe(
        switchMap((response: ITracking) => of(new TrackingSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new ReservationFailure(err.error))),
      )),
  ));

  updateByReservationId$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.updateTrackingByReservationId),
    switchMap((action: UpdateTrackingByReservationId) =>
      this.trackingService.updateTrackingByReservationId(action.id, action.started, action.completed).pipe(
        switchMap((response: ITracking) => of(new TrackingSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new ReservationFailure(err.error))),
      )),
  ));

  review$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.createReview),
    switchMap((action: CreateReview) =>
      this.reservationService.createReview(action.review).pipe(
        switchMap((response: IApiResponse) => of(
          this.requestSuccess('ME.REVIEW.CREATED', true, Role.customer, response.id))),
        catchError((err: HttpErrorResponse) => of(new ReservationFailure(err.error))),
      )),
  ));

  findReview$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.getReview),
    switchMap((action: GetReview) =>
      this.reservationService.getReview(action.id).pipe(
        switchMap((response?: IReview) => of(new ReservationReviewSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new ReservationFailure(err.error))),
      )),
  ));

  getAllColorsByTreatmentId$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.getColorsByTreatmentId),
    switchMap((action: GetColorsByTreatmentId) =>
      this.colorService.getColorsByTreatmentId(action.treatmentId).pipe(
        switchMap((response: IColor[]) => of(new ColorSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new ReservationFailure(err.error))),
      )),
  ));

  paymentOptions$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.paymentOptions),
    switchMap(() =>
      this.paymentService.getPaymentOptions().pipe(
        switchMap((response?: IPaymentOption[]) => of(new PaymentOptionsSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new ReservationFailure(err.error))),
      )),
  ));

  updateNote$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.updateReservationNote),
    switchMap((action: UpdateReservationNote) =>
      this.reservationService.updateReservationNote(action.id, action.note, action.customerNote).pipe(
        switchMap((response: IApiResponse) => of(
          this.requestSuccess('COMMON.RESERVATION.UPDATED.MESSAGE', true, action.role, response.id,
            newDateTimestamp(action.timestamp, action.timeZone), response.paymentLink || action.paymentLink))),
        catchError((err: HttpErrorResponse) => of(new ReservationFailure(err.error))),
      )),
  ));

  updateDiscount$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.updateReservationDiscount),
    switchMap((action: UpdateReservationDiscount) =>
      this.reservationService.updateReservationDiscount(action.id, action.discountId).pipe(
        switchMap((response: IApiResponse) => of(
          this.requestSuccess('COMMON.RESERVATION.UPDATED.MESSAGE', true, Role.professional, response.id,
            newDateTimestamp(response.timestamp, response.timeZone),
            response.paymentLink))),
        catchError((err: HttpErrorResponse) => of(new ReservationFailure(err.error))),
      )),
  ));

  updateTimestamp$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.updateReservationTimestamp),
    switchMap((action: UpdateReservationTimestamp) =>
      this.reservationService.updateReservationTimestamp(action.id, action.start).pipe(
        switchMap((response: IApiResponse) => of(
          this.requestSuccess('COMMON.RESERVATION.UPDATED.MESSAGE', false, Role.professional, action.id,
            newDateTimestamp(response.timestamp, response.timeZone), response.paymentLink))),
        catchError((err: HttpErrorResponse) => of(new ReservationFailure(err.error))),
      )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.reservationSelected),
    tap((data: ReservationSelected) => {
      if (data.selected?.paymentLink) {
        window.open(data.selected.paymentLink, '_self');
        return;
      }
      this.router.navigate([this.router.url]);
    }),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.reservationSuccess),
  ), { dispatch: false });

  dataPageSuccess$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.reservationPageSuccess),
  ), { dispatch: false });

  filterPageSuccess$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.reservationFilterPageSuccess),
  ), { dispatch: false });

  customersSuccess$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.customersSuccess),
  ), { dispatch: false });

  customerSuccess$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.customerSuccess),
  ), { dispatch: false });

  treatmentsSuccess$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.reservationTreatmentsSuccess),
  ), { dispatch: false });

  roomsSuccess$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.reservationRoomsSuccess),
  ), { dispatch: false });

  reviewSuccess$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.reservationReviewSuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.reservationSaveSuccess),
    tap((data: ReservationSaveSuccess) => {
      if (data.navigate) {
        let navigation = [this.translate.currentLang];
        switch (data.role) {
          case Role.customer:
            if (data.paymentLink) {
              window.open(data.paymentLink, '_self');
            }
            navigation = [...navigation, 'me', 'reservations'];
            break;
          case Role.professional:
            navigation =
              data.deleted ? [...navigation, 'dashboard'] : [...navigation, 'reservation', data.id!];
            break;
          case Role.roomAdmin:
            navigation = [...navigation, 'events'];
            break;
        }
        this.router.navigate(navigation);
      }
    }),
  ), { dispatch: false });

  stateSuccess$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.stateSuccess),
    tap((data: StateSuccess) => {
      if (data.paymentLink) {
        window.open(data.paymentLink, '_self');
        return;
      }
      if (data.isDashboard !== undefined) {
        this.router.navigate(data.isDashboard ?
          [this.translate.currentLang, 'events'] : [this.translate.currentLang, 'reservation', data.id]);
      }
    }),
  ), { dispatch: false });

  reservationCustomersSuccess$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.reservationsCustomerSuccess),
  ), { dispatch: false });

  reservationAdditionalSuccess$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.reservationAdditionalSuccess),
  ), { dispatch: false });

  trackingSuccess$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.trackingSuccess),
  ), { dispatch: false });

  paymentsSuccess$ = createEffect(() => this.actions.pipe(
    ofType(ReservationActionTypes.reservationPaymentsSuccess),
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions: Actions, private router: Router,
              private reservationService: ReservationService, private userService: UserService,
              private treatmentService: TreatmentService, private roomService: RoomService,
              private additionalService: AdditionalService, private trackingService: TrackingService,
              private paymentService: PaymentService, private colorService: ColorService) {
  }

  private requestSuccess(key: string, navigate: boolean, role: Role, id?: string, date?: Date,
    paymentLink?: string, deleted?: boolean, toastType?: ToastType): ReservationSaveSuccess {
    const message = this.translate.instant(key, { date });
    const path = id ? `reservation/${ id }` : undefined;

    return new ReservationSaveSuccess(message, navigate, path, role, paymentLink, deleted, id, toastType);
  }

  private changeState(
    action: ApproveReservation | Start | CompleteReservation
      | CancelReservation | CustomerCancelReservation | PaymentCompleteReservation,
  ): Observable<StateSuccess | ReservationFailure> {
    return this.reservationService.changeState(action.id, action.state, action.extras).pipe(
      switchMap((response: IReservation | void) =>
        of(new StateSuccess(this.translate.instant(`COMMON.RESERVATION.STATE.${ action.key }`),
          action.id, response?.paymentLink, action.isDashboard))),
      catchError((err: HttpErrorResponse) => of(new ReservationFailure(err.error))),
    );
  }
}
