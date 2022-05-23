import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as fromActionsReservation from '../reservation.actions';
import { TranslateService } from '@ngx-translate/core';
import { ReservationService } from '../../services/reservation.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { ProductService } from '../../services/product.service';
import { RoomService } from '../../services/room.service';
import { TrackingService } from '../../services/tracking.service';
import { PaymentService } from '../../services/payment.service';
import { AdditionalService } from '../../services/additional.service';
import { newDateTimestamp } from '../../util/dates';

@Injectable()
export class ReservationEffects {

  getAllPage$ = createEffect(() => this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.getAllPage)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) =>
      this.reservationService.getAllPage(payload.roomId, payload.active, payload.direction, payload.page, payload.size).pipe(
        switchMap((response: any) => of(new fromActionsReservation.ReservationPageSuccess(response ? response : {content: []}))),
        catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
      ))
  ));

  getCustomerReservations$ = createEffect(() =>
    this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.getCustomerReservations)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) =>
        this.reservationService.getCustomerReservations(payload.active, payload.direction, payload.page, payload.size).pipe(
          switchMap((response: any) => of(new fromActionsReservation.ReservationCustomerSuccess(response))),
          catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
        ))
    ));

  getAllFilterReservationsPage$ = createEffect(() =>
    this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.getAllFilterPage)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) =>
        this.reservationService.getAllFilterReservationsPage(payload.active, payload.direction, payload.page,
          payload.size, payload.userId, payload.states).pipe(
          switchMap((response: any) => of(new fromActionsReservation.ReservationFilterPageSuccess(response ? response : {content: []}))),
          catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
        ))
    ));

  getAllGroupingByRoom$ = createEffect(() =>
    this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.getAllGroupingByRoom)).pipe(
      map((action: any) => action.payload),
      switchMap((payload) => this.reservationService.getAllGroupingByRoom(payload.days, payload.date).pipe(
        switchMap((response: any) => of(new fromActionsReservation.ReservationSuccess(response ? response : []))),
        catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
      ))
    ));

  search = createEffect(() => this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.searchReservation)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.search(payload.roomId, payload.days, payload.date).pipe(
      switchMap((response: any) => of(new fromActionsReservation.ReservationSuccess(response ? response : []))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  ));

  customerSearch = createEffect(() =>
    this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.customerSearchReservation)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.reservationService.customerSearch(payload.roomId, payload.productId,
        payload.date, payload.additionalIds).pipe(
        switchMap((response: any) => of(new fromActionsReservation.ReservationSuccess(response ? response : []))),
        catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
      ))
    ));

  getAllCustomers$ = createEffect(() => this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.getCustomers)).pipe(
    map((action: any) => action.payload),
    switchMap(() => this.userService.getAllCustomers().pipe(
      switchMap((response: any) => of(new fromActionsReservation.CustomersSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  ));

  getCustomerInfo = createEffect(() => this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.getCustomerInfo)).pipe(
    map((action: any) => action.payload),
    switchMap((payload) => this.userService.getCustomerInformation(payload).pipe(
      switchMap((response: any) => of(new fromActionsReservation.CustomerSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  ));

  getAllProducts$ = createEffect(() => this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.getServices)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.productService.getAllProducts(payload.roomId, payload?.customerId).pipe(
      switchMap((response: any) => of(new fromActionsReservation.ReservationProductsSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  ));

  getAllRooms$ = createEffect(() => this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.getRooms)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.roomService.getAllRooms(payload.customerId).pipe(
      switchMap((response: any) => of(new fromActionsReservation.ReservationRoomsSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  ));

  getAllAdditional$ = createEffect(() => this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.getAdditional)).pipe(
    map((action: any) => action.payload),
    switchMap(() => this.additionalService.getAllAdditional().pipe(
      switchMap((response: any) => of(new fromActionsReservation.ReservationAdditionalSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  ));

  getUpcomingReservation$ = createEffect(() =>
    this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.getUpcomingReservation)).pipe(
      map((action: any) => action.payload),
      switchMap(() => this.reservationService.getUpcomingReservation().pipe(
        switchMap((response: any) => of(new fromActionsReservation.ReservationCustomerSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
      ))
    ));

  findOne$ = createEffect(() => this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.reservationFind)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.getById(payload.id).pipe(
      switchMap((reservation: any) => of(new fromActionsReservation.ReservationSelected(reservation))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  ));

  findPayments$ = createEffect(() => this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.reservationFindPayments)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.paymentService.findByReservationId(payload).pipe(
      switchMap((reservation: any) => of(new fromActionsReservation.ReservationPaymentsSuccess(reservation ? reservation : []))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  ));

  findHistory$ = createEffect(() => this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.reservationFindHistory)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.findHistory(payload.id).pipe(
      switchMap((reservation: any) => of(new fromActionsReservation.ReservationHistorySuccess(reservation ? reservation : []))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  ));

  save$ = createEffect(() => this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.reservationSave)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.add(payload.reservation).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('COMMON.RESERVATION.CREATED', {date: newDateTimestamp(response.timestamp)});
        return of(new fromActionsReservation.ReservationSaveSuccess({
          message,
          id: response.id,
          isCustomer: payload.isCustomer
        }));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  ));

  delete$ = createEffect(() => this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.reservationDelete)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.delete(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('RESERVATION.DELETED.MESSAGE', {date: newDateTimestamp(response.timestamp)});
        return of(new fromActionsReservation.ReservationSaveSuccess({message, deleted: true}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  ));

  approve$ = createEffect(() => this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.approve)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.changeState(payload, 'approve').pipe(
      switchMap(() => {
        const message = this.translate.instant('RESERVATION.STATE.APPROVE');
        return of(new fromActionsReservation.StateSuccess({id: payload, message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  ));

  edit$ = createEffect(() => this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.edit)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.update(payload.reservation).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('COMMON.RESERVATION.UPDATED.MESSAGE', {date: newDateTimestamp(response.timestamp)});
        return of(new fromActionsReservation.ReservationSaveSuccess({
          message,
          id: response.id,
          isCustomer: payload.isCustomer
        }));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  ));

  start$ = createEffect(() => this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.start)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.changeState(payload, 'start').pipe(
      switchMap(() => {
        const message = this.translate.instant('RESERVATION.STATE.START');
        return of(new fromActionsReservation.StateSuccess({id: payload, message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  ));

  complete$ = createEffect(() => this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.complete)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) =>
      this.reservationService.changeState(payload.reservationId, 'complete', payload.extras).pipe(
        switchMap(() => {
          const message = this.translate.instant('RESERVATION.STATE.COMPLETE');
          return of(new fromActionsReservation.ReservationCompleteSuccess({id: payload.reservationId, message}));
        }), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
      ))
  ));

  paymentComplete$ = createEffect(() => this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.paymentComplete)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) =>
      this.reservationService.paymentComplete(payload).pipe(
        switchMap(() => {
          const message = this.translate.instant('RESERVATION.STATE.COMPLETE');
          return of(new fromActionsReservation.StateSuccess({id: payload, message}));
        }), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
      ))
  ));

  cancel$ = createEffect(() => this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.cancel)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.changeState(payload, 'cancel').pipe(
      switchMap(() => {
        const message = this.translate.instant('RESERVATION.STATE.CANCEL');
        return of(new fromActionsReservation.StateSuccess({id: payload, message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  ));

  customerCancel$ = createEffect(() => this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.customerCancel)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.changeState(payload, 'cancel/customer').pipe(
      switchMap(() => {
        const message = this.translate.instant('RESERVATION.STATE.CANCEL');
        return of(new fromActionsReservation.StateSuccess({id: payload, message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  ));

  changeCustomer$ = createEffect(() => this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.changeCustomer)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.changeCustomer(payload.reservationId, payload.customerId).pipe(
      switchMap(() => {
        const message = this.translate.instant('RESERVATION.STATE.CHANGE_CUSTOMER');
        return of(new fromActionsReservation.StateSuccess({id: payload.reservationId, message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  ));

  findTracking$ = createEffect(() => this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.findTracking)).pipe(
    map((action: any) => action.payload),
    switchMap((payload) => this.trackingService.findByReservationId(payload.reservationId).pipe(
      switchMap((response: any) => of(new fromActionsReservation.TrackingSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  ));

  review$ = createEffect(() => this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.reservationReview)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.addReview(payload).pipe(
      switchMap((response: any) => of(new fromActionsReservation.ReservationSaveSuccess({
        message: this.translate.instant('ME.REVIEW.CREATED'), id: response.id, isCustomer: true
      }))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  ));

  selectedData$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.reservationSelected),
    tap(() => this.router.navigate([this.router.url]))
  ), {dispatch: false});

  dataSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.reservationSuccess)
  ), {dispatch: false});

  dataPageSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.reservationPageSuccess)
  ), {dispatch: false});

  filterPageSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.reservationFilterPageSuccess)
  ), {dispatch: false});

  customersSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.customersSuccess)
  ), {dispatch: false});

  customerSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.customerSuccess)
  ), {dispatch: false});

  productsSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.reservationProductsSuccess)
  ), {dispatch: false});

  roomsSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.reservationRoomsSuccess)
  ), {dispatch: false});

  saveSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.reservationSaveSuccess),
    tap((data: any) => this.router.navigate(
      data.payload.isCustomer ? ['me', 'reservations'] : data.payload.deleted ? ['dashboard'] : ['reservation', data.payload.id]
    ))
  ), {dispatch: false});

  stateSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.stateSuccess)
  ), {dispatch: false});

  reservationComplete$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.reservationCompleteSuccess),
    tap((data: any) => this.router.navigate(['reservation', data.payload.id]))
  ), {dispatch: false});

  reservationCustomersSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.reservationsCustomerSuccess)
  ), {dispatch: false});

  reservationAdditionalSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.reservationAdditionalSuccess)
  ), {dispatch: false});

  trackingSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.trackingSuccess)
  ), {dispatch: false});

  paymentsSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.reservationPaymentsSuccess)
  ), {dispatch: false});

  constructor(private readonly translate: TranslateService, private actions$: Actions, private router: Router,
              private reservationService: ReservationService, private userService: UserService,
              private productService: ProductService, private roomService: RoomService,
              private additionalService: AdditionalService, private trackingService: TrackingService,
              private paymentService: PaymentService) {
  }
}
