import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
  ɵTypedOrUntyped
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Expense, IExpense, IExpenseAll, ISupplyStore } from '../../../interfaces/expense';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { AppState, selectExpenseState } from '../../../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsExpense from '../../../store/expense.actions';
import { API_LOCALE, createNewDateZonedTime, getNowTimeZone } from '../../../util/dates';
import { fieldChange, noDuplicateDatesValidator } from '../../../util/validators';
import { map, startWith } from 'rxjs/operators';
import { SharedModule } from '../../../shared/shared.module';
import { TwoDigitsDirective } from '../../../directives/two-digits.directive';
import { BackButtonDirective } from '../../../directives/back-button.directive';

@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.scss'],
  imports: [SharedModule, TwoDigitsDirective, BackButtonDirective]
})
export class ExpenseComponent implements OnInit, OnDestroy {
  @Input() expense?: IExpenseAll;
  form!: UntypedFormGroup;
  id?: string;
  roomId: string | null = null;
  isAddMode: boolean;
  errors: any = [];
  types: any[] = [];
  currencyIcon?: string;
  roomName?: string;
  today: Date;
  supplyStores?: ISupplyStore[];
  filteredSupplyStore?: Observable<ISupplyStore[] | undefined>;
  totalMap: Map<number, { btwValue: string, net: string }> = new Map();

  private getState: Observable<any>;
  private subscription?: Subscription;
  private readonly language: string;

  constructor(private readonly translate: TranslateService, private store: Store<AppState>,
              private formBuilder: FormBuilder,
              private route: ActivatedRoute, private router: Router) {
    this.isAddMode = true;
    this.today = getNowTimeZone();
    this.getState = this.store.select(selectExpenseState);
    this.language = this.translate.currentLang;
  }

  get getForm(): ɵTypedOrUntyped<any, any, { [p: string]: AbstractControl<any> }> {
    return this.form.controls;
  }

  get totals(): FormArray {
    return this.getForm.totals as FormArray;
  }

  get isAddButtonDisabled(): boolean {
    if (this.totals.invalid) {
      return true;
    }

    return this.totals.controls.some(control => control.invalid || !control.get('btw')?.value);
  }

  get submit(): void {
    if (this.form.invalid) {
      return;
    }

    const expense: IExpense = new Expense();
    const supplyStore = fieldChange(this.getForm.supplyStore as UntypedFormControl, this.expense?.supplyStore);
    expense.invoice = fieldChange(this.getForm.invoice as UntypedFormControl, this.expense?.invoice);
    expense.supplyStoreString = supplyStore?.id ? supplyStore.id : supplyStore;
    expense.expenseTotals = this.totals.value;
    expense.date =
      createNewDateZonedTime(this.getForm.date.value, this.expense?.room?.timeZone).toLocaleString(API_LOCALE);

    if (this.isAddMode) {
      return this.store.dispatch(
        new fromActionsExpense.ExpenseSave({ roomId: this.roomId, expense })
      );
    } else {
      expense.id = this.id;
      return this.store.dispatch(
        new fromActionsExpense.ExpenseUpdate({ roomId: this.roomId, expense })
      );
    }
  }

  get removeSupplyStore(): void {
    return this.getForm.supplyStore.setValue('');
  }

  get totalGross(): number {
    return this.totals.controls
      .map(expense => expense.get('gross')?.value || 0)
      .reduce((acc, grossValue) => acc + parseFloat(grossValue || 0), 0);
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

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('expenseId');
    if (id) {
      this.id = id;
    }
    this.roomId = this.route.snapshot.paramMap.get('id');
    this.isAddMode = !this.id;
    this.createForm();
    this.subscribe();
    this.clean();
    this.getExpenseInfo();
    if (!this.isAddMode) {
      this.getExpense();
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  displayFnSupplyStore = (supplyStore: ISupplyStore): string => supplyStore ? `${ supplyStore.name }` : ''

  validateInputValue = (input: HTMLInputElement, index: number, min?: number, max?: number): void => {
    const id = input.id.replace(`${ index }`, '');
    const expense = this.totals.at(index)?.get(id);
    if (input.value) {
      this.errors[input.id] = null;
      const value = parseFloat(input.value);
      if (isNaN(value)) {
        expense?.setValue(null);
        return;
      }
      if (min != undefined && value < min) {
        this.errors[input.id] = this.translate.instant(`EXPENSE.${ input.id.toUpperCase() }.MIN`);
      } else if (max && value > max) {
        this.errors[input.id] = this.translate.instant(`EXPENSE.${ input.id.toUpperCase() }.MAX`);
      }

      if (this.errors[input.id]) {
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
      expense?.setValue(null);
    }
  }

  addDate = (): void => this.totals.push(this.createTotals());

  removeExpense = (index: number): void => this.totals.removeAt(index);

  private createForm = (): void => {
    this.form = this.formBuilder.group({
      invoice: ['', Validators.required],
      supplyStore: ['', Validators.required],
      date: ['', Validators.required],
      totals: this.formBuilder.array([this.createTotals()], noDuplicateDatesValidator('btw'))
    });

    this.filteredSupplyStore = this.getForm.supplyStore.valueChanges.pipe(startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(
        name => name ? this.filterSupplyStore(name) : this.supplyStores ? this.supplyStores.slice() : this.supplyStores)
    );
  }

  private createTotals = (type: string = '', gross: string = '', btw: string = '',
                          description: string = ''): FormGroup => {
    return this.formBuilder.group({
      type: [type, Validators.required],
      gross: [gross, Validators.required],
      description: [description],
      btw: [btw]
    });
  }

  private filterSupplyStore = (name: string): ISupplyStore[] | undefined => this.supplyStores?.filter(
    option => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0)

  private getExpenseInfo = (): void => this.store.dispatch(new fromActionsExpense.GetExpenseInfo(this.roomId));

  private getExpense = (): void => this.store.dispatch(
    new fromActionsExpense.ExpenseFind({ roomId: this.roomId, id: this.id })
  );

  private clean = (): void => {
    for (let i = this.totals.length - 1; i >= 0; i--) {
      this.removeExpense(i);
    }
    this.store.dispatch(
      new fromActionsExpense.Clean()
    );
  }

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe(state => {
      this.supplyStores = state.info?.supplyStores;
      this.types = state.info?.types;
      this.roomName = state.info?.roomName;
      this.currencyIcon = state.info?.currency?.icon;
      this.today = getNowTimeZone(state.info?.timeZone);
      this.expense = state.selected;
      if (this.expense?.id) {
        this.form.patchValue(this.expense);
        this.getForm.date.setValue(createNewDateZonedTime(this.expense.timestamp, this.expense.room?.timeZone));
        this.removeExpense(0);
        this.expense.expenseTotals.forEach((it, index) => {
          let btw = '';
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
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({ incorrect: true });
        });
      } else if (state.message) {
        this.router.navigate([this.language, 'rooms', this.roomId, 'expenses']);
      }
    });
  }
}
