import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IAdditionalAll } from '@app/additional/additional';
import { IExtras } from '@app/reservation/reservation';
import { ICurrencyAll } from '@app/currency/currency';
import { CurrencySymbolPipe } from '@app/pipes/currency-symbol.pipe';
import { TranslatePipe } from '@ngx-translate/core';
import { DecimalPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatDivider, MatListItem, MatListItemIcon, MatListSubheaderCssMatStyler } from '@angular/material/list';
import { DurationTimePipe } from '@app/pipes/durationTime.pipe';

@Component({
  selector: 'app-price-extras',
  templateUrl: './price-extras.component.html',
  styleUrl: './price-extras.component.scss',
  imports: [MatIcon, MatListItem, MatListSubheaderCssMatStyler, TranslatePipe, DecimalPipe, MatListItemIcon,
    CurrencySymbolPipe, MatDivider, DurationTimePipe],
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
