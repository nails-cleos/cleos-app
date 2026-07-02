import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { newDateTimestamp } from '../../../util/dates';
import { BackButtonDirective } from '../../../directives/back-button.directive';
import { AccountStore } from '../../../store/account.store';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { DatePipe, DecimalPipe } from '@angular/common';
import { NavigationService } from '../../../services/navigation.service';
import { PaymentStore } from '../../../store/payment.store';

@Component({
  selector: 'app-transaction-detail',
  templateUrl: './transaction-detail.component.html',
  styleUrls: ['./transaction-detail.component.scss'],
  imports: [MatIcon, MatButton, TranslatePipe, DecimalPipe, RouterLink, DatePipe,
    BackButtonDirective, BackButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionDetailComponent {
  id = input<string>();
  transactionId = input<string>();

  private readonly paymentStore = inject(PaymentStore);
  private readonly accountStore = inject(AccountStore);
  private readonly navigationService: NavigationService = inject(NavigationService);

  private responseSignal = this.paymentStore.response;
  private subErrorsSignal = this.paymentStore.subErrors;

  transactionSignal = computed(() => {
    const transaction = this.accountStore.selectedTransaction();
    if (transaction) {
      return Object.assign(
        {}, transaction, { date: newDateTimestamp(transaction.payment?.timestamp) },
      );
    }
    return transaction;
  });

  readonly language = this.navigationService.language;

  step?: number = history.state?.step;

  constructor() {
    effect(() => {
      const id = this.id();
      const transactionId = this.transactionId();
      if (id && transactionId) {
        this.accountStore.clean();
        this.accountStore.loadTransaction(id, transactionId);
      }
    });

    effect(() => {
      const path = this.responseSignal()?.path;
      if (path) {
        this.navigationService.navigate([path]);
      } else if (this.subErrorsSignal()?.[0]?.message) {
        this.navigationService.navigate(['me', 'transaction', this.transactionId(), 'payment']);
      }
    });
  }

  pay(): void {
    window.open(this.transactionSignal()?.payment?.paymentURL, '_self');
  }

  notify(): void {
    const transaction = this.transactionSignal()!;
    this.paymentStore.notify(
      transaction.payment!.id!,
      'transaction',
      transaction.id!,
      transaction.payment!.preferenceId!,
      transaction.payment!.type!,
    );
  }
}
