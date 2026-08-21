import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { createMatTableState } from '@app/util/mat-table-state';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '@app/interfaces/pagination';
import { IExpenseAll } from '../expense';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DialogComponent } from '@app/shared/dialog/generic/dialog.component';
import {
  getDateFormat,
  getNowTimeZone,
  isSameTimeZone,
  newDateTimestamp,
} from '@app/util/dates';
import { openDialog } from '@app/util/helper';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { TimeDetailPipe } from '@app/pipes/time-detail.pipe';
import { provideYearMonthDateAdapter } from '@app/util/adapter/app-date.provider';
import { EnvService } from '@app/services/env.service';
import { DriveAccessService } from '@app/services/drive-access.service';
import { IDocument } from '@app/document/document';
import { DocumentStore } from '@app/store/document.store';
import { RouterLink } from '@angular/router';
import { CurrencySymbolPipe } from '@app/pipes/currency-symbol.pipe';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
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
  MatList,
  MatListItem,
  MatListItemIcon,
  MatListSubheaderCssMatStyler,
} from '@angular/material/list';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatSuffix } from '@angular/material/form-field';
import { DatePipe, DecimalPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ExpenseStore } from '@app/store/expense.store';
import {
  TableSkeletonColumn,
  TableSkeletonComponent,
} from '@app/shared/skeleton/table-skeleton.component';
import { NavigationService } from '@app/services/navigation.service';

type ExpensesForm = {
  date: FormControl<Date | undefined>;
  filter: FormControl<string | undefined>;
};

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.scss'],
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    MatIcon,
    MatList,
    MatListItem,
    MatListSubheaderCssMatStyler,
    MatIconButton,
    ReactiveFormsModule,
    TranslatePipe,
    DecimalPipe,
    RouterLink,
    DatePipe,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatSortHeader,
    MatTooltip,
    MatListItemIcon,
    MatFooterCellDef,
    MatFooterCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatFooterRow,
    MatFooterRowDef,
    MatPaginator,
    TimeDetailPipe,
    MatSuffix,
    CurrencySymbolPipe,
    TableSkeletonComponent,
  ],
  providers: [...provideYearMonthDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseListComponent {
  id = input<string>();

  private readonly env: EnvService = inject(EnvService);
  private readonly breakpointObserver: BreakpointObserver =
    inject(BreakpointObserver);
  private readonly expenseStore = inject(ExpenseStore);
  private readonly documentStore = inject(DocumentStore);
  private readonly translateService: TranslateService =
    inject(TranslateService);
  private readonly navigationService: NavigationService =
    inject(NavigationService);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly formBuilder: NonNullableFormBuilder = inject(
    NonNullableFormBuilder,
  );
  private readonly driveAccessService: DriveAccessService =
    inject(DriveAccessService);

  private breakpointObserver$ = this.breakpointObserver.observe([
    Breakpoints.XSmall,
    Breakpoints.Small,
  ]);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);
  readonly tableState = createMatTableState(
    this.paginator,
    this.sort,
    'timestamp',
    'desc',
  );

  private expenseListSignal = this.expenseStore.data;
  private responseSignal = this.expenseStore.response;
  private breakpointsSignal = toSignal(this.breakpointObserver$, {
    initialValue: {
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    },
  });

  paginatorPageIndex = this.tableState.pageIndex;
  isLoading = this.expenseStore.isLoading;

  dataSourceSignal = computed(() =>
    this.expenseListSignal()?.content?.map((expense: IExpenseAll) =>
      Object.assign({}, expense, {
        totalBtw: expense.totalGross - expense.totalNet,
      }),
    ),
  );
  resultsLengthSignal = computed(
    () => this.expenseListSignal()?.totalElements || 0,
  );
  pageSizeSignal = computed(() =>
    this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE,
  );

  tableColumns: TableSkeletonColumn[] = [
    { key: 'position' },
    { key: 'timestamp' },
    { key: 'invoice', hideOnMobile: true },
    { key: 'supplyStore.name', hideOnMobile: true },
    { key: 'totalGross', hideOnMobile: true },
    { key: 'totalBtw', hideOnMobile: true },
    { key: 'totalNet' },
    { key: 'actions', hideOnMobile: true },
  ];
  displayedColumns: string[] = this.tableColumns.map((column) => column.key);
  expanded?: IExpenseAll;

  readonly language: string = this.navigationService.language;

  form: FormGroup<ExpensesForm> = this.formBuilder.group<ExpensesForm>({
    date: this.formBuilder.control(undefined),
    filter: this.formBuilder.control(undefined),
  });

  private selectedDate = toSignal(this.getForm.date.valueChanges);
  private selectedFilter = toSignal(this.getForm.filter.valueChanges);

  constructor() {
    this.expenseStore.clean();

    effect(() => {
      const roomId = this.id();
      if (!roomId) {
        return;
      }
      const request = this.tableState.baseRequest();
      const date = this.selectedDate();
      const filter = this.selectedFilter();
      this.expenseStore.loadPage({
        roomId,
        ...request,
        size: this.pageSizeSignal(),
        filter: filter?.trim()?.toLowerCase(),
        dateFilter: getDateFormat(date),
      });
    });
    this.tableState.resetOn(this.responseSignal, () =>
      this.expenseStore.clearResponse(),
    );

    effect(() => {
      this.driveAccessService.requestAccessIfNeeded(this.googleDriveUploadFile);
    });
  }

  get getForm(): ExpensesForm {
    return this.form.controls;
  }

  get googleDriveUploadFile(): boolean {
    return this.env.googleDriveUploadFile;
  }

  showTimeZone = (expense: IExpenseAll): boolean =>
    !isSameTimeZone(expense.room.timeZone);

  setMonthAndYear = (
    normalizedMonthAndYear: Date,
    datepicker: Pick<MatDatepicker<Date>, 'close'>,
  ): void => {
    const ctrlValue = new Date(this.getForm.date.value || getNowTimeZone());
    ctrlValue?.setMonth(normalizedMonthAndYear.getMonth());
    ctrlValue?.setFullYear(normalizedMonthAndYear.getFullYear());

    this.getForm.date.setValue(ctrlValue);

    datepicker.close();
  };

  keyDownHandler = (event: KeyboardEvent): void => {
    if (event.code === 'Backspace') {
      this.getForm.date.setValue(undefined);
    }
  };

  openDialog = (expense: IExpenseAll): void =>
    openDialog(
      expense.room,
      this.language,
      this.translateService,
      this.dialog,
      newDateTimestamp(expense.timestamp),
    );

  edit = (selected: IExpenseAll): void => {
    this.navigationService.navigate([
      'rooms',
      selected.room.id,
      'expenses',
      selected.id,
    ]);
  };

  delete = (expense: IExpenseAll): void => {
    const roomId = this.id();
    if (!roomId) {
      return;
    }
    const title = this.translateService.instant('EXPENSE.DELETED.TITLE');
    const content = this.translateService.instant('EXPENSE.DELETED.CONTENT', {
      invoice: expense.invoice,
    });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title, content, value: expense, variant: 'warning' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.expenseStore.delete(roomId, result.id, result.invoice);
      }
    });
  };

  download = (document: IDocument): void =>
    this.documentStore.download({ id: document.id, fileName: document.name });
}
