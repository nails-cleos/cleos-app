import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  signal,
  Signal,
  viewChild,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { combineLatestWith } from 'rxjs';
import { IUserAll } from '../../user/user';
import { DiscountType, IDiscountAll } from '../discount';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { map, startWith } from 'rxjs/operators';
import { currencySymbol } from '../../util/helper';
import { cleanUser, getAllCustomers } from '../../store/actions/user.actions';
import { getAllCustomersPipe } from '../../store/selectors/user.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserState } from '../../store/reducers/user.reducers';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatChipGrid, MatChipInput, MatChipRow } from '@angular/material/chips';

export type DiscountDialogData = {
  discount: IDiscountAll;
};

type DiscountDialogForm = {
  customers: FormControl<IUserAll[] | undefined>;
};

@Component({
  selector: 'app-discount-dialog-component',
  templateUrl: './discount-dialog.component.html',
  styleUrls: ['./discount-dialog.component.scss'],
  imports: [MatFormField, MatLabel, MatInput, MatOption, MatIcon, MatButton, TranslatePipe, MatAutocomplete,
    MatAutocompleteTrigger, TranslatePipe, ReactiveFormsModule, MatChipGrid, MatDialogContent, MatDialogTitle,
    MatChipRow, MatChipInput, MatDialogActions],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscountDialogComponent {
  private readonly store: Store<UserState> = inject(Store<UserState>);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly dialogRef = inject(MatDialogRef<DiscountDialogComponent>);
  private readonly data = inject<DiscountDialogData>(MAT_DIALOG_DATA);

  private allCustomers$ = this.store.pipe(getAllCustomersPipe);
  private allCustomersSignal = toSignal(this.allCustomers$);

  form: FormGroup<DiscountDialogForm> = this.formBuilder.group<DiscountDialogForm>({
    customers: this.formBuilder.control(undefined),
  });

  filteredCustomerSignal: Signal<IUserAll[] | undefined> = toSignal(
    this.getForm.customers.valueChanges.pipe(
      startWith('' as string),
      map((value: any) => !value || typeof value === 'string' ? value : value.name),
      combineLatestWith(this.allCustomers$),
      map(([name, customers]) => {
        if (!customers) {
          return [];
        }

        return name ? this.filter(name, customers) : customers.slice();
      })),
  );

  selectedCustomersSignal = signal<IUserAll[]>([]);
  allCustomersWritableSignal = signal<IUserAll[] | undefined>(undefined);

  customerInput = viewChild.required<ElementRef<HTMLInputElement>>('customerInput');

  title?: string;

  constructor() {
    this.setSymbol();

    this.store.dispatch(cleanUser());
    this.store.dispatch(getAllCustomers());

    const initial = this.allCustomersSignal();
    this.allCustomersWritableSignal.set(initial ? [...initial] : []);

    effect(() => {
      const customers = this.allCustomersSignal();
      if (!customers) {
        return;
      }

      this.allCustomersWritableSignal.set(customers);
    });
  }

  get getForm(): DiscountDialogForm {
    return this.form.controls;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  doAction(): void {
    const customerIds = this.selectedCustomersSignal().map(({ id }) => id);
    this.dialogRef.close({
      discountId: this.data.discount.id,
      customerIds,
    });
  }

  remove = (customer: IUserAll): void => {
    this.selectedCustomersSignal.update((current) =>
      current.filter((c) => c.id !== customer.id));

    this.allCustomersWritableSignal.update((current) =>
      current ? [...current, customer] : [customer]);

    this.getForm.customers.setValue(undefined);
  };

  selected = (event: MatAutocompleteSelectedEvent): void => {
    const customer = event.option.value as IUserAll;

    this.selectedCustomersSignal.update((current) => [...current, customer]);

    this.allCustomersWritableSignal.update((current) =>
      current?.filter((c) => c.id !== customer.id));

    if (this.customerInput()) {
      this.customerInput().nativeElement.value = '';
    }
    this.getForm.customers.setValue(undefined);
  };

  sortCustomers = (data?: IUserAll[]): IUserAll[] | undefined =>
    data?.sort((a: IUserAll, b: IUserAll) => {
      const aName = a.displayName.toUpperCase();
      const bName = b.displayName.toUpperCase();
      return aName.localeCompare(bName);
    });

  private setSymbol = (): void => {
    const discount = this.data.discount;
    this.title = discount.name;

    switch (discount.type) {
      case DiscountType.money:
        this.title = `${currencySymbol(discount.currency)} ${discount.amount} ${this.title}`;
        break;

      case DiscountType.percentage:
        this.title = `${discount.amount}% ${this.title}`;
        break;
    }
  };

  private filter = (name: string, allCustomers: IUserAll[]): IUserAll[] =>
    allCustomers.filter((option) =>
      option.displayName?.toLowerCase().startsWith(name.toLowerCase()));
}
