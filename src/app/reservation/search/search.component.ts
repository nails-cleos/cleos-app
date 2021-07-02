import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DEFAULT_LENGTH, MOBILE_PAGE_SIZE, PAGE_SIZE, Pagination } from '../../interfaces/pagination';
import { IReservation, IReservationAll, States } from '../../interfaces/reservation';
import { Observable, Subscription } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectReservationState } from '../../store/app.states';
import { ReservationIconName } from '../detail/reservation-detail.component';
import * as fromActionsReservation from '../../store/reservation.actions';
import { getNow, newDate } from '../../util/dates';
import { DialogComponent } from '../../dialog/dialog.component';
import { map, startWith } from 'rxjs/operators';
import { IUser, IUserAll } from '../../interfaces/user';
import { FormControl } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { getUserName } from '../../util/helper';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('stateInput') stateInput!: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete!: MatAutocomplete;

  displayedColumns: string[] = ['position', 'customer', 'start', 'state', 'product', 'actions'];
  dataSource: any = new MatTableDataSource<Pagination<IReservationAll>>();
  getState: Observable<any>;
  subscription: Subscription | undefined;

  resultsLength = DEFAULT_LENGTH;
  pageSize = PAGE_SIZE;

  language: string;

  customers: IUserAll[] | undefined;
  filteredCustomer: Observable<IUser[] | undefined> | undefined;
  customer: FormControl = new FormControl();
  userId: string | undefined;

  state = new FormControl();
  filteredStates: Observable<string[]>;
  states: string[] = [States.created];
  allStates: string[] = Object.keys(States);

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private router: Router,
              private store: Store<AppState>, private cdRef: ChangeDetectorRef, private breakpointObserver: BreakpointObserver) {
    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).subscribe(result => {
      if (result.matches) {
        this.pageSize = MOBILE_PAGE_SIZE;
      }
    });
    this.getState = this.store.select(selectReservationState);
    this.language = this.translate.currentLang;
    // @ts-ignore
    this.allStates = this.allStates.filter(s => States[s] !== States.created);
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
  }

  getIcon(name: any): any {
    // @ts-ignore
    return ReservationIconName[name];
  }

  view(reservation: IReservation): void {
    this.router.navigate(['reservation', reservation.id]);
  }

  cancel(reservation: IReservationAll): void {
    const title = this.translate.instant('RESERVATION.PAGE.CANCEL.TITLE');
    const content = this.translate.instant('RESERVATION.PAGE.CANCEL.CONTENT', {date: reservation.start});
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {title, content, value: reservation.id}
    });

    dialogRef.afterClosed().subscribe(event => {
      if (event) {
        this.dataSource = [{}, {}, {}];
        this.store.dispatch(
          new fromActionsReservation.Cancel(event)
        );
      }
    });
  }

  getCustomerName(customer: any): string {
    return getUserName(customer);
  }

  displayFnUser(user: IUser): string {
    return user ? getUserName(user) : '';
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
    // @ts-ignore
    const state = States[event.option.value];
    this.states = [...this.states, state];
    // @ts-ignore
    this.allStates = this.allStates.filter(s => States[s] !== state);
    this.stateInput.nativeElement.value = '';
    this.state.setValue(null);
    this.getReservations();
  }

  private createPageSubscriptions(): void {
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.getReservations();
    });
    this.paginator?.page.subscribe(() => this.getReservations(this.paginator.pageIndex));

    this.cdRef.detectChanges();
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.customers = state.customers;
      if (state.filter) {
        const now = getNow();
        this.dataSource = state.filter.content?.map((reservation: IReservationAll) => {
          if (reservation.start && [String(States.created), String(States.approved)].includes(reservation.state)) {
            const deadLine = newDate(reservation.start) < now;
            return Object.assign({}, reservation, {deadLine});
          }
          return reservation;
        });
        this.resultsLength = state.filter?.totalElements;
        if (this.resultsLength) {
          this.createPageSubscriptions();
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

    return this.customers?.filter(option => getUserName(option)?.toLowerCase().indexOf(filterValue) === 0);
  }

  private filterStates(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allStates.filter(state => state.toLowerCase().indexOf(filterValue) === 0);
  }
}

