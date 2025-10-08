import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import {
  AdjustPayments,
  CreatePaymentLinkByReservationId,
  GetPayment,
  GetPaymentByResourceId,
  PaymentActionTypes,
  PaymentFailure,
  PaymentNotComplete,
  NotifyPayment,
  PaymentSave,
  PaymentSaveSuccess,
  PaymentSelected,
  PaymentSend,
  PaymentSuccess,
  Recreate,
  UpdatePaymentById,
} from '../payment.actions';
import { TranslateService } from '@ngx-translate/core';
import { PaymentService } from '../../services/payment.service';
import { Router } from '@angular/router';
import { IPay, IPayment, IPaymentOption } from '../../interfaces/payment';
import { IApiResponse, ResponseSuccess, success } from '../../interfaces/common';

@Injectable()
export class PaymentEffects {

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(PaymentActionTypes.getPayment),
    switchMap((action: GetPayment) =>
      this.paymentService.getPayment(action.id).pipe(
        switchMap((response?: IPayment) => of(new PaymentSelected(response, false))),
        catchError((err: HttpErrorResponse) => of(new PaymentFailure(err.error))),
      )),
  ));

  options$ = createEffect(() => this.actions.pipe(
    ofType(PaymentActionTypes.getPaymentOptions),
    switchMap(() =>
      this.paymentService.getPaymentOptions().pipe(
        switchMap((response?: IPaymentOption[]) => of(new PaymentSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new PaymentFailure(err.error))),
      )),
  ));

  findByReservation$ = createEffect(() => this.actions.pipe(
    ofType(PaymentActionTypes.getPaymentByResourceId),
    switchMap((action: GetPaymentByResourceId) =>
      this.paymentService.getPaymentByResourceId(action.id, action.path).pipe(
        switchMap((response: IPayment[]) => of(new PaymentSelected(response, action.redirect))),
        catchError((err: HttpErrorResponse) => of(new PaymentFailure(err.error))),
      )),
  ));

  createOne$ = createEffect(() => this.actions.pipe(
    ofType(PaymentActionTypes.createPaymentLinkByReservationId),
    switchMap((action: CreatePaymentLinkByReservationId) =>
      this.paymentService.createPaymentLinkByReservationId(action.reservationId, action.payment).pipe(
        switchMap((response: IPayment) => of(new PaymentSend(response.link || response.paymentURL))),
        catchError((err: HttpErrorResponse) => of(new PaymentFailure(err.error))),
      )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(PaymentActionTypes.paymentSave),
    switchMap((action: PaymentSave) =>
      this.paymentService.add(action.id, action.path, action.status, action.paymentStatus).pipe(
        switchMap((response: IPay) => {
          const path = response.paths?.join('/');
          switch (response.status) {
            case 'approved':
              return this.requestSuccess('COMMON.PAYMENT.SUCCESS', path);
            case 'pending':
              return this.requestSuccess('COMMON.PAYMENT.PENDING', path);
            default:
              const message = this.translate.instant('ME.PAYMENT.ERROR', { reason: response.message });
              return of(new PaymentNotComplete([{ message }], new ResponseSuccess(message, path, undefined, 'error')));
          }
        }),
        catchError((err: HttpErrorResponse) => of(new PaymentFailure(err.error))),
      )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(PaymentActionTypes.adjustPayments),
    switchMap((action: AdjustPayments) =>
      this.paymentService.adjustPayments(action.payments).pipe(
        switchMap(() => this.requestSuccess('COMMON.PAYMENT.SUCCESS', undefined, true)),
        catchError((err: HttpErrorResponse) => of(new PaymentFailure(err.error))),
      )),
  ));

  updateLink$ = createEffect(() => this.actions.pipe(
    ofType(PaymentActionTypes.updatePaymentById),
    switchMap((action: UpdatePaymentById) =>
      this.paymentService.updatePayment(action.id, action.payment).pipe(
        switchMap((response: IApiResponse) => of(new PaymentSend(response.paymentLink))),
        catchError((err: HttpErrorResponse) => of(new PaymentFailure(err.error))),
      )),
  ));

  recreate$ = createEffect(() => this.actions.pipe(
    ofType(PaymentActionTypes.recreate),
    switchMap((action: Recreate) =>
      this.paymentService.recreate(action.id, action.paymentType).pipe(
        switchMap(() => this.requestSuccess('PAYMENT.RECREATE')),
        catchError((err: HttpErrorResponse) => of(new PaymentFailure(err.error))),
      )),
  ));

  notify$ = createEffect(() => this.actions.pipe(
    ofType(PaymentActionTypes.notifyPayment),
    switchMap((action: NotifyPayment) =>
      this.paymentService.notifyPayment(action.id, action.path, action.resourceId, action.preferenceId,
        action.paymentType).pipe(
        switchMap((response: IPay) => {
          switch (response.status) {
            case 'approved':
              return this.requestSuccess('COMMON.PAYMENT.SUCCESS', undefined, true);
            case 'pending':
              return this.requestSuccess('COMMON.PAYMENT.PENDING');
            default:
              const message = this.translate.instant('COMMON.PAYMENT.ERROR', { reason: response.message });
              return of(new PaymentNotComplete([{ message }]));
          }
        }),
        catchError((err: HttpErrorResponse) => of(new PaymentFailure(err.error))),
      )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(PaymentActionTypes.paymentSelected),
    tap((data: PaymentSelected) => {
      if (data.redirect && data.selected instanceof Array) {
        const payment = data.selected;
        if (payment[0].transactionId || payment[0].transaction?.id) {
          this.router.navigate([this.translate.currentLang, 'me', 'transaction',
            payment[0].transactionId || payment[0].transaction?.id, 'payment']);
        } else {
          this.router.navigate([this.translate.currentLang, 'me', 'reservation',
            payment[0].reservationId || payment[0].reservation?.id, 'payment']);
        }
      }
    }),
  ), { dispatch: false });

  send$ = createEffect(() => this.actions.pipe(
    ofType(PaymentActionTypes.paymentSend),
    tap((data: PaymentSend) => window.open(data.link, '_self')),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(PaymentActionTypes.paymentSuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(PaymentActionTypes.paymentSaveSuccess),
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions: Actions, private router: Router,
              private paymentService: PaymentService) {
  }

  private requestSuccess(key: string, path?: string, reload?: boolean): Observable<PaymentSaveSuccess> {
    const message = this.translate.instant(key);
    return success(PaymentSaveSuccess, message, path, reload);
  }
}
