import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { banks, IBank } from '../../interfaces/bank';
import { Observable } from 'rxjs';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { requireMatch } from '../../util/validators';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-bank',
  templateUrl: './bank.component.html',
  styleUrls: ['./bank.component.scss']
})
export class BankComponent implements AfterViewInit {
  @Input() formGroup!: UntypedFormGroup;
  @Input() types?: string[];
  @Input() firstTime!: boolean;
  @Input() professionalName?: string;
  @Output() percentageEmitter = new EventEmitter<number>();

  bankList?: IBank[] = banks();
  filteredBank?: Observable<IBank[] | undefined>;

  ngAfterViewInit(): void {
    this.formChanges();
    this.createFilter();
  }

  displayFnBank(bank: IBank): string {
    return bank ? `${ bank.name }` : '';
  }

  keyDownHandler(event: any): void {
    if (event.code === 'Backspace') {
      this.formGroup.get('bank')?.setValue('');
    }
  }

  private formChanges(): void {
    if (this.firstTime) {
      this.formGroup.get('type')?.setValidators([Validators.required]);
      this.formGroup.get('percentage')?.setValidators([Validators.required]);
    }

    this.formGroup.get('type')?.valueChanges.subscribe(value => {
      if (value === 'IDEAL') {
        this.formGroup.get('bank')?.setValidators([Validators.required, requireMatch]);
      }
      this.formGroup.get('percentage')?.setValidators([Validators.required]);
    });

    this.formGroup.get('percentage')?.valueChanges.subscribe(value => {
      let percentage;
      switch (value) {
        case 'TOTAL':
          percentage = 100;
          break;
        case 'DEPOSIT_30':
          percentage = 30;
          break;
        default:
          percentage = 0;
      }
      this.percentageEmitter.emit(percentage);
    });
  }

  private createFilter(): void {
    this.filteredBank = this.formGroup.get('bank')?.valueChanges.pipe(startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterBank(name) : this.bankList ? this.bankList.slice() : this.bankList));

    if (this.firstTime && this.types?.length === 1) {
      this.formGroup.get('type')?.setValue(this.types[0]);
    }
  }

  private filterBank(name: string): IBank[] | undefined {
    const filterValue = name.toLowerCase();

    return this.bankList?.filter(option => option.name?.toLowerCase().indexOf(filterValue) === 0);
  }
}
