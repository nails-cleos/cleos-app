import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IAdditionalAll } from '../../interfaces/additional';
import { IExtras } from '../../interfaces/reservation';
import { ICurrencyAll } from '../../interfaces/currency';
import { CurrencySymbolPipe } from '../../pipes/currency-symbol.pipe';
import { AppMaterialModule } from '../../util/app-material.module';
import { TranslatePipe } from '@ngx-translate/core';
import { DecimalPipe } from '@angular/common';
import { DurationTimePipe } from '../../pipes/durationTime.pipe';

@Component({
  selector: 'app-price-extras',
  templateUrl: './price-extras.component.html',
  styleUrl: './price-extras.component.scss',
  imports: [AppMaterialModule, CurrencySymbolPipe, TranslatePipe, DecimalPipe, DurationTimePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PriceExtrasComponent {
  key = input.required<string>();
  currency = input.required<ICurrencyAll>();
  extras = input<IAdditionalAll[] | IExtras[]>();
  total = input<number>(0);

  getDuration = (extra: IAdditionalAll | IExtras): string | undefined =>
    'duration' in extra ? extra.duration : undefined;
}
