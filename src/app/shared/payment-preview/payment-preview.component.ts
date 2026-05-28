import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IPaymentOption } from '../../interfaces/payment';
import { TranslatePipe } from '@ngx-translate/core';
import { CurrencySymbolPipe } from '../../pipes/currency-symbol.pipe';
import { IPrice } from '../../interfaces/treatment';
import { PricePreviewComponent } from '../price-preview/price-preview.component';
import { MatIcon } from '@angular/material/icon';
import { MatDivider, MatListItem, MatListItemIcon, MatListSubheaderCssMatStyler } from '@angular/material/list';

@Component({
  selector: 'app-payment-preview',
  templateUrl: './payment-preview.component.html',
  styleUrls: ['./payment-preview.component.scss'],
  imports: [MatIcon, MatListItem, MatListSubheaderCssMatStyler, TranslatePipe, MatListItemIcon, CurrencySymbolPipe,
    PricePreviewComponent, MatDivider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentPreviewComponent {
  option = input<IPaymentOption>();
  currencyIcon = input<string>();
  toPaid = input<number>();
  penalty = input<number>();
  accountCredit = input<number>();
  accountBalanceUsed = input<number>();
  price = input<IPrice>();
  isEditing = input<boolean>();
  updatedTotal = input<number>();
  paidTotal = input<number>();
  discountId = input<string>();
  discountKey = input<string>();
}
