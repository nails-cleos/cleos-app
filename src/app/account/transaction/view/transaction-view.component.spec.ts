import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { of, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TransactionViewComponent } from './transaction-view.component';
import { AuthUserService } from '../../../services/auth-user.service';
import { IAccountAll, ITransaction } from '../../../interfaces/account';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../../interfaces/pagination';
import { clean, getTransactionsByAccountId } from '../../../store/account.actions';
import { AppState } from '../../../store/app.states';

describe('TransactionViewComponent', () => {
  let component: TransactionViewComponent;
  let fixture: ComponentFixture<TransactionViewComponent>;

  let state$: Subject<any>;
  let breakpoint$: Subject<any>;
  let authUser$: Subject<any>;

  let storeSpy: jasmine.SpyObj<Store<AppState>>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let paramMapSpy: jasmine.SpyObj<ParamMap>;
  let changeDetectorSpy: jasmine.SpyObj<ChangeDetectorRef>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;

  const mockAccount: IAccountAll = {
    id: 'account-123',
    balance: 1000,
    customer: {
      id: 'customer-123',
      displayName: 'John Doe',
      email: 'john@example.com',
      authorities: [],
      locale: 'en',
      timeZone: 'UTC',
    },
    currency: {
      id: 'eur',
      name: 'Euro',
      code: 'EUR',
      icon: '€',
    },
  };

  const mockTransactions: ITransaction[] = [
    {
      id: 'transaction-1',
      amount: 100,
      amountGifted: 10,
      payment: {
        id: 'payment-1',
        status: 'completed',
        type: 'card',
        timestamp: 1672574400000,
      },
    },
    {
      id: 'transaction-2',
      amount: 200,
      amountGifted: 0,
      payment: {
        id: 'payment-2',
        status: 'pending',
        type: 'paypal',
        timestamp: 1672660800000,
      },
    },
  ];

  beforeEach(async () => {
    state$ = new Subject();
    breakpoint$ = new Subject();
    authUser$ = new Subject();

    changeDetectorSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    paramMapSpy = jasmine.createSpyObj<ParamMap>('ParamMap', ['get']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: paramMapSpy,
      },
    });
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', [], {
      authUser: authUser$.asObservable(),
    });
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);

    paramMapSpy.get.and.returnValue('account-123');
    storeSpy.select.and.returnValue(state$.asObservable());
    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [
        TransactionViewComponent,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: Store, useValue: storeSpy },
        { provide: ChangeDetectorRef, useValue: changeDetectorSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.setDefaultLang('en-GB');
    translateService.use('en-GB');

    fixture = TestBed.createComponent(TransactionViewComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    state$.complete();
    breakpoint$.complete();
    authUser$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.hasAdminRole).toBeFalse();
    expect(component.pageSize).toBe(PAGE_SIZE);
    expect(component.dateFormat).toBe('en-GB');
    expect(component.language).toBe('en-GB');
    expect(component.displayedColumns).toEqual([
      'position', 'timestamp', 'amount', 'amountGifted', 'payment.status', 'payment.type', 'actions',
    ]);
    expect(component.dataSource).toBeInstanceOf(MatTableDataSource);
  });

  it('should set mobile page size when small breakpoint matches', () => {
    breakpoint$.next({ matches: true });

    expect(component.pageSize).toBe(MOBILE_PAGE_SIZE);
  });

  it('should keep default page size when breakpoint does not match', () => {
    breakpoint$.next({ matches: false });

    expect(component.pageSize).toBe(PAGE_SIZE);
  });

  it('should update hasAdminRole based on auth user service', () => {
    authUser$.next({ hasAdminRole: true });

    expect(component.hasAdminRole).toBeTrue();

    authUser$.next({ hasAdminRole: false });

    expect(component.hasAdminRole).toBeFalse();
  });

  it('should extract account ID from route and dispatch Clean on init', () => {
    // Ensure the route parameter is correctly mocked
    paramMapSpy.get.and.callFake((key: string) => {
      if (key === 'id') {
        return 'account-123';
      }
      return null;
    });

    // Reset dispatch calls and initialize
    storeSpy.dispatch.calls.reset();
    component.ngOnInit();

    expect(component.accountId).toEqual('account-123');
    expect(storeSpy.dispatch).toHaveBeenCalledWith(clean());
  });

  it('should dispatch GetTransactionsByAccountId after view init', () => {
    component.accountId = 'account-123';
    expect(component.accountId).toBe('account-123');
    component.sort = { active: 'timestamp', direction: 'desc' } as MatSort;

    component.ngAfterViewInit();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getTransactionsByAccountId(
        {
          id: 'account-123',
          page: 0,
          sort: 'timestamp',
          direction: 'desc',
          size: PAGE_SIZE,
        },
      ),
    );
  });

  it('should update account and transactions from state', () => {
    // Mock paginator and sort to prevent subscription errors
    component.paginator = {
      pageIndex: 0,
      page: of({}),
    } as MatPaginator;
    component.sort = {
      active: 'timestamp',
      direction: 'desc',
      sortChange: of({}),
    } as MatSort;

    component.ngOnInit();

    const stateWithData = {
      data: {
        account: mockAccount,
        transactions: {
          content: mockTransactions,
          totalElements: 2,
        },
      },
    };

    state$.next(stateWithData);

    expect(component.account).toEqual(mockAccount);
    expect(component.dataSource.length).toBe(2);
    expect(component.resultsLength).toBe(2);
  });

  it('should handle empty state gracefully', () => {
    component.ngOnInit();

    state$.next({});

    expect(component.account).toBeUndefined();
    expect(component.dataSource).toBeUndefined();
    expect(component.resultsLength).toBe(0);
  });

  it('should transform transactions with date timestamp', () => {
    // Mock paginator and sort to prevent subscription errors
    component.paginator = {
      pageIndex: 0,
      page: of({}),
    } as MatPaginator;
    component.sort = {
      active: 'timestamp',
      direction: 'desc',
      sortChange: of({}),
    } as MatSort;

    component.ngOnInit();

    const stateWithData = {
      data: {
        transactions: {
          content: mockTransactions,
          totalElements: 2,
        },
      },
    };

    state$.next(stateWithData);

    expect(component.dataSource[0].date).toBeDefined();
    expect(component.dataSource[1].date).toBeDefined();
  });

  it('should create page subscriptions when results are available', () => {
    const mockPageObservable = of({ pageIndex: 1 });
    const mockSortObservable = of({ active: 'amount', direction: 'asc' });

    component.paginator = {
      pageIndex: 0,
      page: mockPageObservable,
    } as MatPaginator;
    component.sort = {
      active: 'timestamp',
      direction: 'desc',
      sortChange: mockSortObservable,
    } as MatSort;

    component.ngOnInit();

    const stateWithData = {
      data: {
        transactions: {
          content: mockTransactions,
          totalElements: 2,
        },
      },
    };

    expect(component['paginatorSubscription']).toBeUndefined();

    state$.next(stateWithData);

    expect(component['paginatorSubscription']).toBeDefined();
  });

  it('should reset paginator index and get transactions on sort change', () => {
    component.accountId = 'account-123';
    const sortChangeSubject = new Subject();
    const pageSubject = new Subject();

    component.paginator = {
      pageIndex: 5,
      page: pageSubject,
    } as MatPaginator;
    component.sort = {
      active: 'amount', // This is what getTransactions() will use
      direction: 'asc',  // This is what getTransactions() will use
      sortChange: sortChangeSubject,
    } as MatSort;

    component['createPageSubscriptions']();

    // Update sort properties to simulate what actually happens in sort change
    component.sort.active = 'amount';
    component.sort.direction = 'asc';

    sortChangeSubject.next({ active: 'amount', direction: 'asc' });

    expect(component.paginator.pageIndex).toBe(0);
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getTransactionsByAccountId({
        id: 'account-123',
        page: 0,
        sort: 'amount',
        direction: 'asc',
        size: PAGE_SIZE,
      }),
    );
  });

  it('should get transactions with correct page on paginator page change', () => {
    component.accountId = 'account-123';
    const pageSubject = new Subject();
    const sortChangeSubject = new Subject();

    component.paginator = {
      pageIndex: 2, // This is what getTransactions(pageIndex) will use
      page: pageSubject,
    } as MatPaginator;
    component.sort = {
      active: 'timestamp',
      direction: 'desc',
      sortChange: sortChangeSubject,
    } as MatSort;

    component['createPageSubscriptions']();

    // Update paginator pageIndex to the expected value
    component.paginator.pageIndex = 2;

    pageSubject.next({ pageIndex: 2 });

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getTransactionsByAccountId({
        id: 'account-123',
        page: 2,
        sort: 'timestamp',
        direction: 'desc',
        size: PAGE_SIZE,
      }),
    );
  });

  it('should handle case when account ID is not provided', () => {
    paramMapSpy.get.and.returnValue(null);

    component.ngOnInit();

    expect(component.accountId).toBeUndefined();
  });

  it('should unsubscribe from all subscriptions on destroy', () => {
    component['subscription'] = jasmine.createSpyObj('Subscription', ['unsubscribe']);
    component['paginatorSubscription'] = jasmine.createSpyObj('Subscription', ['unsubscribe']);
    component['authUserServiceSubscription'] = jasmine.createSpyObj('Subscription', ['unsubscribe']);

    component.ngOnDestroy();

    expect(component['subscription']!.unsubscribe).toHaveBeenCalled();
    expect(component['paginatorSubscription']!.unsubscribe).toHaveBeenCalled();
    expect(component['authUserServiceSubscription'].unsubscribe).toHaveBeenCalled();
  });

  it('should handle null payment timestamp gracefully', () => {
    // Mock paginator and sort to prevent subscription errors
    component.paginator = {
      pageIndex: 0,
      page: of({}),
    } as MatPaginator;
    component.sort = {
      active: 'timestamp',
      direction: 'desc',
      sortChange: of({}),
    } as MatSort;

    component.ngOnInit();

    const transactionWithoutTimestamp: ITransaction = {
      id: 'transaction-3',
      amount: 300,
      payment: {
        id: 'payment-3',
        status: 'completed',
        type: 'cash',
      },
    };

    const stateWithData = {
      data: {
        transactions: {
          content: [transactionWithoutTimestamp],
          totalElements: 1,
        },
      },
    };

    state$.next(stateWithData);

    expect(component.dataSource[0].date).toBeDefined();
  });
});
