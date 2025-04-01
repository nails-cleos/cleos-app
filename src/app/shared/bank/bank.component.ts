import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { requireMatch } from '../../util/validators';
import { map, startWith } from 'rxjs/operators';
import { IPaymentOption } from '../../interfaces/payment';
import { SharedModule } from '../shared.module';

@Component({
  selector: 'app-bank',
  templateUrl: './bank.component.html',
  styleUrls: ['./bank.component.scss'],
  imports: [SharedModule]
})
export class BankComponent implements AfterViewInit {
  @Input() formGroup!: UntypedFormGroup;
  @Input() options?: IPaymentOption[];
  @Input() firstTime: boolean;
  @Input() professionalName?: string;
  @Output() percentageEmitter = new EventEmitter<number>();

  bankList: IPaymentOption[];
  filteredBank?: Observable<IPaymentOption[] | undefined>;

  type?: IPaymentOption;

  constructor() {
    this.firstTime = false;
    this.bankList = [];
  }

  ngAfterViewInit(): void {
    this.formChanges();
    this.createFilter();
  }

  displayFnBank = (bank: IPaymentOption): string => bank ? `${ bank.name }` : '';

  keyDownHandler = (event: any): void => {
    if (event.code === 'Backspace') {
      this.formGroup.get('bank')?.setValue('');
    }
  }

  private formChanges = (): void => {
    this.formGroup.get('percentage')?.setValue('TOTAL');
    if (this.firstTime) {
      this.formGroup.get('type')?.setValidators([Validators.required]);
      this.formGroup.get('type')?.updateValueAndValidity();
      this.formGroup.get('percentage')?.setValidators([Validators.required]);
      this.formGroup.get('percentage')?.updateValueAndValidity();
    }

    this.formGroup.get('type')?.valueChanges.subscribe(value => {
      this.type = value;
      if (this.type) {
        if (this.type.subTypes?.length) {
          this.bankList = this.type.subTypes;
          this.formGroup.get('bank')?.setValidators([Validators.required, requireMatch]);
        } else {
          this.formGroup.get('bank')?.setValidators([]);
          this.bankList = [];
        }
        if (this.type.hidePercentage) {
          this.formGroup.get('percentage')?.setValidators([]);
        } else {
          this.formGroup.get('percentage')?.setValidators([Validators.required]);
        }
      } else {
        this.formGroup.get('bank')?.setValidators([]);
        this.formGroup.get('percentage')?.setValidators([]);
        this.bankList = [];
      }
      this.formGroup.get('percentage')?.updateValueAndValidity();
      this.formGroup.get('bank')?.updateValueAndValidity();
    });

    this.formGroup.get('percentage')?.valueChanges.subscribe(value => {
      let percentage;
      switch (value) {
        case 'TOTAL':
          percentage = 100;
          break;
        case 'DEPOSIT_50':
          percentage = 50;
          break;
        default:
          percentage = 0;
      }
      this.percentageEmitter.emit(percentage);
    });
  }

  private createFilter = (): void => {
    this.filteredBank = this.formGroup.get('bank')?.valueChanges.pipe(startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterBank(name) : this.bankList ? this.bankList.slice() : this.bankList));

    if (this.firstTime && this.options?.length === 1) {
      this.formGroup.get('type')?.setValue(this.options[0]);
    }
  }

  private filterBank = (name: string): IPaymentOption[] | undefined => this.bankList?.filter(
    option => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0);
}
