import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IExtras } from '../../interfaces/reservation';
import { ICurrencyAll } from '../../interfaces/currency';
import { detailExpandAnimation } from '../../util/animation';
import { PaymentType } from '../../interfaces/payment';
import { AppMaterialModule } from '../../util/app-material.module';
import { TranslatePipe } from '@ngx-translate/core';
import { CurrencyPipe } from '@angular/common';

export type ExtraForm = {
  description: FormControl<string>;
  price: FormControl<number>;
  paymentType?: FormControl<PaymentType | undefined>;
};

type FormFieldsForm = {
  items: FormArray<FormGroup<ExtraForm>>;
}

@Component({
  selector: 'app-form-field-adder',
  templateUrl: './form-field-adder.component.html',
  styleUrl: './form-field-adder.component.scss',
  animations: [detailExpandAnimation],
  imports: [AppMaterialModule, TranslatePipe, ReactiveFormsModule, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldAdderComponent {
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  allPaymentTypes = input.required<string[]>();
  key = input.required<string>();
  currency = input.required<ICurrencyAll>();
  split = input<boolean>(false);
  toPaid = input<number>(0);

  onChange = output<IExtras[]>();
  isValid = output<boolean>();

  form: FormGroup<FormFieldsForm> = this.formBuilder.group<FormFieldsForm>({
    items: this.formBuilder.array<FormGroup<ExtraForm>>([]),
  });

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
      const extras = this.extras();
      this.formArray.controls.forEach((group, index) => {
        const row = extras[index];
        if (row) {
          row.description = group.controls.description.value;
          row.price = group.controls.price.value;
          if (this.split() && group.controls.paymentType) {
            row.paymentType = group.controls.paymentType.value;
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

  addRow(): void {
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

  private createItemFormGroup = (): FormGroup<ExtraForm> => {
    return this.formBuilder.group<ExtraForm>({
      description: this.formBuilder.control('', {
        validators: [Validators.required],
      }),
      price: this.formBuilder.control(0, {
        validators: [Validators.required],
      }),
      ...(this.split() ? { paymentType: this.formBuilder.control(undefined, Validators.required) } : {}),
    });
  };

  updateExtra(index: number) {
    const group = this.getFormGroup(index).controls;
    this.extras.update(list => {
      const copy = [...list];
      copy[index] = {
        description: group.description.value,
        price: group.price.value,
        ...(this.split() ? { paymentType: group.paymentType?.value } : {}),
      };
      return copy;
    });
  }

  private get formArray(): FormArray<FormGroup<ExtraForm>> {
    return this.getForm.items;
  }
}
