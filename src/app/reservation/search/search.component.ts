import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Signal,
  signal,
  viewChild,
} from '@angular/core';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '@app/interfaces/pagination';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import {
  CancelOption,
  IReservation,
  IReservationAll,
  States,
} from '../reservation';
import { combineLatestWith } from 'rxjs';
import { createMatTableState } from '@app/util/mat-table-state';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import {
  getNowTimeZone,
  isSameTimeZone,
  newDateTimestamp,
} from '@app/util/dates';
import { DialogComponent } from '@app/shared/dialog/generic/dialog.component';
import { map, startWith } from 'rxjs/operators';
import { IUser, IUserAll } from '@app/user/user';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { openCancel, openDialog } from '@app/util/helper';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TimeDetailPipe } from '@app/pipes/time-detail.pipe';
import { ReservationIconPipe } from '@app/pipes/reservation-icon.pipe';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { requireMatch } from '@app/util/validators';
import {
  MatFormField,
  MatInput,
  MatLabel,
  MatPrefix,
} from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import {
  MatList,
  MatListItem,
  MatListItemIcon,
  MatListSubheaderCssMatStyler,
} from '@angular/material/list';
import { MatIconButton } from '@angular/material/button';
import { DatePipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
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
  MatChipGrid,
  MatChipInput,
  MatChipRemove,
  MatChipRow,
} from '@angular/material/chips';
import {
  TableSkeletonColumn,
  TableSkeletonComponent,
} from '@app/shared/skeleton/table-skeleton.component';
import { NavigationService } from '@app/services/navigation.service';
import { UserStore } from '@app/store/user.store';
import { ReservationStore } from '@app/store/reservation.store';

type SearchForm = {
  customer: FormControl<IUserAll | undefined>;
  state: FormControl<string | undefined>;
};

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  imports: [
    TimeDetailPipe,
    MatFormField,
    MatLabel,
    MatInput,
    MatOption,
    MatIcon,
    MatList,
    MatListItem,
    MatListSubheaderCssMatStyler,
    MatIconButton,
    ReactiveFormsModule,
    TranslatePipe,
    NgClass,
    RouterLink,
    DatePipe,
    MatAutocomplete,
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
    MatAutocompleteTrigger,
    MatPrefix,
    TimeDetailPipe,
    ReservationIconPipe,
    MatChipGrid,
    MatChipRow,
    MatChipInput,
    MatChipRemove,
    TableSkeletonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {
  private readonly breakpointObserver: BreakpointObserver =
    inject(BreakpointObserver);
  private readonly reservationStore = inject(ReservationStore);
  private readonly userStore = inject(UserStore);
  private readonly translateService: TranslateService =
    inject(TranslateService);
  private readonly navigationService: NavigationService =
    inject(NavigationService);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly formBuilder: NonNullableFormBuilder = inject(
    NonNullableFormBuilder,
  );

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

  private reservationListSignal = computed(() => {
    const data = this.reservationStore.data();
    return data?.kind === 'pagination' ? data.value : undefined;
  });
  private responseSignal = this.reservationStore.response;
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
  isLoading = this.reservationStore.isLoading;
  dataSourceSignal = computed(() => {
    const now = getNowTimeZone();
    return this.reservationListSignal()?.content?.map(
      (reservation: IReservationAll) => {
        const reservationStart = newDateTimestamp(reservation.timestamp);
        if (
          reservationStart &&
          [String(States.created), String(States.approved)].includes(
            reservation.state,
          )
        ) {
          const deadLine = reservationStart < now;
          return Object.assign({}, reservation, { deadLine });
        }
        return reservation;
      },
    );
  });
  resultsLengthSignal = computed(
    () => this.reservationListSignal()?.totalElements || 0,
  );
  pageSizeSignal = computed(() =>
    this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE,
  );

  private smallSignal = computed(
    () => this.breakpointsSignal()?.matches ?? false,
  );

  tableColumns: TableSkeletonColumn[] = [
    { key: 'position' },
    { key: 'customer' },
    { key: 'timestamp' },
    { key: 'state', hideOnMobile: true },
    { key: 'treatment', hideOnMobile: true },
    { key: 'actions', hideOnMobile: true },
  ];
  displayedColumns: string[] = this.tableColumns.map((column) => column.key);
  expandedReservation?: IReservation;

  readonly language: string = this.navigationService.language;

  form: FormGroup<SearchForm> = this.formBuilder.group<SearchForm>({
    customer: this.formBuilder.control(undefined, {
      validators: [requireMatch],
    }),
    state: this.formBuilder.control(undefined),
  });

  private selectCustomerSignal = toSignal(this.getForm.customer.valueChanges);
  private userId = computed(() => this.selectCustomerSignal()?.id);

  customerListSignal = this.userStore.customers;
  filteredCustomerSignal: Signal<IUserAll[] | undefined> = toSignal(
    this.getForm.customer.valueChanges.pipe(
      startWith(undefined),
      map((value) =>
        !value || typeof value === 'string' ? value : value.displayName,
      ),
      combineLatestWith(toObservable(this.customerListSignal)),
      map(([name, customers]) => {
        if (!customers) {
          return [];
        }

        return name ? this.filterCustomer(name, customers) : customers.slice();
      }),
    ),
  );

  stateInput = viewChild.required<ElementRef<HTMLInputElement>>('stateInput');
  selectedStatesSignal = signal<string[]>([]);
  allStatesWritableSignal = signal<string[]>(Object.values(States));
  filteredStateSignal: Signal<string[] | undefined> = toSignal(
    this.getForm.state.valueChanges.pipe(
      startWith(undefined),
      map((value: any) =>
        !value || typeof value === 'string' ? value : value.name,
      ),
      combineLatestWith(toObservable(this.allStatesWritableSignal)),
      map(([name, states]) => {
        if (!states) {
          return [];
        }

        return name ? this.filterStates(name, states) : states.slice();
      }),
    ),
  );

  constructor() {
    this.reservationStore.clean();
    this.userStore.loadCustomers();
    effect(() => {
      const request = this.tableState.baseRequest();
      this.reservationStore.loadAllFiltered({
        ...request,
        size: this.pageSizeSignal(),
        userId: this.userId(),
        states: this.selectedStatesSignal(),
      });
    });
    this.tableState.resetOn(this.responseSignal, () =>
      this.reservationStore.clearResponse(),
    );
  }

  get getForm(): SearchForm {
    return this.form.controls;
  }

  openDialog = (reservation: IReservationAll): void => {
    const time = newDateTimestamp(reservation.timestamp);
    openDialog(
      reservation.room,
      this.language,
      this.translateService,
      this.dialog,
      time,
    );
  };

  showTimeZone = (reservation: IReservation): boolean =>
    !isSameTimeZone(reservation?.room?.timeZone);

  cancel = (reservation: IReservationAll): void => {
    const title = this.translateService.instant(
      'RESERVATION.LIST.CANCEL.TITLE',
    );
    const date = newDateTimestamp(reservation.timestamp);
    const content = this.translateService.instant(
      'RESERVATION.LIST.CANCEL.CONTENT',
      { date },
    );
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title, content, value: reservation.id },
    });

    dialogRef.afterClosed().subscribe((reservationId) => {
      if (reservationId) {
        const options = Object.values(CancelOption).filter(
          (co) => co !== CancelOption.chargeAndAccount,
        );
        openCancel(
          this.dialog,
          reservation.room,
          this.smallSignal(),
          options,
          (result) => {
            if (result) {
              this.reservationStore.cancel(reservationId, result);
            }
          },
        );
      }
    });
  };

  displayFnUser = (user: IUser): string =>
    user?.displayName ? user.displayName : '';

  keyDownHandler = (event: KeyboardEvent): void => {
    if (event.code === 'Backspace') {
      this.getForm.customer.setValue(undefined);
    }
  };

  remove = (state: string): void => {
    this.selectedStatesSignal.update((current) =>
      current.filter((c) => c !== state),
    );
    this.allStatesWritableSignal.update((current) =>
      current ? [...current, state] : [state],
    );

    this.getForm.state.setValue(undefined);
  };

  selected = (event: MatAutocompleteSelectedEvent): void => {
    const state = event.option.value as string;

    this.selectedStatesSignal.update((current) => [...current, state]);
    this.allStatesWritableSignal.update((current) =>
      current?.filter((c) => c !== state),
    );

    if (this.stateInput()) {
      this.stateInput().nativeElement.value = '';
    }
    this.getForm.state.setValue(undefined);
  };

  private filterCustomer = (
    name: string,
    customers: IUserAll[],
  ): IUserAll[] | undefined =>
    customers?.filter(
      (option) =>
        option.displayName?.toLowerCase().indexOf(name.toLowerCase()) === 0,
    );

  private filterStates = (value: string, allStates: string[]): string[] =>
    allStates.filter(
      (state) => state.toLowerCase().indexOf(value.toLowerCase()) === 0,
    );
}
