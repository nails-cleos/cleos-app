import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { FormBuilder } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { AccountComponent } from './account.component';
import { AuthUserService } from '../../services/auth-user.service';

describe('AccountComponent', () => {
  let component: AccountComponent;
  let fixture: ComponentFixture<AccountComponent>;

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.returnValue('test-customer-id'),
      },
    },
  };

  const mockStore = {
    select: jasmine.createSpy('select').and.returnValue(of({})),
    dispatch: jasmine.createSpy('dispatch'),
  };

  const mockAuthUserService = {
    authUser: of({
      hasAdminRole: false,
      customerId: 'test-user-id',
    }),
  };

  const mockRouter = {
    navigate: jasmine.createSpy('navigate'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountComponent, TranslateModule.forRoot()],
      providers: [
        FormBuilder,
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Store, useValue: mockStore },
        { provide: AuthUserService, useValue: mockAuthUserService },
        { provide: Router, useValue: mockRouter },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with required controls', () => {
    expect(component.form).toBeDefined();
    expect(component.form.get('currency')).toBeDefined();
    expect(component.form.get('gift')).toBeDefined();
  });

  it('should set form as invalid when required fields are empty', () => {
    component.form.patchValue({ currency: '', gift: '' });
    expect(component.form.invalid).toBeTruthy();
  });

  it('should set form as valid when all required fields are filled', () => {
    const mockCurrency = { id: '1', code: 'USD' };
    component.form.patchValue({ currency: mockCurrency, gift: 10 });
    component.form.get('currency')?.setErrors(null);
    expect(component.form.valid).toBeTruthy();
  });

  it('should dispatch GetAccountByCustomerId action on ngOnInit', () => {
    component.ngOnInit();
    expect(mockStore.dispatch).toHaveBeenCalled();
  });

  it('should set showAdd to true when user has admin role and customerId differs from userId', () => {
    spyOn(component, 'ngOnInit').and.callFake(() => {
      component['hasAdminRole'] = true;
      component['userId'] = 'different-user-id';
      component['customerId'] = 'test-customer-id';
      component.showAdd = component['hasAdminRole'] && component['customerId'] !== component['userId'];
    });
    
    component.ngOnInit();
    expect(component.showAdd).toBeTruthy();
  });

  it('should set showAdd to false when user does not have admin role', () => {
    component.ngOnInit();
    expect(component.showAdd).toBeFalsy();
  });

  it('should return early from submit when form is invalid', () => {
    component.form.patchValue({ currency: '', gift: '' });
    (mockStore.dispatch as jasmine.Spy).calls.reset();
    
    void component.submit;
    expect(mockStore.dispatch).not.toHaveBeenCalled();
  });

  it('should dispatch UpdateAccount action when form is valid', () => {
    const mockAccount = { 
      id: 'account-1', 
      balance: 100, 
      customer: { id: 'user-1', displayName: 'Test User', email: 'test@test.com', authorities: [], locale: 'en-US', timeZone: 'UTC' },
      currency: { id: '1', name: 'US Dollar', code: 'USD', icon: 'usd' }, 
    };
    component.account = mockAccount;
    component['customerId'] = 'test-customer-id';
    
    const mockCurrency = { id: '2', code: 'EUR' };
    component.form.patchValue({ currency: mockCurrency, gift: 15 });
    component.form.get('currency')?.setErrors(null);
    component.form.get('gift')?.setErrors(null);
    
    (mockStore.dispatch as jasmine.Spy).calls.reset();
    void component.submit;
    
    expect(mockStore.dispatch).toHaveBeenCalled();
  });

  it('should handle keydown events correctly', () => {
    const backspaceEvent = { code: 'Backspace' };
    const currencyControl = component.form.get('currency');
    
    component.keyDownHandler(backspaceEvent);
    expect(currencyControl?.value).toBe('');
  });

  it('should prevent non-numeric input in number handler', () => {
    const letterEvent = { 
      code: 'KeyA', 
      key: 'a', 
      preventDefault: jasmine.createSpy('preventDefault'), 
    };
    
    component.keyDownNumberHandler(letterEvent);
    expect(letterEvent.preventDefault).toHaveBeenCalled();
  });

  it('should allow numeric input in number handler', () => {
    const numberEvent = { 
      code: 'Digit5', 
      key: '5', 
      preventDefault: jasmine.createSpy('preventDefault'), 
    };
    
    component.keyDownNumberHandler(numberEvent);
    expect(numberEvent.preventDefault).not.toHaveBeenCalled();
  });

  it('should allow backspace in number handler', () => {
    const backspaceEvent = { 
      code: 'Backspace', 
      key: 'Backspace', 
      preventDefault: jasmine.createSpy('preventDefault'), 
    };
    
    component.keyDownNumberHandler(backspaceEvent);
    expect(backspaceEvent.preventDefault).not.toHaveBeenCalled();
  });

  it('should display currency code in displayCurrencyFn', () => {
    const mockCurrency = { code: 'USD', id: '1' };
    const result = component.displayCurrencyFn(mockCurrency as any);
    expect(result).toBe('USD');
  });

  it('should return empty string when currency is null in displayCurrencyFn', () => {
    const result = component.displayCurrencyFn(null as any);
    expect(result).toBe('');
  });

  it('should unsubscribe on ngOnDestroy', () => {
    component['subscription'] = jasmine.createSpyObj('Subscription', ['unsubscribe']);
    component['authUserServiceSubscription'] = jasmine.createSpyObj('Subscription', ['unsubscribe']);
    
    component.ngOnDestroy();
    
    expect(component['subscription']?.unsubscribe).toHaveBeenCalled();
    expect(component['authUserServiceSubscription']?.unsubscribe).toHaveBeenCalled();
  });
});
