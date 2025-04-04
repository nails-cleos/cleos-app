import { Component, Input } from '@angular/core';
import { IPaymentOption } from '../../interfaces/payment';
import { SharedModule } from '../shared.module';

@Component({
  selector: 'app-payment-preview',
  templateUrl: './payment-preview.component.html',
  styleUrls: ['./payment-preview.component.scss'],
  imports: [SharedModule]
})
export class PaymentPreviewComponent {
  @Input() type?: IPaymentOption;
  @Input() bank?: IPaymentOption;
  @Input() currencyIcon?: string;
  @Input() toPaid?: number;
  @Input() penalty?: number;
}
