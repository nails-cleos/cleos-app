import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { paymentNotComplete, paymentSave } from '../../../store/payment.actions';
import { TranslateService } from '@ngx-translate/core';
import { PaymentStatus, PaymentType } from '../../../interfaces/payment';
import { SharedModule } from '../../../shared/shared.module';
import { PaymentState } from '../../../store/reducers/payment.reducers';
import { toSignal } from '@angular/core/rxjs-interop';
import { getPaymentResponsePipe, getResultParamsPipe, getSubErrorsPipe } from '../../../store/selectors/payment.selectors';

@Component({
  selector: 'app-payment-complete',
  templateUrl: './payment-complete.component.html',
  styleUrls: ['./payment-complete.component.scss'],
  imports: [SharedModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentCompleteComponent {
  private readonly router: Router = inject(Router);
  private readonly store: Store<PaymentState> = inject(Store<PaymentState>);
  private readonly translate: TranslateService = inject(TranslateService);

  private paymentResultParams$ = this.store.pipe(getResultParamsPipe);
  private subErrors$ = this.store.pipe(getSubErrorsPipe);
  private response$ = this.store.pipe(getPaymentResponsePipe);

  private paymentResultParamsSignal = toSignal(this.paymentResultParams$);
  private subErrorsSignal = toSignal(this.subErrors$);
  private responseSignal = toSignal(this.response$);

  private id: string = '';
  private path: 'reservation' | 'transaction' = 'reservation';
  private readonly language: string;

  constructor() {
    effect(() => {
      const params = this.paymentResultParamsSignal();
      if (params) {
        this.id = params.id;
        this.path = params.path;
        let status = params.status;
        // TODO analytic payment option
        let type;
        let referenceId;
        if (params.paymentId !== 'null') {
          if (params.preferenceId && params.preferenceId !== 'null') {
            type = PaymentType.ml;
            referenceId = params.preferenceId;
          } else if (params.payerId && params.paymentId !== 'null') {
            type = PaymentType.paypal;
            referenceId = params.payerId;
          }
        } else if (params.token) {
          type = PaymentType.ideal;
          referenceId = params.token;
        } else if (status === 'status') {
          if (params.orderStatusId === '100') {
            status = 'approved';
          } else if (params.orderStatusId && params.orderStatusId > '0') {
            status = 'pending';
          } else {
            status = 'cancelled';
          }
          type = PaymentType.paynl;
          referenceId = params.orderId;
        }
        if (!type || !referenceId) {
          const message = this.translate.instant('ME.PAYMENT.ERROR', { reason: 'incomplete' });
          this.store.dispatch(
            paymentNotComplete({ subError: [{ message }] }),
          );
          // this.router.navigate([this.language, 'me', this.path, this.id, 'payment']);
          return;
        }
        const paymentStatus = new PaymentStatus(params.paymentId, type, referenceId, params.reason);
        this.store.dispatch(paymentSave({ id: params.id, path: params.path, status, paymentStatus }));


      }
    });
    this.language = this.translate.getCurrentLang();


    effect(() => {
      const subErrors = this.subErrorsSignal();
      if (subErrors) {
        this.router.navigate([this.language, 'me', this.path, this.id, 'payment']);
      }
    });

    effect(() => {
      const path = this.responseSignal()?.path;
      if (path) {
        this.router.navigate([`${this.language}/${path}`]);
      }
    });
  }
}
