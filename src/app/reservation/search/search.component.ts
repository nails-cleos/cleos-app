import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DEFAULT_LENGTH, MOBILE_PAGE_SIZE, PAGE_SIZE, Pagination } from '../../interfaces/pagination';
import { CancelOption, IReservation, IReservationAll, States, StatesKey } from '../../interfaces/reservation';
import { Observable, Subscription } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppState, selectReservationState } from '../../store/app.states';
import * as fromActionsReservation from '../../store/reservation.actions';
import { getNow, isSameTimeZone, newDateTimestamp } from '../../util/dates';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { map, startWith } from 'rxjs/operators';
import { IUser, IUserAll } from '../../interfaces/user';
import { UntypedFormControl } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { openCancel, openDialog } from '../../util/helper';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { detailExpandAnimation } from '../../util/animation';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  animations: [detailExpandAnimation]
})
export class SearchComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('stateInput') stateInput!: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete!: MatAutocomplete;

  displayedColumns: string[] = ['position', 'customer', 'timestamp', 'state', 'treatment', 'actions'];
  dataSource: any = new MatTableDataSource<Pagination<IReservationAll>>();
  expandedReservation: IReservation | undefined;
  resultsLength = DEFAULT_LENGTH;
  pageSize = PAGE_SIZE;

  dateFormat: string;
  language: string;

  filteredCustomer: Observable<IUser[] | undefined> | undefined;
  customer: UntypedFormControl = new UntypedFormControl();

  state = new UntypedFormControl();
  filteredStates: Observable<string[]>;
  states: string[] = [];

  private allStates: string[] = Object.keys(States);
  private userId: string | undefined;
  private customers: IUserAll[] | undefined;
  private small = false;
  private getState: Observable<any>;
  private subscription: Subscription | undefined;
  private paginatorSubscription: Subscription | undefined;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private store: Store<AppState>,
              private cdRef: ChangeDetectorRef, private breakpointObserver: BreakpointObserver) {
    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).subscribe(result => {
      if (result.matches) {
        this.pageSize = MOBILE_PAGE_SIZE;
        this.small = true;
      }
    });
    this.getState = this.store.select(selectReservationState);
    this.dateFormat = this.translate.currentLang;
    this.language = this.translate.currentLang;
    this.filteredStates = this.state.valueChanges.pipe(
      startWith(null),
      map((state: string | null) => state ? this.filterStates(state) : this.allStates.slice()));
  }

  ngOnInit(): void {
    this.clean();
    this.subscribe();
    this.getCustomers();
    this.filteredCustomer = this.customer.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value ? value.name : ''),
      map(name => name ? this.filterCustomer(name) : this.customers ? this.customers.slice() : this.customers)
    );
    this.customer.valueChanges.subscribe(value => {
      if (value && value.id) {
        this.userId = value.id;
        this.getReservations();
      }
    });
  }

  ngAfterViewInit(): void {
    this.getReservations();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.paginatorSubscription?.unsubscribe();
  }

  openDialog(reservation: IReservationAll): void {
    const time = newDateTimestamp(reservation.timestamp);
    openDialog(reservation.room, this.dateFormat, this.translate, this.dialog, time);
  }

  showTimeZone(reservation: IReservation): boolean {
    return !isSameTimeZone(reservation?.room?.timeZone);
  }

  cancel(reservation: IReservationAll): void {
    const title = this.translate.instant('RESERVATION.LIST.CANCEL.TITLE');
    const date = newDateTimestamp(reservation.timestamp);
    const content = this.translate.instant('RESERVATION.LIST.CANCEL.CONTENT', { date });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title, content, value: reservation.id }
    });

    dialogRef.afterClosed().subscribe(event => {
      if (event) {
        const options = Object.values(CancelOption).filter(co => co !== CancelOption.charge);
        openCancel(this.dialog, reservation.room, this.small, options, result => {
          if (result) {
            this.dataSource = [{}, {}, {}];
            this.store.dispatch(
              new fromActionsReservation.Cancel({ id: event, paymentCancellation: result })
            );
          }
        });
      }
    });
  }

  displayFnUser(user: IUser): string {
    return user?.displayName ? user.displayName : '';
  }

  keyDownHandler(event: any): void {
    if (event.code === 'Backspace') {
      this.customer.setValue(null);
      this.userId = undefined;
      this.getReservations();
    }
  }

  remove(state: string): void {
    const index = this.states.indexOf(state);

    if (index >= 0) {
      this.states = this.states.filter(s => s !== state);
      this.allStates = Object.keys(States).filter(s => !this.states.includes(s.toUpperCase()));

      this.state.setValue(null);
      this.getReservations();
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const state = States[event.option.value as StatesKey];
    this.states = [...this.states, state];
    this.allStates = this.allStates.filter(s => States[s as StatesKey] !== state);
    this.stateInput.nativeElement.value = '';
    this.state.setValue(null);
    this.getReservations();
  }

  private createPageSubscriptions(): void {
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.getReservations();
    });
    this.paginatorSubscription = this.paginator?.page.subscribe(() => {
      this.getReservations(this.paginator.pageIndex);
    });

    this.cdRef.detectChanges();
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.customers = state.customers;
      if (state.filter) {
        const now = getNow();
        this.dataSource = state.filter.content?.map((reservation: IReservationAll) => {
          const reservationStart = newDateTimestamp(reservation.timestamp);
          if (reservationStart && [String(States.created), String(States.approved)].includes(reservation.state)) {
            const deadLine = reservationStart < now;
            return Object.assign({}, reservation, { deadLine });
          }
          return reservation;
        });
        this.resultsLength = state.filter?.totalElements;
        if (!this.paginatorSubscription && this.resultsLength) {
          this.createPageSubscriptions();
        } else if (!this.resultsLength) {
          this.paginatorSubscription?.unsubscribe();
          this.paginatorSubscription = undefined;
        }
      }
      if (state.message) {
        this.clean();
        this.getReservations();
      }
    });
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsReservation.Clean()
    );
  }

  private getCustomers(): void {
    this.store.dispatch(
      new fromActionsReservation.GetAllCustomers()
    );
  }

  private getReservations(page: number = 0): void {
    const payload = {
      states: this.states,
      userId: this.userId,
      active: this.sort.active,
      direction: this.sort.direction,
      size: this.pageSize,
      page
    };
    this.store.dispatch(
      new fromActionsReservation.GetAllFilterPage(payload)
    );
  }

  private filterCustomer(name: string): IUser[] | undefined {
    const filterValue = name.toLowerCase();

    return this.customers?.filter(option => option.displayName?.toLowerCase().indexOf(filterValue) === 0);
  }

  private filterStates(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allStates.filter(state => state.toLowerCase().indexOf(filterValue) === 0);
  }
}

