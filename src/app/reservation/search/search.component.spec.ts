import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CancelOption, IReservationAll, States } from '../reservation';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { getAllFilterReservations } from '../../store/actions/reservation.actions';
import { ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { SearchComponent } from './search.component';
import { IUserAll } from '../../user/user';
import { getNowTimeZone } from '../../util/dates';
import { ICurrencyAll } from '../../currency/currency';
import { ServiceType } from '../../room/room';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ReservationState } from '../../store/reducers/reservation.reducers';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let storeSpy: jasmine.SpyObj<Store<ReservationState>>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let translate: TranslateService;

  const professional: IUserAll = {
    id: 'prof-123',
    displayName: 'Pro 1',
    email: '',
    authorities: [],
    locale: 'en',
    timeZone: 'Europe/Amsterdam',
  };

  const mockDate = getNowTimeZone();
  const mockCurrency: ICurrencyAll = { id: 'c-1', icon: '€', code: 'EUR', name: 'Euro' };

  const mockCustomers: IUserAll[] = [
    { id: 'a', displayName: 'Alice' } as IUserAll,
    { id: 'b', displayName: 'Bob' } as IUserAll,
  ];

  const mockReservation: IReservationAll = {
    start: mockDate,
    id: 'reservation-123',
    state: States.created,
    timestamp: mockDate.getTime() / 1000,
    customer: {
      id: 'customer-123',
      displayName: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      authorities: [],
      locale: 'en',
      timeZone: 'Europe/Amsterdam',
    },
    room: {
      id: 'room-123',
      timeZone: 'Europe/Amsterdam',
      currency: mockCurrency,
      professionals: [professional],
      paymentTypes: ['CASH', 'TRANSFER'],
      availabilities: [],
      address: { name: 'address', location: { x: 1.0, y: 1.0 }, id: 1 },
      office: { id: 'office-1', name: 'Office 1', manager: professional },
      primary: true,
    },
    treatment: {
      id: '1',
      key: 'treatment-123',
      name: 'Treatment 1',
      price: 100,
      groupId: 'group-1',
      color: { id: 'color-1', name: 'Blue' },
      group: { id: 'group-1', name: 'Group 1' },
      duration: 'PT1H30M',
      type: ServiceType.treatment,
    },
    professional,
    additional: [],
    canEdit: true,
    paymentRequired: false,
    configurationCanCustomerChange: true,
    note: 'Test note',
    customerNote: 'Customer note',
    paymentLink: 'https://payment.link',
  };

  const mockPagination = {
    content: [mockReservation, mockReservation],
    totalElements: 2,
  };

  let reservationList$: BehaviorSubject<any>;
  let customerList$: BehaviorSubject<any>;
  let breakpoint$: BehaviorSubject<any>;
  let response$: BehaviorSubject<any>;

  beforeEach(async () => {
    reservationList$ = new BehaviorSubject(mockPagination);
    customerList$ = new BehaviorSubject(undefined);
    response$ = new BehaviorSubject<any>(undefined);
    breakpoint$ = new BehaviorSubject<any>({
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    });

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);

    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj('ParamMap', ['get']),
      },
    });

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return reservationList$.asObservable();
        case 2:
          return customerList$.asObservable();
        case 3:
          return response$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [SearchComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;

    translate = TestBed.inject(TranslateService);
    translate.use('en-GB');

    fixture.detectChanges();
  });

  afterEach(() => {
    reservationList$.complete();
    customerList$.complete();
    response$.complete();
    breakpoint$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute dataSourceSignal correctly', () => {
    reservationList$.next(mockPagination);
    fixture.detectChanges();

    const data = component.dataSourceSignal() as any;
    expect(data?.length).toBe(2);
  });

  it('should compute resultsLengthSignal correctly', () => {
    reservationList$.next(mockPagination);
    fixture.detectChanges();

    expect(component.resultsLengthSignal()).toBe(2);
  });

  it('should set mobile page size when small breakpoint matches', () => {
    breakpoint$.next({
      matches: true,
      breakpoints: {
        [Breakpoints.XSmall]: true,
        [Breakpoints.Small]: true,
      },
    });
    fixture.detectChanges();

    expect(component.pageSizeSignal()).toBe(MOBILE_PAGE_SIZE);
  });

  it('should keep default page size when breakpoint does not match', () => {
    breakpoint$.next({
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    });
    fixture.detectChanges();

    expect(component.pageSizeSignal()).toBe(PAGE_SIZE);
  });

  it('should dispatch getColorPage when paginatorPageIndex changes', () => {
    const paginator = component['paginator']();

    paginator!.pageIndex = 1;
    paginator!.page.emit({ pageIndex: 1, previousPageIndex: 0, pageSize: PAGE_SIZE, length: 2 });
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getAllFilterReservations({
        page: 1,
        sort: 'timestamp',
        direction: 'desc',
        size: PAGE_SIZE,
        userId: component['selectCustomerSignal']()?.id,
        states: component.selectedStatesSignal(),
      }),
    );
  });

  it('should dispatch clean and reset paginator when responseSignal emits', () => {
    const paginatorMock = jasmine.createSpyObj('MatPaginator', ['firstPage']);
    component['paginator'] = signal(paginatorMock);

    response$.next({ success: true });
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getAllFilterReservations({
        page: 0,
        sort: 'timestamp',
        direction: 'desc',
        size: PAGE_SIZE,
        userId: component['selectCustomerSignal']()?.id,
        states: component.selectedStatesSignal(),
      }),
    );
  });

  it('should exclude chargeAndAccount from cancel options', () => {
    const confirmDialogRef = {
      afterClosed: () => new BehaviorSubject('reservation-123').asObservable(),
    } as any;
    const cancelDialogRef = {
      afterClosed: () => new BehaviorSubject(undefined).asObservable(),
    } as any;
    const openSpy = spyOn(component['dialog'], 'open').and.returnValues(confirmDialogRef, cancelDialogRef);

    component.cancel(mockReservation);

    expect(openSpy.calls.count()).toBe(2);
    const cancelConfig = openSpy.calls.argsFor(1)[1] as { data: { options: CancelOption[] } };
    expect(cancelConfig.data.options).toEqual([
      CancelOption.refund,
      CancelOption.account,
      CancelOption.chargeAndRefund,
      CancelOption.none,
    ]);
  });

  it('should update allCustomersWritableSignal when store emits', async () => {
    customerList$.next(mockCustomers);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.customerListSignal()).toEqual(mockCustomers);
  });

  it('should filter customers', () => {
    const result = component['filterCustomer']('Ali', mockCustomers);
    expect(result!.length).toBe(1);
    expect(result![0].displayName).toBe('Alice');
  });

  it('should update allStatesWritableSignal when store emits', () => {
    expect(component.allStatesWritableSignal()).toEqual(Object.values(States));
  });

  it('should filter states', () => {
    const result = component['filterStates']('cre', Object.values(States));
    expect(result!.length).toBe(1);
    expect(result![0]).toBe(States.created);
  });

  it('should remove a state', () => {
    component.selectedStatesSignal.set([Object.values(States)[0]]);
    component.allStatesWritableSignal.set([...Object.values(States)]);

    component.remove(Object.values(States)[0]);

    expect(component.selectedStatesSignal().length).toBe(0);
    expect(component.allStatesWritableSignal()!.length).toBe(10);
  });

  it('should add selected customer and clear input', () => {
    component.allStatesWritableSignal.set(Object.values(States));
    fixture.detectChanges();

    component.getForm.state.setValue = jasmine.createSpy('setValue');
    component.stateInput().nativeElement.value = 'something';

    const mockEvent = {
      option: { value: Object.values(States)[2] },
    } as unknown as MatAutocompleteSelectedEvent;

    component.selected(mockEvent);

    expect(component.selectedStatesSignal()).toContain(Object.values(States)[2]);

    expect(component.allStatesWritableSignal())
      .toEqual(Object.values(States).filter(s => s !== Object.values(States)[2]));

    expect(component.getForm.state.setValue).toHaveBeenCalledWith(undefined);
  });
});
