import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { IPayment, IPaymentAll } from '../../interfaces/payment';
import { cleanPayment, getPaymentByResourceId, notifyPayment, paymentSend } from '../../store/payment.actions';
import { TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';
import {
  getCurrentPathIdPipe,
  getPaymentResponsePipe,
  getPaymentsPipe,
  getSubErrorsPipe,
} from '../../store/selectors/payment.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { PaymentState } from '../../store/reducers/payment.reducers';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  imports: [SharedModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentComponent {
  private readonly store: Store<PaymentState> = inject(Store<PaymentState>);
  private readonly router: Router = inject(Router);
  private readonly translate: TranslateService = inject(TranslateService);

  private currentPath$ = this.store.pipe(getCurrentPathIdPipe);
  private paymentList$ = this.store.pipe(getPaymentsPipe);
  private response$ = this.store.pipe(getPaymentResponsePipe);
  private subErrors$ = this.store.pipe(getSubErrorsPipe);

  private currentPath = toSignal(this.currentPath$);
  private paymentListSignal = toSignal(this.paymentList$);
  private subErrorsSignal = toSignal(this.subErrors$);
  private responseSignal = toSignal(this.response$);

  dataSourceSignal = computed(() => this.paymentListSignal());
  hiddenSignal = computed(() => {
    const list = this.paymentListSignal();
    return !!list?.length;
  });

  displayedColumns: string[] = ['position', 'description', 'type', 'amount', 'status', 'actions'];

  errorMessage?: string;
  showError = false;
  language: string = this.translate.getCurrentLang();

  private id?: string;
  private path?: 'reservation' | 'transaction';
  private accountId?: string;

  constructor() {
    effect(() => {
      const currentPath = this.currentPath();
      if (currentPath) {
        const path = currentPath.path;
        const id = currentPath.id;
        this.path = path;
        this.id = id;
        this.accountId = currentPath.accountId;
        this.store.dispatch(getPaymentByResourceId({ id, path }));
      }
    });

    effect(() => {
      const response = this.responseSignal();
      if (response?.path) {
        this.store.dispatch(cleanPayment());
        this.router.navigate([`${ this.language }/${ response.path }`]);
      }
    });

    effect(() => {
      const subErrors = this.subErrorsSignal();
      if (subErrors?.length) {
        const errorMessage = subErrors[0].message;
        if (errorMessage) {
          this.errorMessage = errorMessage;
          this.showError = true;
        }
      }
    });
  }

  close(): void {
    this.showError = false;
  }

  pay = (payment: IPaymentAll): void => {
    const link = payment.link || payment.paymentURL;
    if (link) {
      this.store.dispatch(paymentSend({ link }));
    }
  };

  notify = (payment: IPayment): void => {
    this.store.dispatch(
      notifyPayment({
        id: payment.id!,
        path: this.path!,
        resourceId: this.id!,
        preferenceId: payment.preferenceId!,
        paymentType: payment.type!,
      }),
    );
  };

  getCurrency = (payment: IPaymentAll): string => {
    let icon = 'euro';
    if (payment.reservation?.id) {
      icon = payment.reservation.room.currency.icon;
    } else if (payment.transaction?.id && payment.transaction?.account) {
      icon = payment.transaction?.account?.currency?.icon;
    }
    return icon;
  };

  goBack() {
    if (this.path && this.id) {
      let navigate: string[] = [this.language];
      if (this.accountId) {
        navigate = [...navigate, 'accounts', this.accountId, 'transactions', this.id];
      } else {
        navigate = [...navigate, this.path, this.id];
      }
      this.router.navigate(navigate);
    }
  }
}
