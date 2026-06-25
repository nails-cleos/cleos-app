import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MePaymentComponent } from './me-payment.component';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { PaymentState } from '../../../store/reducers/payment.reducers';
import { getPayment, updatePaymentById } from '../../../store/actions/payment.actions';
import { PaymentPercentage } from '../../../interfaces/payment';
import { provideHttpClient } from '@angular/common/http';
import { provideAppIcons } from '../../../util/app-icons.provider';
import { DEFAULT_LOCALE } from '../../../util/dates';
import { NavigationService } from '../../../services/navigation.service';

describe('MePaymentComponent', () => {
  let component: MePaymentComponent;
  let fixture: ComponentFixture<MePaymentComponent>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;

  let storeSpy: jasmine.SpyObj<Store<PaymentState>>;

  let payment$: Subject<any>;
  let paymentOptions$: BehaviorSubject<any>;

  beforeEach(async () => {
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['navigate'],
      { language: DEFAULT_LOCALE },
    );
    payment$ = new Subject();
    paymentOptions$ = new BehaviorSubject([
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
    ]);

    storeSpy = jasmine.createSpyObj<Store<PaymentState>>('Store', ['dispatch', 'pipe']);

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return payment$.asObservable();
        case 2:
          return paymentOptions$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [MePaymentComponent, TranslateModule.forRoot()],
      providers: [
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: Store, useValue: storeSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        provideHttpClient(),
        provideAppIcons(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MePaymentComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    payment$.complete();
    paymentOptions$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch getPayment when paymentId is emitted', () => {
    fixture.componentRef.setInput('id', 'payment-123');
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getPayment({ id: 'payment-123' }),
    );
  });

  it('should keep options empty when no online payment type is available', () => {
    payment$.next({
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
    payment$.next({
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

  it('should dispatch updatePaymentById on update()', () => {
    payment$.next({
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

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      updatePaymentById({
        id: 'payment-1',
        payment: {
          type: 'MOLLIE',
          percentage: PaymentPercentage.total,
        },
      }),
    );
  });
});
