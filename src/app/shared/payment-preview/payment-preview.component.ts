import { Component, Input } from '@angular/core';
import { IPaymentOption } from '../../interfaces/payment';

@Component({
  selector: 'app-payment-preview',
  templateUrl: './payment-preview.component.html',
  styleUrls: ['./payment-preview.component.scss']
})
export class PaymentPreviewComponent {
  @Input() type?: IPaymentOption;
  @Input() bank?: IPaymentOption;
  @Input() currencyIcon?: string;
  @Input() toPaid?: number;
  @Input() penalty?: number;
}
