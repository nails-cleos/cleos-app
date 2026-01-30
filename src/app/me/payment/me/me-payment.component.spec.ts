import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MePaymentComponent } from './me-payment.component';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { Analytics } from '@angular/fire/analytics';
import { BehaviorSubject, Subject } from 'rxjs';
import { PaymentState } from '../../../store/reducers/payment.reducers';
import { getPayment, paymentOptions, updatePaymentById } from '../../../store/payment.actions';
import { PaymentPercentage, PaymentType } from '../../../interfaces/payment';
import { ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AnalyticsStub } from '../../../util/firebase-stub';

describe('MePaymentComponent', () => {
  let component: MePaymentComponent;
  let fixture: ComponentFixture<MePaymentComponent>;

  let storeSpy: jasmine.SpyObj<Store<PaymentState>>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;

  // streams returned by store.pipe()
  let paymentId$: Subject<string | null>;
  let payment$: Subject<any>;
  let paymentOptions$: Subject<any>;

  beforeEach(async () => {
    paymentId$ = new Subject();
    payment$ = new Subject();
    paymentOptions$ = new Subject();

    storeSpy = jasmine.createSpyObj<Store<PaymentState>>('Store', ['dispatch', 'pipe']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj('ParamMap', ['get']),
      },
    });

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return paymentId$.asObservable();
        case 2:
          return payment$.asObservable();
        case 3:
          return paymentOptions$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [MePaymentComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: Analytics, useClass: AnalyticsStub },
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MePaymentComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    paymentId$.complete();
    payment$.complete();
    paymentOptions$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch getPayment when paymentId is emitted', () => {
    paymentId$.next('payment-123');

    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getPayment({ id: 'payment-123' }),
    );
  });

  it('should NOT dispatch paymentOptions when paynl is not available', () => {
    payment$.next({
      reservation: {
        room: {
          paymentTypes: [PaymentType.paypal],
        },
      },
    });

    fixture.detectChanges();

    expect(storeSpy.dispatch).not.toHaveBeenCalledWith(paymentOptions());
  });

  it('should dispatch paymentOptions when paynl is available', () => {
    payment$.next({
      reservation: {
        room: {
          paymentTypes: [PaymentType.paynl],
        },
      },
    });

    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(paymentOptions());
  });

  it('should update options signal when paymentOptions are emitted', () => {
    const options = [{ bic: 'ING', type: PaymentType.paynl }];

    paymentOptions$.next(options);

    fixture.detectChanges();

    expect(component.options()).toBeDefined();
  });

  it('should dispatch updatePaymentById on update()', () => {
    payment$.next({
      id: 'payment-1',
      reservation: {
        room: {
          paymentTypes: [PaymentType.paypal],
        },
      },
    });

    fixture.detectChanges();

    component.getForm.type.setValue({
      type: PaymentType.paynl,
      bic: 'paynl',
      subTypes: [],
    } as any);

    component.update();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      updatePaymentById({
        id: 'payment-1',
        payment: {
          type: PaymentType.paynl,
          paymentOptionId: 'paynl',
          percentage: PaymentPercentage.total,
          bic: undefined,
        },
      }),
    );
  });
});
