import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as fromActionsPayment from '../payment.actions';
import { TranslateService } from '@ngx-translate/core';
import { PaymentService } from '../../services/payment.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable()
export class PaymentEffects {

  @Effect()
  getAll$ = this.actions$.pipe(ofType(fromActionsPayment.PaymentActionTypes.getAll)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.paymentService.getAll(payload.active, payload.direction, payload.page,
      payload.size).pipe(
      switchMap((response: any) => of(new fromActionsPayment.PaymentSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsPayment.PaymentFailure({error: err.error})))
    ))
  );

  @Effect()
  findOne$ = this.actions$.pipe(ofType(fromActionsPayment.PaymentActionTypes.paymentFind)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.paymentService.getById(payload).pipe(
      switchMap((payment: any) => of(new fromActionsPayment.PaymentSelected(payment))),
      catchError((err: HttpErrorResponse) => of(new fromActionsPayment.PaymentFailure({error: err.error})))
    ))
  );

  @Effect()
  findByReservation$ = this.actions$.pipe(ofType(fromActionsPayment.PaymentActionTypes.paymentByReservation)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.paymentService.findByReservationId(payload).pipe(
      switchMap((payment: any) => of(new fromActionsPayment.PaymentSelected(payment))),
      catchError((err: HttpErrorResponse) => of(new fromActionsPayment.PaymentFailure({error: err.error})))
    ))
  );

  @Effect()
  save$ = this.actions$.pipe(ofType(fromActionsPayment.PaymentActionTypes.paymentSave)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.paymentService.add(payload.mlPaymentId, payload.reservationId,
      payload.preferenceId, payload.status).pipe(
      switchMap((response: any) => {
        if (response.status === 'approved') {
          return of(new fromActionsPayment.PaymentSaveSuccess({message: this.translate.instant('PAYMENT.ADD.CREATED')}));
        }
        const message = this.translate.instant('PAYMENT.ADD.ERROR', {reason: response.message});
        return of(new fromActionsPayment.PaymentNotComplete({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsPayment.PaymentFailure({error: err.error})))
    ))
  );

  @Effect()
  recreate$ = this.actions$.pipe(ofType(fromActionsPayment.PaymentActionTypes.paymentRecreate)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.paymentService.recreate(payload).pipe(
      switchMap(() => of(new fromActionsPayment.PaymentSaveSuccess({message: this.translate.instant('PAYMENT.ADD.RECREATE')}))),
      catchError((err: HttpErrorResponse) => of(new fromActionsPayment.PaymentFailure({error: err.error})))
    ))
  );

  @Effect()
  notify$ = this.actions$.pipe(ofType(fromActionsPayment.PaymentActionTypes.paymentNotify)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.paymentService.notify(payload.id, payload.reservationId, payload.preferenceId).pipe(
      switchMap((response: any) => {
        if (response.status === 'approved') {
          return of(new fromActionsPayment.PaymentSaveSuccess({message: this.translate.instant('PAYMENT.ADD.CREATED')}));
        }
        const message = this.translate.instant('PAYMENT.ADD.ERROR', {reason: response.status});
        return of(new fromActionsPayment.PaymentNotComplete({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsPayment.PaymentFailure({error: err.error})))
    ))
  );

  @Effect({dispatch: false})
  selectedData$ = this.actions$.pipe(
    ofType(fromActionsPayment.PaymentActionTypes.paymentSelected),
    tap((data: any) => this.router.navigate(['me', 'reservation', data.payload[0].reservationId, 'payment']))
  );

  @Effect({dispatch: false})
  send$ = this.actions$.pipe(
    ofType(fromActionsPayment.PaymentActionTypes.paymentSend),
    tap((data: any) => window.open(data.payload, '_self'))
  );

  @Effect({dispatch: false})
  dataSuccess$ = this.actions$.pipe(
    ofType(fromActionsPayment.PaymentActionTypes.paymentSuccess)
  );

  @Effect({dispatch: false})
  saveSuccess$ = this.actions$.pipe(
    ofType(fromActionsPayment.PaymentActionTypes.paymentSaveSuccess)
  );

  constructor(private readonly translate: TranslateService, private actions$: Actions, private router: Router,
              private paymentService: PaymentService) {
  }
}
