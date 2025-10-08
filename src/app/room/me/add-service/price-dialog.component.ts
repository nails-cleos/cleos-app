import { Component, Inject, OnInit } from '@angular/core';
import { AppMaterialModule } from '../../../util/app-material.module';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-price-dialog',
  templateUrl: 'price-dialog.html',
  imports: [AppMaterialModule, ReactiveFormsModule, TranslatePipe],
})
export class PriceDialogComponent implements OnInit {

  form!: UntypedFormGroup;
  price: UntypedFormControl = new UntypedFormControl('', [
    Validators.required,
  ]);

  constructor(public dialogRef: MatDialogRef<PriceDialogComponent>, private formBuilder: UntypedFormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: { name: string; price: number; currentPrice?: number }) {
  }

  get onNoClick(): void {
    return this.dialogRef.close();
  }

  get submit(): void {
    this.data.price = this.price.value;
    return this.dialogRef.close(this.data);
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      price: this.price,
    });

    if (this.data.currentPrice) {
      this.price.setValue(this.data.currentPrice);
    }
  }
}
