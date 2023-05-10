import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as fromActionsPayment from '../payment.actions';
import { TranslateService } from '@ngx-translate/core';
import { PaymentService } from '../../services/payment.service';
import { Router } from '@angular/router';

@Injectable()
export class PaymentEffects {

  getAll$ = createEffect(() => this.actions$.pipe(ofType(fromActionsPayment.PaymentActionTypes.getAll)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.paymentService.getAll(payload.active, payload.direction, payload.page,
      payload.size).pipe(
      switchMap((response: any) => of(new fromActionsPayment.PaymentSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsPayment.PaymentFailure({ error: err.error })))
    ))
  ));

  findOne$ = createEffect(() => this.actions$.pipe(ofType(fromActionsPayment.PaymentActionTypes.paymentFind)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.paymentService.getById(payload).pipe(
      switchMap((payment: any) => of(new fromActionsPayment.PaymentSelected({ payment, redirect: false }))),
      catchError((err: HttpErrorResponse) => of(new fromActionsPayment.PaymentFailure({ error: err.error })))
    ))
  ));

  findByReservation$ = createEffect(() => this.actions$.pipe(ofType(fromActionsPayment.PaymentActionTypes.paymentByReservation)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.paymentService.findByReservationId(payload.reservationId).pipe(
      switchMap((payment: any) => of(new fromActionsPayment.PaymentSelected({ payment, redirect: payload.redirect }))),
      catchError((err: HttpErrorResponse) => of(new fromActionsPayment.PaymentFailure({ error: err.error })))
    ))
  ));

  createOne$ = createEffect(() => this.actions$.pipe(ofType(fromActionsPayment.PaymentActionTypes.paymentCreate)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.paymentService.create(payload.reservationId, payload.payment).pipe(
      switchMap((payment: any) => of(new fromActionsPayment.PaymentSuccess(payment))),
      catchError((err: HttpErrorResponse) => of(new fromActionsPayment.PaymentFailure({ error: err.error })))
    ))
  ));

  save$ = createEffect(() => this.actions$.pipe(ofType(fromActionsPayment.PaymentActionTypes.paymentSave)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.paymentService.add(payload.reservationId, payload.status, payload.paymentStatus).pipe(
      switchMap((response: any) => {
        switch (response.status) {
          case 'approved':
            return of(new fromActionsPayment.PaymentSaveSuccess({ message: this.translate.instant('COMMON.PAYMENT.SUCCESS') }));
          case 'pending':
            return of(new fromActionsPayment.PaymentSaveSuccess({ message: this.translate.instant('COMMON.PAYMENT.PENDING') }));
          default:
            const message = this.translate.instant('ME.PAYMENT.ERROR', { reason: response.message });
            return of(new fromActionsPayment.PaymentNotComplete({ message }));
        }
      }), catchError((err: HttpErrorResponse) => of(new fromActionsPayment.PaymentFailure({ error: err.error })))
    ))
  ));

  updateOne$ = createEffect(() => this.actions$.pipe(ofType(fromActionsPayment.PaymentActionTypes.paymentUpdate)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.paymentService.update(payload.id, payload.payment).pipe(
      switchMap((payment: any) => of(new fromActionsPayment.PaymentSend(payment.link))),
      catchError((err: HttpErrorResponse) => of(new fromActionsPayment.PaymentFailure({ error: err.error })))
    ))
  ));

  recreate$ = createEffect(() => this.actions$.pipe(ofType(fromActionsPayment.PaymentActionTypes.paymentRecreate)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.paymentService.recreate(payload.id, payload.paymentType).pipe(
      switchMap(() => of(new fromActionsPayment.PaymentSaveSuccess({ message: this.translate.instant('PAYMENT.RECREATE') }))),
      catchError((err: HttpErrorResponse) => of(new fromActionsPayment.PaymentFailure({ error: err.error })))
    ))
  ));

  notify$ = createEffect(() => this.actions$.pipe(ofType(fromActionsPayment.PaymentActionTypes.paymentNotify)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.paymentService.notify(payload.id, payload.reservationId, payload.preferenceId, payload.type).pipe(
      switchMap((response: any) => {
        switch (response.status) {
          case 'approved':
            return of(new fromActionsPayment.PaymentSaveSuccess({ message: this.translate.instant('COMMON.PAYMENT.SUCCESS') }));
          case 'pending':
            return of(new fromActionsPayment.PaymentSaveSuccess({ message: this.translate.instant('COMMON.PAYMENT.PENDING') }));
          default:
            const message = this.translate.instant('COMMON.PAYMENT.ERROR', { reason: response.message });
            return of(new fromActionsPayment.PaymentNotComplete({ message }));
        }
      }), catchError((err: HttpErrorResponse) => of(new fromActionsPayment.PaymentFailure({ error: err.error })))
    ))
  ));

  selectedData$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsPayment.PaymentActionTypes.paymentSelected),
    tap((data: any) => {
      const payment = data.payload.payment;
      if (data.payload.redirect) {
        this.router.navigate(['me', 'reservation', payment[0].reservationId || payment[0].reservation.id, 'payment']);
      }
    })
  ), { dispatch: false });

  send$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsPayment.PaymentActionTypes.paymentSend),
    tap((data: any) => window.open(data.payload, '_self'))
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsPayment.PaymentActionTypes.paymentSuccess)
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsPayment.PaymentActionTypes.paymentSaveSuccess),
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions$: Actions, private router: Router,
              private paymentService: PaymentService) {
  }
}
