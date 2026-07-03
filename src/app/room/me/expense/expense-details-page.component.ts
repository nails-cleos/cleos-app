import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { ExpenseComponent } from './expense.component';
import { ExpenseStore } from '../../../store/expense.store';
import { IExpense } from './expense';
import { ICommon } from '../../../interfaces/common';
import { SkeletonComponent } from '../../../shared/skeleton/skeleton.component';

@Component({
  selector: 'app-expense-details-page',
  template: `
    @if (expense(); as expense) {
      <app-expense [roomId]="id()" [expense]="expense" [config]="config" (submitData)="submit($event)"/>
    } @else {
      <app-skeleton [lines]="0" [boxes]="3"/>
    }
  `,
  imports: [ExpenseComponent, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseDetailsPageComponent {
  id = input.required<string>();
  expenseId = input.required<string>();

  config: ICommon = {
    title: 'EXPENSE.DETAIL',
    button: { icon: 'published_with_changes', label: 'COMMON.BUTTON.UPDATE' },
  };

  private readonly expenseStore = inject(ExpenseStore);
  expense = computed(() => this.expenseStore.selected());

  constructor() {
    effect(() => {
      this.expenseStore.clean();
      this.expenseStore.loadById(this.id(), this.expenseId());
    });
  }

  submit(data: { expense: IExpense, file?: File }) {
    this.expenseStore.update(this.expenseId(), this.id(), data.expense, data.file);
  }
}
