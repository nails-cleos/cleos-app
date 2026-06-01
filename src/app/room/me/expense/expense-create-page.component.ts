import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ExpenseComponent } from './expense.component';

@Component({
  selector: 'app-expense-create-page',
  template: '<app-expense [id]="id()" />',
  imports: [ExpenseComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseCreatePageComponent {
  id = input<string>();
}
