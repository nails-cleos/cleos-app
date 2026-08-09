import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IPrice } from '@app/treatment/treatment';
import { CurrencySymbolPipe } from '@app/pipes/currency-symbol.pipe';
import { TranslatePipe } from '@ngx-translate/core';
import { DecimalPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatListItem, MatListItemIcon } from '@angular/material/list';

@Component({
  selector: 'app-price-preview',
  templateUrl: './price-preview.component.html',
  styleUrls: ['./price-preview.component.scss'],
  imports: [
    MatIcon,
    MatListItem,
    TranslatePipe,
    DecimalPipe,
    MatListItemIcon,
    CurrencySymbolPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricePreviewComponent {
  price = input<IPrice>();
  currencyIcon = input<string>();
  isEditing = input<boolean>();
  discountId = input<string>();
  discountKey = input<string>();
  label = input<string>('COMMON.LABEL.TOTAL');
  penalty = input<number>();
  toPaid = input<number>();
  updatedTotal = input<number>();
  paidTotal = input<number>();
  accountCredit = input<number>();
  accountBalanceUsedInput = input<number>();
  summaryOnly = input<boolean>(false);

  get resultAmount(): number {
    const toPaid = this.toPaid();
    if (toPaid !== undefined && toPaid > 0) {
      return toPaid;
    }

    if (this.accountCreditAmount > 0) {
      return this.accountCreditAmount;
    }

    if (
      toPaid !== undefined ||
      this.penalty() !== undefined ||
      this.accountCredit() !== undefined
    ) {
      return 0;
    }

    const price = this.price();
    if (!price) {
      return 0;
    }

    return price.toPaid;
  }

  get accountCreditAmount(): number {
    const accountCredit = this.accountCredit();
    if (accountCredit !== undefined) {
      return accountCredit;
    }

    const price = this.price();
    if (!price) {
      return 0;
    }

    const covered = price.totalPaid + price.balance;
    const target = price.total + (this.penalty() ?? 0);
    return Math.max(covered - target, 0);
  }

  get hasBalanceSummary(): boolean {
    return (
      !!this.penalty() ||
      this.accountCreditAmount > 0 ||
      this.accountBalanceUsed > 0 ||
      (this.toPaid() ?? 0) > 0
    );
  }

  get currentTotal(): number {
    const updatedTotal = this.updatedTotal();
    if (updatedTotal !== undefined && updatedTotal !== null) {
      return updatedTotal;
    }

    return this.price()?.total ?? 0;
  }

  get currentPaidTotal(): number {
    const paidTotal = this.paidTotal();
    if (paidTotal !== undefined && paidTotal !== null) {
      return paidTotal;
    }

    return this.price()?.totalPaid ?? 0;
  }

  get targetAmount(): number {
    return this.currentTotal + (this.penalty() ?? 0);
  }

  get accountBalanceUsed(): number {
    const provided = this.accountBalanceUsedInput();
    if (provided !== undefined && provided !== null) {
      return provided;
    }

    const balance = this.price()?.balance ?? 0;
    if (!balance) {
      return 0;
    }

    const remainingAfterPaid = Math.max(
      this.targetAmount - this.currentPaidTotal,
      0,
    );
    return Math.min(balance, remainingAfterPaid);
  }
}
