import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import {
  adjustPayments,
  createPaymentLinkByReservationId,
  getOptions,
  getOptionsSuccess,
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
} from '../actions/payment.actions';
import { TranslateService } from '@ngx-translate/core';
import { PaymentService } from '../../services/payment.service';
import { IPay, IPayment, IPaymentOption } from '../../interfaces/payment';
import { IApiResponse, successResponse } from '../../interfaces/common';
import { effectRequest } from '../../util/rxjs';
import { NavigationService } from '../../services/navigation.service';

@Injectable()
export class PaymentEffects {
  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly actions: Actions = inject(Actions);
  private readonly navigationService: NavigationService = inject(NavigationService);
  private readonly paymentService: PaymentService = inject(PaymentService);

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(getPayment),
    switchMap(({ id }) => effectRequest(
      this.paymentService.getPayment(id).pipe(map((selected?: IPayment) => paymentSelected({ selected }))),
      action => action,
      paymentFailure,
    )),
  ));

  getOptions$ = createEffect(() => this.actions.pipe(
    ofType(getOptions),
    switchMap(() => effectRequest(
      this.paymentService.getPaymentOptions().pipe(map((options: IPaymentOption[]) => getOptionsSuccess({ options }))),
      action => action,
      paymentFailure,
    )),
  ));

  findByReservation$ = createEffect(() => this.actions.pipe(
    ofType(getPaymentByResourceId),
    switchMap(({ id, path }) => effectRequest(
      this.paymentService.getPaymentByResourceId(id, path)
        .pipe(map((selected: IPayment[]) => paymentSelected({ selected }))),
      action => action,
      paymentFailure,
    )),
  ));

  createOne$ = createEffect(() => this.actions.pipe(
    ofType(createPaymentLinkByReservationId),
    switchMap(({ reservationId, payment }) => effectRequest(
      this.paymentService.createPaymentLinkByReservationId(reservationId, payment)
        .pipe(map((response: IPayment) => paymentSend({ link: response.link || response.paymentURL }))),
      action => action,
      paymentFailure,
    )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(paymentSave),
    switchMap(({ id, path, status, paymentStatus }) => effectRequest(
      this.paymentService.add(id, path, status, paymentStatus).pipe(switchMap((response: IPay) => {
        const path = response.paths?.join('/');
        switch (response.status) {
          case 'approved':
            return this.requestSuccess('COMMON.PAYMENT.SUCCESS', path);
          case 'pending':
            return this.requestSuccess('COMMON.PAYMENT.PENDING', path);
          default:
            const message = this.translateService.instant('ME.PAYMENT.ERROR', { reason: response.message });
            return of(paymentNotComplete(
              { subError: [{ message }], response: { message, path, toastType: 'error', redirect: path } }));
        }
      })),
      action => action,
      paymentFailure,
    )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(adjustPayments),
    switchMap(({ payments }) => effectRequest(
      this.paymentService.adjustPayments(payments)
        .pipe(switchMap(() => this.requestSuccess('COMMON.PAYMENT.SUCCESS', undefined, true))),
      action => action,
      paymentFailure,
    )),
  ));

  updateLink$ = createEffect(() => this.actions.pipe(
    ofType(updatePaymentById),
    switchMap(({ id, payment }) => effectRequest(
      this.paymentService.updatePayment(id, payment)
        .pipe(map((response: IApiResponse) => paymentSend({ link: response.paymentLink }))),
      action => action,
      paymentFailure,
    )),
  ));

  recreate$ = createEffect(() => this.actions.pipe(
    ofType(recreate),
    switchMap(({ id, paymentType }) => effectRequest(
      this.paymentService.recreate(id, paymentType).pipe(switchMap(() => this.requestSuccess('PAYMENT.RECREATE'))),
      action => action,
      paymentFailure,
    )),
  ));

  notify$ = createEffect(() => this.actions.pipe(
    ofType(notifyPayment),
    switchMap(({ id, path, resourceId, preferenceId, paymentType }) => effectRequest(
      this.paymentService.notifyPayment(id, path, resourceId, preferenceId, paymentType)
        .pipe(switchMap((response: IPay) => {
          switch (response.status) {
            case 'approved':
              return this.requestSuccess('COMMON.PAYMENT.SUCCESS', undefined, true);
            case 'pending':
              return this.requestSuccess('COMMON.PAYMENT.PENDING');
            default:
              const message = this.translateService.instant('COMMON.PAYMENT.ERROR', { reason: response.message });
              return of(paymentNotComplete({ subError: [message] }));
          }
        })),
      action => action,
      paymentFailure,
    )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(paymentSelected),
    tap(({ selected, redirect }) => {
      if (redirect && selected instanceof Array) {
        if (selected[0].transactionId || selected[0].transaction?.id) {
          this.navigationService.navigate(['me', 'transaction',
            selected[0].transactionId || selected[0].transaction?.id, 'payment']);
        } else {
          this.navigationService.navigate(['me', 'reservation',
            selected[0].reservationId || selected[0].reservation?.id, 'payment']);
        }
      }
    }),
  ), { dispatch: false });

  send$ = createEffect(() => this.actions.pipe(
    ofType(paymentSend),
    tap(({ link }) => window.open(link, '_self')),
  ), { dispatch: false });

  private requestSuccess(key: string, path?: string, reload?: boolean) {
    const message = this.translateService.instant(key);
    return successResponse(paymentSaveSuccess, message, path, path, reload);
  }
}
