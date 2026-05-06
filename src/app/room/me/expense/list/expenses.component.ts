import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../../../interfaces/pagination';
import { IExpenseAll } from '../../../../interfaces/expense';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { cleanExpense, deleteExpense, expenseSelected, getExpensesPage } from '../../../../store/expense.actions';
import { DialogComponent } from '../../../../shared/dialog/generic/dialog.component';
import { getDateFormat, getNowTimeZone, isSameTimeZone, newDateTimestamp } from '../../../../util/dates';
import { openDialog } from '../../../../util/helper';
import { FormControl, FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { SharedModule } from '../../../../shared/shared.module';
import { TimeDetailPipe } from '../../../../pipes/time-detail.pipe';
import { RoomState } from '../../../../store/reducers/room.reducers';
import { ExpenseState } from '../../../../store/reducers/expense.reducers';
import { getCurrentRoomIdPipe } from '../../../../store/selectors/room.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { getExpensePaginationPipe, getExpenseResponsePipe } from '../../../../store/selectors/expense.selectors';
import { DateAdapter } from '@angular/material/core';
import { YearMonthAdapter } from '../../../../util/adapter/year-month.adapter';
import { EnvService } from '../../../../services/env.service';
import { DriveAccessService } from '../../../../services/drive-access.service';
import { IDocument } from '../../../../interfaces/document';
import { documentView } from '../../../../store/document.actions';
import { DocumentState } from '../../../../store/reducers/document.reducers';
import { CurrencySymbolPipe } from '../../../../pipes/currency-symbol.pipe';

type ExpensesForm = {
  date: FormControl<Date | undefined>;
  filter: FormControl<string | undefined>;
}

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss'],
  imports: [SharedModule, TimeDetailPipe, CurrencySymbolPipe],
  providers: [
    { provide: DateAdapter, useClass: YearMonthAdapter },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpensesComponent {
  private readonly env: EnvService = inject(EnvService);
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly store: Store<RoomState | ExpenseState | DocumentState> = inject(
    Store<RoomState | ExpenseState | DocumentState>);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly driveAccessService: DriveAccessService = inject(DriveAccessService);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);
  private roomId$ = this.store.pipe(getCurrentRoomIdPipe);
  private expenseList$ = this.store.pipe(getExpensePaginationPipe);
  private response$ = this.store.pipe(getExpenseResponsePipe);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);

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

  private sortActive = computed(() => this.sort()?.active ?? 'timestamp');
  private sortDirection = computed(() => this.sort()?.direction ?? 'desc');

  roomIdSignal = toSignal(this.roomId$);

  paginatorPageIndex = signal(0);

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
    effect((onCleanup) => {
      const paginator = this.paginator();
      if (paginator) {
        const sub = paginator.page.subscribe((pageEvent) => {
          this.paginatorPageIndex.set(pageEvent.pageIndex);
        });
        onCleanup(() => sub.unsubscribe());
      }
    });

    effect(() => {
      const page = this.paginatorPageIndex();
      const roomId = this.roomIdSignal();
      if (!roomId) {
        return;
      }
      const date = this.selectedDate();
      const filter = this.selectedFilter();
      this.store.dispatch(
        getExpensesPage({
          roomId: roomId,
          page: page,
          sort: this.sortActive(),
          direction: this.sortDirection(),
          size: this.pageSizeSignal(),
          filter: filter?.trim()?.toLowerCase(),
          dateFilter: getDateFormat(date),
        }),
      );
    });

    effect(() => {
      if (this.responseSignal()) {
        this.store.dispatch(cleanExpense());
        this.paginator()?.firstPage();
      }
    });

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
    const roomId = this.roomIdSignal();
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
