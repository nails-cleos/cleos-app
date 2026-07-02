import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OptionComponent } from './option.component';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { IPaymentOption } from '../../../interfaces/payment';
import { IReservationAll } from '../../../reservation/reservation';
import { provideHttpClient } from '@angular/common/http';
import { NavigationService } from '../../../services/navigation.service';
import { provideAppIcons } from '../../../util/app-icons.provider';
import { DEFAULT_LOCALE } from '../../../util/dates';
import { signal } from '@angular/core';
import { PaymentStore } from '../../../store/payment.store';

describe('OptionComponent', () => {
  let component: OptionComponent;
  let fixture: ComponentFixture<OptionComponent>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;

  let paymentStoreSpy: {
    options: ReturnType<typeof signal>;
    data: ReturnType<typeof signal>;
    getOptions: jasmine.Spy;
    getPaymentByResourceId: jasmine.Spy;
    createPaymentLinkByReservationId: jasmine.Spy;
    clean: jasmine.Spy;
  };
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;

  let breakpoint$: BehaviorSubject<any>;

  beforeEach(async () => {
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['back', 'navigate'],
      { language: DEFAULT_LOCALE },
    );
    const paymentOptions = [
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
    ];
    paymentStoreSpy = {
      options: signal(paymentOptions),
      data: signal(undefined),
      getOptions: jasmine.createSpy('getOptions'),
      getPaymentByResourceId: jasmine.createSpy('getPaymentByResourceId'),
      createPaymentLinkByReservationId: jasmine.createSpy('createPaymentLinkByReservationId'),
      clean: jasmine.createSpy('clean'),
    };
    breakpoint$ = new BehaviorSubject(undefined);

    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [OptionComponent, TranslateModule.forRoot()],
      providers: [
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: PaymentStore, useValue: paymentStoreSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        provideHttpClient(),
        provideAppIcons(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch getPaymentByResourceId when reservationId is emitted', () => {
    fixture.componentRef.setInput('id', 'res-123');
    fixture.detectChanges();
    expect(paymentStoreSpy.getPaymentByResourceId).toHaveBeenCalledWith('res-123', 'reservation');
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

    paymentStoreSpy.data.set(paymentsMock);
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

    paymentStoreSpy.data.set(paymentsMock);
    fixture.detectChanges();
    expect(component.options()).toEqual([]);
  });

  it('should dispatch createPaymentLinkByReservationId on pay()', () => {
    fixture.componentRef.setInput('id', 'res-123');
    paymentStoreSpy.data.set([{
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

    expect(paymentStoreSpy.createPaymentLinkByReservationId).toHaveBeenCalledWith('res-123', jasmine.any(Object));
  });

  it('should not dispatch createPaymentLinkByReservationId if form type is undefined', () => {
    fixture.componentRef.setInput('id', 'res-123');

    component.form.controls.option.setValue(undefined);
    component.pay();

    expect(paymentStoreSpy.createPaymentLinkByReservationId).not.toHaveBeenCalledWith('res-123', jasmine.any(Object));
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
