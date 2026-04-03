import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MePaymentComponent } from './me-payment.component';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { PaymentState } from '../../../store/reducers/payment.reducers';
import { getPayment, updatePaymentById } from '../../../store/payment.actions';
import { PaymentPercentage, PaymentType } from '../../../interfaces/payment';
import { ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

describe('MePaymentComponent', () => {
  let component: MePaymentComponent;
  let fixture: ComponentFixture<MePaymentComponent>;

  let storeSpy: jasmine.SpyObj<Store<PaymentState>>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;

  // streams returned by store.pipe()
  let paymentId$: Subject<string | null>;
  let payment$: Subject<any>;

  beforeEach(async () => {
    paymentId$ = new Subject();
    payment$ = new Subject();

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
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [MePaymentComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MePaymentComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    paymentId$.complete();
    payment$.complete();
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

  it('should keep options empty when no online payment type is available', () => {
    payment$.next({
      reservation: {
        room: {
          paymentTypes: [PaymentType.cash, PaymentType.transfer],
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
          paymentTypes: [PaymentType.cash, PaymentType.mollie],
        },
      },
    });

    fixture.detectChanges();

    expect(component.options()).toEqual(jasmine.arrayContaining([
      jasmine.objectContaining({ type: PaymentType.mollie }),
    ]));
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
      type: PaymentType.mollie,
    } as any);

    component.update();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      updatePaymentById({
        id: 'payment-1',
        payment: {
          type: PaymentType.mollie,
          percentage: PaymentPercentage.total,
        },
      }),
    );
  });
});
