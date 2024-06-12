import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SharedModule } from '../shared.module';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { IExtras } from '../../interfaces/reservation';
import { ICurrencyAll } from '../../interfaces/currency';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { detailExpandAnimation } from '../../util/animation';
import { PaymentType } from '../../interfaces/payment';

@Component({
  selector: 'app-form-field-adder',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './form-field-adder.component.html',
  styleUrl: './form-field-adder.component.scss',
  animations: [detailExpandAnimation]
})
export class FormFieldAdderComponent implements OnInit {
  @Input() key!: string;
  @Input() currency!: ICurrencyAll;
  @Input() split: boolean = false;
  @Input() toPaid?: number = 0;
  @Output() onChange = new EventEmitter<IExtras[]>();
  @Output() isValid = new EventEmitter<boolean>();

  displayedColumns: string[] = ['description', 'price'];
  dataSource = new MatTableDataSource<IExtras>([]);
  formGroup!: FormGroup;
  expanded?: IExtras;
  allPaymentTypes: string[] = Object.keys(PaymentType);

  get addRow(): void {
    const element: IExtras = { description: undefined, price: 0 };
    if (this.split) {
      element.paymentType = undefined;
    }
    const newData = [...this.dataSource.data, element];
    this.dataSource = new MatTableDataSource<IExtras>(newData);

    this.formArray.push(this.createItemFormGroup());
    return this.subscribeToFormChanges();
  }

  get total() {
    return this.dataSource.data.map(t => t.price).reduce((acc, value) => acc + value, 0);
  }

  get remainsToBeSplit(): number | null {
    if (this.split) {
      return (this.toPaid || 0) - this.total;
    }
    return null;
  }

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      items: this.formBuilder.array([])
    });
    if (this.split) {
      this.displayedColumns = [...this.displayedColumns, 'paymentType'];
    }
    this.displayedColumns = [...this.displayedColumns, 'actions'];
  }

  deleteRow(index: number): void {
    this.dataSource.data.splice(index, 1);
    this.formArray.removeAt(index);
    this.emitRowChange();
  }

  getFormGroup(index: number): FormGroup {
    return this.formArray.at(index) as FormGroup;
  }

  private createItemFormGroup(): FormGroup {
    if (this.split) {
      return this.formBuilder.group({
        description: ['', Validators.required],
        price: ['', Validators.required],
        paymentType: ['', Validators.required]
      });
    }
    return this.formBuilder.group({
      description: ['', Validators.required],
      price: ['', Validators.required]
    });
  }

  private emitRowChange(): void {
    if (!this.formGroup.invalid) {
      this.onChange.emit(this.dataSource.data);
    }
    if (!this.split) {
      this.isValid.emit(!this.formGroup.invalid);
    } else {
      this.isValid.emit(this.total === this.toPaid && !this.formGroup.invalid);
    }
  }

  private subscribeToFormChanges(): void {
    this.formArray.controls.forEach((control, index) => {
      control.get('description')?.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe((newValue) => {
        const newData = [...this.dataSource.data];
        newData[index].description = newValue;
        this.dataSource = new MatTableDataSource<IExtras>(newData);
        this.emitRowChange();
      });

      control.get('price')?.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe((newValue) => {
        const newData = [...this.dataSource.data];
        newData[index].price = newValue;
        this.dataSource = new MatTableDataSource<IExtras>(newData);
        this.emitRowChange();
      });

      control.get('paymentType')?.valueChanges?.pipe(debounceTime(300), distinctUntilChanged())?.subscribe((newValue) => {
        const newData = [...this.dataSource.data];
        newData[index].paymentType = newValue;
        this.dataSource = new MatTableDataSource<IExtras>(newData);
        this.emitRowChange();
      });
    });
  }

  private get formArray(): FormArray {
    return this.formGroup.get('items') as FormArray;
  }
}
