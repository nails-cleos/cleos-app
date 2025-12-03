import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { cleanDiscount, getUserDiscountByCustomerId } from '../../store/discount.actions';
import { AppMaterialModule } from '../../util/app-material.module';
import { TranslatePipe } from '@ngx-translate/core';
import { DiscountState } from '../../store/reducers/discount.reducers';
import { getUserDiscountsPipe } from '../../store/selectors/discount.selectors';
import { toSignal } from '@angular/core/rxjs-interop';

type DiscountForm = {
  discount: FormControl<string>;
}

type DiscountDialogData = {
  customerId: string,
}

@Component({
  selector: 'app-add-discount-dialog-component',
  templateUrl: './add-discount-dialog.component.html',
  imports: [AppMaterialModule, ReactiveFormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddDiscountDialogComponent {
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly store: Store<DiscountState> = inject(Store<DiscountState>);
  private readonly dialogRef: MatDialogRef<AddDiscountDialogComponent> = inject(
    MatDialogRef<AddDiscountDialogComponent>);
  private readonly data = inject<DiscountDialogData>(MAT_DIALOG_DATA);

  private userDiscounts$ = this.store.pipe(getUserDiscountsPipe);

  userDiscountsSignal = toSignal(this.userDiscounts$);

  form: FormGroup<DiscountForm> = this.formBuilder.group<DiscountForm>({
    discount: this.formBuilder.control('', { validators: [Validators.required] }),
  });

  customerId = computed(() => this.data.customerId);

  constructor() {
    effect(() => {
      const customerId = this.customerId();
      this.store.dispatch(cleanDiscount());
      this.store.dispatch(getUserDiscountByCustomerId({ customerId }));
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
