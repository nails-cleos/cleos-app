import { Component, Input } from '@angular/core';
import { SharedModule } from "../../shared/shared.module";

@Component({
  selector: 'app-total-summary-item',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './total-summary-item.component.html',
  styleUrl: './total-summary-item.component.scss'
})
export class TotalSummaryItemComponent {
  @Input() label!: string;
  @Input() value!: number;
  @Input() currencyCode?: string;
  @Input() isResult: boolean = false;
}
