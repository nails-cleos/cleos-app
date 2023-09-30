import { Component, Input } from '@angular/core';
import { IPrice } from '../../interfaces/treatment';
import { transitionAnimation } from '../../util/animation';

@Component({
  selector: 'app-price-preview',
  templateUrl: './price-preview.component.html',
  styleUrls: ['./price-preview.component.scss'],
  animations: [transitionAnimation]
})
export class PricePreviewComponent {
  @Input() price?: IPrice;
  @Input() currencyIcon?: string;
  @Input() isEditing?: boolean;
  @Input() discountId?: string;
  @Input() discountKey?: string;
  @Input() label = 'COMMON.LABEL.TOTAL';
}
