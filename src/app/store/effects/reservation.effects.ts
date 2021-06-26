import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
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

@Injectable()
export class ReservationEffects {

  @Effect()
  getAll$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.getAll)).pipe(
    map((action: any) => action.payload),
    switchMap(() => this.reservationService.getAll().pipe(
      switchMap((response: any) => response ? of(new fromActionsReservation.ReservationSuccess(response)) :
        of(new fromActionsReservation.ReservationFailure({error: {status: 'NO_CONTENT', message: 'NO_CONTENT'}}))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  );

  @Effect()
  getAllPage$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.getAllPage)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) =>
      this.reservationService.getAllPage(payload.active, payload.direction, payload.page, payload.size).pipe(
        switchMap((response: any) => of(new fromActionsReservation.ReservationPageSuccess(response ? response : {content: []}))),
        catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
      ))
  );

  @Effect()
  getCustomerReservations$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.getCustomerReservations)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) =>
      this.reservationService.getCustomerReservations(payload.active, payload.direction, payload.page, payload.size).pipe(
        switchMap((response: any) => of(new fromActionsReservation.ReservationCustomerSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
      ))
  );

  @Effect()
  getAllFilterReservationsPage$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.getAllFilterPage)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) =>
      this.reservationService.getAllFilterReservationsPage(payload.active, payload.direction, payload.page,
        payload.size, payload.userId, payload.states).pipe(
        switchMap((response: any) => of(new fromActionsReservation.ReservationFilterPageSuccess(response ? response : {content: []}))),
        catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
      ))
  );

  @Effect()
  getAllGroupingByRoom$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.getAllGroupingByRoom)).pipe(
    map((action: any) => action.payload),
    switchMap(() => this.reservationService.getAllGroupingByRoom().pipe(
      switchMap((response: any) => response ? of(new fromActionsReservation.ReservationSuccess(response)) :
        of(new fromActionsReservation.ReservationFailure({error: {status: 'NO_CONTENT'}}))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  );

  @Effect()
  search = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.searchReservation)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.search(payload.roomId, payload.date).pipe(
      switchMap((response: any) => of(new fromActionsReservation.ReservationSuccess(response ? response : []))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  );

  @Effect()
  customerSearch = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.customerSearchReservation)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.customerSearch(payload.roomId, payload.productId, payload.date).pipe(
      switchMap((response: any) => of(new fromActionsReservation.ReservationSuccess(response ? response : []))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  );

  @Effect()
  getAllCustomers$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.getCustomers)).pipe(
    map((action: any) => action.payload),
    switchMap(() => this.userService.getAllCustomers().pipe(
      switchMap((response: any) => of(new fromActionsReservation.CustomersSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  );

  @Effect()
  getAllProducts$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.getProducts)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.productService.getAllProducts(payload?.customerId).pipe(
      switchMap((response: any) => of(new fromActionsReservation.ReservationProductsSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  );

  @Effect()
  getAllRooms$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.getRooms)).pipe(
    map((action: any) => action.payload),
    switchMap(() => this.roomService.getAllRooms().pipe(
      switchMap((response: any) => of(new fromActionsReservation.ReservationRoomsSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  );

  @Effect()
  getUpcomingReservation$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.getUpcomingReservation)).pipe(
    map((action: any) => action.payload),
    switchMap(() => this.reservationService.getUpcomingReservation().pipe(
      switchMap((response: any) => of(new fromActionsReservation.ReservationCustomerSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  );

  @Effect()
  findOne$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.reservationFind)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.getById(payload).pipe(
      switchMap((reservation: any) => of(new fromActionsReservation.ReservationSelected(reservation))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  );

  @Effect()
  save$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.reservationSave)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.add(payload.reservation).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('RESERVATION.ADD.CREATED', {date: response.start});
        return of(new fromActionsReservation.ReservationSaveSuccess({message, isCustomer: payload.isCustomer}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  );

  @Effect()
  delete$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.reservationDelete)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.delete(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('RESERVATION.DELETED.MESSAGE', {date: response.start});
        return of(new fromActionsReservation.ReservationSaveSuccess({message, isCustomer: false}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  );

  @Effect()
  approve$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.approve)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.changeState(payload, 'approve').pipe(
      switchMap(() => {
        const message = this.translate.instant('RESERVATION.DETAIL.STATE.APPROVE');
        return of(new fromActionsReservation.StateSuccess({id: payload, message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  );

  @Effect()
  edit$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.edit)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.update(payload.reservation).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('RESERVATION.UPDATED.MESSAGE', {date: response.start});
        return of(new fromActionsReservation.ReservationSaveSuccess({message, isCustomer: payload.isCustomer}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  );

  @Effect()
  start$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.start)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.changeState(payload, 'start').pipe(
      switchMap(() => {
        const message = this.translate.instant('RESERVATION.DETAIL.STATE.START');
        return of(new fromActionsReservation.StateSuccess({id: payload, message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  );

  @Effect()
  complete$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.complete)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) =>
      this.reservationService.changeState(payload.reservationId, 'complete', payload.extras).pipe(
        switchMap(() => {
          const message = this.translate.instant('RESERVATION.DETAIL.STATE.COMPLETE');
          return of(new fromActionsReservation.StateSuccess({id: payload, message}));
        }), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
      ))
  );

  @Effect()
  cancel$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.cancel)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.changeState(payload, 'cancel').pipe(
      switchMap(() => {
        const message = this.translate.instant('RESERVATION.DETAIL.STATE.CANCEL');
        return of(new fromActionsReservation.StateSuccess({id: payload, message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  );

  @Effect()
  customerCancel$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.customerCancel)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.changeState(payload, 'cancel/customer').pipe(
      switchMap(() => {
        const message = this.translate.instant('RESERVATION.DETAIL.STATE.CANCEL');
        return of(new fromActionsReservation.StateSuccess({id: payload, message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  );

  @Effect()
  getAllTracking$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.getTracking)).pipe(
    map((action: any) => action.payload),
    switchMap(() => this.trackingService.getAll().pipe(
      switchMap((response: any) => response ? of(new fromActionsReservation.ReservationSuccess(response)) :
        of(new fromActionsReservation.ReservationFailure({error: {status: 'NO_CONTENT', message: 'NO_CONTENT'}}))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
    ))
  );

  @Effect({dispatch: false})
  selectedData$ = this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.reservationSelected),
    tap(() => this.router.navigate([this.router.url]))
  );

  @Effect({dispatch: false})
  dataSuccess$ = this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.reservationSuccess)
  );

  @Effect({dispatch: false})
  dataPageSuccess$ = this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.reservationPageSuccess)
  );

  @Effect({dispatch: false})
  filterPageSuccess$ = this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.reservationFilterPageSuccess)
  );

  @Effect({dispatch: false})
  customersSuccess$ = this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.customersSuccess)
  );

  @Effect({dispatch: false})
  productsSuccess$ = this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.reservationProductsSuccess)
  );

  @Effect({dispatch: false})
  roomsSuccess$ = this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.reservationRoomsSuccess)
  );

  @Effect({dispatch: false})
  saveSuccess$ = this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.reservationSaveSuccess),
    tap((data: any) => this.router.navigate(data.payload.isCustomer ? ['me', 'reservations'] : ['calendar']))
  );

  @Effect({dispatch: false})
  stateSuccess$ = this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.stateSuccess)
  );

  @Effect({dispatch: false})
  reservationCustomersSuccess$ = this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.reservationsCustomerSuccess)
  );

  @Effect({dispatch: false})
  trackingSuccess$ = this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.trackingSuccess)
  );

  constructor(private readonly translate: TranslateService, private actions$: Actions, private router: Router,
              private reservationService: ReservationService, private userService: UserService,
              private productService: ProductService, private roomService: RoomService,
              private trackingService: TrackingService) {
  }
}
