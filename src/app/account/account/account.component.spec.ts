import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import { AccountComponent } from './account.component';
import { AuthUserService, IAuthUser, initialAuthUser } from '../../services/auth-user.service';
import { IAccountAll, ITransaction } from '../../interfaces/account';
import { getAccountByCustomerId } from '../../store/account.actions';
import { AccountState } from '../../store/reducers/account.reducers';
import { signal } from '@angular/core';

describe('AccountComponent', () => {
  let component: AccountComponent;
  let fixture: ComponentFixture<AccountComponent>;

  let storeSpy: jasmine.SpyObj<Store<AccountState>>;
  let navigateSpy: jasmine.Spy;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;

  let selectedAccount$: BehaviorSubject<any>;
  let subErrors$: BehaviorSubject<any>;
  let response$: BehaviorSubject<any>;
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
    selectedAccount$ = new BehaviorSubject<any>(undefined);
    subErrors$ = new BehaviorSubject<any>(undefined);
    response$ = new BehaviorSubject<any>(undefined);

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', [], {
      authUser: authUserSignal.asReadonly(),
    });

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return selectedAccount$.asObservable();
        case 2:
          return subErrors$.asObservable();
        case 3:
          return response$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [AccountComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountComponent);
    component = fixture.componentInstance;

    const router = TestBed.inject(Router);
    navigateSpy = spyOn(router, 'navigate');

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

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getAccountByCustomerId({ customerId: 'customer-123' }));
  });

  it('should update showAdd correctly based on admin role and customerId', () => {
    authUserSignal.update(prev => ({ ...prev, customerId: 'user-1', hasAdminRole: true }));
    fixture.componentRef.setInput('customerId', 'customer-2');
    fixture.detectChanges();

    expect(component.showAdd()).toBeTrue();

    authUserSignal.update(prev => ({ ...prev, customerId: 'user-1', hasAdminRole: false }));
    fixture.detectChanges();
    expect(component.showAdd()).toBeFalse();
  });

  it('should patch form when selectedAccountSignal emits', () => {
    spyOn(component.form, 'patchValue');

    selectedAccount$.next(mockAccount);
    fixture.detectChanges();

    expect(component.form.patchValue).toHaveBeenCalledWith(mockAccount);
    expect(component.accountSignal()).toEqual(mockAccount);
  });

  it('should handle form errors from subErrorsSignal', () => {
    const errors = [
      { field: 'currency', message: 'Required' },
      { field: 'gift', message: 'Required' },
    ];

    subErrors$.next(errors);
    fixture.detectChanges();

    expect(component.errors().currency).toBe('Required');
    expect(component.errors().gift).toBe('Required');
    expect(component.getForm.currency?.errors).toEqual({ incorrect: true });
    expect(component.getForm.gift?.errors).toEqual({ incorrect: true });
  });

  it('should navigate after responseSignal emits', () => {
    authUserSignal.update(prev => ({ ...prev, customerId: 'user-1', hasAdminRole: true }));
    component.language = 'en';
    fixture.componentRef.setInput('customerId', 'user-1');
    response$.next({ success: true });
    fixture.detectChanges();
    expect(navigateSpy).toHaveBeenCalledWith(['en', 'users', 'user-1', 'overview']);

    authUserSignal.update(prev => ({ ...prev, customerId: 'user-1', hasAdminRole: false }));
    response$.next({ success: true });
    fixture.detectChanges();
    expect(navigateSpy).toHaveBeenCalledWith(['en', 'me', 'overview']);
  });

  it('should dispatch updateAccount on valid submit', () => {
    selectedAccount$.next(mockAccount);
    fixture.componentRef.setInput('customerId', 'user-1');
    fixture.detectChanges();

    component.form.patchValue({ currency: mockCurrency, gift: 10 });
    component.submit();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      jasmine.objectContaining({
        id: 'account-123',
        transaction: jasmine.objectContaining({
          customerId: 'user-1',
          gift: 10,
        } as ITransaction),
      }),
    );
  });

  it('should not dispatch updateAccount if form is invalid', () => {
    selectedAccount$.next(mockAccount);
    authUserSignal.update(prev => ({ ...prev, customerId: 'user-1', hasAdminRole: true }));
    fixture.detectChanges();

    component.form.patchValue({ currency: undefined, gift: undefined });
    storeSpy.dispatch.calls.reset();

    component.submit();

    expect(storeSpy.dispatch).not.toHaveBeenCalled();
  });

  it('should filter currencies correctly in filteredCurrencyOptionsSignal', () => {
    const currencies = [
      { id: '1', code: 'USD', name: 'US Dollar', icon: '$' },
      { id: '2', code: 'EUR', name: 'Euro', icon: '€' },
    ];

    selectedAccount$.next({ ...mockAccount, currencies });
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
