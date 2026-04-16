import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IPaymentOption } from '../../interfaces/payment';
import { AppMaterialModule } from '../../util/app-material.module';
import { TranslatePipe } from '@ngx-translate/core';
import { CurrencySymbolPipe } from '../../pipes/currency-symbol.pipe';
import { IPrice } from '../../interfaces/treatment';
import { PricePreviewComponent } from '../price-preview/price-preview.component';

@Component({
  selector: 'app-payment-preview',
  templateUrl: './payment-preview.component.html',
  styleUrls: ['./payment-preview.component.scss'],
  imports: [AppMaterialModule, TranslatePipe, CurrencySymbolPipe, PricePreviewComponent],
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
