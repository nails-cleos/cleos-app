import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import {
  adjustPayments,
  notifyPayment,
  paymentFailure,
  paymentNotComplete,
  paymentSave,
  paymentSaveSuccess,
  paymentSelected,
  recreate,
} from '../actions/payment.actions';
import { TranslateService } from '@ngx-translate/core';
import { PaymentService } from '../../services/payment.service';
import { IPay } from '../../interfaces/payment';
import { successResponse } from '../../interfaces/common';
import { effectRequest } from '../../util/rxjs';
import { NavigationService } from '../../services/navigation.service';

@Injectable()
export class PaymentEffects {
  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly actions: Actions = inject(Actions);
  private readonly navigationService: NavigationService = inject(NavigationService);
  private readonly paymentService: PaymentService = inject(PaymentService);

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

  private requestSuccess(key: string, path?: string, reload?: boolean) {
    const message = this.translateService.instant(key);
    return successResponse(paymentSaveSuccess, message, path, path, reload);
  }
}
