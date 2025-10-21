import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { TransactionDetailComponent } from './transaction-detail.component';
import { ITransaction } from '../../../interfaces/account';
import { getTransaction } from '../../../store/account.actions';
import { notifyPayment, paymentSend } from '../../../store/payment.actions';
import { AppState } from '../../../store/app.states';

describe('TransactionDetailComponent', () => {
  let component: TransactionDetailComponent;
  let fixture: ComponentFixture<TransactionDetailComponent>;

  let state$: Subject<any>;

  let storeSpy: jasmine.SpyObj<Store<AppState>>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;

  let translateService: TranslateService;

  const mockTransaction: ITransaction = {
    id: 'transaction-123',
    amount: 100,
    amountGifted: 10,
    payment: {
      id: 'payment-123',
      preferenceId: 'preference-123',
      type: 'card',
      paymentURL: 'https://payment.url',
      timestamp: 1672574400000,
    },
  };

  beforeEach(async () => {
    state$ = new Subject();

    const paramMapSpy = jasmine.createSpyObj<ParamMap>('ParamMap', ['get']);

    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: paramMapSpy,
      },
    });

    storeSpy.select.and.returnValue(state$.asObservable());
    routerSpy.getCurrentNavigation.and.returnValue({ extras: { state: { step: 2 } } } as any);
    paramMapSpy.get.and.callFake((param: string) => {
      if (param === 'id') {
        return 'account-123';
      }
      if (param === 'transactionId') {
        return 'transaction-123';
      }
      return null;
    });

    await TestBed.configureTestingModule({
      imports: [TransactionDetailComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    translateService = TestBed.inject(TranslateService);
    translateService.setDefaultLang('en-GB');
    translateService.use('en-GB');

    fixture = TestBed.createComponent(TransactionDetailComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => state$.complete());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with route parameters', () => {
    fixture.detectChanges();

    expect(component['id']).toBe('account-123');
    expect(component['transactionId']).toBe('transaction-123');
  });

  it('should set initial properties from constructor', () => {
    expect(component.dateFormat).toBe('en-GB');
    expect(component.step).toBe(2);
    expect(component.language).toBe('en-GB');
  });

  it('should dispatch GetTransaction action on init', () => {
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getTransaction({ id: 'account-123', transactionId: 'transaction-123' }),
    );
  });

  it('should update transaction when state has selected transaction', () => {
    fixture.detectChanges();

    const stateWithTransaction = {
      selected: mockTransaction,
    };

    state$.next(stateWithTransaction);

    expect(component.transaction).toBeDefined();
    expect(component.transaction?.id).toBe('transaction-123');
    expect(component.transaction?.amount).toBe(100);
    expect(component.transaction?.date).toBeDefined();
  });

  it('should navigate to payment path when response has path', () => {
    fixture.detectChanges();

    const stateWithPath = {
      response: { path: 'some/path' },
    };

    state$.next(stateWithPath);

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB/some/path']);
  });

  it('should navigate to payment page when there are subErrors', () => {
    fixture.detectChanges();

    const stateWithErrors = {
      subErrors: [{ message: 'Payment failed' }],
    };

    state$.next(stateWithErrors);

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'me', 'transaction', 'account-123', 'payment']);
  });

  it('should dispatch PaymentSend action when pay getter is called', () => {
    component.transaction = mockTransaction;

    void component.pay;

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      paymentSend({ link: 'https://payment.url' }),
    );
  });

  it('should dispatch NotifyPayment action when notify getter is called', () => {
    component.transaction = mockTransaction;

    void component.notify;

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      notifyPayment({
        id: 'payment-123',
        path: 'transaction',
        resourceId: 'transaction-123',
        preferenceId: 'preference-123',
        paymentType: 'card',
      }),
    );
  });

  it('should handle case when getCurrentNavigation returns null', () => {
    routerSpy.getCurrentNavigation.and.returnValue(null);

    const newComponent = new TransactionDetailComponent(storeSpy, activatedRouteSpy, translateService, routerSpy);

    expect(newComponent.step).toBeUndefined();
  });

  it('should unsubscribe on destroy', () => {
    fixture.detectChanges();
    spyOn(component['subscription']!, 'unsubscribe');

    component.ngOnDestroy();

    expect(component['subscription']!.unsubscribe).toHaveBeenCalled();
  });

  it('should handle empty state gracefully', () => {
    fixture.detectChanges();

    state$.next({});

    expect(component.transaction).toBeUndefined();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should handle state with null selected transaction', () => {
    fixture.detectChanges();

    state$.next({ selected: null });

    expect(component.transaction).toBeUndefined();
  });

  it('should handle notify when transaction has no payment', () => {
    component.transaction = { id: 'transaction-123' };

    expect(() => component.notify).toThrow();
  });
});
