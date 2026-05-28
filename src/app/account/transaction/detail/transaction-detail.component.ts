import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router, RouterLink } from '@angular/router';
import { getTransaction } from '../../../store/account.actions';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { notifyPayment, paymentSend } from '../../../store/payment.actions';
import { newDateTimestamp } from '../../../util/dates';
import { BackButtonDirective } from '../../../directives/back-button.directive';
import {
  getAccountResponsePipe,
  getCurrentAccountIdPipe,
  getCurrentTransactionIdPipe,
  getSelectedTransactionPipe,
  getSubErrorsPipe,
} from '../../../store/selectors/account.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { AccountState } from '../../../store/reducers/account.reducers';
import { PaymentState } from '../../../store/reducers/payment.reducers';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-transaction-detail',
  templateUrl: './transaction-detail.component.html',
  styleUrls: ['./transaction-detail.component.scss'],
  imports: [MatIcon, MatButton, TranslatePipe, DecimalPipe, RouterLink, DatePipe,
    BackButtonDirective, BackButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionDetailComponent {
  private readonly store: Store<AccountState | PaymentState> = inject(Store<AccountState | PaymentState>);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly router: Router = inject(Router);

  private accountId$ = this.store.pipe(getCurrentAccountIdPipe);
  private transactionId$ = this.store.pipe(getCurrentTransactionIdPipe);
  private selectedTransaction$ = this.store.pipe(getSelectedTransactionPipe);
  private response$ = this.store.pipe(getAccountResponsePipe);
  private subErrors$ = this.store.pipe(getSubErrorsPipe);

  private accountIdSignal = toSignal(this.accountId$);
  private transactionIdSignal = toSignal(this.transactionId$);
  private selectedTransactionSignal = toSignal(this.selectedTransaction$);
  private responseSignal = toSignal(this.response$);
  private subErrorsSignal = toSignal(this.subErrors$);

  transactionSignal = computed(() => {
    const transaction = this.selectedTransactionSignal();
    if (transaction) {
      return Object.assign(
        {}, transaction, { date: newDateTimestamp(transaction.payment?.timestamp) },
      );
    }
    return transaction;
  });

  dateFormat = this.translate.getCurrentLang();
  step?: number = this.router.currentNavigation()?.extras.state?.step;
  language = this.translate.getCurrentLang();

  constructor() {
    effect(() => {
      const id = this.accountIdSignal();
      const transactionId = this.transactionIdSignal();
      if (id && transactionId) {
        this.store.dispatch(getTransaction({ id, transactionId }));
      }
    });

    effect(() => {
      const path = this.responseSignal()?.path;
      if (path) {
        this.router.navigate([`${ this.language }/${ path }`]);
      } else if (this.subErrorsSignal()?.[0]?.message) {
        this.router.navigate([this.language, 'me', 'transaction', this.transactionIdSignal(), 'payment']);
      }
    });
  }

  pay(): void {
    this.store.dispatch(paymentSend({ link: this.transactionSignal()?.payment?.paymentURL }));
  }

  notify(): void {
    const transaction = this.transactionSignal()!;
    this.store.dispatch(
      notifyPayment({
        id: transaction.payment!.id!,
        path: 'transaction',
        resourceId: transaction.id!,
        preferenceId: transaction.payment!.preferenceId!,
        paymentType: transaction.payment!.type!,
      }),
    );
  }
}
