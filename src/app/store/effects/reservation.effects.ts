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

@Injectable()
export class ReservationEffects {

  @Effect()
  getAll$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.GET_ALL)).pipe(
    map((action: any) => action.payload),
    switchMap(() => {
      return this.reservationService.getAll().pipe(
        switchMap((response: any) => {
          return of(new fromActionsReservation.ReservationSuccess(response));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
      );
    })
  );

  @Effect()
  getAllPage$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.GET_ALL_PAGE)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.reservationService.getAllPage(payload.active, payload.direction, payload.page, payload.size).pipe(
        switchMap((response: any) => {
          return of(new fromActionsReservation.ReservationPageSuccess(response));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
      );
    })
  );

  @Effect()
  getAllAssignmentPage$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.GET_ALL_ASSIGNMENT_PAGE)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.reservationService.getAllAssignmentPage(payload.active, payload.direction, payload.page).pipe(
        switchMap((response: any) => {
          return of(new fromActionsReservation.ReservationPageSuccess(response));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
      );
    })
  );

  @Effect()
  getAllGroupingByRoom$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.GET_ALL_GROUPING_BY_ROOM)).pipe(
    map((action: any) => action.payload),
    switchMap(() => {
      return this.reservationService.getAllGroupingByRoom().pipe(
        switchMap((response: any) => {
          return of(new fromActionsReservation.ReservationSuccess(response));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
      );
    })
  );

  @Effect()
  search = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.SEARCH_RESERVATION)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.reservationService.search(payload.roomId, payload.date).pipe(
        switchMap((response: any) => {
          return of(new fromActionsReservation.ReservationSuccess(response));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
      );
    })
  );

  @Effect()
  getAllCustomers$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.GET_CUSTOMERS)).pipe(
    map((action: any) => action.payload),
    switchMap(() => {
      return this.userService.getAllCustomers().pipe(
        switchMap((response: any) => {
          return of(new fromActionsReservation.ReservationCustomersSuccess(response));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
      );
    })
  );

  @Effect()
  getAllProducts$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.GET_PRODUCTS)).pipe(
    map((action: any) => action.payload),
    switchMap(() => {
      return this.productService.getAllProducts().pipe(
        switchMap((response: any) => {
          return of(new fromActionsReservation.ReservationProductsSuccess(response));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
      );
    })
  );

  @Effect()
  getAllRooms$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.GET_ROOMS)).pipe(
    map((action: any) => action.payload),
    switchMap(() => {
      return this.roomService.getAllRooms().pipe(
        switchMap((response: any) => {
          return of(new fromActionsReservation.ReservationRoomsSuccess(response));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
      );
    })
  );

  @Effect()
  findOne$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.RESERVATION_FIND)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.reservationService.getById(payload).pipe(
        switchMap((reservation: any) => {
          return of(new fromActionsReservation.ReservationSelected(reservation));
        }),
        catchError((err: HttpErrorResponse) => {
          console.log(err);
          return of(new fromActionsReservation.ReservationFailure({error: err.error}));
        })
      );
    })
  );

  @Effect()
  save$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.RESERVATION_SAVE)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.reservationService.add(payload).pipe(
        switchMap((response: any) => {
          const message = this.translate.instant('RESERVATION.ADD.CREATED', {date: response.start});
          return of(new fromActionsReservation.ReservationSaveSuccess({message}));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
      );
    })
  );

  @Effect()
  update = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.RESERVATION_UPDATE)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.reservationService.update(payload).pipe(
        switchMap((response: any) => {
          const message = this.translate.instant('RESERVATION.UPDATED.MESSAGE', {date: response.start});
          return of(new fromActionsReservation.ReservationSaveSuccess({message}));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
      );
    })
  );

  @Effect()
  delete$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.RESERVATION_DELETE)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.reservationService.delete(payload).pipe(
        switchMap((response: any) => {
          const message = this.translate.instant('RESERVATION.DELETED.MESSAGE', {date: response.start});
          return of(new fromActionsReservation.ReservationSaveSuccess({message}));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
      );
    })
  );

  @Effect()
  approve$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.APPROVE)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.reservationService.changeState(payload, 'approve').pipe(
        switchMap(() => {
          const message = this.translate.instant('RESERVATION.DETAIL.STATE.APPROVE');
          return of(new fromActionsReservation.StateSuccess({id: payload, message}));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
      );
    })
  );

  @Effect()
  start$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.START)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.reservationService.changeState(payload, 'start').pipe(
        switchMap(() => {
          const message = this.translate.instant('RESERVATION.DETAIL.STATE.START');
          return of(new fromActionsReservation.StateSuccess({id: payload, message}));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
      );
    })
  );

  @Effect()
  complete$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.COMPLETE)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.reservationService.changeState(payload, 'complete').pipe(
        switchMap(() => {
          const message = this.translate.instant('RESERVATION.DETAIL.STATE.COMPLETE');
          return of(new fromActionsReservation.StateSuccess({id: payload, message}));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
      );
    })
  );

  @Effect()
  cancel$ = this.actions$.pipe(ofType(fromActionsReservation.ReservationActionTypes.CANCEL)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.reservationService.changeState(payload, 'cancel').pipe(
        switchMap(() => {
          const message = this.translate.instant('RESERVATION.DETAIL.STATE.CANCEL');
          return of(new fromActionsReservation.StateSuccess({id: payload, message}));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({error: err.error})))
      );
    })
  );

  @Effect({dispatch: false})
  selectedData$ = this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.RESERVATION_SELECTED),
    tap((data: any) => {
      this.router.navigate(['reservation', data.payload.id]);
    })
  );

  @Effect({dispatch: false})
  dataSuccess$ = this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.RESERVATION_SUCCESS)
  );

  @Effect({dispatch: false})
  dataPageSuccess$ = this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.RESERVATION_PAGE_SUCCESS)
  );

  @Effect({dispatch: false})
  customersSuccess$ = this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.RESERVATION_CUSTOMERS_SUCCESS)
  );

  @Effect({dispatch: false})
  productsSuccess$ = this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.RESERVATION_PRODUCTS_SUCCESS)
  );

  @Effect({dispatch: false})
  roomsSuccess$ = this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.RESERVATION_ROOMS_SUCCESS)
  );

  @Effect({dispatch: false})
  saveSuccess$ = this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.RESERVATION_SAVE_SUCCESS),
    tap(() => {
      this.router.navigate(['reservations']);
    })
  );

  @Effect({dispatch: false})
  stateSuccess$ = this.actions$.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.STATE_SUCCESS)
  );

  constructor(private readonly translate: TranslateService, private actions$: Actions, private reservationService: ReservationService,
              private userService: UserService, private productService: ProductService, private roomService: RoomService,
              private router: Router) {
  }
}
