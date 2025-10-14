import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AppMaterialModule } from '../../util/app-material.module';
import { TranslatePipe } from '@ngx-translate/core';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable, Subscription } from 'rxjs';
import { IUser, IUserAll } from '../../interfaces/user';
import { DiscountType, IDiscountAll } from '../../interfaces/discount';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppState, selectUserState } from '../../store/app.states';
import { map, startWith } from 'rxjs/operators';
import { currencySymbol } from '../../util/helper';
import { clean, getAllCustomers } from '../../store/user.actions';

@Component({
  selector: 'app-discount-dialog-component',
  templateUrl: './discount-dialog.component.html',
  styleUrls: ['./discount-dialog.component.scss'],
  imports: [AppMaterialModule, TranslatePipe, ReactiveFormsModule, AsyncPipe],
})
export class DiscountDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('customerInput') customerInput!: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete!: MatAutocomplete;

  title?: string;
  customerCtrl = new UntypedFormControl();
  filteredCustomers?: Observable<IUser[] | undefined>;
  customers: IUserAll[] = [];
  allCustomers?: IUserAll[];

  private getState: Observable<any>;
  private subscription?: Subscription;
  private discount: IDiscountAll;

  constructor(public dialogRef: MatDialogRef<DiscountDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
    private store: Store<AppState>, private cdRef: ChangeDetectorRef) {
    this.getState = this.store.select(selectUserState);
    this.discount = data.discount;
    this.setSymbol();
  }

  ngOnInit(): void {
    this.clean();
    this.subscribe();
    this.getCustomers();
    this.filteredCustomers = this.customerCtrl.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value ? value.name : ''),
      map(name => name ? this.filter(name) : (this.allCustomers ? this.allCustomers.slice() : this.allCustomers)),
    );
  }

  ngAfterViewInit(): void {
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onNoClick(): void {
    return this.dialogRef.close();
  }

  doAction(): void {
    const customerIds = this.customers.map(({ id }) => id);
    return this.dialogRef.close({ discountId: this.discount.id, customerIds });
  }

  remove = (customer: IUserAll): void => {
    const index = this.customers.indexOf(customer);
    if (index >= 0) {
      this.customers.splice(index, 1);
      this.allCustomers?.push(customer);
      this.customerCtrl.setValue(null);
    }
  };

  selected = (event: MatAutocompleteSelectedEvent): void => {
    const customer = event.option.value;
    this.customers.push(customer);
    this.allCustomers = this.allCustomers?.filter(c => c.id !== customer.id);
    this.customerInput.nativeElement.value = '';
    this.customerCtrl.setValue(null);
  };

  sortCustomers = (data: any): IUser[] => data.sort((a: any, b: any) => {
    const aName = a.displayName?.toUpperCase();
    const bName = b.displayName?.toUpperCase();
    return (aName > bName) ? 1 : ((bName > aName) ? -1 : 0);
  });

  private setSymbol = (): void => {
    this.title = this.discount.name;
    switch (this.discount.type) {
      case DiscountType.money:
        this.title = `${ currencySymbol(this.discount.currency) } ${ this.discount.amount } ${ this.title }`;
        break;
      case DiscountType.percentage:
        this.title = `${ this.discount.amount } % ${ this.title }`;
        break;
    }
  };

  private getCustomers = (): void => this.store.dispatch(getAllCustomers());

  private clean = (): void => this.store.dispatch(clean());

  private filter = (name: string): IUserAll[] | undefined => this.allCustomers?.filter(
    option => option.displayName?.toLowerCase().indexOf(name.toLowerCase()) === 0);

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe((state) => {
      this.allCustomers = state.data;
      this.customerCtrl.setValue(null);
    });
  };
}
