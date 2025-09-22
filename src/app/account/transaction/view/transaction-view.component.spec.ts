import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
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
import * as fromActionsAccount from '../../../store/account.actions';

describe('TransactionViewComponent', () => {
  let component: TransactionViewComponent;
  let fixture: ComponentFixture<TransactionViewComponent>;
  let mockStore: jasmine.SpyObj<Store>;
  let stateSubject: Subject<any>;
  let breakpointSubject: Subject<any>;
  let authUserSubject: Subject<any>;

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

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.returnValue('account-123'),
      },
    },
  };

  beforeEach(async () => {
    stateSubject = new Subject();
    breakpointSubject = new Subject();
    authUserSubject = new Subject();

    const storeSpyObj = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    const changeDetectorSpyObj = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    const authUserSpyObj = jasmine.createSpyObj('AuthUserService', [], {
      authUser: authUserSubject.asObservable(),
    });
    const breakpointSpyObj = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    const translateSpyObj = jasmine.createSpyObj('TranslateService', ['instant', 'get', 'stream'], {
      currentLang: 'en',
      onLangChange: of('en'),
      onTranslationChange: of('en'),
      onDefaultLangChange: of('en'),
    });
    translateSpyObj.get.and.returnValue(of('translated text'));
    translateSpyObj.stream.and.returnValue(of('translated text'));

    storeSpyObj.select.and.returnValue(stateSubject.asObservable());
    breakpointSpyObj.observe.and.returnValue(breakpointSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [
        TransactionViewComponent,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Store, useValue: storeSpyObj },
        { provide: ChangeDetectorRef, useValue: changeDetectorSpyObj },
        { provide: AuthUserService, useValue: authUserSpyObj },
        { provide: BreakpointObserver, useValue: breakpointSpyObj },
        { provide: TranslateService, useValue: translateSpyObj },
      ],
    }).compileComponents();

    mockStore = TestBed.inject(Store) as jasmine.SpyObj<Store>;

    fixture = TestBed.createComponent(TransactionViewComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    stateSubject.complete();
    breakpointSubject.complete();
    authUserSubject.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.hasAdminRole).toBe(false);
    expect(component.pageSize).toBe(PAGE_SIZE);
    expect(component.dateFormat).toBe('en');
    expect(component.language).toBe('en');
    expect(component.displayedColumns).toEqual([
      'position', 'timestamp', 'amount', 'amountGifted', 'payment.status', 'payment.type', 'actions',
    ]);
    expect(component.dataSource).toBeInstanceOf(MatTableDataSource);
  });

  it('should set mobile page size when small breakpoint matches', () => {
    breakpointSubject.next({ matches: true });

    expect(component.pageSize).toBe(MOBILE_PAGE_SIZE);
  });

  it('should keep default page size when breakpoint does not match', () => {
    breakpointSubject.next({ matches: false });

    expect(component.pageSize).toBe(PAGE_SIZE);
  });

  it('should update hasAdminRole based on auth user service', () => {
    authUserSubject.next({ hasAdminRole: true });

    expect(component.hasAdminRole).toBe(true);

    authUserSubject.next({ hasAdminRole: false });

    expect(component.hasAdminRole).toBe(false);
  });

  it('should extract account ID from route and dispatch Clean on init', () => {
    fixture.detectChanges(); // This calls ngOnInit
    component.ngOnInit();

    expect(component.accountId).toEqual('account-123');
    expect(mockStore.dispatch).toHaveBeenCalledWith(new fromActionsAccount.Clean());
  });

  it('should dispatch GetTransactionsByAccountId after view init', () => {
    component.accountId = 'account-123';
    expect(component.accountId).toBe('account-123');
    component.sort = { active: 'timestamp', direction: 'desc' } as MatSort;

    component.ngAfterViewInit();

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      new fromActionsAccount.GetTransactionsByAccountId(
        'account-123',
        0,
        'timestamp',
        'desc',
        PAGE_SIZE,
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

    stateSubject.next(stateWithData);

    expect(component.account).toEqual(mockAccount);
    expect(component.dataSource.length).toBe(2);
    expect(component.resultsLength).toBe(2);
  });

  it('should handle empty state gracefully', () => {
    component.ngOnInit();

    stateSubject.next({});

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

    stateSubject.next(stateWithData);

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

    stateSubject.next(stateWithData);

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
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      new fromActionsAccount.GetTransactionsByAccountId(
        'account-123',
        0,
        'amount',
        'asc',
        PAGE_SIZE,
      ),
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

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      new fromActionsAccount.GetTransactionsByAccountId(
        'account-123',
        2,
        'timestamp',
        'desc',
        PAGE_SIZE,
      ),
    );
  });

  it('should handle case when account ID is not provided', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(null);

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

    stateSubject.next(stateWithData);

    expect(component.dataSource[0].date).toBeDefined();
  });
});
