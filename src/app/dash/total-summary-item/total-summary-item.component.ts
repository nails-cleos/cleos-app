import { Component, Input } from '@angular/core';
import { AppMaterialModule } from '../../util/app-material.module';
import { CurrencyPipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-total-summary-item',
  templateUrl: './total-summary-item.component.html',
  styleUrl: './total-summary-item.component.scss',
  imports: [AppMaterialModule, CurrencyPipe, NgClass],
})
export class TotalSummaryItemComponent {
  @Input() label!: string;
  @Input() value!: number;
  @Input() currencyCode?: string;
  @Input() isResult: boolean = false;
}
