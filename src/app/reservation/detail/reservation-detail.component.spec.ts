import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, of } from 'rxjs';
import { ReservationDetailComponent } from './reservation-detail.component';
import { AuthUserService, IAuthUser, initialAuthUser } from '../../services/auth-user.service';
import { CancelOption, IReservationAll, States } from '../../interfaces/reservation';
import { IPaymentAll, PaymentType } from '../../interfaces/payment';
import {
  approveReservation,
  cancelReservation,
  customerCancelReservation,
  getReservation,
  getReservationHistory,
  paymentCompleteReservation,
  reservationFindPayments,
  startReservation,
  updateReservationColor,
  updateReservationCustomer,
} from '../../store/reservation.actions';
import { notifyPayment, paymentSend } from '../../store/payment.actions';
import { ServiceType } from '../../interfaces/room';
import { IUserAll } from '../../interfaces/user';
import { getNowTimeZone } from '../../util/dates';
import { ICurrencyAll } from '../../interfaces/currency';
import { IAdditionalAll } from '../../interfaces/additional';
import { ReservationState } from '../../store/reducers/reservation.reducers';
import { signal } from '@angular/core';

describe('ReservationDetailComponent', () => {
  let component: ReservationDetailComponent;
  let fixture: ComponentFixture<ReservationDetailComponent>;

  let reservationId$: BehaviorSubject<any>;
  let navigationParams$: BehaviorSubject<any>;
  let reservationSelected$: BehaviorSubject<any>;
  let payments$: BehaviorSubject<any>;
  let histories$: BehaviorSubject<any>;
  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  let storeSpy: jasmine.SpyObj<Store<ReservationState>>;
  let navigateSpy: jasmine.Spy;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;
  let dialogSpy: jasmine.Spy<any>;

  const professional: IUserAll = {
    id: 'prof-123',
    displayName: 'Pro 1',
    email: '',
    authorities: [],
    locale: 'en',
    timeZone: 'Europe/Amsterdam',
  };

  const mockDate = getNowTimeZone();
  const mockCurrency: ICurrencyAll = { id: 'c-1', icon: '€', code: 'EUR', name: 'Euro' };

  const mockReservation: IReservationAll = {
    start: mockDate,
    id: 'reservation-123',
    state: States.created,
    timestamp: mockDate.getTime() / 1000,
    customer: {
      id: 'customer-123',
      displayName: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      authorities: [],
      locale: 'en',
      timeZone: 'Europe/Amsterdam',
    },
    room: {
      id: 'room-123',
      timeZone: 'Europe/Amsterdam',
      currency: mockCurrency,
      professionals: [professional],
      paymentTypes: [PaymentType.cash, PaymentType.transfer],
      availabilities: [],
      address: { name: 'address', location: { x: 1.0, y: 1.0 }, id: 1 },
      office: { id: 'office-1', name: 'Office 1', manager: professional },
      primary: true,
    },
    treatment: {
      id: '1',
      key: 'treatment-123',
      name: 'Treatment 1',
      price: 100,
      groupId: 'group-1',
      color: { id: 'color-1', name: 'Blue' },
      group: { id: 'group-1', name: 'Group 1' },
      duration: 'PT1H30M',
      type: ServiceType.treatment,
    },
    professional,
    additional: [],
    canEdit: true,
    paymentRequired: false,
    configurationCanCustomerChange: true,
    note: 'Test note',
    customerNote: 'Customer note',
    paymentLink: 'https://payment.link',
  };

  const mockPayments: IPaymentAll[] = [
    {
      id: 'payment-1',
      transactionAmount: 25.00,
      status: 'APPROVED',
      type: PaymentType.cash,
      description: '',
      amount: 25,
      timestamp: mockDate.getTime() / 1000,
      paymentId: 'p1',
      preferenceId: 'pref1',
    },
    {
      id: 'payment-2',
      transactionAmount: 25.00,
      status: 'APPROVED',
      type: PaymentType.transfer,
      description: '',
      amount: 25,
      timestamp: mockDate.getTime() / 1000,
      paymentId: 'p2',
      preferenceId: 'pref2',
    },
  ];

  beforeEach(async () => {
    reservationId$ = new BehaviorSubject(undefined);
    navigationParams$ = new BehaviorSubject(undefined);
    reservationSelected$ = new BehaviorSubject(undefined);
    payments$ = new BehaviorSubject(undefined);
    histories$ = new BehaviorSubject(undefined);

    storeSpy = jasmine.createSpyObj('Store', ['dispatch', 'pipe']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj('ParamMap', ['get']),
      },
    });
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', ['getUser', 'logout'], {
      authUser: authUserSignal.asReadonly(),
    });

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return reservationId$.asObservable();
        case 2:
          return navigationParams$.asObservable();
        case 3:
          return reservationSelected$.asObservable();
        case 4:
          return payments$.asObservable();
        case 5:
          return histories$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [ReservationDetailComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: Store, useValue: storeSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');

    const router = TestBed.inject(Router);
    navigateSpy = spyOn(router, 'navigate');

    fixture = TestBed.createComponent(ReservationDetailComponent);
    component = fixture.componentInstance;

    dialogSpy = spyOn(component['dialog'], 'open');
  });

  afterEach(() => {
    reservationId$.complete();
    navigationParams$.complete();
    reservationSelected$.complete();
    payments$.complete();
    histories$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.duration).toBeDefined();
    expect(component.changeState).toEqual([]);
    expect(component.displayedColumns).toEqual(['position', 'professional', 'start', 'treatment', 'state']);
    expect(component.pageSize).toBe(5);
    expect(component.disableUpdateButton()).toBeTrue();
  });

  it('should subscribe to auth user service on init', () => {
    authUserSignal.update(prev => ({
      ...prev,
      isAdmin: false,
      isManager: false,
      isRoomAdmin: false,
      professionalId: 'professional-123',
      customerId: 'customer-123',
    }));

    fixture.detectChanges();

    expect(component.professionalId()).toBe('professional-123');
    expect(component.customerId()).toBe('customer-123');
  });

  it('should dispatch getReservation actions on init', () => {
    reservationId$.next('reservation-123');
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getReservation({ id: 'reservation-123' }));
    expect(storeSpy.dispatch).toHaveBeenCalledWith(reservationFindPayments({ id: 'reservation-123' }));
    expect(storeSpy.dispatch).toHaveBeenCalledWith(getReservationHistory({ id: 'reservation-123' }));
  });

  it('should return form payments array', () => {
    expect(component.payments).toBeDefined();
    expect(component.payments.length).toBe(0);
  });

  it('should calculate total from payments', () => {
    component.paymentPaid.set(mockPayments);

    const total = component.total;
    expect(total).toBe(50.00);
  });

  it('should handle empty payment array', () => {
    component.paymentPaid.set([]);
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
    reservationSelected$.next(mockReservation);
    fixture.detectChanges();

    const gmt = component.gmt;
    expect(typeof gmt).toBe('string');
  });

  it('should handle missing payment data gracefully', () => {
    payments$.next(undefined);
    fixture.detectChanges();
    expect(() => component.total).not.toThrow();
    expect(component.total).toBe(0);
  });

  it('should handle undefined reservation gracefully', () => {
    reservationSelected$.next(undefined);
    fixture.detectChanges();

    expect(() => component.gmt).not.toThrow();
    expect(() => component.showTimeZone()).not.toThrow();
  });

  describe('State Machine - Professional', () => {
    beforeEach(() => {
      authUserSignal.update(prev => ({
        ...prev,
        isAdmin: false,
        isManager: false,
        isRoomAdmin: false,
        professionalId: 'prof-123',
        customerId: undefined,
      }));
      fixture.detectChanges();
    });

    it('should create professional machine with created state', () => {
      reservationSelected$.next(mockReservation);
      histories$.next([]);
      fixture.detectChanges();

      expect(component.changeState).toBeDefined();
      expect(component.changeState.length).toBe(5);
    });

    it('should transition from created to approved state', () => {
      reservationSelected$.next(mockReservation);
      histories$.next([]);
      fixture.detectChanges();

      dialogSpy.and.returnValue({
        afterClosed: () => of('approve'),
      });

      component.onChangeState('approve');

      expect(storeSpy.dispatch).toHaveBeenCalledWith(approveReservation('reservation-123'));
    });

    it('should transition from approve to start state', () => {
      const approvedReservation = { ...mockReservation, state: States.approved };
      reservationSelected$.next(approvedReservation);
      histories$.next([]);
      fixture.detectChanges();

      dialogSpy.and.returnValue({
        afterClosed: () => of('start'),
      });

      component.onChangeState('start');

      expect(storeSpy.dispatch).toHaveBeenCalledWith(startReservation(mockReservation.id));
    });

    it('should send tomorrow message', () => {
      const approvedReservation = {
        ...mockReservation,
        state: States.approved,
        timestamp: (Date.now() / 1000) + 86400, // Tomorrow
      };
      reservationSelected$.next(approvedReservation);
      histories$.next([]);
      fixture.detectChanges();

      dialogSpy.and.returnValue({
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
      reservationSelected$.next(approvedReservation);
      histories$.next([]);
      fixture.detectChanges();

      dialogSpy.and.returnValue({
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
        timestamp: (getNowTimeZone().getTime() / 1000), // Today
      };
      reservationSelected$.next(approvedReservation);
      histories$.next([]);
      fixture.detectChanges();

      dialogSpy.and.returnValue({
        afterClosed: () => of('send'),
      });

      spyOn(window, 'open');

      component.onChangeState('send');

      expect(window.open).toHaveBeenCalledWith(
        `https://api.whatsapp.com/send?phone=+${mockReservation.customer.phone}&text=WHATSAPP.SEND.TODAY`, '_blank');
    });

    it('should send future message', () => {
      const additional: IAdditionalAll = {
        duration: 'PT30M',
        key: 'additional-1',
        type: ServiceType.additional,
        id: 'additional-1',
        name: 'additional-1',
        price: 20,
      };
      const approvedReservation = {
        ...mockReservation,
        state: States.approved,
        timestamp: (getNowTimeZone().getTime() / 1000) + (86400 * 2), // 2 days later
        additional: [additional],
      };
      reservationSelected$.next(approvedReservation);
      histories$.next([]);
      fixture.detectChanges();

      dialogSpy.and.returnValue({
        afterClosed: () => of('send'),
      });

      spyOn(window, 'open');

      component.onChangeState('send');

      expect(window.open).toHaveBeenCalledWith(
        `https://api.whatsapp.com/send?phone=+${mockReservation.customer.phone}&text=WHATSAPP.SEND.APPROVE`, '_blank');
    });

    it('should allow editing from created state', () => {
      reservationSelected$.next(mockReservation);
      histories$.next([]);
      fixture.detectChanges();

      dialogSpy.and.returnValue({
        afterClosed: () => of('edit'),
      });

      component.onChangeState('edit');

      expect(navigateSpy).toHaveBeenCalledWith(
        ['en-GB', 'reservation', 'reservation-123', 'edit'],
        { state: { roomId: 'room-123' } },
      );
    });

    it('should transition from started to completed state', () => {
      const startedReservation = { ...mockReservation, state: States.started };
      reservationSelected$.next(startedReservation);
      histories$.next([]);
      fixture.detectChanges();

      dialogSpy.and.returnValue({
        afterClosed: () => of('complete'),
      });

      component.onChangeState('complete');

      expect(navigateSpy).toHaveBeenCalledWith(
        ['en-GB', 'reservation', 'reservation-123', 'rooms', 'room-123', 'customer', 'customer-123', 'complete'],
      );
    });

    it('should allow clone from completed state', () => {
      const startedReservation = { ...mockReservation, state: States.completed };
      reservationSelected$.next(startedReservation);
      histories$.next([]);
      fixture.detectChanges();

      const today = new Date();
      const daysUntilMonday = (1 + 7 - today.getDay()) % 7 || 7;

      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + daysUntilMonday);

      dialogSpy.and.returnValue({
        afterClosed: () => of({
          time: '10:00',
          date: nextMonday,
        }),
      });

      component.onChangeState('clone');

      expect(navigateSpy).toHaveBeenCalledWith(['en-GB', 'reservation'], jasmine.objectContaining({
        state: jasmine.objectContaining({
          date: nextMonday,
          customerId: mockReservation.customer.id,
          professionalId: mockReservation.professional.id,
          roomId: mockReservation.room.id,
          treatmentId: mockReservation.treatment.key,
          groupId: mockReservation.treatment.groupId,
        }),
      }));
    });

    it('should allow change color from completed state', () => {
      const startedReservation = { ...mockReservation, state: States.completed };
      reservationSelected$.next(startedReservation);
      histories$.next([]);
      fixture.detectChanges();

      dialogSpy.and.returnValue({
        afterClosed: () => of({
          colorId: 'color-2',
        }),
      });

      component.onChangeState('color');

      expect(storeSpy.dispatch)
        .toHaveBeenCalledWith(updateReservationColor({ id: mockReservation.id, colorId: 'color-2' }));
    });

    it('should allow change customer from completed state', () => {
      const startedReservation = { ...mockReservation, state: States.completed };
      reservationSelected$.next(startedReservation);
      histories$.next([]);
      fixture.detectChanges();

      dialogSpy.and.returnValue({
        afterClosed: () => of({
          customerId: 'customer-2',
        }),
      });

      component.onChangeState('change');

      expect(storeSpy.dispatch)
        .toHaveBeenCalledWith(updateReservationCustomer({ id: mockReservation.id, customerId: 'customer-2' }));
    });

    it('should allow canceling from created state', () => {
      dialogSpy.and.returnValue({
        afterClosed: () => of({ option: CancelOption.none }),
      });
      reservationSelected$.next(mockReservation);
      histories$.next([]);
      fixture.detectChanges();

      component.onChangeState('cancel');

      expect(dialogSpy).toHaveBeenCalledWith(
        jasmine.any(Function),
        jasmine.objectContaining({
          data: jasmine.objectContaining({
            options: [CancelOption.refund, CancelOption.account, CancelOption.chargeAndRefund, CancelOption.none],
            price: jasmine.objectContaining({
              amount: 100,
              totalPaid: 0,
            }),
          }),
        }));

      expect(storeSpy.dispatch)
        .toHaveBeenCalledWith(cancelReservation('reservation-123', { option: CancelOption.none }));
    });

    it('should navigate to more info page', () => {
      reservationSelected$.next(mockReservation);
      histories$.next([]);
      fixture.detectChanges();

      component.onChangeState('more');

      expect(navigateSpy).toHaveBeenCalledWith(['en-GB', 'reservation', 'reservation-123', 'more-info']);
    });

    it('should transition from partiallyCompleted to completed', () => {
      const partiallyCompletedReservation = { ...mockReservation, state: States.partiallyCompleted };
      reservationSelected$.next(partiallyCompletedReservation);
      histories$.next([]);
      fixture.detectChanges();

      dialogSpy.and.returnValue({
        afterClosed: () => of('complete'),
      });

      component.onChangeState('complete');

      expect(storeSpy.dispatch).toHaveBeenCalledWith(paymentCompleteReservation('reservation-123'));
    });

    it('should allow booking from completed state', () => {
      const completedReservation = { ...mockReservation, state: States.completed };
      reservationSelected$.next(completedReservation);
      histories$.next([]);
      fixture.detectChanges();

      component.onChangeState('book');

      const customerId = mockReservation.customer.id;
      const roomId = mockReservation.room.id;
      const treatmentId = mockReservation.treatment.key;
      const professionalId = mockReservation.professional.id;
      const data = { customerId, roomId, treatmentId, professionalId };

      expect(navigateSpy).toHaveBeenCalledWith(['en-GB', 'reservation'], { state: data });
    });
  });

  describe('State Machine - Customer', () => {
    beforeEach(() => {
      authUserSignal.update(prev => ({
        ...prev,
        isAdmin: false,
        isManager: false,
        isRoomAdmin: false,
        professionalId: undefined,
        customerId: 'customer-123',
      }));
      fixture.detectChanges();
    });

    it('should create customer machine with created state', () => {
      reservationSelected$.next(mockReservation);
      histories$.next([]);
      fixture.detectChanges();

      expect(component.changeState).toBeDefined();
      expect(component.changeState.length).toBe(2);
    });

    it('should allow booking from completed state', () => {
      const completedReservation = { ...mockReservation, state: States.completed };
      reservationSelected$.next(completedReservation);
      histories$.next([]);
      fixture.detectChanges();

      component.onChangeState('book');

      const roomId = mockReservation.room.id;
      const treatmentId = mockReservation.treatment.key;
      const professionalId = mockReservation.professional.id;
      const data = { roomId, treatmentId, professionalId };

      expect(navigateSpy).toHaveBeenCalledWith(['en-GB', 'me', 'reservation'], { state: data });
    });

    it('should allow edit a reservation', () => {
      reservationSelected$.next({ ...mockReservation, canEdit: true });
      histories$.next([]);
      fixture.detectChanges();

      dialogSpy.and.returnValue({
        afterClosed: () => of('edit'),
      });

      component.onChangeState('edit');

      expect(navigateSpy).toHaveBeenCalledWith(['en-GB', 'me', 'reservation', mockReservation.id]);
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
      reservationSelected$.next({ ...mockReservation, state: States.cancelledPaymentRequired, paymentRequired: true });
      histories$.next([]);
      payments$.next([pendingPayment]);
      fixture.detectChanges();

      component.onChangeState('notify');

      expect(storeSpy.dispatch).toHaveBeenCalledWith(notifyPayment({
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
      reservationSelected$.next({ ...mockReservation, state: States.cancelledPaymentRequired, paymentRequired: true });
      histories$.next([]);
      payments$.next([createdPayment]);
      fixture.detectChanges();

      component.onChangeState('pay');

      expect(navigateSpy).toHaveBeenCalledWith(['/', 'en-GB', 'me', 'payment', createdPayment.id]);
    });


    it('should allow paid when reservation is approved', () => {
      reservationSelected$.next({ ...mockReservation, state: States.approved });
      histories$.next([]);
      fixture.detectChanges();

      component.onChangeState('pay');

      expect(navigateSpy)
        .toHaveBeenCalledWith(['/', 'en-GB', 'me', 'reservation', mockReservation.id, 'payment', 'option']);
    });

    it('should allow cancel and edit a reservation', () => {
      reservationSelected$.next({ ...mockReservation, canEdit: false });
      histories$.next([]);
      fixture.detectChanges();

      dialogSpy.and.returnValue({
        afterClosed: () => of(true),
      });

      component.onChangeState('cancel_edit');

      expect(dialogSpy).toHaveBeenCalledWith(
        jasmine.any(Function),
        jasmine.objectContaining({
          data: jasmine.objectContaining({
            price: jasmine.objectContaining({
              amount: 100,
              totalPaid: 0,
            }),
            currency: mockCurrency,
          }),
        }));

      expect(navigateSpy).toHaveBeenCalledWith(['en-GB', 'me', 'reservation', mockReservation.id]);
    });

    it('should allow canceling when is edit mode and no payments', () => {
      reservationSelected$.next({ ...mockReservation, canEdit: true });
      histories$.next([]);
      fixture.detectChanges();

      dialogSpy.and.returnValue({
        afterClosed: () => of({ option: CancelOption.none }),
      });

      component.onChangeState('cancel');

      expect(dialogSpy).toHaveBeenCalledWith(
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

      expect(storeSpy.dispatch)
        .toHaveBeenCalledWith(customerCancelReservation('reservation-123', { option: CancelOption.none }));
    });

    it('should allow canceling when is edit mode with payments', () => {
      reservationSelected$.next({ ...mockReservation, canEdit: true });
      payments$.next(
        [{ id: 'payment-1', transactionAmount: 100, status: 'APPROVED', type: PaymentType.transfer } as any]);
      histories$.next([]);
      fixture.detectChanges();

      dialogSpy.and.returnValue({
        afterClosed: () => of({ option: CancelOption.account }),
      });

      component.onChangeState('cancel');

      expect(dialogSpy).toHaveBeenCalledWith(
        jasmine.any(Function),
        jasmine.objectContaining({
          data: jasmine.objectContaining({
            options: [CancelOption.account, CancelOption.refund],
            price: jasmine.objectContaining({
              amount: 100,
              totalPaid: 100,
            }),
            showPenalty: false,
          }),
        }));

      expect(storeSpy.dispatch)
        .toHaveBeenCalledWith(customerCancelReservation('reservation-123', { option: CancelOption.account }));
    });

    it('should allow canceling with a penalty when is not edit mode', () => {
      dialogSpy.and.returnValue({
        afterClosed: () => of({ option: CancelOption.chargeAndAccount }),
      });
      reservationSelected$.next({ ...mockReservation, canEdit: false });
      histories$.next([]);
      fixture.detectChanges();

      component.onChangeState('cancel');

      expect(dialogSpy).toHaveBeenCalledWith(
        jasmine.any(Function),
        jasmine.objectContaining({
          data: jasmine.objectContaining({
            options: [CancelOption.chargeAndAccount],
            price: jasmine.objectContaining({
              amount: 100,
              totalPaid: 0,
              penalty: 50,
            }),
            showPenalty: true,
          }),
        }));

      expect(storeSpy.dispatch)
        .toHaveBeenCalledWith(customerCancelReservation('reservation-123', { option: CancelOption.chargeAndAccount }));
    });

    it('should allow canceling with a penalty when is not edit mode and has paid the penalty', () => {
      dialogSpy.and.returnValue({
        afterClosed: () => of({ option: CancelOption.none }),
      });
      reservationSelected$.next({ ...mockReservation, canEdit: false });
      payments$.next(
        [{ id: 'payment-1', transactionAmount: 50, status: 'APPROVED', type: PaymentType.transfer } as any]);
      histories$.next([]);
      fixture.detectChanges();

      component.onChangeState('cancel');

      expect(dialogSpy).toHaveBeenCalledWith(
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

      expect(storeSpy.dispatch)
        .toHaveBeenCalledWith(customerCancelReservation('reservation-123', { option: CancelOption.none }));
    });

    it('should allow canceling when is not edit mode and has paid more than the penalty', () => {
      dialogSpy.and.returnValue({
        afterClosed: () => of({ option: CancelOption.chargeAndAccount }),
      });
      reservationSelected$.next({ ...mockReservation, canEdit: false });
      payments$.next(
        [{ id: 'payment-1', transactionAmount: 100, status: 'APPROVED', type: PaymentType.transfer } as any]);
      histories$.next([]);
      fixture.detectChanges();

      component.onChangeState('cancel');

      expect(dialogSpy).toHaveBeenCalledWith(
        jasmine.any(Function),
        jasmine.objectContaining({
          data: jasmine.objectContaining({
            options: [CancelOption.chargeAndAccount, CancelOption.chargeAndRefund],
            price: jasmine.objectContaining({
              amount: 100,
              totalPaid: 100,
              penalty: 50,
            }),
            showPenalty: true,
          }),
        }));

      expect(storeSpy.dispatch)
        .toHaveBeenCalledWith(
          customerCancelReservation('reservation-123', { option: CancelOption.chargeAndAccount }));
    });
  });

  describe('Payment Management', () => {
    beforeEach(() => {
      authUserSignal.update(prev => ({
        ...prev,
        isAdmin: false,
        isManager: false,
        isRoomAdmin: false,
        professionalId: 'prof-123',
        customerId: undefined,
      }));
      fixture.detectChanges();
    });

    it('should populate payment form when payments are loaded', () => {
      reservationSelected$.next(mockReservation);
      payments$.next(mockPayments);
      histories$.next([]);
      fixture.detectChanges();

      expect(component.payments.length).toBe(2);
    });

    it('should dispatch paymentSend when pay is called', () => {
      const payment = {
        paymentURL: 'https://payment.url',
      } as any;

      component.pay(payment);

      expect(storeSpy.dispatch).toHaveBeenCalledWith(paymentSend({ link: 'https://payment.url' }));
    });
  });
});
