import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IPrice } from '../../interfaces/treatment';
import { transitionAnimation } from '../../util/animation';
import { CurrencySymbolPipe } from '../../pipes/currency-symbol.pipe';
import { AppMaterialModule } from '../../util/app-material.module';
import { TranslatePipe } from '@ngx-translate/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-price-preview',
  templateUrl: './price-preview.component.html',
  styleUrls: ['./price-preview.component.scss'],
  animations: [transitionAnimation],
  imports: [AppMaterialModule, CurrencySymbolPipe, TranslatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricePreviewComponent {
  price = input<IPrice>();
  currencyIcon = input<string>();
  isEditing = input<boolean>();
  discountId = input<string>();
  discountKey = input<string>();
  label = input<string>('COMMON.LABEL.TOTAL');
}
