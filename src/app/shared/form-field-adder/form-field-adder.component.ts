import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SharedModule } from '../shared.module';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { IExtras } from '../../interfaces/reservation';
import { ICurrencyAll } from '../../interfaces/currency';

@Component({
  selector: 'app-form-field-adder',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './form-field-adder.component.html',
  styleUrl: './form-field-adder.component.scss'
})
export class FormFieldAdderComponent implements OnInit {
  @Input() key!: string;
  @Input() currency!: ICurrencyAll;
  @Input() split: boolean = false;
  @Output() onChange = new EventEmitter<IExtras[]>();
  @Input() toPaid?: number = 0;

  extraDataForm!: UntypedFormGroup;
  displayedColumns: string[] = ['description', 'price'];
  extraDataSource = new MatTableDataSource<IExtras>([]);
  currentExtraData: IExtras[] = [];

  constructor(private formBuilder: FormBuilder) {
    if (this.split) {
      this.displayedColumns = [...this.displayedColumns, 'type'];
    }
  }

  get total() {
    return this.currentExtraData.map(t => t.price).reduce((acc, value) => acc + value, 0);
  }

  ngOnInit(): void {
    this.extraDataForm = this.formBuilder.group({
      description: [undefined],
      price: [undefined, [Validators.required]],
      type: [undefined]
    });
    if (this.split) {
      this.extraDataForm.controls['type'].setValidators([Validators.required]);
    }
  }

  addExtra() {
    if (this.extraDataForm.invalid) {
      return;
    }
    const extra = {
      description: this.extraDataForm.controls['description'].value,
      price: this.extraDataForm.controls['price'].value,
      type: this.extraDataForm.controls['type'].value
    };
    this.currentExtraData.push(extra);
    this.onChange.emit(this.currentExtraData);
    this.extraDataSource.data = [...this.currentExtraData];
    this.extraDataForm.reset();
  }
}
