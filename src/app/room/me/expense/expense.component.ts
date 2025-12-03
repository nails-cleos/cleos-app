import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Expense, IExpense, ISupplyStore, ITotalExpense } from '../../../interfaces/expense';
import { TranslateService } from '@ngx-translate/core';
import { combineLatestWith } from 'rxjs';
import { Store } from '@ngrx/store';
import { createExpense, getAllExpensesInfo, getExpense, updateExpense } from '../../../store/expense.actions';
import { API_LOCALE, createNewDateZonedTime, getNowTimeZone } from '../../../util/dates';
import { fieldChange, noDuplicateDatesValidator } from '../../../util/validators';
import { map, startWith } from 'rxjs/operators';
import { SharedModule } from '../../../shared/shared.module';
import { TwoDigitsDirective } from '../../../directives/two-digits.directive';
import { BackButtonDirective } from '../../../directives/back-button.directive';
import { ExpenseState } from '../../../store/reducers/expense.reducers';
import { RoomState } from '../../../store/reducers/room.reducers';
import { getColorResponsePipe, getSubErrorsPipe } from '../../../store/selectors/color.selectors';
import {
  getCurrentExpenseIdPipe,
  getInfoPipe,
  getSelectedExpensePipe,
} from '../../../store/selectors/expense.selectors';
import { getCurrentRoomIdPipe } from '../../../store/selectors/room.selectors';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { IError } from '../../../interfaces/common';

type TotalsForm = {
  type: FormControl<string>;
  gross: FormControl<string>;
  btw: FormControl<string>;
  description: FormControl<string>;
}

type ExpenseForm = {
  invoice: FormControl<string>;
  supplyStore: FormControl<string | ISupplyStore>;
  date: FormControl<Date | undefined>;
  totals: FormArray;
}

@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.scss'],
  imports: [SharedModule, TwoDigitsDirective, BackButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseComponent {
  private readonly store: Store<ExpenseState | RoomState> = inject(Store<ExpenseState | RoomState>);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly router: Router = inject(Router);
  private readonly translate: TranslateService = inject(TranslateService);

  private roomId$ = this.store.pipe(getCurrentRoomIdPipe);
  private expenseId$ = this.store.pipe(getCurrentExpenseIdPipe);
  private selectedExpense$ = this.store.pipe(getSelectedExpensePipe);
  private info$ = this.store.pipe(getInfoPipe);
  private subErrors$ = this.store.pipe(getSubErrorsPipe);
  private response$ = this.store.pipe(getColorResponsePipe);

  private expenseIdSignal = toSignal(this.expenseId$);
  private roomIdSignal = toSignal(this.roomId$);
  private infoSignal = toSignal(this.info$);
  private subErrorsSignal = toSignal(this.subErrors$);
  private responseSignal = toSignal(this.response$);

  expenseSignal = toSignal(this.selectedExpense$);
  isAddModeSignal = computed(() => !this.expenseIdSignal());
  errors = signal<Record<string, unknown>>({});

  form: FormGroup<ExpenseForm> = this.formBuilder.group<ExpenseForm>({
    invoice: this.formBuilder.control('', {
      validators: [Validators.required],
    }),
    supplyStore: this.formBuilder.control('', {
      validators: [Validators.required],
    }),
    date: this.formBuilder.control(undefined, {
      validators: [Validators.required],
    }),
    totals: this.formBuilder.array<FormGroup<TotalsForm>>([], { validators: [noDuplicateDatesValidator('btw')] }),
  });

  createAnother: boolean = false;
  types = computed(() => this.infoSignal()?.types || []);
  currencyIcon = computed(() => this.infoSignal()?.currency?.icon || '');
  roomName = computed(() => this.infoSignal()?.roomName || '');
  supplyStores = computed(() => this.infoSignal()?.supplyStores || []);
  today = computed(() => getNowTimeZone(this.timeZone()));

  filteredSupplyStore = toSignal(
    this.getForm.supplyStore.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.name),
      combineLatestWith(toObservable(this.supplyStores)),
      map(([name, supplyStores]) => {
        if (name) {
          return this.filterSupplyStore(name, supplyStores);
        } else {
          return supplyStores ? supplyStores.slice() : supplyStores;
        }
      }),
    ),
  );

  totalMap: Map<number, { btwValue: string, net: string }> = new Map();

  private timeZone = computed(() => this.infoSignal()?.timeZone || '');

  private readonly language: string = this.translate.currentLang;

  constructor() {
    effect(() => {
      const selected = this.expenseSignal();
      if (selected?.id) {
        this.form.patchValue(selected);
        this.getForm.date.setValue(createNewDateZonedTime(selected.timestamp, selected.room?.timeZone));
        this.removeExpense(0);
        selected.expenseTotals.forEach((it, index) => {
          let btw = '0';
          const total = { net: '', btwValue: '' };
          if (it.btw !== undefined) {
            btw = it.btw.toFixed(2);
            total.net = (it.gross / (it.btw + 100) * 100).toFixed(2);
          } else {
            total.net = it.gross.toFixed(2);
          }
          this.totals.push(this.createTotals(it.type, it.gross.toFixed(2), btw, it.description));
          total.btwValue = (it.gross - parseFloat(total.net)).toFixed(2);
          this.totalMap.set(index, total);
        });
      }
    });

    effect(() => {
      const subErrors = this.subErrorsSignal();
      if (subErrors) {
        const errorMap: Record<string, unknown> = {};
        subErrors.forEach((error: IError) => {
          const field = error.field as keyof ExpenseForm | undefined;

          if (field && field in this.form.controls) {
            errorMap[field] = error.message;
            this.form.controls[field].setErrors({ incorrect: true });
          }
        });
        this.errors.set(errorMap);
      }
    });

    effect(() => {
      const roomId = this.roomIdSignal();
      if (this.responseSignal()) {
        if (this.isAddModeSignal() && this.createAnother) {
          this.form.reset();
          this.form.markAsPristine({ emitEvent: false });
          this.form.markAsUntouched({ emitEvent: false });
          this.totals.clear();
          this.totals.controls.forEach(control => {
            control.markAsPristine({ emitEvent: false });
            control.markAsUntouched({ emitEvent: false });
          });
          this.totalMap = new Map();
        } else {
          this.router.navigate([this.language, 'rooms', roomId, 'expenses']);
        }
      }
    });

    effect(() => {
      const id = this.expenseIdSignal();
      const roomId = this.roomIdSignal();
      if (roomId) {
        this.store.dispatch(getAllExpensesInfo({ roomId }));
        if (id) {
          this.store.dispatch(getExpense({ roomId, id }));
        }
      }
    });
  }

  get getForm(): ExpenseForm {
    return this.form.controls;
  }

  get totals(): FormArray<FormGroup<TotalsForm>> {
    return this.getForm.totals;
  }

  get isAddButtonDisabled(): boolean {
    if (this.totals.invalid) {
      return true;
    }

    return this.totals.controls.some(control => {
      return control.invalid;
    });
  }

  submit() {
    const date = this.getForm.date.value;
    const roomId = this.roomIdSignal();
    if (this.form.invalid || !roomId || !date) {
      return;
    }

    const expenseSignal = this.expenseSignal();
    const expense: IExpense = new Expense();
    const supplyStore = fieldChange(this.getForm.supplyStore, expenseSignal?.supplyStore);
    expense.invoice = fieldChange(this.getForm.invoice, expenseSignal?.invoice);
    expense.supplyStoreString = supplyStore?.id ? supplyStore.id : supplyStore;
    expense.expenseTotals = this.totals.getRawValue() as unknown as ITotalExpense[];
    expense.date = createNewDateZonedTime(date, expenseSignal?.room?.timeZone).toLocaleString(API_LOCALE);

    if (this.isAddModeSignal()) {
      this.store.dispatch(createExpense({ roomId, expense }));
    } else {
      const id = this.expenseIdSignal()!;
      this.store.dispatch(updateExpense({ id, roomId, expense }));
    }
  }

  removeSupplyStore() {
    this.getForm.supplyStore.setValue('');
  }

  get totalGross(): number {
    return this.totals.controls
      .map(expense => expense.value.gross || '0')
      .reduce((acc, grossValue) => acc + parseFloat(grossValue), 0);
  }

  get totalBTW(): number {
    return Array.from(this.totalMap.values())
      .map(total => parseFloat(total.btwValue) || 0)
      .reduce((acc, btw) => acc + btw, 0);
  }

  get totalNet(): number {
    return Array.from(this.totalMap.values())
      .map(total => parseFloat(total.net) || 0)
      .reduce((acc, btw) => acc + btw, 0);
  }

  displayFnSupplyStore = (supplyStore: ISupplyStore): string => supplyStore ? `${supplyStore.name}` : '';

  validateInputValue = (input: HTMLInputElement, index: number, min?: number, max?: number): void => {
    const id = input.id.replace(`${index}`, '');
    const expense = this.totals.at(index)?.get(id);
    if (input.value) {
      this.errors.update(prev => {
        prev[input.id] = null;
        return prev;
      });
      const value = parseFloat(input.value);
      if (isNaN(value)) {
        expense?.setValue(null);
        return;
      }
      const EXPENSE = this.translate.instant('EXPENSE');
      if (min !== undefined && value < min) {
        this.errors.update(prev => {
          prev[input.id] = EXPENSE[id.toUpperCase()].MIN;
          return prev;
        });
      } else if (max && value > max) {
        this.errors.update(prev => {
          prev[input.id] = EXPENSE[id.toUpperCase()].MAX;
          return prev;
        });
      }

      if (this.errors()[input.id]) {
        expense?.setValue('');
        expense?.setErrors({ incorrect: true });
      } else {
        expense?.setValue(value.toFixed(2));
        const grossValue = this.totals.at(index)?.get('gross')?.value;
        if (grossValue) {
          const btwValue = this.totals.at(index)?.get('btw')?.value;
          const gross = parseFloat(grossValue);
          const total = this.totalMap.get(index) ?? { net: '', btwValue: '' };
          if (btwValue) {
            const btw = parseFloat(btwValue);
            total.net = (gross / (btw + 100) * 100).toFixed(2);
          } else {
            total.net = grossValue;
          }
          total.btwValue = (gross - parseFloat(total.net)).toFixed(2);
          this.totalMap.set(index, total);
        }
      }
    } else {
      expense?.setValue(undefined);
    }
  };

  addDate = (): void => this.totals.push(this.createTotals());

  removeExpense = (index: number): void => this.totals.removeAt(index);

  private createTotals = (
    type: string = '',
    gross: string = '',
    btw: string = '',
    description: string = '',
  ): FormGroup => {
    return this.formBuilder.group({
      type: [type, [Validators.required]],
      gross: [gross, [Validators.required]],
      btw: [btw, [Validators.required]],
      description: [description],
    });
  };

  private filterSupplyStore = (
    name: string,
    supplyStores: ISupplyStore[],
  ): ISupplyStore[] | undefined => supplyStores?.filter(
    option => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0);
}
