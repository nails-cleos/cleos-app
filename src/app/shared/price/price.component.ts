import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IPrice } from '../../interfaces/treatment';
import { ICurrency } from '../../interfaces/currency';
import { UntypedFormGroup } from '@angular/forms';
import { IPaymentOption } from '../../interfaces/payment';

@Component({
  selector: 'app-price',
  templateUrl: './price.component.html',
  styleUrls: ['./price.component.scss']
})
export class PriceComponent {
  @Input() typeForm!: UntypedFormGroup;
  @Input() price?: IPrice;
  @Input() currency!: ICurrency;
  @Input() firstTime!: boolean;
  @Input() showPenalty?: boolean;
  @Input() showBank!: boolean;
  @Input() types?: string[]; // TODO remove
  @Input() options?: IPaymentOption[];
  @Input() professionalName?: string;
  @Output() percentageEmitter = new EventEmitter<number>();

  emitter(percentage: number): void {
    this.percentageEmitter.emit(percentage);
  }
}
