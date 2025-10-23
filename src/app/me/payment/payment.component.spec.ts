import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentComponent } from './payment.component';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { getPaymentByResourceId, notifyPayment, paymentSend } from '../../store/payment.actions';

describe('PaymentComponent', () => {
  let component: PaymentComponent;
  let fixture: ComponentFixture<PaymentComponent>;

  let state$: Subject<any>;
  let params$: Subject<any>;

  let storeSpy: jasmine.SpyObj<Store<any>>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    state$ = new Subject<any>();
    params$ = new Subject<any>();

    storeSpy = jasmine.createSpyObj<Store<any>>('Store', ['dispatch', 'select']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      params: params$.asObservable(),
    });

    storeSpy.select.and.returnValue(state$.asObservable());

    await TestBed.configureTestingModule({
      imports: [PaymentComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    state$.complete();
    params$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should unsubscribe on destroy', () => {
    const nextSpy = spyOn(component['destroy$'], 'next').and.callThrough();
    const completeSpy = spyOn(component['destroy$'], 'complete').and.callThrough();

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should dispatch getPaymentByResourceId when getPayments called with no dataSource', () => {
    component['dataSource'] = null as any;
    component['id'] = '123';
    component['path'] = 'transaction';
    (component as any).getPayments();
    expect(storeSpy.dispatch).toHaveBeenCalledWith(getPaymentByResourceId(
      { id: '123', path: 'transaction', redirect: true },
    ));
  });

  it('should dispatch paymentSend when pay called with valid link', () => {
    const payment = { link: 'https://pay', paymentURL: null } as any;
    component.pay(payment);
    expect(storeSpy.dispatch).toHaveBeenCalledWith(paymentSend({ link: 'https://pay' }));
  });

  it('should dispatch paymentSend when pay called with valid paymentURL', () => {
    const payment = { link: null, paymentURL: 'https://pay' } as any;
    component.pay(payment);
    expect(storeSpy.dispatch).toHaveBeenCalledWith(paymentSend({ link: 'https://pay' }));
  });

  it('should dispatch notifyPayment when notify called', () => {
    component['path'] = 'reservation';
    component['id'] = 'res123';
    const payment = {
      id: '1',
      preferenceId: 'pref1',
      type: 'type1',
    } as any;
    component.notify(payment);
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      notifyPayment({
        id: '1',
        path: 'reservation',
        resourceId: 'res123',
        preferenceId: 'pref1',
        paymentType: 'type1',
      }),
    );
  });

  it('should get currency from reservation', () => {
    const payment = { reservation: { room: { currency: { icon: 'usd' } } } } as any;
    expect(component.getCurrency(payment)).toBe('usd');
  });

  it('should get currency from transaction', () => {
    const payment = { transaction: { account: { currency: { icon: 'gbp' } } } } as any;
    expect(component.getCurrency(payment)).toBe('gbp');
  });

  it('should return "euro" when no currency info', () => {
    expect(component.getCurrency({} as any)).toBe('euro');
  });

  it('should clean and navigate when state has path', () => {
    spyOn<any>(component, 'clean').and.callThrough();
    state$.next({ response: { path: 'redirect' } });
    expect(component['clean']).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalled();
  });

  it('should show error when state has subErrors', () => {
    state$.next({ subErrors: [{ message: 'error123' }] });
    expect(component.showError).toBeTrue();
    expect(component.errorMessage).toBe('error123');
  });

  it('should set id and path when route params emitted', () => {
    params$.next({ id: '10', path: 'some-path' });
    expect(component['id']).toBe('10');
    expect(component['path']).toBe('some-path');
  });

  it('should remove error when close', () => {
    component.showError = true;

    component.close();

    expect(component.showError).toBeFalse();
  });
});
