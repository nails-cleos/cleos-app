import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IPrice } from '../../treatment/treatment';
import { ICurrency } from '../../currency/currency';
import { FormGroup } from '@angular/forms';
import { IPaymentOption } from '../../interfaces/payment';
import { BankComponent, BankForm } from '../bank/bank.component';
import { MatDivider } from '@angular/material/divider';
import { PricePreviewComponent } from '../price-preview/price-preview.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-price',
  templateUrl: './price.component.html',
  styleUrls: ['./price.component.scss'],
  imports: [BankComponent, MatDivider, PricePreviewComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PriceComponent {
  typeForm = input.required<FormGroup<BankForm>>();
  currency = input.required<ICurrency>();
  price = input<IPrice>();
  paymentPrice = input<IPrice>();
  hasChanges = input<boolean>(false);
  options = input<IPaymentOption[]>();
  professionalName = input<string>();
  firstTime = input<boolean>(false);
  showPenalty = input<boolean>(false);
  showBank = input<boolean>(false);
  includeBalance = input<boolean>(true);
  accountBalanceUsed = input<number>();
  percentageEmitter = output<number>();

  emitter = (percentage: number): void => this.percentageEmitter.emit(percentage);

  get summaryPrice(): IPrice | undefined {
    return this.price() ?? this.paymentPrice();
  }

  get appliedBalance(): number {
    if (!this.includeBalance()) {
      return 0;
    }

    const provided = this.accountBalanceUsed();
    if (provided !== undefined && provided !== null) {
      return provided;
    }

    const currentPrice = this.summaryPrice;
    if (!currentPrice) {
      return 0;
    }

    const remainingAfterPaid = Math.max(this.targetAmount - currentPrice.totalPaid, 0);
    return Math.min(currentPrice.balance ?? 0, remainingAfterPaid);
  }

  get targetAmount(): number {
    const originalPrice = this.price();
    const paymentPrice = this.paymentPrice();
    if (!originalPrice && !paymentPrice) {
      return 0;
    }

    if (paymentPrice && this.hasChanges()) {
      return paymentPrice.total + (this.showPenalty() ? (originalPrice?.penalty ?? 0) : 0);
    }

    if (this.showPenalty()) {
      return originalPrice?.penalty ?? 0;
    }

    return paymentPrice?.total ?? originalPrice?.total ?? 0;
  }

  get adjustedAmountToPay(): number {
    const currentPrice = this.summaryPrice;
    if (!currentPrice) {
      return 0;
    }

    const covered = currentPrice.totalPaid + this.appliedBalance;
    return Math.max(this.targetAmount - covered, 0);
  }

  get adjustedCredit(): number {
    const currentPrice = this.summaryPrice;
    if (!currentPrice) {
      return 0;
    }

    const covered = currentPrice.totalPaid + this.appliedBalance;
    return Math.max(covered - this.targetAmount, 0);
  }

  get shouldShowBankForm(): boolean {
    return this.showBank() && this.adjustedAmountToPay > 0;
  }
}
