import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IUser, IUserAll } from '../../interfaces/user';
import { combineLatestWith } from 'rxjs';
import { requireMatch } from '../../util/validators';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { map, startWith } from 'rxjs/operators';
import { cleanUser, getAllCustomers } from '../../store/actions/user.actions';
import { TranslatePipe } from '@ngx-translate/core';
import { UserState } from '../../store/reducers/user.reducers';
import { toSignal } from '@angular/core/rxjs-interop';
import { getAllCustomersPipe } from '../../store/selectors/user.selectors';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';

type ChangeCustomerForm = {
  customer: FormControl<IUserAll | undefined>,
}

type ChangeCustomerDialogData = {
  customerId: string,
  small: boolean;
}

@Component({
  selector: 'app-change-customer-dialog-component',
  templateUrl: './change-customer-dialog.component.html',
  imports: [MatFormField, MatLabel, MatInput, MatOption, MatIcon, MatButton, TranslatePipe, MatAutocomplete, MatError,
    MatAutocompleteTrigger, ReactiveFormsModule, MatDialogTitle, MatDialogContent, MatDialogActions],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeCustomerDialogComponent {
  private readonly store: Store<UserState> = inject(Store<UserState>);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly dialogRef: MatDialogRef<ChangeCustomerDialogComponent> = inject(
    MatDialogRef<ChangeCustomerDialogComponent>);
  readonly data = inject<ChangeCustomerDialogData>(MAT_DIALOG_DATA);

  private customers$ = this.store.pipe(getAllCustomersPipe);

  form: FormGroup<ChangeCustomerForm> = this.formBuilder.group<ChangeCustomerForm>({
    customer: this.formBuilder.control<IUserAll | undefined>(undefined, {
      validators: [Validators.required, requireMatch],
    }),
  });

  customersSignal = toSignal(this.customers$);
  filteredCustomerSignal = toSignal(
    this.getForm.customer.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.displayName),
      combineLatestWith(this.customers$),
      map(([name, customerList]) => {
        if (name) {
          return this.filterCustomer(name, customerList);
        } else {
          return customerList ? customerList.slice() : customerList;
        }
      }),
    ),
  );

  private customerId = computed(() => this.data.customerId);

  constructor() {
    effect(() => {
      this.customerId();
      this.store.dispatch(cleanUser());
      this.store.dispatch(getAllCustomers());
    });

    effect(() => {
      const customers = this.customersSignal();
      const customerId = this.customerId();
      this.getForm.customer.setValue(customers?.find(customer => customer.id === customerId));
    });
  }

  get getForm(): ChangeCustomerForm {
    return this.form.controls;
  }

  onNoClick() {
    this.dialogRef.close();
  }

  doAction() {
    this.dialogRef.close({ customerId: this.getForm.customer.value?.id });
  }

  displayFnUser = (user: IUser): string => user?.displayName ? user.displayName : '';

  keyDownHandler = (event: KeyboardEvent): void => {
    if (event.code === 'Backspace') {
      this.getForm.customer.setValue(undefined);
    }
  };

  private filterCustomer = (name: string, customers: IUserAll[]): IUserAll[] | undefined => customers?.filter(
    option => option.displayName?.toLowerCase().indexOf(name.toLowerCase()) === 0);

}
