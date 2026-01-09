import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import { TransactionComponent } from './transaction.component';
import { AuthUserService, IAuthUser, initialAuthUser } from '../../services/auth-user.service';
import { IAccountAll, ITransaction } from '../../interfaces/account';
import { IPaymentOption, PaymentOption, PaymentType } from '../../interfaces/payment';
import { createTransaction, getAccount, paymentOptions } from '../../store/account.actions';
import { AccountState } from '../../store/reducers/account.reducers';
import { signal } from '@angular/core';

describe('TransactionComponent', () => {
  let component: TransactionComponent;
  let fixture: ComponentFixture<TransactionComponent>;

  let accountId$: BehaviorSubject<string | null>;
  let selectedAccount$: BehaviorSubject<IAccountAll | undefined>;
  let paymentOptions$: BehaviorSubject<any>;
  let subErrors$: BehaviorSubject<any>;
  let response$: BehaviorSubject<any>;
  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  let storeSpy: jasmine.SpyObj<Store<AccountState>>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let routerSpy: jasmine.SpyObj<Router>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;

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
    accountId$ = new BehaviorSubject<any>(null);
    selectedAccount$ = new BehaviorSubject<any>(undefined);
    paymentOptions$ = new BehaviorSubject<any>(undefined);
    subErrors$ = new BehaviorSubject<any>(undefined);
    response$ = new BehaviorSubject<any>(undefined);

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', [], {
      authUser: authUserSignal.asReadonly(),
    });
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
          return accountId$.asObservable();
        case 2:
          return selectedAccount$.asObservable();
        case 3:
          return paymentOptions$.asObservable();
        case 4:
          return subErrors$.asObservable();
        case 5:
          return response$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [TransactionComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');

    fixture = TestBed.createComponent(TransactionComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {
    accountId$.complete();
    selectedAccount$.complete();
    paymentOptions$.complete();
    subErrors$.complete();
    response$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.amountMin).toBe(100);
    expect(component.language).toBe('en-GB');
    expect(component.types).toEqual([{ type: PaymentType.cash }, { type: PaymentType.transfer }] as IPaymentOption[]);
    expect(component.errors()).toEqual({});
  });

  it('should have created the reactive form', () => {
    expect(component.form).toBeDefined();
    expect(component.getForm.amount).toBeDefined();
    expect(component.getBankForm.type).toBeDefined();
    expect(component.getForm.transfer).toBeDefined();
    expect(component.getBankForm.bank).toBeDefined();
  });

  it('should have validators configured (required & min)', () => {
    const amountControl = component.getForm.amount!;
    const typeControl = component.getBankForm.type!;

    expect(typeControl.hasError('required')).toBeTrue();

    amountControl.setValue(50);
    expect(amountControl.hasError('min')).toBeTrue();

    amountControl.setValue(150);
    expect(amountControl.hasError('min')).toBeFalse();
  });

  it('should dispatch getAccount when accountId signal emits an id', () => {
    storeSpy.dispatch.calls.reset();
    accountId$.next('account-123');

    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getAccount({ id: 'account-123' }));
  });

  it('should react to selectedAccount updates (accountSignal)', () => {
    selectedAccount$.next(mockAccount);
    fixture.detectChanges();

    expect(component.accountSignal()?.id).toBe('account-123');
    expect(component.currencyIcon).toBeDefined();
    expect(typeof component.currencyIcon).toBe('string');
  });

  it('should react to paymentOptions and compute optionsSignal', () => {
    const optionsPayload = [
      {
        name: 'Test Payment Option',
        image: 'test-image.png',
        id: 'test-id',
        paymentOptionSubList: [{ name: 'Sub Option', image: 'sub-image.png', id: 'sub-id' }],
      },
    ];
    paymentOptions$.next(optionsPayload);
    fixture.detectChanges();

    const opts = component.optionsSignal();
    expect(opts).toBeDefined();
    expect(Array.isArray(opts)).toBeTrue();
    expect((opts as any).length).toBeGreaterThan(0);
  });

  it('should set errors signal when subErrors arrive and set form control errors', () => {
    const errors = [
      { field: 'amount', message: 'Amount is invalid' },
      { field: 'type', message: 'Type is required' },
    ];
    subErrors$.next(errors);
    fixture.detectChanges();

    const currentErrors = component.errors();
    expect(currentErrors['amount']).toBe('Amount is invalid');
    expect(currentErrors['type']).toBe('Type is required');

    expect(component.getForm.amount?.hasError('incorrect')).toBeTrue();
    expect(component.getBankForm.type?.hasError('incorrect')).toBeTrue();
  });

  it('should navigate to appropriate route when response arrives (admin)', () => {
    selectedAccount$.next(mockAccount);
    authUserSignal.update(prev => ({ ...prev, hasAdminRole: true }));

    response$.next({ success: true });
    fixture.detectChanges();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'users', 'customer-123', 'overview']);
  });

  it('should navigate to me overview when response arrives (not admin)', () => {
    authUserSignal.update(prev => ({ ...prev, hasAdminRole: false }));

    response$.next({ success: true });
    fixture.detectChanges();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'me', 'overview']);
  });

  it('should not submit when form is invalid', () => {
    storeSpy.dispatch.calls.reset();
    component.submit();
    expect(storeSpy.dispatch).not.toHaveBeenCalled();
  });

  it('should dispatch createTransaction for string PaymentType', () => {
    accountId$.next('account-123');
    selectedAccount$.next(mockAccount);

    component.bankForm.patchValue({
      type: { type: PaymentType.cash } as PaymentOption,
    });

    component.form.patchValue({
      amount: 200,
      transfer: 'test-transfer',
    });

    component.submit();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      createTransaction({
        id: 'account-123',
        transaction: {
          customerId: 'customer-123',
          amount: 200,
          paymentRequest: {
            type: PaymentType.cash,
            paymentOptionId: undefined,
            transfer: 'test-transfer',
            bic: undefined,
          },
        } as ITransaction,
      }),
    );
  });

  it('should dispatch createTransaction for PaymentOption type without subTypes', () => {
    accountId$.next('account-123');
    selectedAccount$.next(mockAccount);

    const paymentOption = new PaymentOption('Test Payment', PaymentType.paynl, 'test-icon', 'test-image', 'test-bic');

    component.bankForm.patchValue({
      type: paymentOption,
    });

    component.form.patchValue({
      amount: 300,
      transfer: 'test-transfer',
    });

    storeSpy.dispatch.calls.reset();

    component.submit();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      createTransaction({
        id: 'account-123',
        transaction: {
          customerId: 'customer-123',
          amount: 300,
          paymentRequest: {
            type: PaymentType.paynl,
            paymentOptionId: 'test-bic' as any,
            transfer: 'test-transfer',
            bic: undefined,
          },
        } as ITransaction,
      }),
    );
  });

  it('should dispatch createTransaction for PaymentOption with subTypes and selected bank', () => {
    accountId$.next('account-123');
    selectedAccount$.next(mockAccount);

    const subOption = new PaymentOption('Sub Option', PaymentType.ideal, 'sub-icon', 'sub-image', 'sub-bic');
    const paymentOption = new PaymentOption(
      'Test Payment',
      PaymentType.ideal,
      'test-icon',
      'test-image',
      'test-bic',
      [subOption],
    );

    component.bankForm.patchValue({
      type: paymentOption,
      bank: { bic: 'selected-bic' } as PaymentOption,
    });

    component.form.patchValue({
      amount: 400,
      transfer: 'test-transfer',
    });

    storeSpy.dispatch.calls.reset();
    component.submit();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      createTransaction({
        id: 'account-123',
        transaction: {
          customerId: 'customer-123',
          amount: 400,
          paymentRequest: {
            type: PaymentType.ideal,
            paymentOptionId: 'test-bic' as any,
            transfer: 'test-transfer',
            bic: 'selected-bic',
          },
        } as ITransaction,
      }),
    );
  });

  it('should dispatch paymentOptions action when hasAdminRole() is false and computed runs', () => {
    storeSpy.dispatch.calls.reset();

    authUserSignal.update(prev => ({ ...prev, hasAdminRole: true }));
    fixture.detectChanges();

    expect(component.hasAdminRole()).toBeTrue();
    expect(storeSpy.dispatch).not.toHaveBeenCalledWith(paymentOptions());

    authUserSignal.update(prev => ({ ...prev, hasAdminRole: false }));
    fixture.detectChanges();

    expect(component.hasAdminRole()).toBeFalse();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(paymentOptions());
  });

  it('should leave errors when response clears (errors persist until next submission)', () => {
    subErrors$.next([{ field: 'amount', message: 'Amount is invalid' }]);
    fixture.detectChanges();

    expect((component.errors() as any)['amount']).toBe('Amount is invalid');

    response$.next({ success: true });

    expect((component.errors() as any)['amount']).toBe('Amount is invalid');
  });

  it('should handle empty selector emissions gracefully', () => {
    selectedAccount$.next(undefined);
    paymentOptions$.next(undefined);
    subErrors$.next(undefined);
    response$.next(undefined);

    expect(component.accountSignal()).toBeUndefined();
    expect(component.optionsSignal()).toBeUndefined();
  });
});
