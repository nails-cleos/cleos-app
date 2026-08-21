import {
  beforeEach,
  describe,
  expect,
  it,
  type MockedObject,
  vi,
} from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AccountComponent } from './account.component';
import {
  AuthUserService,
  IAuthUser,
  initialAuthUser,
} from '@app/services/auth-user.service';
import { IAccountAll, ITransaction } from '../account';
import { AccountStore } from '@app/store/account.store';
import { signal } from '@angular/core';
import { NavigationService } from '@app/services/navigation.service';
import { DEFAULT_LOCALE } from '@app/util/dates';
import { provideTranslateService } from '@ngx-translate/core';

describe('AccountComponent', () => {
  let component: AccountComponent;
  let fixture: ComponentFixture<AccountComponent>;
  let navigationServiceSpy: Pick<
    NavigationService,
    'back' | 'navigate' | 'language'
  > & {
    back: ReturnType<typeof vi.fn>;
    navigate: ReturnType<typeof vi.fn>;
  };

  let accountStoreSpy: MockedObject<any>;
  let authUserServiceSpy: Pick<AuthUserService, 'authUser'>;

  let selectedAccountSignal: ReturnType<typeof signal<any>>;
  let subErrorsSignal: ReturnType<typeof signal<any>>;
  let responseSignal: ReturnType<typeof signal<any>>;
  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  const mockCurrency = {
    id: 'eur',
    name: 'Euro',
    code: 'EUR',
    icon: '€',
  };

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
    currency: mockCurrency,
  };

  beforeEach(async () => {
    navigationServiceSpy = {
      back: vi.fn().mockName('NavigationService.back'),
      navigate: vi.fn().mockName('NavigationService.navigate'),
      language: DEFAULT_LOCALE,
    };
    authUserSignal.set(initialAuthUser);
    selectedAccountSignal = signal<any>(undefined);
    subErrorsSignal = signal<any>(undefined);
    responseSignal = signal<any>(undefined);

    accountStoreSpy = {
      clean: vi.fn().mockName('AccountStore.clean'),
      loadAccountByCustomerId: vi
        .fn()
        .mockName('AccountStore.loadAccountByCustomerId'),
      updateAccount: vi.fn().mockName('AccountStore.updateAccount'),
      selected: selectedAccountSignal.asReadonly(),
      subErrors: subErrorsSignal.asReadonly(),
      response: responseSignal.asReadonly(),
      isLoading: signal(false).asReadonly(),
    };
    authUserServiceSpy = {
      authUser: authUserSignal.asReadonly(),
    };

    await TestBed.configureTestingModule({
      imports: [AccountComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: AccountStore, useValue: accountStoreSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        provideRouter([]),
      ],
      teardown: {
        destroyAfterEach: true,
      },
    }).compileComponents();

    fixture = TestBed.createComponent(AccountComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with currency and gift controls', () => {
    expect(component.getForm.currency).toBeDefined();
    expect(component.getForm.gift).toBeDefined();
  });

  it('should dispatch getAccountByCustomerId when customerIdSignal emits', () => {
    fixture.componentRef.setInput('customerId', 'customer-123');
    fixture.detectChanges();

    expect(accountStoreSpy.clean).toHaveBeenCalled();
    expect(accountStoreSpy.loadAccountByCustomerId).toHaveBeenCalledWith(
      'customer-123',
    );
  });

  it('should update showAdd correctly based on admin role and customerId', () => {
    authUserSignal.update((prev) => ({
      ...prev,
      customerId: 'user-1',
      hasAdminRole: true,
    }));
    fixture.componentRef.setInput('customerId', 'customer-2');
    fixture.detectChanges();

    expect(component.showAdd()).toBe(true);

    authUserSignal.update((prev) => ({
      ...prev,
      customerId: 'user-1',
      hasAdminRole: false,
    }));
    fixture.detectChanges();
    expect(component.showAdd()).toBe(false);
  });

  it('should patch form when selectedAccountSignal emits', () => {
    vi.spyOn(component.form, 'patchValue').mockReturnValue(undefined);

    selectedAccountSignal.set(mockAccount);
    fixture.detectChanges();

    expect(component.form.patchValue).toHaveBeenCalledWith(mockAccount);
    expect(component.accountSignal()).toEqual(mockAccount);
  });

  it('should handle form errors from subErrorsSignal', () => {
    const errors = [
      { field: 'currency', message: 'Required' },
      { field: 'gift', message: 'Required' },
    ];

    subErrorsSignal.set(errors);
    fixture.detectChanges();

    expect(component.errors().currency).toBe('Required');
    expect(component.errors().gift).toBe('Required');
    expect(component.getForm.currency?.errors).toEqual({ incorrect: true });
    expect(component.getForm.gift?.errors).toEqual({ incorrect: true });
  });

  it('should navigate after responseSignal emits', () => {
    authUserSignal.update((prev) => ({
      ...prev,
      customerId: 'user-1',
      hasAdminRole: true,
    }));
    component.language = 'en';
    fixture.componentRef.setInput('customerId', 'user-1');
    responseSignal.set({ success: true });
    fixture.detectChanges();
    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith([
      'users',
      'user-1',
      'overview',
    ]);

    authUserSignal.update((prev) => ({
      ...prev,
      customerId: 'user-1',
      hasAdminRole: false,
    }));
    responseSignal.set({ success: true });
    fixture.detectChanges();
    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith([
      'me',
      'overview',
    ]);
  });

  it('should dispatch updateAccount on valid submit', () => {
    selectedAccountSignal.set(mockAccount);
    fixture.componentRef.setInput('customerId', 'user-1');
    fixture.detectChanges();

    component.form.patchValue({ currency: mockCurrency, gift: 10 });
    component.submit();

    expect(accountStoreSpy.updateAccount).toHaveBeenCalledWith(
      'account-123',
      expect.objectContaining({
        customerId: 'user-1',
        gift: 10,
      } as ITransaction),
    );
  });

  it('should not dispatch updateAccount if form is invalid', () => {
    selectedAccountSignal.set(mockAccount);
    authUserSignal.update((prev) => ({
      ...prev,
      customerId: 'user-1',
      hasAdminRole: true,
    }));
    fixture.detectChanges();

    component.form.patchValue({ currency: undefined, gift: undefined });
    accountStoreSpy.updateAccount.mockClear();

    component.submit();

    expect(accountStoreSpy.updateAccount).not.toHaveBeenCalled();
  });

  it('should filter currencies correctly in filteredCurrencyOptionsSignal', () => {
    const currencies = [
      { id: '1', code: 'USD', name: 'US Dollar', icon: '$' },
      { id: '2', code: 'EUR', name: 'Euro', icon: '€' },
    ];

    selectedAccountSignal.set({ ...mockAccount, currencies });
    fixture.detectChanges();

    (component.getForm.currency as any).setValue('U');
    fixture.detectChanges();

    expect(component.filteredCurrencyOptionsSignal()).toEqual([
      { id: '1', code: 'USD', name: 'US Dollar', icon: '$' },
    ]);

    (component.getForm.currency as any).setValue('');
    fixture.detectChanges();

    expect(component.filteredCurrencyOptionsSignal()).toEqual(currencies);
  });
});
