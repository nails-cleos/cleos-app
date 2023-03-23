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
      catchError((err: HttpErrorResponse) => of(new fromActionsPayment.PaymentFailure({error: err.error})))
    ))
  ));

  findOne$ = createEffect(() => this.actions$.pipe(ofType(fromActionsPayment.PaymentActionTypes.paymentFind)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.paymentService.getById(payload).pipe(
      switchMap((payment: any) => of(new fromActionsPayment.PaymentSelected(payment))),
      catchError((err: HttpErrorResponse) => of(new fromActionsPayment.PaymentFailure({error: err.error})))
    ))
  ));

  findByReservation$ = createEffect(() => this.actions$.pipe(ofType(fromActionsPayment.PaymentActionTypes.paymentByReservation)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.paymentService.findByReservationId(payload).pipe(
      switchMap((payment: any) => of(new fromActionsPayment.PaymentSelected(payment))),
      catchError((err: HttpErrorResponse) => of(new fromActionsPayment.PaymentFailure({error: err.error})))
    ))
  ));

  createOne$ = createEffect(() => this.actions$.pipe(ofType(fromActionsPayment.PaymentActionTypes.paymentCreate)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.paymentService.create(payload.reservationId, payload.type, payload.percentage).pipe(
      switchMap((payment: any) => of(new fromActionsPayment.PaymentSuccess(payment))),
      catchError((err: HttpErrorResponse) => of(new fromActionsPayment.PaymentFailure({error: err.error})))
    ))
  ));

  paymentBankList$ = createEffect(() => this.actions$.pipe(ofType(fromActionsPayment.PaymentActionTypes.paymentBankList)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.paymentService.getBankList(payload).pipe(
      switchMap((payment: any) => of(new fromActionsPayment.PaymentBankListSuccess(payment))),
      catchError((err: HttpErrorResponse) => of(new fromActionsPayment.PaymentFailure({error: err.error})))
    ))
  ));

  save$ = createEffect(() => this.actions$.pipe(ofType(fromActionsPayment.PaymentActionTypes.paymentSave)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.paymentService.add(payload.reservationId, payload.status, payload.paymentStatus).pipe(
      switchMap((response: any) => {
        if (response.status === 'approved') {
          return of(new fromActionsPayment.PaymentSaveSuccess({message: this.translate.instant('COMMON.PAYMENT.CREATED')}));
        }
        const message = this.translate.instant('PAYMENT.ERROR', {reason: response.message});
        return of(new fromActionsPayment.PaymentNotComplete({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsPayment.PaymentFailure({error: err.error})))
    ))
  ));

  recreate$ = createEffect(() => this.actions$.pipe(ofType(fromActionsPayment.PaymentActionTypes.paymentRecreate)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.paymentService.recreate(payload.id, payload.paymentType).pipe(
      switchMap(() => of(new fromActionsPayment.PaymentSaveSuccess({message: this.translate.instant('PAYMENT.RECREATE')}))),
      catchError((err: HttpErrorResponse) => of(new fromActionsPayment.PaymentFailure({error: err.error})))
    ))
  ));

  notify$ = createEffect(() => this.actions$.pipe(ofType(fromActionsPayment.PaymentActionTypes.paymentNotify)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.paymentService.notify(payload.id, payload.reservationId, payload.preferenceId, payload.type).pipe(
      switchMap((response: any) => {
        if (response.status === 'approved') {
          return of(new fromActionsPayment.PaymentSaveSuccess({message: this.translate.instant('COMMON.PAYMENT.CREATED')}));
        }
        const message = this.translate.instant('PAYMENT.ERROR', {reason: response.status});
        return of(new fromActionsPayment.PaymentNotComplete({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsPayment.PaymentFailure({error: err.error})))
    ))
  ));

  selectedData$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsPayment.PaymentActionTypes.paymentSelected),
    tap((data: any) => this.router.navigate(['me', 'reservation', data.payload[0].reservationId, 'payment']))
  ), {dispatch: false});

  send$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsPayment.PaymentActionTypes.paymentSend),
    tap((data: any) => window.open(data.payload, '_self'))
  ), {dispatch: false});

  dataSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsPayment.PaymentActionTypes.paymentSuccess)
  ), {dispatch: false});

  paymentBankListSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsPayment.PaymentActionTypes.paymentBankListSuccess)
  ), {dispatch: false});

  saveSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsPayment.PaymentActionTypes.paymentSaveSuccess)
  ), {dispatch: false});

  constructor(private readonly translate: TranslateService, private actions$: Actions, private router: Router,
              private paymentService: PaymentService) {
  }
}
