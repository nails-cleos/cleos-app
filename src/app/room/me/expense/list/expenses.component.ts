import { ChangeDetectionStrategy, Component, computed, effect, inject, input, viewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { createMatTableState } from 'src/app/util/mat-table-state';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../../../interfaces/pagination';
import { IExpenseAll } from '../../../../interfaces/expense';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { cleanExpense, deleteExpense, expenseSelected, getExpensesPage } from '../../../../store/expense.actions';
import { DialogComponent } from '../../../../shared/dialog/generic/dialog.component';
import { getDateFormat, getNowTimeZone, isSameTimeZone, newDateTimestamp } from '../../../../util/dates';
import { openDialog } from '../../../../util/helper';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { TimeDetailPipe } from '../../../../pipes/time-detail.pipe';
import { RoomState } from '../../../../store/reducers/room.reducers';
import { ExpenseState } from '../../../../store/reducers/expense.reducers';
import { toSignal } from '@angular/core/rxjs-interop';
import { getExpensePaginationPipe, getExpenseResponsePipe } from '../../../../store/selectors/expense.selectors';
import { provideYearMonthDateAdapter } from '../../../../util/adapter/app-date.provider';
import { EnvService } from '../../../../services/env.service';
import { DriveAccessService } from '../../../../services/drive-access.service';
import { IDocument } from '../../../../interfaces/document';
import { documentView } from '../../../../store/document.actions';
import { DocumentState } from '../../../../store/reducers/document.reducers';
import { CurrencySymbolPipe } from '../../../../pipes/currency-symbol.pipe';
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
import { MatList, MatListItem, MatListItemIcon, MatListSubheaderCssMatStyler } from '@angular/material/list';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatSuffix } from '@angular/material/form-field';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

type ExpensesForm = {
  date: FormControl<Date | undefined>;
  filter: FormControl<string | undefined>;
}

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss'],
  imports: [TimeDetailPipe, MatFormField, MatLabel, MatInput, MatDatepickerInput, MatDatepickerToggle, MatDatepicker,
    MatIcon, MatList, MatListItem, MatListSubheaderCssMatStyler, MatIconButton, ReactiveFormsModule, TranslatePipe,
    DecimalPipe, RouterLink, DatePipe, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef,
    MatCell, MatSortHeader, MatTooltip, MatListItemIcon, MatFooterCellDef, MatFooterCell, MatHeaderRowDef, MatHeaderRow,
    MatRowDef, MatRow, MatFooterRow, MatFooterRowDef, MatPaginator, CurrencySymbolPipe, TimeDetailPipe, MatSuffix,
    CurrencySymbolPipe],
  providers: [...provideYearMonthDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpensesComponent {
  id = input<string>();

  private readonly env: EnvService = inject(EnvService);
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly store: Store<RoomState | ExpenseState | DocumentState> = inject(
    Store<RoomState | ExpenseState | DocumentState>);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly driveAccessService: DriveAccessService = inject(DriveAccessService);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);
  private expenseList$ = this.store.pipe(getExpensePaginationPipe);
  private response$ = this.store.pipe(getExpenseResponsePipe);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);
  private tableState = createMatTableState(this.paginator, this.sort, 'timestamp', 'desc');

  private expenseListSignal = toSignal(this.expenseList$);
  private responseSignal = toSignal(this.response$);
  private breakpointsSignal = toSignal(
    this.breakpointObserver$, {
      initialValue: {
        matches: false,
        breakpoints: {
          [Breakpoints.XSmall]: false,
          [Breakpoints.Small]: false,
        },
      },
    },
  );

  paginatorPageIndex = this.tableState.pageIndex;

  dataSourceSignal = computed(() => this.expenseListSignal()?.content?.map((expense: IExpenseAll) => Object.assign({},
    expense, { totalBtw: expense.totalGross - expense.totalNet })));
  resultsLengthSignal = computed(() => this.expenseListSignal()?.totalElements || 0);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);

  displayedColumns: string[] = ['position', 'invoice', 'supplyStore.name', 'timestamp', 'actions'];
  expanded?: IExpenseAll;

  dateFormat: string = this.translate.getCurrentLang();
  language: string = this.translate.getCurrentLang();

  form: FormGroup<ExpensesForm> = this.formBuilder.group<ExpensesForm>({
    date: this.formBuilder.control(undefined),
    filter: this.formBuilder.control(undefined),
  });

  private selectedDate = toSignal(this.getForm.date.valueChanges);
  private selectedFilter = toSignal(this.getForm.filter.valueChanges);

  constructor() {
    effect(() => {
      const roomId = this.id();
      if (!roomId) {
        return;
      }
      const request = this.tableState.baseRequest();
      const date = this.selectedDate();
      const filter = this.selectedFilter();
      this.store.dispatch(
        getExpensesPage({
          roomId: roomId,
          ...request,
          size: this.pageSizeSignal(),
          filter: filter?.trim()?.toLowerCase(),
          dateFilter: getDateFormat(date),
        }),
      );
    });
    this.tableState.resetOn(this.responseSignal, () => this.store.dispatch(cleanExpense()));

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

  showTimeZone = (expense: IExpenseAll): boolean => !isSameTimeZone(expense.room.timeZone);

  setMonthAndYear = (normalizedMonthAndYear: Date, datepicker: MatDatepicker<Date>): void => {
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

  openDialog = (expense: IExpenseAll): void => openDialog(
    expense.room, this.dateFormat, this.translate, this.dialog, newDateTimestamp(expense.timestamp),
  );

  edit = (selected: IExpenseAll): void => this.store.dispatch(expenseSelected({ selected }));

  delete = (expense: IExpenseAll): void => {
    const roomId = this.id();
    if (!roomId) {
      return;
    }
    const title = this.translate.instant('EXPENSE.DELETED.TITLE');
    const content = this.translate.instant('EXPENSE.DELETED.CONTENT', { invoice: expense.invoice });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title, content, value: expense, variant: 'warning' },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(deleteExpense({ roomId, id: result.id, invoice: result.invoice }));
      }
    });
  };

  download = (document: IDocument): void => this.store.dispatch(
    documentView({ id: document.id, fileName: document.name }),
  );
}
