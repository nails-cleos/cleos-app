import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { TransactionViewComponent } from './transaction-view.component';
import { AuthUserService, IAuthUser, initialAuthUser } from '../../../services/auth-user.service';
import { IAccountAll, IAccountTransaction, ITransaction } from '../../account';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../../interfaces/pagination';
import { signal } from '@angular/core';
import { AccountStore } from '../../../store/account.store';
import { DEFAULT_LOCALE } from '../../../util/dates';

describe('TransactionViewComponent', () => {
  let component: TransactionViewComponent;
  let fixture: ComponentFixture<TransactionViewComponent>;

  let accountTransactionSignal: ReturnType<typeof signal<IAccountTransaction | undefined>>;
  let breakpoint$: BehaviorSubject<any>;
  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  let accountStoreSpy: jasmine.SpyObj<any>;
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
    accountTransactionSignal = signal<IAccountTransaction | undefined>(undefined);
    breakpoint$ = new BehaviorSubject<any>({
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    });
    authUserSignal.update(prev => ({ ...prev, hasAdminRole: false, customerId: 'user-1' }));

    accountStoreSpy = jasmine.createSpyObj('AccountStore', ['clean', 'loadTransactions'], {
      data: accountTransactionSignal.asReadonly(),
      isLoading: signal(false).asReadonly(),
    });
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', [], {
      authUser: authUserSignal.asReadonly(),
    });
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);

    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [TransactionViewComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: AccountStore, useValue: accountStoreSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);

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
    expect(component.dateFormat).toBe(DEFAULT_LOCALE);
    expect(component.language).toBe(DEFAULT_LOCALE);
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

  it('should load transactions when accountId changes', () => {
    fixture.componentRef.setInput('id', 'account-123');
    fixture.detectChanges();

    expect(accountStoreSpy.clean).toHaveBeenCalled();
    expect(accountStoreSpy.loadTransactions).toHaveBeenCalledWith('account-123', {
      page: 0,
      sort: 'timestamp',
      direction: 'desc',
      size: PAGE_SIZE,
    });
  });

  it('should update account and transactions from accountTransactionSignal', () => {
    accountTransactionSignal.set({
      account: mockAccount,
      transactions: {
        content: mockTransactions,
        totalElements: 2,
        totalPages: 1,
        number: 0,
      },
    });
    fixture.detectChanges();

    expect(component.accountSignal()).toEqual(mockAccount);
    expect(component.dataSourceSignal()?.length).toBe(2);
    expect(component.resultsLengthSignal()).toBe(2);
  });

  it('should handle empty accountTransaction signal gracefully', () => {
    accountTransactionSignal.set(undefined);
    fixture.detectChanges();

    expect(component.accountSignal()).toBeUndefined();
    expect(component.dataSourceSignal()).toBeUndefined();
    expect(component.resultsLengthSignal()).toBe(0);
  });

  it('should transform transactions with date timestamp', () => {
    accountTransactionSignal.set({
      transactions: {
        content: mockTransactions,
        totalElements: 2,
        totalPages: 1,
        number: 0,
      },
    });
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

    accountTransactionSignal.set({
      transactions: {
        content: [transactionWithoutTimestamp],
        totalElements: 1,
        totalPages: 1,
        number: 0,
      },
    });
    fixture.detectChanges();

    expect(component.dataSourceSignal()?.[0].date).toBeDefined();
  });
});
