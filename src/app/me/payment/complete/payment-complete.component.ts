import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
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
import { NavigationService } from '../../../services/navigation.service';
import { PaymentStore } from '../../../store/payment.store';

@Component({
  selector: 'app-payment-complete',
  templateUrl: './payment-complete.component.html',
  styleUrls: ['./payment-complete.component.scss'],
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
// TODO remove?
export class PaymentCompleteComponent {
  private readonly navigationService: NavigationService = inject(NavigationService);
  private readonly store: Store<PaymentState> = inject(Store<PaymentState>);
  private readonly paymentStore = inject(PaymentStore);
  private readonly translateService: TranslateService = inject(TranslateService);

  private paymentResultParams$ = this.store.pipe(getResultParamsPipe);
  private subErrors$ = this.store.pipe(getSubErrorsPipe);
  private response$ = this.store.pipe(getPaymentResponsePipe);

  private paymentResultParamsSignal = toSignal(this.paymentResultParams$);
  private subErrorsSignal = toSignal(this.subErrors$);
  private responseSignal = toSignal(this.response$);

  private id: string = '';
  private path: 'reservation' | 'transaction' = 'reservation';

  constructor() {
    this.paymentStore.clean();
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
          this.navigationService.navigate(['me', this.path, this.id, 'payment'],
            { queryParams: { accountId: params.accountId } });
          return;
        }
        if (!type || !referenceId) {
          const message = this.translateService.instant('ME.PAYMENT.ERROR', { reason: 'incomplete' });
          this.store.dispatch(
            paymentNotComplete({ subError: [{ message }] }),
          );
          return;
        }
        const paymentStatus = new PaymentStatus(params.paymentId, type, referenceId, params.reason);
        this.store.dispatch(paymentSave({ id: params.id, path: params.path, status, paymentStatus }));
      }
    });

    effect(() => {
      const subErrors = this.subErrorsSignal();
      if (subErrors) {
        this.navigationService.navigate(['me', this.path, this.id, 'payment']);
      }
    });

    effect(() => {
      const path = this.responseSignal()?.path;
      if (path) {
        this.navigationService.navigate([path]);
      }
    });
  }
}
