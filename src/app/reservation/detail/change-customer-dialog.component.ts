import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { IUser, IUserAll } from '../../interfaces/user';
import { Observable, Subscription } from 'rxjs';
import { requireMatch } from '../../util/validators';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppState, selectUserState } from '../../store/app.states';
import { map, startWith } from 'rxjs/operators';
import * as fromActionsUser from '../../store/user.actions';
import { AppMaterialModule } from '../../util/app-material.module';
import { TranslatePipe } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';


@Component({
  selector: 'app-change-customer-dialog-component',
  templateUrl: './change-customer-dialog.component.html',
  imports: [AppMaterialModule, ReactiveFormsModule, TranslatePipe, AsyncPipe]
})
export class ChangeCustomerDialogComponent implements OnInit, OnDestroy {
  customerForm!: UntypedFormGroup;
  customers?: IUserAll[];
  filteredCustomer?: Observable<IUser[] | undefined>;
  customer: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, requireMatch
  ]);

  private getState: Observable<any>;
  private subscription?: Subscription;

  constructor(public dialogRef: MatDialogRef<ChangeCustomerDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              private store: Store<AppState>, private formBuilder: UntypedFormBuilder) {
    this.getState = this.store.select(selectUserState);
  }

  get onNoClick(): void {
    return this.dialogRef.close();
  }

  get doAction(): void {
    return this.dialogRef.close({ customerId: this.customer.value.id });
  }

  ngOnInit(): void {
    this.clean();
    this.createForm();
    this.createFilters();
    this.subscribe();
    this.getCustomers();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  displayFnUser = (user: IUser): string => user?.displayName ? user.displayName : '';

  keyDownHandler = (event: any): void => {
    if (event.code === 'Backspace') {
      this.customer.setValue('');
    }
  };

  private createForm = (): void => {
    this.customerForm = this.formBuilder.group({
      customer: this.customer
    });
  };

  private createFilters = (): void => {
    this.filteredCustomer = this.customer.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterCustomer(name) : this.customers ? this.customers.slice() : this.customers)
    );
  };

  private filterCustomer = (name: string): IUser[] | undefined => this.customers?.filter(
    option => option.displayName?.toLowerCase().indexOf(name.toLowerCase()) === 0);

  private getCustomers = (): void => this.store.dispatch(new fromActionsUser.GetAllCustomers());

  private clean = (): void => this.store.dispatch(new fromActionsUser.Clean());

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe(state => {
      this.customers = state.data;
      this.customer.setValue(this.customers?.find(customer => customer.id === this.data.customerId));
    });
  };

}
