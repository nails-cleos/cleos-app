import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IPrice } from '../../interfaces/treatment';
import { ICurrency } from '../../interfaces/currency';
import { UntypedFormGroup } from '@angular/forms';
import { IPaymentOption } from '../../interfaces/payment';
import { SharedModule } from "../shared.module";
import { CurrencySymbolPipe } from "../../pipes/currency-symbol.pipe";
import { BankComponent } from "../bank/bank.component";

@Component({
  selector: 'app-price',
  templateUrl: './price.component.html',
  styleUrls: ['./price.component.scss'],
  standalone: true,
  imports: [SharedModule, CurrencySymbolPipe, BankComponent]
})
export class PriceComponent {
  @Input() typeForm!: UntypedFormGroup;
  @Input() price?: IPrice;
  @Input() currency!: ICurrency;
  @Input() firstTime: boolean;
  @Input() showPenalty: boolean;
  @Input() showBank: boolean;
  @Input() options?: IPaymentOption[];
  @Input() professionalName?: string;
  @Output() percentageEmitter = new EventEmitter<number>();

  constructor() {
    this.firstTime = false;
    this.showBank = false;
    this.showPenalty = false;
  }

  emitter = (percentage: number): void => this.percentageEmitter.emit(percentage);
}
