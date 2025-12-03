import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';

import { TransactionViewComponent } from './transaction-view.component';
import { AuthUserService, IAuthUser, initialAuthUser } from '../../../services/auth-user.service';
import { IAccountAll, ITransaction } from '../../../interfaces/account';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../../interfaces/pagination';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AccountState } from '../../../store/reducers/account.reducers';
import { signal } from '@angular/core';

describe('TransactionViewComponent', () => {
  let component: TransactionViewComponent;
  let fixture: ComponentFixture<TransactionViewComponent>;

  let accountId$: BehaviorSubject<string | undefined>;
  let accountTransaction$: BehaviorSubject<any>;
  let breakpoint$: BehaviorSubject<any>;
  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  let storeSpy: jasmine.SpyObj<Store<AccountState>>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
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
    accountId$ = new BehaviorSubject<string | undefined>(undefined);
    accountTransaction$ = new BehaviorSubject<any>(undefined);
    breakpoint$ = new BehaviorSubject<any>({
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    });
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj<ParamMap>('ParamMap', ['get']),
      },
    });
    authUserSignal.update(prev => ({ ...prev, hasAdminRole: false, customerId: 'user-1' }));

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', [], {
      authUser: authUserSignal.asReadonly(),
    });
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);

    let pipeCallCount = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallCount++;
      if (pipeCallCount === 1) {
        return accountId$.asObservable();
      }
      if (pipeCallCount === 2) {
        return accountTransaction$.asObservable();
      }
      return new BehaviorSubject(undefined).asObservable();
    });

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
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.setDefaultLang('en-GB');
    translateService.use('en-GB');

    fixture = TestBed.createComponent(TransactionViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.hasAdminRole()).toBeFalse();
    expect(component.pageSizeSignal()).toBe(PAGE_SIZE);
    expect(component.dateFormat).toBe('en-GB');
    expect(component.language).toBe('en-GB');
    expect(component.displayedColumns).toEqual([
      'position', 'timestamp', 'amount', 'amountGifted', 'payment.status', 'payment.type', 'actions',
    ]);
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

  it('should update hasAdminRole signal based on auth user', () => {
    authUserSignal.update(prev => ({ ...prev, hasAdminRole: true, customerId: 'user-1' }));
    fixture.detectChanges();

    expect(component.hasAdminRole()).toBeTrue();

    authUserSignal.update(prev => ({ ...prev, hasAdminRole: false, customerId: 'user-2' }));
    fixture.detectChanges();

    expect(component.hasAdminRole()).toBeFalse();
  });

  it('should dispatch getTransactionsByAccountId when accountId changes', () => {
    (storeSpy.dispatch as jasmine.Spy).calls.reset();

    accountId$.next('account-123');
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalled();
  });

  it('should update account and transactions from accountTransactionSignal', () => {
    const mockData = {
      account: mockAccount,
      transactions: {
        content: mockTransactions,
        totalElements: 2,
      },
    };

    accountTransaction$.next(mockData);
    fixture.detectChanges();

    expect(component.accountSignal()).toEqual(mockAccount);
    expect(component.dataSourceSignal()?.length).toBe(2);
    expect(component.resultsLengthSignal()).toBe(2);
  });

  it('should handle empty accountTransaction signal gracefully', () => {
    accountTransaction$.next(undefined);
    fixture.detectChanges();

    expect(component.accountSignal()).toBeUndefined();
    expect(component.dataSourceSignal()).toBeUndefined();
    expect(component.resultsLengthSignal()).toBe(0);
  });

  it('should transform transactions with date timestamp', () => {
    const mockData = {
      transactions: {
        content: mockTransactions,
        totalElements: 2,
      },
    };

    accountTransaction$.next(mockData);
    fixture.detectChanges();

    const dataSource = component.dataSourceSignal();
    expect(dataSource?.[0].date).toBeDefined();
    expect(dataSource?.[1].date).toBeDefined();
  });

  it('should handle null payment timestamp gracefully', () => {
    const transactionWithoutTimestamp: ITransaction = {
      id: 'transaction-3',
      amount: 300,
      payment: {
        id: 'payment-3',
        status: 'completed',
        type: 'cash',
      },
    };

    const mockData = {
      transactions: {
        content: [transactionWithoutTimestamp],
        totalElements: 1,
      },
    };

    accountTransaction$.next(mockData);
    fixture.detectChanges();

    const dataSource = component.dataSourceSignal();
    expect(dataSource?.[0].date).toBeDefined();
  });

  it('should compute sortActive from sort viewChild', () => {
    expect(component['sortActive']()).toBe('timestamp');
  });

  it('should compute sortDirection from sort viewChild', () => {
    expect(component['sortDirection']()).toBe('asc');
  });

  it('should have paginatorPageIndex signal initialized to 0', () => {
    expect(component.paginatorPageIndex()).toBe(0);
  });

  it('should compute transactionsSignal from accountTransactionSignal', () => {
    const mockData = {
      transactions: {
        content: mockTransactions,
        totalElements: 2,
      },
    };

    accountTransaction$.next(mockData);
    fixture.detectChanges();

    expect(component['transactionsSignal']()).toEqual(jasmine.objectContaining({
      content: mockTransactions,
      totalElements: 2,
    }));
  });

  it('should return 0 for resultsLengthSignal when no transactions', () => {
    accountTransaction$.next({ transactions: undefined });
    fixture.detectChanges();

    expect(component.resultsLengthSignal()).toBe(0);
  });

  it('should compute authUserSignal from authUser observable', () => {
    authUserSignal.update(prev => ({ ...prev, hasAdminRole: true, customerId: 'admin-1' }));
    fixture.detectChanges();

    expect(component['authUserSignal']()).toEqual(jasmine.objectContaining({
      hasAdminRole: true,
      customerId: 'admin-1',
    }));
  });
});
