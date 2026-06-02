import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { paymentNotComplete, paymentSave } from '../../../store/actions/payment.actions';
import { TranslateService } from '@ngx-translate/core';
import { PaymentStatus } from '../../../interfaces/payment';
import { PaymentState } from '../../../store/reducers/payment.reducers';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  getPaymentResponsePipe,
  getResultParamsPipe,
  getSubErrorsPipe,
} from '../../../store/selectors/payment.selectors';

@Component({
  selector: 'app-payment-complete',
  templateUrl: './payment-complete.component.html',
  styleUrls: ['./payment-complete.component.scss'],
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
// TODO remove?
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
        const status = params.status;
        // TODO analytic payment option
        let type;
        let referenceId;
        if (params.paymentType) {
          this.router.navigate([this.language, 'me', this.path, this.id, 'payment'],
            { queryParams: { accountId: params.accountId } });
          return;
        }
        if (!type || !referenceId) {
          const message = this.translate.instant('ME.PAYMENT.ERROR', { reason: 'incomplete' });
          this.store.dispatch(
            paymentNotComplete({ subError: [{ message }] }),
          );
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
        this.router.navigate([`${ this.language }/${ path }`]);
      }
    });
  }
}
