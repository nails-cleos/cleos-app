import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OptionComponent } from './option.component';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { IPaymentOption, PaymentType } from '../../../interfaces/payment';
import { getPaymentByResourceId } from '../../../store/payment.actions';
import { IReservationAll } from '../../../interfaces/reservation';
import { provideHttpClient } from '@angular/common/http';

describe('OptionComponent', () => {
  let component: OptionComponent;
  let fixture: ComponentFixture<OptionComponent>;

  let storeSpy: jasmine.SpyObj<Store<any>>;
  let routerSpy: jasmine.SpyObj<Router>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;

  let reservationId$: BehaviorSubject<any>;
  let payments$: BehaviorSubject<any>;
  let breakpoint$: BehaviorSubject<any>;

  beforeEach(async () => {
    reservationId$ = new BehaviorSubject(undefined);
    payments$ = new BehaviorSubject(undefined);
    breakpoint$ = new BehaviorSubject(undefined);

    storeSpy = jasmine.createSpyObj('Store', ['dispatch', 'pipe']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    // Simulate the signal order
    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return reservationId$.asObservable();
        case 2:
          return payments$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [OptionComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    reservationId$.complete();
    payments$.complete();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch getPaymentByResourceId when reservationId is emitted', () => {
    reservationId$.next('res-123');
    fixture.detectChanges();
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getPaymentByResourceId({ id: 'res-123', path: 'reservation' }),
    );
  });

  it('should derive options from the reservation room payment types', () => {
    const paymentsMock = [{
      reservation: {
        id: 'res1',
        room: { paymentTypes: [PaymentType.paypal, PaymentType.ideal], currency: { icon: 'euro' } },
        state: 'CONFIRMED',
        treatment: { price: 100 },
      } as IReservationAll,
      amount: 100,
    }];

    payments$.next(paymentsMock);
    fixture.detectChanges();

    expect(component.options()).toEqual(jasmine.arrayContaining([
      jasmine.objectContaining({ type: PaymentType.paypal }),
      jasmine.objectContaining({ type: PaymentType.ideal }),
    ]));
    expect(component.reservation()).toEqual(paymentsMock[0].reservation);
  });

  it('should keep local options empty when no online payment type is available', () => {
    const paymentsMock = [{
      reservation: {
        id: 'res2',
        room: { paymentTypes: [PaymentType.cash, PaymentType.transfer], currency: { icon: 'euro' } },
        state: 'CONFIRMED',
        treatment: { price: 100 },
      },
      amount: 50,
    }];

    payments$.next(paymentsMock);
    fixture.detectChanges();
    expect(component.options()).toEqual([]);
  });

  it('should dispatch createPaymentLinkByReservationId on pay()', () => {
    reservationId$.next('res-123');
    payments$.next([{
      reservation: {
        id: 'res-123',
        room: { paymentTypes: [PaymentType.paypal], currency: { icon: 'euro' } },
        state: 'CONFIRMED',
        treatment: { price: 100 },
      },
      amount: 100,
    }]);

    fixture.detectChanges();

    const option: IPaymentOption = { name: '', svgIcon: '', type: PaymentType.paypal };
    component.form.controls.type.setValue(option);

    component.pay();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({
      reservationId: 'res-123',
      payment: jasmine.any(Object),
    }));
  });

  it('should not dispatch createPaymentLinkByReservationId if form type is undefined', () => {
    reservationId$.next('res-123');

    component.form.controls.type.setValue(undefined);
    component.pay();

    expect(storeSpy.dispatch).not.toHaveBeenCalledWith(jasmine.objectContaining({
      reservationId: 'res-123',
    }));
  });

  it('should update smallScreen signal based on breakpointObserver', () => {
    breakpoint$.next({ matches: true });
    fixture.detectChanges();
    expect(component.smallScreen()).toBeTrue();
  });
});
