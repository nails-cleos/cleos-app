import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IExtras } from '../../reservation/reservation';
import { ICurrencyAll } from '../../currency/currency';
import { IPaymentOption } from '../../interfaces/payment';
import { TranslatePipe } from '@ngx-translate/core';
import { CurrencyPipe } from '@angular/common';
import { PaymentOptionSelectComponent } from '../payment-option-select/payment-option-select.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs/operators';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatFabButton, MatIconButton } from '@angular/material/button';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatFooterCell,
  MatFooterCellDef,
  MatFooterRow,
  MatFooterRowDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';

export type ExtraForm = {
  description: FormControl<string>;
  price: FormControl<number>;
  paymentOption?: FormControl<string | undefined>;
};

type FormFieldsForm = {
  items: FormArray<FormGroup<ExtraForm>>;
}

@Component({
  selector: 'app-form-field-adder',
  templateUrl: './form-field-adder.component.html',
  styleUrl: './form-field-adder.component.scss',
  imports: [MatFormField, MatLabel, MatInput, MatIcon, MatIconButton, TranslatePipe, CurrencyPipe, MatError, MatTable,
    MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatFooterCellDef, MatFooterCell,
    MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatFooterRow, MatFooterRowDef, MatFabButton, ReactiveFormsModule,
    PaymentOptionSelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldAdderComponent {
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  allPaymentOptions = input.required<IPaymentOption[]>();
  key = input.required<string>();
  currency = input.required<ICurrencyAll>();
  split = input<boolean>(false);
  toPaid = input<number>(0);

  onChange = output<IExtras[]>();
  isValid = output<boolean>();

  form: FormGroup<FormFieldsForm> = this.formBuilder.group<FormFieldsForm>({
    items: this.formBuilder.array<FormGroup<ExtraForm>>([]),
  });

  private readonly formValueSignal = toSignal(
    this.form.valueChanges.pipe(startWith(this.form.getRawValue())),
    { initialValue: this.form.getRawValue() },
  );
  private readonly formStatusSignal = toSignal(
    this.form.statusChanges.pipe(startWith(this.form.status)),
    { initialValue: this.form.status },
  );

  extras = signal<IExtras[]>([]);
  total = computed(() => this.extras().reduce((acc, item) => acc + item.price, 0));

  displayedColumns = computed(() => {
    const base = ['description', 'price'];

    return this.split()
      ? [...base, 'paymentType', 'actions']
      : [...base, 'actions'];
  });
  remainsToBeSplit = computed(() => this.split() ? this.toPaid() - this.total() : null);

  constructor() {
    effect(() => {
      this.formValueSignal();
      this.formStatusSignal();

      const extras = this.extras();
      this.formArray.controls.forEach((group, index) => {
        const row = extras[index];
        if (row) {
          row.description = group.controls.description.value;
          row.price = group.controls.price.value;
          if (this.split() && group.controls.paymentOption) {
            row.paymentType = group.controls.paymentOption.value;
          }
        }
      });

      const valid = this.form.valid;
      if (valid) {
        this.onChange.emit(extras);
      }
      this.isValid.emit(this.split() ? valid && this.total() === this.toPaid() : valid);
    });
  }

  get getForm(): FormFieldsForm {
    return this.form.controls;
  }

  addNewRow(): void {
    const row: IExtras = {
      description: '',
      price: 0,
      ...(this.split() ? { paymentType: undefined } : {}),
    };

    this.extras.update(list => [...list, row]);
    this.formArray.push(this.createItemFormGroup());
  }

  deleteRow(index: number): void {
    this.extras.update(list => list.filter((_, i) => i !== index));
    this.formArray.removeAt(index);
  }

  getFormGroup = (index: number): FormGroup<ExtraForm> => this.formArray.at(index);

  getFormGroupControls = (index: number): ExtraForm => this.getFormGroup(index).controls;

  getPaymentOptionControl = (index: number): FormControl<string | undefined> => this.getFormGroupControls(
    index).paymentOption!;

  private createItemFormGroup = (): FormGroup<ExtraForm> => {
    return this.formBuilder.group<ExtraForm>({
      description: this.formBuilder.control('', {
        validators: [Validators.required],
      }),
      price: this.formBuilder.control(0, {
        validators: [Validators.required],
      }),
      ...(this.split() ? { paymentOption: this.formBuilder.control(undefined, Validators.required) } : {}),
    });
  };

  updateExtra(index: number) {
    const group = this.getFormGroup(index).controls;
    this.extras.update(list => {
      const copy = [...list];
      copy[index] = {
        description: group.description.value,
        price: group.price.value,
        ...(this.split() ? { paymentType: group.paymentOption?.value } : {}),
      };
      return copy;
    });
  }

  private get formArray(): FormArray<FormGroup<ExtraForm>> {
    return this.getForm.items;
  }
}
