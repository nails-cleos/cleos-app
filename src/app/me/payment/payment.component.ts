import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { IPayment, IPaymentAll } from '@app/interfaces/payment';
import { TranslatePipe } from '@ngx-translate/core';
import { MatPrefix } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { DecimalPipe } from '@angular/common';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatFooterCell,
  MatFooterCellDef,
  MatFooterRow,
  MatFooterRowDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import {
  TableSkeletonColumn,
  TableSkeletonComponent,
} from '@app/shared/skeleton/table-skeleton.component';
import { NavigationService } from '@app/services/navigation.service';
import { PaymentStore } from '@app/store/payment.store';
import { BackButtonDirective } from '@app/directives/back-button.directive';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  imports: [
    MatIcon,
    MatIconButton,
    TranslatePipe,
    DecimalPipe,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatTooltip,
    MatFooterCellDef,
    MatFooterCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatFooterRow,
    MatFooterRowDef,
    MatPrefix,
    MatButton,
    TableSkeletonComponent,
    BackButtonDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentComponent {
  path = input<'reservation' | 'transaction'>();
  id = input<string>();
  accountId = input<string>();

  private readonly paymentStore = inject(PaymentStore);
  private readonly navigationService: NavigationService =
    inject(NavigationService);

  private readonly loadingSignal = this.paymentStore.isLoading;
  private readonly paymentResource = this.paymentStore.data;
  private readonly subErrorsSignal = this.paymentStore.subErrors;
  private readonly responseSignal = this.paymentStore.response;

  dataSourceSignal = computed(() => this.paymentResource()?.payments);
  isLoading = computed(() => this.loadingSignal());
  hiddenSignal = computed(() => {
    const list = this.dataSourceSignal();
    return !!list?.length;
  });

  tableColumns: TableSkeletonColumn[] = [
    { key: 'position' },
    { key: 'description' },
    { key: 'type' },
    { key: 'amount' },
    { key: 'status', hideOnMobile: true },
    { key: 'actions' },
  ];
  displayedColumns: string[] = this.tableColumns.map((column) => column.key);

  errorMessage?: string;
  showError = false;

  constructor() {
    this.paymentStore.clean();
    effect(() => {
      const path = this.path();
      const id = this.id();
      if (path && id) {
        this.paymentStore.getPaymentByResourceId(id, path);
      }
    });

    effect(() => {
      const response = this.responseSignal();
      if (response?.path) {
        this.paymentStore.clearResponse();
        this.navigationService.navigate([response.path]);
      }
    });

    effect(() => {
      const subErrors = this.subErrorsSignal();
      if (subErrors?.length) {
        const errorMessage = subErrors[0].message;
        if (errorMessage) {
          this.errorMessage = errorMessage;
          this.showError = true;
        }
      }
    });
  }

  close(): void {
    this.showError = false;
  }

  pay = (payment: IPaymentAll): void => {
    window.open(payment.link || payment.paymentURL, '_self');
  };

  notify = (payment: IPayment): void => {
    this.paymentStore.notify(
      payment.id!,
      this.path()!,
      this.id()!,
      payment.preferenceId!,
      payment.type!,
    );
  };

  getCurrency = (payment: IPaymentAll): string => {
    let icon = 'euro';
    if (payment.reservation?.id) {
      icon = payment.reservation.room.currency.icon;
    } else if (payment.transaction?.id && payment.transaction?.account) {
      icon = payment.transaction?.account?.currency?.icon;
    }
    return icon;
  };

  goBack() {
    const path = this.path();
    const id = this.id();
    const accountId = this.accountId();
    if (path && id) {
      let navigate: string[];
      if (accountId) {
        navigate = ['accounts', accountId, 'transactions', id];
      } else {
        navigate = [path, id];
      }
      this.navigationService.navigate(navigate);
    }
  }
}
