import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IAccountAll } from '../../interfaces/account';
import { TranslatePipe } from '@ngx-translate/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.scss'],
  imports: [
    TranslatePipe,
    CurrencyPipe,
    RouterLink,
    MatButton,
    MatIcon,
    MatProgressSpinner,
  ],
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
