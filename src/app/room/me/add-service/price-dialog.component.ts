import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AppMaterialModule } from '../../../util/app-material.module';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ServiceType } from '../../../interfaces/room';

type PriceDialogData = {
  name: string;
  type: ServiceType;
  currentPrice?: number;
};

type PriceForm = {
  price: FormControl<number>;
};

@Component({
  selector: 'app-price-dialog',
  templateUrl: 'price-dialog.component.html',
  styleUrls: ['./price-dialog.component.scss'],
  imports: [AppMaterialModule, ReactiveFormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PriceDialogComponent {
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly dialogRef: MatDialogRef<PriceDialogComponent> = inject(MatDialogRef<PriceDialogComponent>);

  readonly data = inject<PriceDialogData>(MAT_DIALOG_DATA);

  form: FormGroup<PriceForm> = this.formBuilder.group<PriceForm>({
    price: this.formBuilder.control(this.data.currentPrice ?? 0,
      { validators: [Validators.required, Validators.min(1)] }),
  });

  get getForm(): PriceForm {
    return this.form.controls;
  }

  onNoClick() {
    this.dialogRef.close();
  }

  submit() {
    const data = {
      price: this.getForm.price.value,
      type: this.data.type,
    };
    this.dialogRef.close(data);
  }
}
