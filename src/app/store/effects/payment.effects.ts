import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  adjustPayments,
  createPaymentLinkByReservationId,
  getPayment,
  getPaymentByResourceId,
  notifyPayment,
  paymentFailure,
  paymentNotComplete,
  paymentSave,
  paymentSaveSuccess,
  paymentSelected,
  paymentSend,
  recreate,
  updatePaymentById,
} from '../payment.actions';
import { TranslateService } from '@ngx-translate/core';
import { PaymentService } from '../../services/payment.service';
import { Router } from '@angular/router';
import { IPay, IPayment } from '../../interfaces/payment';
import { IApiResponse, successResponse } from '../../interfaces/common';

@Injectable()
export class PaymentEffects {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly actions: Actions = inject(Actions);
  private readonly router: Router = inject(Router);
  private readonly paymentService: PaymentService = inject(PaymentService);

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(getPayment),
    switchMap(({ id }) =>
      this.paymentService.getPayment(id).pipe(
        map((selected?: IPayment) => paymentSelected({ selected })),
        catchError((err: HttpErrorResponse) => of(paymentFailure({ error: err.error }))),
      )),
  ));

  findByReservation$ = createEffect(() => this.actions.pipe(
    ofType(getPaymentByResourceId),
    switchMap(({ id, path }) =>
      this.paymentService.getPaymentByResourceId(id, path).pipe(
        map((selected: IPayment[]) => paymentSelected({ selected })),
        catchError((err: HttpErrorResponse) => of(paymentFailure({ error: err.error }))),
      )),
  ));

  createOne$ = createEffect(() => this.actions.pipe(
    ofType(createPaymentLinkByReservationId),
    switchMap(({ reservationId, payment }) =>
      this.paymentService.createPaymentLinkByReservationId(reservationId, payment).pipe(
        map((response: IPayment) => paymentSend({ link: response.link || response.paymentURL })),
        catchError((err: HttpErrorResponse) => of(paymentFailure({ error: err.error }))),
      )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(paymentSave),
    switchMap(({ id, path, status, paymentStatus }) =>
      this.paymentService.add(id, path, status, paymentStatus).pipe(
        switchMap((response: IPay) => {
          const path = response.paths?.join('/');
          switch (response.status) {
            case 'approved':
              return this.requestSuccess('COMMON.PAYMENT.SUCCESS', path);
            case 'pending':
              return this.requestSuccess('COMMON.PAYMENT.PENDING', path);
            default:
              const message = this.translate.instant('ME.PAYMENT.ERROR', { reason: response.message });
              return of(paymentNotComplete(
                { subError: [{ message }], response: { message, path, toastType: 'error', redirect: path } }));
          }
        }),
        catchError((err: HttpErrorResponse) => of(paymentFailure({ error: err.error }))),
      )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(adjustPayments),
    switchMap(({ payments }) =>
      this.paymentService.adjustPayments(payments).pipe(
        switchMap(() => this.requestSuccess('COMMON.PAYMENT.SUCCESS', undefined, true)),
        catchError((err: HttpErrorResponse) => of(paymentFailure({ error: err.error }))),
      )),
  ));

  updateLink$ = createEffect(() => this.actions.pipe(
    ofType(updatePaymentById),
    switchMap(({ id, payment }) =>
      this.paymentService.updatePayment(id, payment).pipe(
        map((response: IApiResponse) => paymentSend({ link: response.paymentLink })),
        catchError((err: HttpErrorResponse) => of(paymentFailure({ error: err.error }))),
      )),
  ));

  recreate$ = createEffect(() => this.actions.pipe(
    ofType(recreate),
    switchMap(({ id, paymentType }) =>
      this.paymentService.recreate(id, paymentType).pipe(
        switchMap(() => this.requestSuccess('PAYMENT.RECREATE')),
        catchError((err: HttpErrorResponse) => of(paymentFailure({ error: err.error }))),
      )),
  ));

  notify$ = createEffect(() => this.actions.pipe(
    ofType(notifyPayment),
    switchMap(({ id, path, resourceId, preferenceId, paymentType }) =>
      this.paymentService.notifyPayment(id, path, resourceId, preferenceId, paymentType).pipe(
        switchMap((response: IPay) => {
          switch (response.status) {
            case 'approved':
              return this.requestSuccess('COMMON.PAYMENT.SUCCESS', undefined, true);
            case 'pending':
              return this.requestSuccess('COMMON.PAYMENT.PENDING');
            default:
              const message = this.translate.instant('COMMON.PAYMENT.ERROR', { reason: response.message });
              return of(paymentNotComplete({ subError: [message] }));
          }
        }),
        catchError((err: HttpErrorResponse) => of(paymentFailure({ error: err.error }))),
      )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(paymentSelected),
    tap(({ selected, redirect }) => {
      if (redirect && selected instanceof Array) {
        if (selected[0].transactionId || selected[0].transaction?.id) {
          this.router.navigate([this.translate.getCurrentLang(), 'me', 'transaction',
            selected[0].transactionId || selected[0].transaction?.id, 'payment']);
        } else {
          this.router.navigate([this.translate.getCurrentLang(), 'me', 'reservation',
            selected[0].reservationId || selected[0].reservation?.id, 'payment']);
        }
      }
    }),
  ), { dispatch: false });

  send$ = createEffect(() => this.actions.pipe(
    ofType(paymentSend),
    tap(({ link }) => window.open(link, '_self')),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(paymentSaveSuccess),
  ), { dispatch: false });

  private requestSuccess(key: string, path?: string, reload?: boolean) {
    const message = this.translate.instant(key);
    return successResponse(paymentSaveSuccess, message, path, path, reload);
  }
}
