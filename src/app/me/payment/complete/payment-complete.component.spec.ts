import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentCompleteComponent } from './payment-complete.component';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { PaymentState } from '../../../store/reducers/payment.reducers';

describe('PaymentCompleteComponent', () => {
  let component: PaymentCompleteComponent;
  let fixture: ComponentFixture<PaymentCompleteComponent>;

  let storeSpy: jasmine.SpyObj<Store<PaymentState>>;
  let routerSpy: jasmine.SpyObj<Router>;

  let paymentResultParams$: Subject<any>;
  let subErrors$: Subject<any>;
  let response$: Subject<any>;

  beforeEach(async () => {
    paymentResultParams$ = new Subject();
    subErrors$ = new Subject();
    response$ = new Subject();

    storeSpy = jasmine.createSpyObj<Store<PaymentState>>('Store', ['dispatch', 'pipe']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return paymentResultParams$.asObservable();
        case 2:
          return subErrors$.asObservable();
        case 3:
          return response$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [PaymentCompleteComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');

    fixture = TestBed.createComponent(PaymentCompleteComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    paymentResultParams$.complete();
    subErrors$.complete();
    response$.complete();
  });

  it('should create and dispatch paymentSave when params are valid', () => {
    paymentResultParams$.next({
      id: '123',
      path: 'reservation',
      status: 'approved',
      paymentId: 'pid',
      preferenceId: 'pref-1',
      payerId: null,
      token: null,
      reason: null,
      orderId: null,
      orderStatusId: null,
    });

    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(storeSpy.dispatch).toHaveBeenCalled();
  });

  it('should navigate back when subErrors exist', () => {
    // First emit valid params (required for path/id)
    paymentResultParams$.next({
      id: '123',
      path: 'reservation',
      status: 'approved',
      paymentId: 'pid',
      preferenceId: 'pref',
    });
    subErrors$.next([{ message: 'error' }]);

    fixture.detectChanges();

    expect(routerSpy.navigate).toHaveBeenCalledWith([
      'en-GB',
      'me',
      'reservation',
      '123',
      'payment',
    ]);
  });

  it('should navigate when response has path', () => {
    response$.next({ path: 'dashboard' });

    fixture.detectChanges();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB/dashboard']);
  });
});
