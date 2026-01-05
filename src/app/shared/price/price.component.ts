import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IPrice } from '../../interfaces/treatment';
import { ICurrency } from '../../interfaces/currency';
import { FormGroup } from '@angular/forms';
import { IPaymentOption } from '../../interfaces/payment';
import { CurrencySymbolPipe } from '../../pipes/currency-symbol.pipe';
import { BankComponent, BankForm } from '../bank/bank.component';
import { TranslatePipe } from '@ngx-translate/core';
import { DecimalPipe } from '@angular/common';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'app-price',
  templateUrl: './price.component.html',
  styleUrls: ['./price.component.scss'],
  imports: [CurrencySymbolPipe, BankComponent, TranslatePipe, DecimalPipe, MatDivider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PriceComponent {
  typeForm = input.required<FormGroup<BankForm>>();
  currency = input.required<ICurrency>();
  price = input<IPrice>();
  options = input<IPaymentOption[]>();
  professionalName = input<string>();
  firstTime = input<boolean>(false);
  showPenalty = input<boolean>(false);
  showBank = input<boolean>(false);
  percentageEmitter = output<number>();

  emitter = (percentage: number): void => this.percentageEmitter.emit(percentage);
}
