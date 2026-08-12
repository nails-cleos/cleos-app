import {
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  type MockedObject,
  vi,
} from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TransactionComponent } from './transaction.component';
import {
  AuthUserService,
  IAuthUser,
  initialAuthUser,
} from '@app/services/auth-user.service';
import { IAccountAll, ITransaction } from '../account';
import { IPaymentOption } from '@app/interfaces/payment';
import { signal } from '@angular/core';
import { NavigationService } from '@app/services/navigation.service';
import { provideAppIcons } from '@app/util/app-icons.provider';
import { AccountStore } from '@app/store/account.store';
import { DEFAULT_LOCALE } from '@app/util/dates';
import { PaymentStore } from '@app/store/payment.store';
import { provideTranslateService } from '@ngx-translate/core';

describe('TransactionComponent', () => {
  let component: TransactionComponent;
  let fixture: ComponentFixture<TransactionComponent>;
  let navigationServiceSpy: Pick<
    NavigationService,
    'back' | 'navigate' | 'language'
  > & {
    back: ReturnType<typeof vi.fn>;
    navigate: ReturnType<typeof vi.fn>;
  };

  let selectedAccountSignal: ReturnType<typeof signal<IAccountAll | undefined>>;
  let subErrorsSignal: ReturnType<typeof signal<any>>;
  let responseSignal: ReturnType<typeof signal<any>>;
  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  let paymentStoreSpy: {
    options: ReturnType<typeof signal>;
    getOptions: Mock;
  };
  let accountStoreSpy: MockedObject<any>;
  let authUserServiceSpy: Pick<AuthUserService, 'authUser'>;

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

  beforeEach(async () => {
    navigationServiceSpy = {
      back: vi.fn().mockName('NavigationService.back'),
      navigate: vi.fn().mockName('NavigationService.navigate'),
      language: DEFAULT_LOCALE,
    };
    const paymentOptions = [
      {
        type: 'CASH',
        label: 'Cash',
        enabled: true,
        default: true,
        filter: true,
        defaultFilter: false,
        show: true,
        icon: 'cash',
      },
      {
        type: 'TRANSFER',
        label: 'Transfer',
        enabled: true,
        default: true,
        filter: true,
        defaultFilter: false,
        show: true,
        icon: 'transfer',
      },
      {
        type: 'MOLLIE',
        label: 'Mollie',
        enabled: true,
        default: false,
        filter: true,
        defaultFilter: false,
        show: true,
      },
    ];
    paymentStoreSpy = {
      options: signal(paymentOptions),
      getOptions: vi.fn().mockName('getOptions'),
    };
    authUserSignal.set(initialAuthUser);
    selectedAccountSignal = signal<any>(undefined);
    subErrorsSignal = signal<any>(undefined);
    responseSignal = signal<any>(undefined);

    accountStoreSpy = {
      clean: vi.fn().mockName('AccountStore.clean'),
      loadAccount: vi.fn().mockName('AccountStore.loadAccount'),
      createTransaction: vi.fn().mockName('AccountStore.createTransaction'),
      selected: selectedAccountSignal.asReadonly(),
      subErrors: subErrorsSignal.asReadonly(),
      response: responseSignal.asReadonly(),
    };
    authUserServiceSpy = {
      authUser: authUserSignal.asReadonly(),
    };

    await TestBed.configureTestingModule({
      imports: [TransactionComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: AccountStore, useValue: accountStoreSpy },
        { provide: PaymentStore, useValue: paymentStoreSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null } } },
        },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        provideAppIcons(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.amountMin).toBe(100);
    expect(component.language).toBe(DEFAULT_LOCALE);
    expect(component.types().map((option) => option.type)).toEqual([
      'CASH',
      'TRANSFER',
    ]);
    expect(component.errors()).toEqual({});
  });

  it('should have created the reactive form', () => {
    expect(component.form).toBeDefined();
    expect(component.getForm.amount).toBeDefined();
    expect(component.getBankForm.option).toBeDefined();
    expect(component.getForm.transfer).toBeDefined();
    expect(component.getBankForm.percentage).toBeDefined();
  });

  it('should have validators configured (required & min)', () => {
    const amountControl = component.getForm.amount!;
    const typeControl = component.getBankForm.option!;

    expect(typeControl.hasError('required')).toBe(true);

    amountControl.setValue(50);
    expect(amountControl.hasError('min')).toBe(true);

    amountControl.setValue(150);
    expect(amountControl.hasError('min')).toBe(false);
  });

  it('should load the account and payment options when accountId signal emits an id', () => {
    paymentStoreSpy.getOptions.mockClear();
    fixture.componentRef.setInput('id', 'account-123');

    fixture.detectChanges();

    expect(accountStoreSpy.clean).toHaveBeenCalled();
    expect(accountStoreSpy.loadAccount).toHaveBeenCalledWith('account-123');
    expect(paymentStoreSpy.getOptions).toHaveBeenCalled();
  });

  it('should react to selectedAccount updates (accountSignal)', () => {
    selectedAccountSignal.set(mockAccount);
    fixture.detectChanges();

    expect(component.accountSignal()?.id).toBe('account-123');
    expect(component.currencyIcon).toBeDefined();
    expect(typeof component.currencyIcon).toBe('string');
  });

  it('should compute admin payment options locally', () => {
    authUserSignal.update((prev) => ({ ...prev, hasAdminRole: true }));
    fixture.detectChanges();

    expect(component.optionsSignal().map((option) => option.type)).toEqual([
      'CASH',
      'TRANSFER',
    ]);
  });

  it('should compute non-admin payment options locally', () => {
    authUserSignal.update((prev) => ({ ...prev, hasAdminRole: false }));
    fixture.detectChanges();

    const options = component.optionsSignal();
    expect(options.map((option) => option.type)).toEqual([
      'CASH',
      'TRANSFER',
      'MOLLIE',
    ]);
    expect(options.every((option) => option.hidePercentage)).toBe(true);
  });

  it('should set errors signal when subErrors arrive and set form control errors', () => {
    const errors = [
      { field: 'amount', message: 'Amount is invalid' },
      { field: 'option', message: 'Type is required' },
    ];
    subErrorsSignal.set(errors);
    fixture.detectChanges();

    const currentErrors = component.errors();
    expect(currentErrors['amount']).toBe('Amount is invalid');
    expect(currentErrors['option']).toBe('Type is required');

    expect(component.getForm.amount?.hasError('incorrect')).toBe(true);
    expect(component.getBankForm.option?.hasError('incorrect')).toBe(true);
  });

  it('should navigate to appropriate route when response arrives (admin)', () => {
    selectedAccountSignal.set(mockAccount);
    authUserSignal.update((prev) => ({ ...prev, hasAdminRole: true }));

    responseSignal.set({ success: true });
    fixture.detectChanges();

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith([
      'users',
      'customer-123',
      'overview',
    ]);
  });

  it('should navigate to me overview when response arrives (not admin)', () => {
    authUserSignal.update((prev) => ({ ...prev, hasAdminRole: false }));

    responseSignal.set({ success: true });
    fixture.detectChanges();

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith([
      'me',
      'overview',
    ]);
  });

  it('should not submit when form is invalid', () => {
    accountStoreSpy.createTransaction.mockClear();
    component.submit();
    expect(accountStoreSpy.createTransaction).not.toHaveBeenCalled();
  });

  it('should dispatch createTransaction for selected payment option', () => {
    fixture.componentRef.setInput('id', 'account-123');
    selectedAccountSignal.set(mockAccount);
    fixture.detectChanges();

    component.bankForm.patchValue({
      option: { type: 'CASH', icon: 'cash' } as IPaymentOption,
    });

    component.form.patchValue({
      amount: 200,
      transfer: 'test-transfer',
    });

    component.submit();

    expect(accountStoreSpy.createTransaction).toHaveBeenCalledWith(
      'account-123',
      {
        customerId: 'customer-123',
        amount: 200,
        paymentRequest: {
          type: 'CASH',
          transfer: 'test-transfer',
        },
      } as ITransaction,
    );
  });

  it('should dispatch createTransaction for another payment option', () => {
    fixture.componentRef.setInput('id', 'account-123');
    selectedAccountSignal.set(mockAccount);
    fixture.detectChanges();

    const paymentOption = {
      label: 'Test Payment',
      type: 'PAYPAL',
    } as IPaymentOption;

    component.bankForm.patchValue({
      option: paymentOption,
    });

    component.form.patchValue({
      amount: 300,
      transfer: 'test-transfer',
    });

    accountStoreSpy.createTransaction.mockClear();

    component.submit();

    expect(accountStoreSpy.createTransaction).toHaveBeenCalledWith(
      'account-123',
      {
        customerId: 'customer-123',
        amount: 300,
        paymentRequest: {
          type: 'PAYPAL',
          transfer: 'test-transfer',
        },
      } as ITransaction,
    );
  });

  it('should leave errors when response clears (errors persist until next submission)', () => {
    subErrorsSignal.set([{ field: 'amount', message: 'Amount is invalid' }]);
    fixture.detectChanges();

    expect((component.errors() as any)['amount']).toBe('Amount is invalid');

    responseSignal.set({ success: true });

    expect((component.errors() as any)['amount']).toBe('Amount is invalid');
  });

  it('should handle empty selector emissions gracefully', () => {
    selectedAccountSignal.set(undefined);
    subErrorsSignal.set(undefined);
    responseSignal.set(undefined);

    expect(component.accountSignal()).toBeUndefined();
    expect(component.optionsSignal().map((option) => option.type)).toEqual([
      'CASH',
      'TRANSFER',
      'MOLLIE',
    ]);
  });
});
