import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, UntypedFormControl, UntypedFormGroup, Validators, ɵTypedOrUntyped } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Expense, IExpense, IExpenseAll, ISupplyStore } from '../../../interfaces/expense';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { AppState, selectExpenseState } from '../../../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsExpense from '../../../store/expense.actions';
import { API_LOCALE, getNow, getNowTimeZone, newDateTimestamp } from '../../../util/dates';
import { fieldChange } from '../../../util/validators';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.scss']
})
export class ExpenseComponent implements OnInit, OnDestroy {
  @Input() expense?: IExpenseAll;
  form!: UntypedFormGroup;
  id?: string;
  roomId: string | null = null;
  isAddMode: boolean;
  errors: any = [];
  types: any[] = [];
  net: string;
  btwValue: string;
  currencyIcon?: string;
  roomName?: string;
  today: Date;
  supplyStores?: ISupplyStore[];
  filteredSupplyStore?: Observable<ISupplyStore[] | undefined>;

  private getState: Observable<any>;
  private subscription?: Subscription;
  private readonly language: string;

  constructor(private readonly translate: TranslateService, private store: Store<AppState>, private formBuilder: FormBuilder,
              private route: ActivatedRoute, private router: Router) {
    this.isAddMode = true;
    this.net = '';
    this.btwValue = '';
    this.today = getNow();
    this.getState = this.store.select(selectExpenseState);
    this.language = this.translate.currentLang;
  }

  get getForm(): ɵTypedOrUntyped<any, any, { [p: string]: AbstractControl<any> }> {
    return this.form.controls;
  }

  get submit(): void {
    if (this.form.invalid) {
      return;
    }

    const expense: IExpense = new Expense();
    const supplyStore = fieldChange(this.getForm.supplyStore as UntypedFormControl, this.expense?.supplyStore);
    expense.invoice = fieldChange(this.getForm.invoice as UntypedFormControl, this.expense?.invoice);
    expense.supplyStore = supplyStore?.id ? supplyStore.id : supplyStore;
    expense.description = fieldChange(this.getForm.description as UntypedFormControl, this.expense?.description);
    expense.gross = fieldChange(this.getForm.gross as UntypedFormControl, this.expense?.gross?.toFixed(2));
    expense.btw = fieldChange(this.getForm.btw as UntypedFormControl, this.expense?.btw?.toFixed(2));
    expense.type = fieldChange(this.getForm.type as UntypedFormControl, this.expense?.type);
    expense.date = this.getForm.date.value.toLocaleString(API_LOCALE);

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

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('expenseId');
    if (id) {
      this.id = id;
    }
    this.roomId = this.route.snapshot.paramMap.get('id');
    this.isAddMode = !this.id;
    this.createForm();
    this.subscribe();
    this.getExpenseInfo();
    if (!this.isAddMode) {
      this.getExpense();
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  displayFnSupplyStore(supplyStore: ISupplyStore): string {
    return supplyStore ? `${ supplyStore.name }` : '';
  }

  validateInputValue(input: HTMLInputElement, min?: number, max?: number): void {
    if (input.value) {
      this.errors[input.id] = null;
      const value = parseFloat(input.value);
      if (isNaN(value)) {
        this.getForm[input.id].setValue(null);
        return;
      }
      if (min && value < min) {
        this.errors[input.id] = this.translate.instant(`EXPENSE.${ input.id.toUpperCase() }.MIN`);
      } else if (max && value > max) {
        this.errors[input.id] = this.translate.instant(`EXPENSE.${ input.id.toUpperCase() }.MAX`);
      }

      if (this.errors[input.id]) {
        this.getForm[input.id].setValue('');
        this.getForm[input.id].setErrors({ incorrect: true });
      } else {
        this.getForm[input.id].setValue(value.toFixed(2));
        if (this.getForm.gross.value) {
          const gross = parseFloat(this.getForm.gross.value);
          if (this.getForm.btw.value) {
            const btw = parseFloat(this.getForm.btw.value);
            this.net = (gross / (btw + 100) * 100).toFixed(2);
          } else {
            this.net = this.getForm.gross.value;
          }
          this.btwValue = (gross - parseFloat(this.net)).toFixed(2);
        }
      }
    } else {
      this.getForm[input.id].setValue(null);
    }
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.supplyStores = state.info?.supplyStores;
      this.types = state.info?.types;
      this.roomName = state.info?.roomName;
      this.currencyIcon = state.info?.currency?.icon;
      this.today = getNowTimeZone(state.info?.timeZone);
      this.expense = state.selected;
      if (this.expense?.id) {
        this.form.patchValue(this.expense);
        this.getForm.date.setValue(newDateTimestamp(this.expense.timestamp, this.expense.room?.timeZone));
        this.getForm.gross.setValue(this.expense.gross.toFixed(2));
        if (this.expense.btw) {
          this.getForm.btw.setValue(this.expense.btw.toFixed(2));
          this.net = (this.expense.gross / (this.expense.btw + 100) * 100).toFixed(2);
        } else {
          this.net = this.expense.gross.toFixed(2);
        }
        this.btwValue = (this.expense.gross - parseFloat(this.net)).toFixed(2);
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

  private createForm(): void {
    this.form = this.formBuilder.group({
      invoice: ['', Validators.required],
      supplyStore: ['', Validators.required],
      description: [''],
      gross: ['', Validators.required],
      btw: [''],
      date: ['', Validators.required],
      type: ['', Validators.required]
    });

    this.filteredSupplyStore = this.getForm.supplyStore.valueChanges.pipe(startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterSupplyStore(name) : this.supplyStores ? this.supplyStores.slice() : this.supplyStores)
    );
  }

  private filterSupplyStore(name: string): ISupplyStore[] | undefined {
    const filterValue = name.toLowerCase();

    return this.supplyStores?.filter(option => option.name?.toLowerCase().indexOf(filterValue) === 0);
  }

  private getExpenseInfo(): void {
    this.store.dispatch(
      new fromActionsExpense.GetExpenseInfo(this.roomId)
    );
  }

  private getExpense(): void {
    this.store.dispatch(
      new fromActionsExpense.ExpenseFind({ roomId: this.roomId, id: this.id })
    );
  }
}
