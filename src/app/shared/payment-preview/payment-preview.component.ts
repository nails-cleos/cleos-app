import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IPaymentOption } from '../../interfaces/payment';
import { AppMaterialModule } from '../../util/app-material.module';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-payment-preview',
  templateUrl: './payment-preview.component.html',
  styleUrls: ['./payment-preview.component.scss'],
  imports: [AppMaterialModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentPreviewComponent {
  type = input<IPaymentOption>();
  bank = input<IPaymentOption>();
  currencyIcon = input<string>();
  toPaid = input<number>();
  penalty = input<number>();
}
