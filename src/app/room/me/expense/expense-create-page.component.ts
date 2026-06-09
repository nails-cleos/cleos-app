import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ExpenseComponent } from './expense.component';
import { ExpenseStore } from '../../../store/expense.store';
import { IExpense } from './expense';
import { ICommon } from '../../../interfaces/common';

@Component({
  selector: 'app-expense-create-page',
  template: '<app-expense [config]="config" (submitData)="submit($event)"/>',
  imports: [ExpenseComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseCreatePageComponent {
  id = input.required<string>();
  private readonly expenseStore = inject(ExpenseStore);
  config: ICommon = {
    title: 'COLOR.TITLE',
    button: { icon: 'add_shopping_cart', label: 'COMMON.BUTTON.CREATE' },
  };

  constructor() {
    this.expenseStore.clean();
  }

  submit(data: { expense: IExpense, file?: File }) {
    if (data.file) {
      this.expenseStore.create(this.id(), data.expense, data.file);
    }
  }
}
