import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { MatError, MatFormField, MatLabel } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { DiscountStore } from '@app/store/discount.store';

type DiscountForm = {
  discount: FormControl<string>;
};

type DiscountDialogData = {
  customerId: string;
};

@Component({
  selector: 'app-add-discount-dialog-component',
  templateUrl: './add-discount-dialog.component.html',
  imports: [
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatIcon,
    MatButton,
    TranslatePipe,
    MatError,
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddDiscountDialogComponent {
  private readonly formBuilder: NonNullableFormBuilder = inject(
    NonNullableFormBuilder,
  );
  private readonly discountStore = inject(DiscountStore);
  private readonly dialogRef: MatDialogRef<AddDiscountDialogComponent> = inject(
    MatDialogRef<AddDiscountDialogComponent>,
  );
  private readonly data = inject<DiscountDialogData>(MAT_DIALOG_DATA);

  userDiscountsSignal = computed(() => {
    const data = this.discountStore.data();
    return data?.kind === 'list' ? data.value : undefined;
  });

  form: FormGroup<DiscountForm> = this.formBuilder.group<DiscountForm>({
    discount: this.formBuilder.control('', {
      validators: [Validators.required],
    }),
  });

  customerId = computed(() => this.data.customerId);

  constructor() {
    effect(() => {
      const customerId = this.customerId();
      this.discountStore.clean();
      this.discountStore.loadUserDiscounts(customerId);
    });
  }

  get getForm(): DiscountForm {
    return this.form.controls;
  }

  onNoClick(): void {
    return this.dialogRef.close();
  }

  doAction(): void {
    return this.dialogRef.close({ discountId: this.getForm.discount.value });
  }
}
