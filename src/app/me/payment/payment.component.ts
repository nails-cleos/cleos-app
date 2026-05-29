import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { IPayment, IPaymentAll } from '../../interfaces/payment';
import { cleanPayment, getPaymentByResourceId, notifyPayment, paymentSend } from '../../store/payment.actions';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { getPaymentResponsePipe, getPaymentsPipe, getSubErrorsPipe } from '../../store/selectors/payment.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { PaymentState } from '../../store/reducers/payment.reducers';
import { MatPrefix } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatFabButton, MatIconButton } from '@angular/material/button';
import { DecimalPipe } from '@angular/common';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatFooterCell,
  MatFooterCellDef,
  MatFooterRow,
  MatFooterRowDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  imports: [MatIcon, MatIconButton, TranslatePipe, DecimalPipe, MatTable, MatColumnDef,
    MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatTooltip, MatFooterCellDef, MatFooterCell, MatHeaderRowDef,
    MatHeaderRow, MatRowDef, MatRow, MatFooterRow, MatFooterRowDef, MatPrefix, MatFabButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentComponent {
  path = input<'reservation' | 'transaction'>();
  id = input<string>();
  accountId = input<string>();

  private readonly store: Store<PaymentState> = inject(Store<PaymentState>);
  private readonly router: Router = inject(Router);
  private readonly translate: TranslateService = inject(TranslateService);

  private paymentList$ = this.store.pipe(getPaymentsPipe);
  private response$ = this.store.pipe(getPaymentResponsePipe);
  private subErrors$ = this.store.pipe(getSubErrorsPipe);

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

  constructor() {
    effect(() => {
      const path = this.path();
      const id = this.id();
      if (path && id) {
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
        path: this.path()!,
        resourceId: this.id()!,
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
    const path = this.path();
    const id = this.id();
    const accountId = this.accountId();
    if (path && id) {
      let navigate: string[] = [this.language];
      if (accountId) {
        navigate = [...navigate, 'accounts', accountId, 'transactions', id];
      } else {
        navigate = [...navigate, path, id];
      }
      this.router.navigate(navigate);
    }
  }
}
