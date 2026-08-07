import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MePaymentComponent } from './me-payment.component';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PaymentPercentage } from '../../../interfaces/payment';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideAppIcons } from '../../../util/app-icons.provider';
import { DEFAULT_LOCALE } from '../../../util/dates';
import { NavigationService } from '../../../services/navigation.service';
import { signal } from '@angular/core';
import { PaymentStore } from '../../../store/payment.store';

describe('MePaymentComponent', () => {
  let component: MePaymentComponent;
  let fixture: ComponentFixture<MePaymentComponent>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;

  let paymentStoreSpy: {
    selected: ReturnType<typeof signal>;
    options: ReturnType<typeof signal>;
    getPayment: jasmine.Spy;
    getOptions: jasmine.Spy;
    updateById: jasmine.Spy;
    clean: jasmine.Spy;
  };

  beforeEach(async () => {
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['navigate'],
      { language: DEFAULT_LOCALE },
    );
    paymentStoreSpy = {
      selected: signal(undefined),
      options: signal([
        {
          type: 'MOLLIE',
          label: 'Mollie',
          enabled: true,
          enabledCustomer: true,
          default: false,
          filter: true,
          defaultFilter: false,
          show: true,
        },
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
      ]),
      getPayment: jasmine.createSpy('getPayment'),
      getOptions: jasmine.createSpy('getOptions'),
      updateById: jasmine.createSpy('updateById'),
      clean: jasmine.createSpy('clean'),
    };

    await TestBed.configureTestingModule({
      imports: [MePaymentComponent, TranslateModule.forRoot()],
      providers: [
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: PaymentStore, useValue: paymentStoreSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        provideHttpClient(withXhr()),
        provideAppIcons(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MePaymentComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch getPayment when paymentId is emitted', () => {
    fixture.componentRef.setInput('id', 'payment-123');
    fixture.detectChanges();

    expect(paymentStoreSpy.getPayment).toHaveBeenCalledWith('payment-123');
  });

  it('should keep options empty when no online payment type is available', () => {
    paymentStoreSpy.selected.set({
      reservation: {
        room: {
          paymentTypes: ['CASH', 'TRANSFER'],
        },
      },
    });

    fixture.detectChanges();

    expect(component.options()).toEqual([]);
  });

  it('should derive options from the room payment types', () => {
    paymentStoreSpy.selected.set({
      reservation: {
        room: {
          paymentTypes: ['CASH', 'MOLLIE'],
        },
      },
    });

    fixture.detectChanges();

    expect(component.options()).toEqual(jasmine.arrayContaining([
      jasmine.objectContaining({ type: 'MOLLIE' }),
    ]));
  });

  it('should dispatch updateById on update()', () => {
    paymentStoreSpy.selected.set({
      id: 'payment-1',
      reservation: {
        room: {
          paymentTypes: ['PAYPAL'],
        },
      },
    });

    fixture.detectChanges();

    component.getForm.option.setValue({
      type: 'MOLLIE',
    } as any);

    component.update();

    expect(paymentStoreSpy.updateById).toHaveBeenCalledWith(
      'payment-1',
      { type: 'MOLLIE', percentage: PaymentPercentage.total },
    );
  });
});
