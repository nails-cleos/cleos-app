import { Component, Input } from '@angular/core';
import { IAdditionalAll } from '../../interfaces/additional';
import { IExtras } from '../../interfaces/reservation';
import { SharedModule } from '../shared.module';
import { ICurrencyAll } from '../../interfaces/currency';
import { CurrencySymbolPipe } from '../../pipes/currency-symbol.pipe';

@Component({
  selector: 'app-price-extras',
  templateUrl: './price-extras.component.html',
  styleUrl: './price-extras.component.scss',
  imports: [SharedModule, CurrencySymbolPipe]
})
export class PriceExtrasComponent {
  @Input('key') key!: string;
  @Input('extras') extras?: IAdditionalAll[] | IExtras[];
  @Input('total') total: number = 0;
  @Input('currency') currency!: ICurrencyAll;
}
