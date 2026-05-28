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
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { CancelOption, IReservation, IReservationAll, States } from '../../interfaces/reservation';
import { combineLatestWith } from 'rxjs';
import { createMatTableState } from 'src/app/util/mat-table-state';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { cancelReservation, cleanReservation, getAllFilterReservations } from '../../store/reservation.actions';
import { getNowTimeZone, isSameTimeZone, newDateTimestamp } from '../../util/dates';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { map, startWith } from 'rxjs/operators';
import { IUser, IUserAll } from '../../interfaces/user';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { openCancel, openDialog } from '../../util/helper';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TimeDetailPipe } from '../../pipes/time-detail.pipe';
import { ReservationIconPipe } from '../../pipes/reservation-icon.pipe';
import {
  getCustomersPipe,
  getFilteredReservationsPipe,
  getReservationResponsePipe,
} from '../../store/selectors/reservation.selectors';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ReservationState } from '../../store/reducers/reservation.reducers';
import { requireMatch } from '../../util/validators';
import { MatFormField, MatInput, MatLabel, MatPrefix } from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatList, MatListItem, MatListItemIcon, MatListSubheaderCssMatStyler } from '@angular/material/list';
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
import { MatChipGrid, MatChipInput, MatChipRow } from '@angular/material/chips';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

type SearchForm = {
  customer: FormControl<IUserAll | undefined>;
  state: FormControl<string | undefined>;
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  imports: [TimeDetailPipe, MatFormField, MatLabel, MatInput, MatOption, MatIcon, MatList, MatListItem,
    MatListSubheaderCssMatStyler, MatIconButton, ReactiveFormsModule, TranslatePipe, NgClass, RouterLink, DatePipe,
    MatAutocomplete, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell,
    MatSortHeader, MatTooltip, MatListItemIcon, MatFooterCellDef, MatFooterCell, MatHeaderRowDef, MatHeaderRow,
    MatRowDef, MatRow, MatFooterRow, MatFooterRowDef, MatPaginator, MatAutocompleteTrigger, MatPrefix, TimeDetailPipe,
    ReservationIconPipe, MatChipGrid, MatChipRow, MatChipInput, MatProgressSpinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly store: Store<ReservationState> = inject(Store<ReservationState>);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);
  private reservationList$ = this.store.pipe(getFilteredReservationsPipe);
  private customerList$ = this.store.pipe(getCustomersPipe);
  private response$ = this.store.pipe(getReservationResponsePipe);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);
  private tableState = createMatTableState(this.paginator, this.sort, 'timestamp', 'desc');

  private reservationListSignal = toSignal(this.reservationList$);
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
  dataSourceSignal = computed(() => {
    const now = getNowTimeZone();
    return this.reservationListSignal()?.content?.map((reservation: IReservationAll) => {
      const reservationStart = newDateTimestamp(reservation.timestamp);
      if (reservationStart && [String(States.created), String(States.approved)].includes(reservation.state)) {
        const deadLine = reservationStart < now;
        return Object.assign({}, reservation, { deadLine });
      }
      return reservation;
    });
  });
  resultsLengthSignal = computed(() => this.reservationListSignal()?.totalElements || 0);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);

  private smallSignal = computed(() => this.breakpointsSignal()?.matches ?? false);

  displayedColumns: string[] = ['position', 'customer', 'timestamp', 'state', 'treatment', 'actions'];
  expandedReservation?: IReservation;

  dateFormat: string = this.translate.getCurrentLang();
  language: string = this.translate.getCurrentLang();

  form: FormGroup<SearchForm> = this.formBuilder.group<SearchForm>({
    customer: this.formBuilder.control(undefined, {
      validators: [requireMatch],
    }),
    state: this.formBuilder.control(undefined),
  });

  private selectCustomerSignal = toSignal(this.getForm.customer.valueChanges);
  private userId = computed(() => this.selectCustomerSignal()?.id);

  customerListSignal = toSignal(this.customerList$);
  filteredCustomerSignal: Signal<IUserAll[] | undefined> = toSignal(
    this.getForm.customer.valueChanges.pipe(
      startWith(undefined),
      map((value) => !value || typeof value === 'string' ? value : value.displayName),
      combineLatestWith(this.customerList$),
      map(([name, customers]) => {
        if (!customers) {
          return [];
        }

        return name ? this.filterCustomer(name, customers) : customers.slice();
      })),
  );

  stateInput = viewChild.required<ElementRef<HTMLInputElement>>('stateInput');
  selectedStatesSignal = signal<string[]>([]);
  allStatesWritableSignal = signal<string[]>(Object.values(States));
  filteredStateSignal: Signal<string[] | undefined> = toSignal(
    this.getForm.state.valueChanges.pipe(
      startWith(undefined),
      map((value: any) => !value || typeof value === 'string' ? value : value.name),
      combineLatestWith(toObservable(this.allStatesWritableSignal)),
      map(([name, states]) => {
        if (!states) {
          return [];
        }

        return name ? this.filterStates(name, states) : states.slice();
      })),
  );

  constructor() {
    effect(() => {
      const request = this.tableState.baseRequest();
      this.store.dispatch(
        getAllFilterReservations({
          ...request,
          size: this.pageSizeSignal(),
          userId: this.userId(),
          states: this.selectedStatesSignal(),
        }),
      );
    });
    this.tableState.resetOn(this.responseSignal, () => this.store.dispatch(cleanReservation()));
  }

  get getForm(): SearchForm {
    return this.form.controls;
  }

  openDialog = (reservation: IReservationAll): void => {
    const time = newDateTimestamp(reservation.timestamp);
    openDialog(reservation.room, this.dateFormat, this.translate, this.dialog, time);
  };

  showTimeZone = (reservation: IReservation): boolean => !isSameTimeZone(reservation?.room?.timeZone);

  cancel = (reservation: IReservationAll): void => {
    const title = this.translate.instant('RESERVATION.LIST.CANCEL.TITLE');
    const date = newDateTimestamp(reservation.timestamp);
    const content = this.translate.instant('RESERVATION.LIST.CANCEL.CONTENT', { date });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title, content, value: reservation.id },
    });

    dialogRef.afterClosed().subscribe(reservationId => {
      if (reservationId) {
        const options = Object.values(CancelOption).filter(co => co !== CancelOption.chargeAndAccount);
        openCancel(this.dialog, reservation.room, this.smallSignal(), options, result => {
          if (result) {
            this.store.dispatch(cancelReservation(reservationId, result));
          }
        });
      }
    });
  };

  displayFnUser = (user: IUser): string => user?.displayName ? user.displayName : '';

  keyDownHandler = (event: KeyboardEvent): void => {
    if (event.code === 'Backspace') {
      this.getForm.customer.setValue(undefined);
    }
  };

  remove = (state: string): void => {
    this.selectedStatesSignal.update((current) => current.filter((c) => c !== state));
    this.allStatesWritableSignal.update((current) => current ? [...current, state] : [state]);

    this.getForm.state.setValue(undefined);
  };

  selected = (event: MatAutocompleteSelectedEvent): void => {
    const state = event.option.value as string;

    this.selectedStatesSignal.update((current) => [...current, state]);
    this.allStatesWritableSignal.update((current) => current?.filter((c) => c !== state));

    if (this.stateInput()) {
      this.stateInput().nativeElement.value = '';
    }
    this.getForm.state.setValue(undefined);
  };

  private filterCustomer = (name: string, customers: IUserAll[]): IUserAll[] | undefined => customers?.filter(
    option => option.displayName?.toLowerCase().indexOf(name.toLowerCase()) === 0);

  private filterStates = (value: string, allStates: string[]): string[] => allStates.filter(
    state => state.toLowerCase().indexOf(value.toLowerCase()) === 0);
}
