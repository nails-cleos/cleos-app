import { Component, Input } from '@angular/core';
import { IAccountAll } from '../../interfaces/account';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.scss']
})
export class BalanceComponent {
  @Input() account?: IAccountAll;
  @Input() showAdd?: boolean;
  @Input() showView?: boolean;

  get balancePercentage(): number {
    if (this.account) {
      if (this.account.balance > 2000) {
        return 100;
      }
      return this.account.balance * 100 / 2000;
    }
    return 0;
  }
}
