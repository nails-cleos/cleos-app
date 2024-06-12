import { Component, Input } from '@angular/core';
import { IAdditionalAll } from '../../interfaces/additional';
import { IExtras } from '../../interfaces/reservation';
import { SharedModule } from '../shared.module';
import { ICurrencyAll } from '../../interfaces/currency';

@Component({
  selector: 'app-price-extras',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './price-extras.component.html',
  styleUrl: './price-extras.component.scss'
})
export class PriceExtrasComponent {
  @Input('key') key!: string;
  @Input('extras') extras?: IAdditionalAll[] | IExtras[];
  @Input('total') total: number = 0;
  @Input('currency') currency!: ICurrencyAll;
}
