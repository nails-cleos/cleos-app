import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ExpenseComponent } from './expense.component';

@Component({
  selector: 'app-expense-details-page',
  template: '<app-expense [id]="id()" [expenseId]="expenseId()" />',
  imports: [ExpenseComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseDetailsPageComponent {
  id = input<string>();
  expenseId = input<string>();
}
