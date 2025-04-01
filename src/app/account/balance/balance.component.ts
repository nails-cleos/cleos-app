import { Component, Input } from '@angular/core';
import { IAccountAll } from '../../interfaces/account';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.scss'],
  imports: [SharedModule]
})
export class BalanceComponent {
  @Input() account?: IAccountAll;
  @Input() showAdd?: boolean;
  @Input() showView?: boolean;
  @Input() showUser?: boolean;
  @Input() language!: string;

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
