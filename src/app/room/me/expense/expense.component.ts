import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, UntypedFormControl, UntypedFormGroup, Validators, ɵTypedOrUntyped } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Expense, IExpense, IExpenseAll } from '../../../interfaces/expense';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { AppState, selectExpenseState } from '../../../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsExpense from '../../../store/expense.actions';
import { API_LOCALE, getNow, getNowTimeZone, newDateTimestamp } from '../../../util/dates';
import { fieldChange } from '../../../util/validators';

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
  btw: string;
  currencyIcon?: string;
  roomName?: string;
  today: Date;

  private getState: Observable<any>;
  private subscription?: Subscription;

  constructor(private readonly translate: TranslateService, private store: Store<AppState>, private formBuilder: FormBuilder,
              private route: ActivatedRoute, private router: Router) {
    this.isAddMode = true;
    this.net = '';
    this.btw = '';
    this.today = getNow();
    this.getState = this.store.select(selectExpenseState);
  }

  get getForm(): ɵTypedOrUntyped<any, any, { [p: string]: AbstractControl<any> }> {
    return this.form.controls;
  }

  get submit(): void {
    if (this.form.invalid) {
      return;
    }

    const expense: IExpense = new Expense();
    expense.invoice = fieldChange(this.getForm.invoice as UntypedFormControl, this.expense?.invoice);
    expense.storeSupply = fieldChange(this.getForm.storeSupply as UntypedFormControl, this.expense?.storeSupply);
    expense.description = fieldChange(this.getForm.description as UntypedFormControl, this.expense?.description);
    expense.gross = fieldChange(this.getForm.gross as UntypedFormControl, this.expense?.gross?.toFixed(2));
    expense.btw = fieldChange(this.getForm.btw21 as UntypedFormControl, this.expense?.btw?.toFixed(2));
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

  validateInputValue(input: HTMLInputElement, min?: number, max?: number): void {
    if (input.value) {
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
          if (this.getForm.btw21.value) {
            const btw21 = parseFloat(this.getForm.btw21.value);
            this.net = (gross / (btw21 + 100) * 100).toFixed(2);
          } else {
            this.net = this.getForm.gross.value;
          }
          this.btw = (gross - parseFloat(this.net)).toFixed(2);
        }
      }
    } else {
      this.getForm[input.id].setValue(null);
    }
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
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
          this.getForm.btw21.setValue(this.expense.btw.toFixed(2));
          this.net = (this.expense.gross / (this.expense.btw + 100) * 100).toFixed(2);
        } else {
          this.net = this.expense.gross.toFixed(2);
        }
        this.btw = (this.expense.gross - parseFloat(this.net)).toFixed(2);
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({ incorrect: true });
        });
      } else if (state.message) {
        this.router.navigate(['rooms', this.roomId, 'expenses']);
      }
    });
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      invoice: ['', Validators.required],
      storeSupply: ['', Validators.required],
      description: [''],
      gross: ['', Validators.required],
      btw21: [''],
      date: ['', Validators.required],
      type: ['', Validators.required]
    });
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
