import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { CancelOption, IReservationAll, States } from '../reservation';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '@app/interfaces/pagination';
import { ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { SearchComponent } from './search.component';
import { IUserAll } from '@app/user/user';
import { DEFAULT_LOCALE, getNowTimeZone } from '@app/util/dates';
import { ICurrencyAll } from '@app/currency/currency';
import { ServiceType } from '@app/room/room';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { NavigationService } from '@app/services/navigation.service';
import { UserStore } from '@app/store/user.store';
import { ReservationStore } from '@app/store/reservation.store';
describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let navigationServiceSpy: Pick<NavigationService, 'navigate' | 'language'> & {
    navigate: ReturnType<typeof vi.fn>;
  };
  let breakpointObserverSpy: Pick<BreakpointObserver, 'observe'> & {
    observe: ReturnType<typeof vi.fn>;
  };
  let activatedRouteSpy: {
    snapshot: {
      paramMap: {
        get: ReturnType<typeof vi.fn>;
      };
    };
  };

  let reservationStoreSpy: {
    data: ReturnType<typeof signal>;
    isLoading: ReturnType<typeof signal>;
    response: ReturnType<typeof signal>;
    loadAllFiltered: Mock;
    clearResponse: Mock;
    cancel: Mock;
    clean: Mock;
  };

  let userStoreSpy: {
    customers: ReturnType<typeof signal>;
    loadCustomers: Mock;
  };

  const professional: IUserAll = {
    id: 'prof-123',
    displayName: 'Pro 1',
    email: '',
    authorities: [],
    locale: 'en',
    timeZone: 'Europe/Amsterdam',
  };

  const mockDate = getNowTimeZone();
  const mockCurrency: ICurrencyAll = {
    id: 'c-1',
    icon: '€',
    code: 'EUR',
    name: 'Euro',
  };

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

  let breakpoint$: BehaviorSubject<any>;

  beforeEach(async () => {
    navigationServiceSpy = {
      navigate: vi.fn().mockName('NavigationService.navigate'),
      language: DEFAULT_LOCALE,
    };
    reservationStoreSpy = {
      data: signal({ kind: 'pagination', value: mockPagination }),
      isLoading: signal(false),
      response: signal(undefined),
      loadAllFiltered: vi.fn().mockName('loadAllFiltered'),
      clearResponse: vi.fn().mockName('clearResponse'),
      cancel: vi.fn().mockName('cancel'),
      clean: vi.fn().mockName('clean'),
    };
    userStoreSpy = {
      customers: signal<any>(undefined),
      loadCustomers: vi.fn().mockName('loadCustomers'),
    };
    breakpoint$ = new BehaviorSubject<any>({
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    });

    breakpointObserverSpy = {
      observe: vi.fn().mockName('BreakpointObserver.observe'),
    };

    activatedRouteSpy = {
      snapshot: {
        paramMap: {
          get: vi.fn().mockName('ParamMap.get'),
        },
      },
    };

    breakpointObserverSpy.observe.mockReturnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [SearchComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: UserStore, useValue: userStoreSpy },
        { provide: ReservationStore, useValue: reservationStoreSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;

    const translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);

    fixture.detectChanges();
  });

  afterEach(() => breakpoint$.complete());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute dataSourceSignal correctly', () => {
    reservationStoreSpy.data.set({ kind: 'pagination', value: mockPagination });
    fixture.detectChanges();

    const data = component.dataSourceSignal() as any;
    expect(data?.length).toBe(2);
  });

  it('should compute resultsLengthSignal correctly', () => {
    reservationStoreSpy.data.set({ kind: 'pagination', value: mockPagination });
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
    paginator!.page.emit({
      pageIndex: 1,
      previousPageIndex: 0,
      pageSize: PAGE_SIZE,
      length: 2,
    });
    fixture.detectChanges();

    expect(reservationStoreSpy.loadAllFiltered).toHaveBeenCalledWith({
      page: 1,
      sort: 'timestamp',
      direction: 'desc',
      size: PAGE_SIZE,
      userId: component['selectCustomerSignal']()?.id,
      states: component.selectedStatesSignal(),
    });
  });

  it('should dispatch clean and reset paginator when responseSignal emits', () => {
    const paginatorMock = {
      firstPage: vi.fn().mockName('MatPaginator.firstPage'),
    };
    component['paginator'] = signal(paginatorMock) as any;

    reservationStoreSpy.response.set({ success: true });
    fixture.detectChanges();

    expect(reservationStoreSpy.loadAllFiltered).toHaveBeenCalledWith({
      page: 0,
      sort: 'timestamp',
      direction: 'desc',
      size: PAGE_SIZE,
      userId: component['selectCustomerSignal']()?.id,
      states: component.selectedStatesSignal(),
    });
  });

  it('should exclude chargeAndAccount from cancel options', () => {
    const confirmDialogRef = {
      afterClosed: () => new BehaviorSubject('reservation-123').asObservable(),
    } as any;
    const cancelDialogRef = {
      afterClosed: () => new BehaviorSubject(undefined).asObservable(),
    } as any;
    const openSpy = vi
      .spyOn(component['dialog'], 'open')
      .mockReturnValueOnce(confirmDialogRef)
      .mockReturnValueOnce(cancelDialogRef);

    component.cancel(mockReservation);

    expect(vi.mocked(openSpy).mock.calls.length).toBe(2);
    const cancelConfig = vi.mocked(openSpy).mock.calls[1][1] as {
      data: {
        options: CancelOption[];
      };
    };
    expect(cancelConfig.data.options).toEqual([
      CancelOption.refund,
      CancelOption.account,
      CancelOption.chargeAndRefund,
      CancelOption.none,
    ]);
  });

  it('should update allCustomersWritableSignal when store emits', async () => {
    userStoreSpy.customers.set(mockCustomers);
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

    component.getForm.state.setValue = vi.fn().mockName('setValue');
    component.stateInput().nativeElement.value = 'something';

    const mockEvent = {
      option: { value: Object.values(States)[2] },
    } as unknown as MatAutocompleteSelectedEvent;

    component.selected(mockEvent);

    expect(component.selectedStatesSignal()).toContain(
      Object.values(States)[2],
    );

    expect(component.allStatesWritableSignal()).toEqual(
      Object.values(States).filter((s) => s !== Object.values(States)[2]),
    );

    expect(component.getForm.state.setValue).toHaveBeenCalledWith(undefined);
  });
});
