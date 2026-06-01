import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OptionComponent } from './option.component';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { IPaymentOption } from '../../../interfaces/payment';
import { getPaymentByResourceId } from '../../../store/payment.actions';
import { IReservationAll } from '../../../interfaces/reservation';
import { provideHttpClient } from '@angular/common/http';
import { NavigationService } from '../../../services/navigation.service';
import { provideAppIcons } from '../../../util/app-icons.provider';

describe('OptionComponent', () => {
  let component: OptionComponent;
  let fixture: ComponentFixture<OptionComponent>;

  let storeSpy: jasmine.SpyObj<Store<any>>;
  let routerSpy: jasmine.SpyObj<Router>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;

  let payments$: BehaviorSubject<any>;
  let paymentOptions$: BehaviorSubject<any>;
  let breakpoint$: BehaviorSubject<any>;

  beforeEach(async () => {
    payments$ = new BehaviorSubject(undefined);
    paymentOptions$ = new BehaviorSubject([
      {
        type: 'PAYPAL',
        label: 'PayPal',
        enabled: true,
        enabledCustomer: true,
        default: false,
        filter: true,
        defaultFilter: false,
        show: true,
      },
      {
        type: 'IDEAL',
        label: 'iDeal',
        enabled: true,
        enabledCustomer: true,
        default: false,
        filter: true,
        defaultFilter: false,
        show: true,
      },
      {
        type: 'CASH',
        label: 'Cash',
        enabled: true,
        enabledCustomer: false,
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
        enabledCustomer: false,
        default: true,
        filter: true,
        defaultFilter: true,
        show: true,
        icon: 'transfer',
      },
    ]);
    breakpoint$ = new BehaviorSubject(undefined);

    storeSpy = jasmine.createSpyObj('Store', ['dispatch', 'pipe']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    const navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['back']);

    // Simulate the signal order
    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return payments$.asObservable();
        case 2:
          return paymentOptions$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [OptionComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        provideHttpClient(),
        provideAppIcons(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    payments$.complete();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch getPaymentByResourceId when reservationId is emitted', () => {
    fixture.componentRef.setInput('id', 'res-123');
    fixture.detectChanges();
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getPaymentByResourceId({ id: 'res-123', path: 'reservation' }),
    );
  });

  it('should derive options from the reservation room payment types', () => {
    const paymentsMock = [{
      reservation: {
        id: 'res1',
        room: { paymentTypes: ['PAYPAL', 'IDEAL'], currency: { icon: 'euro' } },
        state: 'CONFIRMED',
        treatment: { price: 100 },
      } as IReservationAll,
      amount: 100,
    }];

    payments$.next(paymentsMock);
    fixture.detectChanges();

    expect(component.options()).toEqual(jasmine.arrayContaining([
      jasmine.objectContaining({ type: 'PAYPAL' }),
      jasmine.objectContaining({ type: 'IDEAL' }),
    ]));
    expect(component.reservation()).toEqual(paymentsMock[0].reservation);
  });

  it('should keep local options empty when no online payment type is available', () => {
    const paymentsMock = [{
      reservation: {
        id: 'res2',
        room: { paymentTypes: ['CASH', 'TRANSFER'], currency: { icon: 'euro' } },
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
    fixture.componentRef.setInput('id', 'res-123');
    payments$.next([{
      reservation: {
        id: 'res-123',
        room: { paymentTypes: ['PAYPAL'], currency: { icon: 'euro' } },
        state: 'CONFIRMED',
        treatment: { price: 100 },
      },
      amount: 100,
    }]);

    fixture.detectChanges();

    const option: IPaymentOption = {
      label: 'PayPal',
      type: 'PAYPAL',
      enabled: true,
      enabledCustomer: true,
      default: false,
      filter: true,
      defaultFilter: false,
      show: true,
    };
    component.form.controls.option.setValue(option);

    component.pay();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({
      reservationId: 'res-123',
      payment: jasmine.any(Object),
    }));
  });

  it('should not dispatch createPaymentLinkByReservationId if form type is undefined', () => {
    fixture.componentRef.setInput('id', 'res-123');

    component.form.controls.option.setValue(undefined);
    component.pay();

    expect(storeSpy.dispatch).not.toHaveBeenCalledWith(jasmine.objectContaining({
      reservationId: 'res-123',
    }));
  });

  it('should move one step back without going below zero', () => {
    component.currentStepIndex.set(2);
    component.back();
    expect(component.currentStepIndex()).toBe(1);

    component.back();
    component.back();
    expect(component.currentStepIndex()).toBe(0);
  });

  it('should advance to step two only when requested and form is valid', () => {
    component.form.controls.option.setValue({
      label: 'PayPal',
      type: 'PAYPAL',
      enabled: true,
      enabledCustomer: true,
      default: false,
      filter: true,
      defaultFilter: false,
      show: true,
    });

    component.callStepTwo(false);
    expect(component.currentStepIndex()).toBe(0);

    component.callStepTwo(true);
    expect(component.currentStepIndex()).toBe(1);
  });

});
