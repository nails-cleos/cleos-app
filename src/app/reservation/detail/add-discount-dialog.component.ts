import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectDiscountState } from '../../store/app.states';
import { clean, getUserDiscountByCustomerId } from '../../store/discount.actions';
import { IUserDiscount } from '../../interfaces/discount';
import { AppMaterialModule } from '../../util/app-material.module';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-add-discount-dialog-component',
  templateUrl: './add-discount-dialog.component.html',
  imports: [AppMaterialModule, ReactiveFormsModule, TranslatePipe],
})
export class AddDiscountDialogComponent implements OnInit, OnDestroy {
  discountForm!: UntypedFormGroup;
  discount: FormControl<string | null> = new FormControl('', [
    Validators.required,
  ]);

  customerId: string;

  discounts: IUserDiscount[] = [];

  private getState: Observable<any>;
  private subscription?: Subscription;

  constructor(public dialogRef: MatDialogRef<AddDiscountDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              private store: Store<AppState>, private formBuilder: UntypedFormBuilder) {
    this.getState = this.store.select(selectDiscountState);
    this.customerId = data.customerId;
  }

  get onNoClick(): void {
    return this.dialogRef.close();
  }

  get doAction(): void {
    return this.dialogRef.close({ discountId: this.discount.value });
  }

  ngOnInit(): void {
    this.clean();
    this.createForm();
    this.subscribe();
    this.getDiscounts();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private createForm = (): void => {
    this.discountForm = this.formBuilder.group({
      discount: this.discount,
    });
  };

  private getDiscounts = (): void => this.store.dispatch(getUserDiscountByCustomerId({ customerId: this.customerId }));

  private clean = (): void => this.store.dispatch(clean());

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe((state) => this.discounts = state.data);
  };
}
