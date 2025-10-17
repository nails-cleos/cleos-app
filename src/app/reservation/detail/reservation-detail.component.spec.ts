import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { of, Subject } from 'rxjs';

import { ReservationDetailComponent } from './reservation-detail.component';
import { AuthUserService } from '../../services/auth-user.service';
import { CancelOption, IReservationAll, States } from '../../interfaces/reservation';
import { IPayment, PaymentType } from '../../interfaces/payment';
import {
  approveReservation,
  cancelReservation,
  clean,
  customerCancelReservation,
  getReservation,
  getReservationHistory,
  paymentCompleteReservation,
  reservationFindPayments,
  startReservation,
  updateReservationColor,
  updateReservationCustomer,
} from '../../store/reservation.actions';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UntypedFormBuilder } from '@angular/forms';
import { notifyPayment, paymentSend } from '../../store/payment.actions';

describe('ReservationDetailComponent', () => {
  let component: ReservationDetailComponent;
  let fixture: ComponentFixture<ReservationDetailComponent>;
  let mockStore: jasmine.SpyObj<Store>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockAuthUserService: any;
  let stateSubject: Subject<any>;
  let paymentStateSubject: Subject<any>;
  let authUserSubject: Subject<any>;
  let openDialogSpy: jasmine.Spy<any>;

  const mockReservation: IReservationAll = {
    id: 'reservation-123',
    state: States.created,
    timestamp: new Date('2025-01-20T10:00:00Z').getTime() / 1000,
    customer: {
      id: 'customer-123',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
    },
    room: {
      id: 'room-123',
      name: 'Room 1',
      timeZone: 'Europe/Amsterdam',
      currency: { symbol: '€', code: 'EUR' },
      professionals: [{ id: 'prof-123', name: 'Pro 1' }],
      paymentTypes: [PaymentType.cash, PaymentType.transfer],
    },
    treatment: {
      key: 'treatment-123',
      name: 'Treatment 1',
      price: 100,
      groupId: 'group-1',
      color: { id: 'color-1', name: 'Blue' },
    },
    professional: {
      id: 'prof-123',
      name: 'Pro 1',
    },
    additional: [],
    canEdit: true,
    paymentRequired: false,
    configurationCanCustomerChange: true,
    note: 'Test note',
    customerNote: 'Customer note',
    paymentLink: 'https://payment.link',
  } as any;

  const mockPayments: IPayment[] = [
    {
      id: 'payment-1',
      transactionAmount: 25.00,
      status: 'APPROVED',
      type: PaymentType.cash,
    } as any,
    {
      id: 'payment-2',
      transactionAmount: 25.00,
      status: 'APPROVED',
      type: PaymentType.transfer,
    } as any,
  ];

  beforeEach(async () => {
    stateSubject = new Subject();
    paymentStateSubject = new Subject();
    authUserSubject = new Subject();

    mockStore = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('reservation-123'),
        },
      },
      params: of({ id: 'reservation-123' }),
    };

    mockAuthUserService = {
      authUser: authUserSubject.asObservable(),
    };

    mockStore.select.and.callFake((selector: any) => {
      if (selector.toString().includes('payment')) {
        return paymentStateSubject.asObservable();
      }
      return stateSubject.asObservable();
    });

    mockRouter.getCurrentNavigation.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [
        ReservationDetailComponent,
        TranslateModule.forRoot(),
        NoopAnimationsModule,
      ],
      providers: [
        UntypedFormBuilder,
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Store, useValue: mockStore },
        { provide: Router, useValue: mockRouter },
        { provide: AuthUserService, useValue: mockAuthUserService },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.setDefaultLang('en-GB');
    translateService.use('en-GB');

    fixture = TestBed.createComponent(ReservationDetailComponent);
    component = fixture.componentInstance;

    openDialogSpy = spyOn(component.dialog, 'open');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.duration).toBeDefined();
    expect(component.changeState).toEqual([]);
    expect(component.displayedColumns).toEqual(['position', 'professional', 'start', 'treatment', 'state']);
    expect(component.pageSize).toBe(5);
    expect(component.disableUpdateButton).toBeTrue();
  });

  it('should subscribe to auth user service on init', () => {
    authUserSubject.next({
      isAdmin: false,
      isManager: false,
      isRoomAdmin: false,
      professionalId: 'professional-123',
      customerId: 'customer-123',
    });

    fixture.detectChanges();

    expect(component.professionalId).toBe('professional-123');
    expect(component.customerId).toBe('customer-123');
  });

  it('should dispatch clean action on init', () => {
    authUserSubject.next({});
    fixture.detectChanges();

    expect(mockStore.dispatch).toHaveBeenCalledWith(clean());
  });

  it('should dispatch getReservation actions on init', () => {
    authUserSubject.next({});
    fixture.detectChanges();

    expect(mockStore.dispatch).toHaveBeenCalledWith(getReservation({ id: 'reservation-123' }));
    expect(mockStore.dispatch).toHaveBeenCalledWith(reservationFindPayments({ id: 'reservation-123' }));
    expect(mockStore.dispatch).toHaveBeenCalledWith(getReservationHistory({ id: 'reservation-123' }));
  });

  it('should return form payments array', () => {
    expect(component.payments).toBeDefined();
    expect(component.payments.length).toBe(0);
  });

  it('should calculate total from payments', () => {
    component.paymentPaid = mockPayments;

    const total = component.total;
    expect(total).toBe(50.00);
  });

  it('should handle empty payment array', () => {
    component.paymentPaid = [];
    const total = component.total;
    expect(total).toBe(0);
  });

  it('should handle timezone display', () => {
    const reservation = { room: { timeZone: 'UTC' } } as any;
    const result = component.showTimeZone(reservation);
    expect(typeof result).toBe('boolean');
  });

  it('should handle undefined reservation in timezone', () => {
    const result = component.showTimeZone(undefined);
    expect(typeof result).toBe('boolean');
  });

  it('should return GMT timezone string', () => {
    component.reservation = mockReservation;
    const gmt = component.gmt;
    expect(typeof gmt).toBe('string');
  });

  it('should clean up subscriptions on destroy', () => {
    authUserSubject.next({});
    fixture.detectChanges();
    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('should handle missing payment data gracefully', () => {
    component.paymentPaid = undefined as any;
    expect(() => component.total).not.toThrow();
  });

  it('should handle undefined reservation gracefully', () => {
    component.reservation = undefined;
    expect(() => component.gmt).not.toThrow();
    expect(() => component.showTimeZone()).not.toThrow();
  });

  describe('State Machine - Professional', () => {
    beforeEach(() => {
      authUserSubject.next({
        isAdmin: false,
        isManager: false,
        isRoomAdmin: false,
        professionalId: 'prof-123',
        customerId: null,
      });
      fixture.detectChanges();
    });

    it('should create professional machine with created state', () => {
      stateSubject.next({
        selected: mockReservation,
        history: [],
      });

      expect(component.changeState).toBeDefined();
      expect(component.changeState.length).toBe(5);
    });

    it('should transition from created to approved state', () => {
      stateSubject.next({
        selected: mockReservation,
        history: [],
      });

      openDialogSpy.and.returnValue({
        afterClosed: () => of('approve'),
      });

      component.onChangeState('approve');

      expect(mockStore.dispatch).toHaveBeenCalledWith(approveReservation('reservation-123'));
    });

    it('should transition from approve to start state', () => {
      const approvedReservation = { ...mockReservation, state: States.approved };
      stateSubject.next({
        selected: approvedReservation,
        history: [],
      });

      openDialogSpy.and.returnValue({
        afterClosed: () => of('start'),
      });

      component.onChangeState('start');

      expect(mockStore.dispatch).toHaveBeenCalledWith(startReservation(mockReservation.id));
    });

    it('should send tomorrow message', () => {
      const approvedReservation = {
        ...mockReservation,
        state: States.approved,
        timestamp: (Date.now() / 1000) + 86400, // Tomorrow
      };
      stateSubject.next({
        selected: approvedReservation,
        history: [],
      });

      openDialogSpy.and.returnValue({
        afterClosed: () => of('send'),
      });

      spyOn(window, 'open');

      component.onChangeState('send');

      expect(window.open).toHaveBeenCalledWith(
        `https://api.whatsapp.com/send?phone=+${mockReservation.customer.phone}&text=WHATSAPP.SEND.TOMORROW`, '_blank');
    });

    it('should send coffee message', () => {
      const approvedReservation = {
        ...mockReservation,
        state: States.approved,
        timestamp: (Date.now() / 1000) + 86400, // Tomorrow
      };
      stateSubject.next({
        selected: approvedReservation,
        history: [],
      });

      openDialogSpy.and.returnValue({
        afterClosed: () => of('coffee'),
      });

      spyOn(window, 'open');

      component.onChangeState('coffee');

      expect(window.open).toHaveBeenCalledWith(
        `https://api.whatsapp.com/send?phone=+${mockReservation.customer.phone}&text=WHATSAPP.SEND.COFFEE`, '_blank');
    });

    it('should send today message', () => {
      const approvedReservation = {
        ...mockReservation,
        state: States.approved,
        timestamp: (Date.now() / 1000), // Today
      };
      stateSubject.next({
        selected: approvedReservation,
        history: [],
      });

      openDialogSpy.and.returnValue({
        afterClosed: () => of('send'),
      });

      spyOn(window, 'open');

      component.onChangeState('send');

      expect(window.open).toHaveBeenCalledWith(
        `https://api.whatsapp.com/send?phone=+${mockReservation.customer.phone}&text=WHATSAPP.SEND.TODAY`, '_blank');
    });

    it('should send future message', () => {
      const approvedReservation = {
        ...mockReservation,
        state: States.approved,
        timestamp: (Date.now() / 1000) + (86400 * 2), // 2 days later
        additional: [{ name: 'additional-1', price: 20 }],
      };
      stateSubject.next({
        selected: approvedReservation,
        history: [],
      });

      openDialogSpy.and.returnValue({
        afterClosed: () => of('send'),
      });

      spyOn(window, 'open');

      component.onChangeState('send');

      expect(window.open).toHaveBeenCalledWith(
        `https://api.whatsapp.com/send?phone=+${mockReservation.customer.phone}&text=WHATSAPP.SEND.APPROVE`, '_blank');
    });

    it('should allow editing from created state', () => {
      stateSubject.next({
        selected: mockReservation,
        history: [],
      });

      openDialogSpy.and.returnValue({
        afterClosed: () => of('edit'),
      });

      component.onChangeState('edit');

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['en-GB', 'reservation', 'reservation-123', 'edit'],
        { state: { roomId: 'room-123' } },
      );
    });

    it('should transition from started to completed state', () => {
      const startedReservation = { ...mockReservation, state: States.started };
      stateSubject.next({
        selected: startedReservation,
        history: [],
      });

      openDialogSpy.and.returnValue({
        afterClosed: () => of('complete'),
      });

      component.onChangeState('complete');

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['en-GB', 'reservation', 'reservation-123', 'rooms', 'room-123', 'customer', 'customer-123', 'complete'],
      );
    });

    it('should allow clone from completed state', () => {
      const startedReservation = { ...mockReservation, state: States.completed };
      stateSubject.next({
        selected: startedReservation,
        history: [],
      });

      const today = new Date();
      const daysUntilMonday = (1 + 7 - today.getDay()) % 7 || 7;

      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + daysUntilMonday);

      openDialogSpy.and.returnValue({
        afterClosed: () => of({
          time: '10:00',
          date: nextMonday,
        }),
      });

      component.onChangeState('clone');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['en-GB', 'reservation'], jasmine.objectContaining({
        state: jasmine.objectContaining({
          date: nextMonday,
          customer: mockReservation.customer,
          professionalId: mockReservation.professional.id,
          roomId: mockReservation.room.id,
          treatmentId: mockReservation.treatment.key,
          groupId: mockReservation.treatment.groupId,
          skip: true,
        }),
      }));
    });

    it('should allow change color from completed state', () => {
      const startedReservation = { ...mockReservation, state: States.completed };
      stateSubject.next({
        selected: startedReservation,
        history: [],
      });

      openDialogSpy.and.returnValue({
        afterClosed: () => of({
          colorId: 'color-2',
        }),
      });

      component.onChangeState('color');

      expect(mockStore.dispatch)
        .toHaveBeenCalledWith(updateReservationColor({ id: mockReservation.id, colorId: 'color-2' }));
    });

    it('should allow change customer from completed state', () => {
      const startedReservation = { ...mockReservation, state: States.completed };
      stateSubject.next({
        selected: startedReservation,
        history: [],
      });

      openDialogSpy.and.returnValue({
        afterClosed: () => of({
          customerId: 'customer-2',
        }),
      });

      component.onChangeState('change');

      expect(mockStore.dispatch)
        .toHaveBeenCalledWith(updateReservationCustomer({ id: mockReservation.id, customerId: 'customer-2' }));
    });

    it('should allow canceling from created state', () => {
      openDialogSpy.and.returnValue({
        afterClosed: () => of({ option: CancelOption.none }),
      });

      stateSubject.next({
        selected: mockReservation,
        history: [],
      });

      component.onChangeState('cancel');

      expect(openDialogSpy).toHaveBeenCalledWith(
        jasmine.any(Function),
        jasmine.objectContaining({
          data: jasmine.objectContaining({
            options: [CancelOption.refund, CancelOption.discount, CancelOption.chargeWithDiscount,
              CancelOption.chargeWithRefund, CancelOption.none],
            price: jasmine.objectContaining({
              amount: 100,
              totalPaid: 0,
            }),
          }),
        }));

      expect(mockStore.dispatch)
        .toHaveBeenCalledWith(cancelReservation('reservation-123', { option: CancelOption.none }));
    });

    it('should navigate to more info page', () => {
      stateSubject.next({
        selected: mockReservation,
        history: [],
      });

      component.onChangeState('more');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['en-GB', 'reservation', 'reservation-123', 'more-info']);
    });

    it('should transition from partiallyCompleted to completed', () => {
      const partiallyCompletedReservation = { ...mockReservation, state: States.partiallyCompleted };
      stateSubject.next({
        selected: partiallyCompletedReservation,
        history: [],
      });

      openDialogSpy.and.returnValue({
        afterClosed: () => of('complete'),
      });

      component.onChangeState('complete');

      expect(mockStore.dispatch).toHaveBeenCalledWith(paymentCompleteReservation('reservation-123'));
    });

    it('should allow booking from completed state', () => {
      const completedReservation = { ...mockReservation, state: States.completed };
      stateSubject.next({
        selected: completedReservation,
        history: [],
      });

      component.onChangeState('book');

      const customer = mockReservation.customer;
      const room = mockReservation.room;
      const treatment = mockReservation.treatment;
      const professional = mockReservation.professional;
      const data = { customer, room, treatment, professional };

      expect(mockRouter.navigate).toHaveBeenCalledWith(['en-GB', 'reservation'], { state: data });
    });
  });

  describe('State Machine - Customer', () => {
    beforeEach(() => {
      authUserSubject.next({
        isAdmin: false,
        isManager: false,
        isRoomAdmin: false,
        professionalId: null,
        customerId: 'customer-123',
      });
      fixture.detectChanges();
    });

    it('should create customer machine with created state', () => {
      stateSubject.next({
        selected: mockReservation,
        history: [],
      });

      expect(component.changeState).toBeDefined();
      expect(component.changeState.length).toBe(2);
    });

    it('should allow booking from completed state', () => {
      const completedReservation = { ...mockReservation, state: States.completed };
      stateSubject.next({
        selected: completedReservation,
        history: [],
      });

      component.onChangeState('book');

      const room = mockReservation.room;
      const treatment = mockReservation.treatment;
      const professional = mockReservation.professional;
      const data = { room, treatment, professional };

      expect(mockRouter.navigate).toHaveBeenCalledWith(['en-GB', 'me', 'reservation'], { state: data });
    });

    it('should allow edit a reservation', () => {
      stateSubject.next({
        selected: { ...mockReservation, canEdit: true },
        history: [],
      });

      openDialogSpy.and.returnValue({
        afterClosed: () => of('edit'),
      });

      component.onChangeState('edit');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['en-GB', 'me', 'reservation', mockReservation.id]);
    });

    it('should allow notify when it has pending payments', () => {
      const pendingPayment = {
        id: 'payment-1',
        preferenceId: 'preference-123',
        amount: 100,
        status: 'PENDING',
        type: PaymentType.ideal,
        reservation: mockReservation,
      } as any;

      stateSubject.next({
        selected: { ...mockReservation, state: States.cancelledPaymentRequired, paymentRequired: true },
        payments: [pendingPayment],
        history: [],
      });

      component.onChangeState('notify');

      expect(mockStore.dispatch).toHaveBeenCalledWith(notifyPayment({
        id: pendingPayment.id,
        path: 'reservation',
        resourceId: mockReservation.id,
        preferenceId: pendingPayment.preferenceId,
        paymentType: pendingPayment.type,
      }));
    });

    it('should allow paid when payment is required and it has no pending payments', () => {
      const createdPayment = {
        id: 'payment-1',
        preferenceId: 'preference-123',
        amount: 100,
        status: 'CREATED',
        type: PaymentType.ideal,
        reservation: mockReservation,
      } as any;

      stateSubject.next({
        selected: { ...mockReservation, state: States.cancelledPaymentRequired, paymentRequired: true },
        payments: [createdPayment],
        history: [],
      });

      component.onChangeState('pay');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/', 'en-GB', 'me', 'payment', createdPayment.id]);
    });


    it('should allow paid when reservation is approved', () => {
      stateSubject.next({
        selected: { ...mockReservation, state: States.approved },
        history: [],
      });

      component.onChangeState('pay');

      expect(mockRouter.navigate)
        .toHaveBeenCalledWith(['/', 'en-GB', 'me', 'reservation', mockReservation.id, 'payment', 'option']);
    });

    it('should allow cancel and edit a reservation', () => {
      stateSubject.next({
        selected: { ...mockReservation, canEdit: false },
        history: [],
      });

      openDialogSpy.and.returnValue({
        afterClosed: () => of(true),
      });

      component.onChangeState('cancel_edit');

      expect(openDialogSpy).toHaveBeenCalledWith(
        jasmine.any(Function),
        jasmine.objectContaining({
          data: jasmine.objectContaining({
            price: jasmine.objectContaining({
              amount: 100,
              totalPaid: 0,
            }),
            currency: {
              symbol: '€',
              code: 'EUR',
            },
          }),
        }));

      expect(mockRouter.navigate).toHaveBeenCalledWith(['en-GB', 'me', 'reservation', mockReservation.id]);
    });

    it('should allow canceling when is edit mode and no payments', () => {
      openDialogSpy.and.returnValue({
        afterClosed: () => of({ option: CancelOption.none }),
      });

      stateSubject.next({
        selected: { ...mockReservation, canEdit: true },
        history: [],
      });

      component.onChangeState('cancel');

      expect(openDialogSpy).toHaveBeenCalledWith(
        jasmine.any(Function),
        jasmine.objectContaining({
          data: jasmine.objectContaining({
            options: [CancelOption.none],
            price: jasmine.objectContaining({
              amount: 100,
              totalPaid: 0,
            }),
            showPenalty: false,
          }),
        }));

      expect(mockStore.dispatch)
        .toHaveBeenCalledWith(customerCancelReservation('reservation-123', { option: CancelOption.none }));
    });

    it('should allow canceling when is edit mode with payments', () => {
      openDialogSpy.and.returnValue({
        afterClosed: () => of({ option: CancelOption.discount }),
      });

      stateSubject.next({
        selected: { ...mockReservation, canEdit: true },
        payments: [{ id: 'payment-1', transactionAmount: 100, status: 'APPROVED', type: PaymentType.transfer } as any],
        history: [],
      });

      component.onChangeState('cancel');

      expect(openDialogSpy).toHaveBeenCalledWith(
        jasmine.any(Function),
        jasmine.objectContaining({
          data: jasmine.objectContaining({
            options: [CancelOption.discount, CancelOption.refund],
            price: jasmine.objectContaining({
              amount: 100,
              totalPaid: 100,
            }),
            showPenalty: false,
          }),
        }));

      expect(mockStore.dispatch)
        .toHaveBeenCalledWith(customerCancelReservation('reservation-123', { option: CancelOption.discount }));
    });

    it('should allow canceling with a penalty when is not edit mode', () => {
      openDialogSpy.and.returnValue({
        afterClosed: () => of({ option: CancelOption.charge }),
      });

      stateSubject.next({
        selected: { ...mockReservation, canEdit: false },
        history: [],
      });

      component.onChangeState('cancel');

      expect(openDialogSpy).toHaveBeenCalledWith(
        jasmine.any(Function),
        jasmine.objectContaining({
          data: jasmine.objectContaining({
            options: [CancelOption.charge],
            price: jasmine.objectContaining({
              amount: 100,
              totalPaid: 0,
              penalty: 50,
            }),
            showPenalty: true,
          }),
        }));

      expect(mockStore.dispatch)
        .toHaveBeenCalledWith(customerCancelReservation('reservation-123', { option: CancelOption.charge }));
    });

    it('should allow canceling with a penalty when is not edit mode and has paid the penalty', () => {
      openDialogSpy.and.returnValue({
        afterClosed: () => of({ option: CancelOption.none }),
      });

      stateSubject.next({
        selected: { ...mockReservation, canEdit: false },
        payments: [{ id: 'payment-1', transactionAmount: 50, status: 'APPROVED', type: PaymentType.transfer } as any],
        history: [],
      });

      component.onChangeState('cancel');

      expect(openDialogSpy).toHaveBeenCalledWith(
        jasmine.any(Function),
        jasmine.objectContaining({
          data: jasmine.objectContaining({
            options: [CancelOption.none],
            price: jasmine.objectContaining({
              amount: 100,
              totalPaid: 50,
              penalty: 50,
            }),
            showPenalty: false,
          }),
        }));

      expect(mockStore.dispatch)
        .toHaveBeenCalledWith(customerCancelReservation('reservation-123', { option: CancelOption.none }));
    });

    it('should allow canceling when is not edit mode and has paid more than the penalty', () => {
      openDialogSpy.and.returnValue({
        afterClosed: () => of({ option: CancelOption.chargeWithDiscount }),
      });

      stateSubject.next({
        selected: { ...mockReservation, canEdit: false },
        payments: [{ id: 'payment-1', transactionAmount: 100, status: 'APPROVED', type: PaymentType.transfer } as any],
        history: [],
      });

      component.onChangeState('cancel');

      expect(openDialogSpy).toHaveBeenCalledWith(
        jasmine.any(Function),
        jasmine.objectContaining({
          data: jasmine.objectContaining({
            options: [CancelOption.chargeWithDiscount, CancelOption.chargeWithRefund],
            price: jasmine.objectContaining({
              amount: 100,
              totalPaid: 100,
              penalty: 50,
            }),
            showPenalty: true,
          }),
        }));

      expect(mockStore.dispatch)
        .toHaveBeenCalledWith(
          customerCancelReservation('reservation-123', { option: CancelOption.chargeWithDiscount }));
    });
  });

  describe('Payment Management', () => {
    beforeEach(() => {
      authUserSubject.next({
        isAdmin: false,
        isManager: false,
        isRoomAdmin: false,
        professionalId: 'prof-123',
        customerId: null,
      });
      fixture.detectChanges();
    });

    it('should populate payment form when payments are loaded', () => {
      stateSubject.next({
        selected: mockReservation,
        payments: mockPayments,
        history: [],
      });

      expect(component.payments.length).toBe(2);
    });

    it('should dispatch paymentSend when pay is called', () => {
      const payment = {
        paymentURL: 'https://payment.url',
      } as any;

      component.pay(payment);

      expect(mockStore.dispatch).toHaveBeenCalledWith(paymentSend({ link: 'https://payment.url' }));
    });
  });
});
