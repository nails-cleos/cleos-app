import { Component, Input } from '@angular/core';
import { IPrice } from '../../interfaces/treatment';
import { transitionAnimation } from '../../util/animation';
import { SharedModule } from "../shared.module";
import { CurrencySymbolPipe } from "../../pipes/currency-symbol.pipe";

@Component({
  selector: 'app-price-preview',
  templateUrl: './price-preview.component.html',
  styleUrls: ['./price-preview.component.scss'],
  animations: [transitionAnimation],
  standalone: true,
  imports: [SharedModule, CurrencySymbolPipe]
})
export class PricePreviewComponent {
  @Input() price?: IPrice;
  @Input() currencyIcon?: string;
  @Input() isEditing?: boolean;
  @Input() discountId?: string;
  @Input() discountKey?: string;
  @Input() label = 'COMMON.LABEL.TOTAL';
}
