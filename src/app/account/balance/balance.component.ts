import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IAccountAll } from '../../interfaces/account';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.scss'],
  imports: [SharedModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BalanceComponent {
  account = input<IAccountAll>();
  showAdd = input<boolean>();
  showView = input<boolean>();
  showUser = input<boolean>();
  language = input.required<string>();

  get balancePercentage(): number {
    const account = this.account();
    if (!account) {
      return 0;
    }
    return account.balance > 2000 ? 100 : (account.balance * 100) / 2000;
  }
}
