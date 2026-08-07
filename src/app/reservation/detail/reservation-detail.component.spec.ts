import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ReservationDetailComponent } from './reservation-detail.component';
import { AuthUserService, IAuthUser, initialAuthUser } from '@app/services/auth-user.service';
import { CancelOption, IReservationAll, States } from '../reservation';
import { IPaymentAll } from '@app/interfaces/payment';
import { ServiceType } from '@app/room/room';
import { IUserAll } from '@app/user/user';
import { DEFAULT_LOCALE, getNowTimeZone } from '@app/util/dates';
import { ICurrencyAll } from '@app/currency/currency';
import { IAdditionalAll } from '@app/additional/additional';
import { signal } from '@angular/core';
import { NavigationService } from '@app/services/navigation.service';
import { PaymentStore } from '@app/store/payment.store';
import { ReservationStore } from '@app/store/reservation.store';

describe('ReservationDetailComponent', () => {
  let component: ReservationDetailComponent;
  let fixture: ComponentFixture<ReservationDetailComponent>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;

  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  let reservationStoreSpy: {
    data: ReturnType<typeof signal>;
    selected: ReturnType<typeof signal>;
    loadById: jasmine.Spy;
    loadHistory: jasmine.Spy;
    updateNote: jasmine.Spy;
    updateDiscount: jasmine.Spy;
    updateColor: jasmine.Spy;
    updateCustomer: jasmine.Spy;
    start: jasmine.Spy;
    approve: jasmine.Spy;
    cancel: jasmine.Spy;
    customerCancel: jasmine.Spy;
    paymentComplete: jasmine.Spy;
    isLoading: jasmine.Spy;
  };
  let paymentStoreSpy: {
    data: ReturnType<typeof signal>;
    options: ReturnType<typeof signal>;
    getOptions: jasmine.Spy;
    notify: jasmine.Spy;
    adjust: jasmine.Spy;
    getPaymentByResourceId: jasmine.Spy;
    isLoading: jasmine.Spy;
  };
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
      paymentTypes: ['CASH', 'TRANSFER'],
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
      type: 'CASH',
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
      type: 'TRANSFER',
      description: '',
      amount: 25,
      timestamp: mockDate.getTime() / 1000,
      paymentId: 'p2',
      preferenceId: 'pref2',
    },
  ];

  const addPaymentForm = (amount = '100.00', type = 'TRANSFER') => {
    component.payments.push(new FormGroup({
      amount: new FormControl(amount),
      type: new FormControl(type),
    }) as any);
  };

  beforeEach(async () => {
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['navigate'],
      { language: DEFAULT_LOCALE },
    );
    reservationStoreSpy = {
      data: signal(undefined),
      selected: signal(undefined),
      loadById: jasmine.createSpy('loadById'),
      loadHistory: jasmine.createSpy('loadHistory'),
      updateNote: jasmine.createSpy('updateNote'),
      updateDiscount: jasmine.createSpy('updateDiscount'),
      updateColor: jasmine.createSpy('updateColor'),
      updateCustomer: jasmine.createSpy('updateCustomer'),
      start: jasmine.createSpy('start'),
      approve: jasmine.createSpy('approve'),
      cancel: jasmine.createSpy('cancel'),
      customerCancel: jasmine.createSpy('customerCancel'),
      paymentComplete: jasmine.createSpy('paymentComplete'),
      isLoading: jasmine.createSpy('isLoading'),
    };
    paymentStoreSpy = {
      options: signal([
        {
          type: 'CASH',
          label: 'Cash',
          enabled: true,
          enabledCustomer: true,
          enabledProfessional: true,
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
          enabledCustomer: true,
          enabledProfessional: true,
          default: true,
          filter: true,
          defaultFilter: false,
          show: true,
          icon: 'transfer',
        },
      ]),
      data: signal(undefined),
      getOptions: jasmine.createSpy('getOptions'),
      notify: jasmine.createSpy('notify'),
      adjust: jasmine.createSpy('adjust'),
      getPaymentByResourceId: jasmine.createSpy('getPaymentByResourceId'),
      isLoading: jasmine.createSpy('isLoading'),
    };

    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', ['getUser', 'logout'], {
      authUser: authUserSignal.asReadonly(),
    });

    await TestBed.configureTestingModule({
      imports: [ReservationDetailComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: ReservationStore, useValue: reservationStoreSpy },
        { provide: PaymentStore, useValue: paymentStoreSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);

    fixture = TestBed.createComponent(ReservationDetailComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'reservation-id');

    dialogSpy = spyOn(component['dialog'], 'open');
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
    fixture.componentRef.setInput('id', 'reservation-123');
    fixture.detectChanges();

    expect(reservationStoreSpy.loadById).toHaveBeenCalledWith('reservation-123');
    expect(paymentStoreSpy.getPaymentByResourceId).toHaveBeenCalledWith('reservation-123', 'reservation');
    expect(reservationStoreSpy.loadHistory).toHaveBeenCalledWith('reservation-123');
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
    reservationStoreSpy.selected.set(mockReservation);
    fixture.detectChanges();

    const gmt = component.gmt;
    expect(typeof gmt).toBe('string');
  });

  it('should handle missing payment data gracefully', () => {
    paymentStoreSpy.data.set(undefined);
    fixture.detectChanges();
    expect(() => component.total).not.toThrow();
    expect(component.total).toBe(0);
  });

  it('should handle undefined reservation gracefully', () => {
    reservationStoreSpy.selected.set(undefined);
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
      reservationStoreSpy.selected.set(mockReservation);
      reservationStoreSpy.data.set({ kind: 'list', value: [] });
      fixture.detectChanges();

      expect(component.changeState).toBeDefined();
      expect(component.changeState.map(action => action.id)).toEqual([
        'overview',
        'note',
        'approve',
        'edit',
        'cancel',
        'more',
        'clone',
      ]);
    });

    it('should transition from created to approved state', () => {
      reservationStoreSpy.selected.set(mockReservation);
      reservationStoreSpy.data.set({ kind: 'list', value: [] });
      fixture.detectChanges();

      dialogSpy.and.returnValue({
        afterClosed: () => of('approve'),
      });

      component.onChangeState('approve');

      expect(reservationStoreSpy.approve).toHaveBeenCalledWith('reservation-123');
    });

    it('should transition from approve to start state', () => {
      const approvedReservation = { ...mockReservation, state: States.approved };
      reservationStoreSpy.selected.set(approvedReservation);
      reservationStoreSpy.data.set({ kind: 'list', value: [] });
      fixture.detectChanges();

      dialogSpy.and.returnValue({
        afterClosed: () => of('start'),
      });

      component.onChangeState('start');

      expect(reservationStoreSpy.start).toHaveBeenCalledWith(mockReservation.id);
    });

    it('should send tomorrow message', () => {
      const approvedReservation = {
        ...mockReservation,
        state: States.approved,
        timestamp: (Date.now() / 1000) + 86400, // Tomorrow
      };
      reservationStoreSpy.selected.set(approvedReservation);
      reservationStoreSpy.data.set({ kind: 'list', value: [] });
      fixture.detectChanges();

      dialogSpy.and.returnValue({
        afterClosed: () => of('send'),
      });

      spyOn(window, 'open');

      component.onChangeState('send');

      expect(window.open).toHaveBeenCalledWith(
        `https://api.whatsapp.com/send?phone=+${ mockReservation.customer.phone }&text=WHATSAPP.SEND.TOMORROW`,
        '_blank');
    });

    it('should send coffee message', () => {
      const approvedReservation = {
        ...mockReservation,
        state: States.approved,
        timestamp: (Date.now() / 1000) + 86400, // Tomorrow
      };
      reservationStoreSpy.selected.set(approvedReservation);
      reservationStoreSpy.data.set({ kind: 'list', value: [] });
      fixture.detectChanges();

      dialogSpy.and.returnValue({
        afterClosed: () => of('coffee'),
      });

      spyOn(window, 'open');

      component.onChangeState('coffee');

      expect(window.open).toHaveBeenCalledWith(
        `https://api.whatsapp.com/send?phone=+${ mockReservation.customer.phone }&text=WHATSAPP.SEND.COFFEE`, '_blank');
    });

    it('should send today message', () => {
      const approvedReservation = {
        ...mockReservation,
        state: States.approved,
        timestamp: (getNowTimeZone().getTime() / 1000), // Today
      };
      reservationStoreSpy.selected.set(approvedReservation);
      reservationStoreSpy.data.set({ kind: 'list', value: [] });
      fixture.detectChanges();

      dialogSpy.and.returnValue({
        afterClosed: () => of('send'),
      });

      spyOn(window, 'open');

      component.onChangeState('send');

      expect(window.open).toHaveBeenCalledWith(
        `https://api.whatsapp.com/send?phone=+${ mockReservation.customer.phone }&text=WHATSAPP.SEND.TODAY`, '_blank');
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
      reservationStoreSpy.selected.set(approvedReservation);
      reservationStoreSpy.data.set({ kind: 'list', value: [] });
      fixture.detectChanges();

      dialogSpy.and.returnValue({
        afterClosed: () => of('send'),
      });

      spyOn(window, 'open');

      component.onChangeState('send');

      expect(window.open).toHaveBeenCalledWith(
        `https://api.whatsapp.com/send?phone=+${ mockReservation.customer.phone }&text=WHATSAPP.SEND.APPROVE`,
        '_blank');
    });

    it('should allow editing from created state', () => {
      reservationStoreSpy.selected.set(mockReservation);
      reservationStoreSpy.data.set({ kind: 'list', value: [] });
      fixture.detectChanges();

      dialogSpy.and.returnValue({
        afterClosed: () => of('edit'),
      });

      component.onChangeState('edit');

      expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(
        ['reservation', 'reservation-123', 'edit'],
        { state: { roomId: 'room-123' } },
      );
    });

    it('should transition from started to completed state', () => {
      const startedReservation = { ...mockReservation, state: States.started };
      reservationStoreSpy.selected.set(startedReservation);
      reservationStoreSpy.data.set({ kind: 'list', value: [] });
      fixture.detectChanges();

      dialogSpy.and.returnValue({
        afterClosed: () => of('complete'),
      });

      component.onChangeState('complete');

      expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(
        ['reservation', 'reservation-123', 'rooms', 'room-123', 'customer', 'customer-123', 'complete'],
      );
    });

    it('should navigate to me overview for customer users', () => {
      authUserSignal.update(prev => ({ ...prev, customerId: 'customer-1223', isCustomer: true }));
      reservationStoreSpy.selected.set(
        { ...mockReservation, customer: { ...mockReservation.customer, id: 'customer-1223' } });

      fixture.detectChanges();

      component.overview();

      expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['me', 'overview']);
    });

    it('should navigate to customer overview for non-customer users', () => {
      authUserSignal.update(prev => ({ ...prev, customerId: undefined, isCustomer: false }));
      reservationStoreSpy.selected.set(mockReservation);
      fixture.detectChanges();

      component.overview();

      expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['users', mockReservation.customer.id, 'overview']);
    });

    it('should allow clone from completed state', () => {
      const startedReservation = { ...mockReservation, state: States.completed };
      reservationStoreSpy.selected.set(startedReservation);
      reservationStoreSpy.data.set({ kind: 'list', value: [] });
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

      expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['reservation'], jasmine.objectContaining({
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
      reservationStoreSpy.selected.set(startedReservation);
      reservationStoreSpy.data.set({ kind: 'list', value: [] });
      fixture.detectChanges();

      dialogSpy.and.returnValue({
        afterClosed: () => of({
          colorId: 'color-2',
        }),
      });

      component.onChangeState('color');

      expect(reservationStoreSpy.updateColor).toHaveBeenCalledWith(mockReservation.id, 'color-2');
    });

    it('should allow change customer from completed state', () => {
      const startedReservation = { ...mockReservation, state: States.completed };
      reservationStoreSpy.selected.set(startedReservation);
      reservationStoreSpy.data.set({ kind: 'list', value: [] });
      fixture.detectChanges();

      dialogSpy.and.returnValue({
        afterClosed: () => of({
          customerId: 'customer-2',
        }),
      });

      component.onChangeState('change');

      expect(reservationStoreSpy.updateCustomer).toHaveBeenCalledWith(mockReservation.id, 'customer-2');
    });

    it('should allow canceling from created state', () => {
      dialogSpy.and.returnValue({
        afterClosed: () => of({ option: CancelOption.none }),
      });
      reservationStoreSpy.selected.set(mockReservation);
      reservationStoreSpy.data.set({ kind: 'list', value: [] });
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

      expect(reservationStoreSpy.cancel)
        .toHaveBeenCalledWith('reservation-123', { option: CancelOption.none });
    });

    it('should navigate to more info page', () => {
      reservationStoreSpy.selected.set(mockReservation);
      reservationStoreSpy.data.set({ kind: 'list', value: [] });
      fixture.detectChanges();

      component.onChangeState('more');

      expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['reservation', 'reservation-123', 'more-info']);
    });

    it('should transition from partiallyCompleted to completed', () => {
      const partiallyCompletedReservation = { ...mockReservation, state: States.partiallyCompleted };
      reservationStoreSpy.selected.set(partiallyCompletedReservation);
      reservationStoreSpy.data.set({ kind: 'list', value: [] });
      fixture.detectChanges();

      dialogSpy.and.returnValue({
        afterClosed: () => of('complete'),
      });

      component.onChangeState('complete');

      expect(reservationStoreSpy.paymentComplete).toHaveBeenCalledWith('reservation-123');
    });

    it('should allow booking from completed state', () => {
      const completedReservation = { ...mockReservation, state: States.completed };
      reservationStoreSpy.selected.set(completedReservation);
      reservationStoreSpy.data.set({ kind: 'list', value: [] });
      fixture.detectChanges();

      component.onChangeState('book');

      const customerId = mockReservation.customer.id;
      const roomId = mockReservation.room.id;
      const treatmentId = mockReservation.treatment.key;
      const professionalId = mockReservation.professional.id;
      const data = { customerId, roomId, treatmentId, professionalId };

      expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['reservation'], { state: data });
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
      reservationStoreSpy.selected.set(mockReservation);
      reservationStoreSpy.data.set({ kind: 'list', value: [] });
      fixture.detectChanges();

      expect(component.changeState).toBeDefined();
      expect(component.changeState.map(action => action.id)).toEqual([
        'overview',
        'note',
        'edit',
        'cancel',
      ]);
    });

    it('should allow booking from completed state', () => {
      const completedReservation = { ...mockReservation, state: States.completed };
      reservationStoreSpy.selected.set(completedReservation);
      reservationStoreSpy.data.set({ kind: 'list', value: [] });
      fixture.detectChanges();

      component.onChangeState('book');

      const roomId = mockReservation.room.id;
      const treatmentId = mockReservation.treatment.key;
      const professionalId = mockReservation.professional.id;
      const data = { roomId, treatmentId, professionalId };

      expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['me', 'reservation'], { state: data });
    });

    it('should allow edit a reservation', () => {
      reservationStoreSpy.selected.set({ ...mockReservation, canEdit: true });
      reservationStoreSpy.data.set({ kind: 'list', value: [] });
      fixture.detectChanges();

      dialogSpy.and.returnValue({
        afterClosed: () => of('edit'),
      });

      component.onChangeState('edit');

      expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['me', 'reservation', mockReservation.id]);
    });

    it('should allow notify when it has pending payments', () => {
      const pendingPayment = {
        id: 'payment-1',
        preferenceId: 'preference-123',
        amount: 100,
        status: 'PENDING',
        type: 'IDEAL',
        reservation: mockReservation,
      };
      paymentStoreSpy.data.set({ remainingAmount: 0, payments: [pendingPayment] });
      addPaymentForm('100.00', 'IDEAL');
      reservationStoreSpy.selected.set(
        { ...mockReservation, state: States.cancelledPaymentRequired, paymentRequired: true });
      reservationStoreSpy.data.set({ kind: 'list', value: [] });
      fixture.detectChanges();

      component.onChangeState('notify');

      expect(paymentStoreSpy.notify).toHaveBeenCalledWith(
        pendingPayment.id,
        'reservation',
        mockReservation.id,
        pendingPayment.preferenceId,
        pendingPayment.type,
      );
    });

    it('should allow paid when payment is required and it has no pending payments', () => {
      const createdPayment = {
        id: 'payment-1',
        preferenceId: 'preference-123',
        amount: 100,
        status: 'CREATED',
        type: 'IDEAL',
        reservation: mockReservation,
      };
      paymentStoreSpy.data.set({ remainingAmount: 0, payments: [createdPayment] });
      addPaymentForm('100.00', 'IDEAL');
      reservationStoreSpy.selected.set(
        { ...mockReservation, state: States.cancelledPaymentRequired, paymentRequired: true });
      reservationStoreSpy.data.set({ kind: 'list', value: [] });
      fixture.detectChanges();

      component.onChangeState('pay');

      expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['me', 'payment', createdPayment.id]);
    });


    it('should allow paid when reservation is approved', () => {
      reservationStoreSpy.selected.set({ ...mockReservation, state: States.approved });
      reservationStoreSpy.data.set({ kind: 'list', value: [] });
      fixture.detectChanges();

      component.onChangeState('pay');

      expect(navigationServiceSpy.navigate)
        .toHaveBeenCalledWith(['me', 'reservation', mockReservation.id, 'payment', 'option']);
    });

    it('should allow cancel and edit a reservation', () => {
      reservationStoreSpy.selected.set({ ...mockReservation, canEdit: false });
      reservationStoreSpy.data.set({ kind: 'list', value: [] });
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

      expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['me', 'reservation', mockReservation.id]);
    });

    it('should allow canceling when is edit mode and no payments', () => {
      reservationStoreSpy.selected.set({ ...mockReservation, canEdit: true });
      reservationStoreSpy.data.set({ kind: 'list', value: [] });
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

      expect(reservationStoreSpy.customerCancel).toHaveBeenCalledWith('reservation-123', { option: CancelOption.none });
    });

    it('should allow canceling when is edit mode with payments', () => {
      paymentStoreSpy.data.set({
        remainingAmount: 0,
        payments: [{ id: 'payment-1', transactionAmount: 100, status: 'APPROVED', type: 'TRANSFER' }],
      });
      addPaymentForm('100.00', 'TRANSFER');
      reservationStoreSpy.selected.set({ ...mockReservation, canEdit: true });
      reservationStoreSpy.data.set({ kind: 'list', value: [] });
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

      expect(reservationStoreSpy.customerCancel)
        .toHaveBeenCalledWith('reservation-123', { option: CancelOption.account });
    });

    it('should allow canceling with a penalty when is not edit mode', () => {
      dialogSpy.and.returnValue({
        afterClosed: () => of({ option: CancelOption.chargeAndAccount }),
      });
      reservationStoreSpy.selected.set({ ...mockReservation, canEdit: false });
      reservationStoreSpy.data.set({ kind: 'list', value: [] });
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

      expect(reservationStoreSpy.customerCancel)
        .toHaveBeenCalledWith('reservation-123', { option: CancelOption.chargeAndAccount });
    });

    it('should allow canceling with a penalty when is not edit mode and has paid the penalty', () => {
      dialogSpy.and.returnValue({
        afterClosed: () => of({ option: CancelOption.none }),
      });
      paymentStoreSpy.data.set({
        remainingAmount: 0,
        payments: [{ id: 'payment-1', transactionAmount: 50, status: 'APPROVED', type: 'TRANSFER' }],
      });
      addPaymentForm('50.00', 'TRANSFER');
      reservationStoreSpy.selected.set({ ...mockReservation, canEdit: false });
      reservationStoreSpy.data.set({ kind: 'list', value: [] });
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

      expect(reservationStoreSpy.customerCancel)
        .toHaveBeenCalledWith('reservation-123', { option: CancelOption.none });
    });

    it('should allow canceling when is not edit mode and has paid more than the penalty', () => {
      dialogSpy.and.returnValue({
        afterClosed: () => of({ option: CancelOption.chargeAndAccount }),
      });
      paymentStoreSpy.data.set({
        remainingAmount: 0,
        payments: [
          { id: 'payment-1', transactionAmount: 100, status: 'APPROVED', type: 'TRANSFER' },
        ],
      });
      addPaymentForm('100.00', 'TRANSFER');
      reservationStoreSpy.selected.set({ ...mockReservation, canEdit: false });
      reservationStoreSpy.data.set({ kind: 'list', value: [] });
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

      expect(reservationStoreSpy.customerCancel)
        .toHaveBeenCalledWith('reservation-123', { option: CancelOption.chargeAndAccount });
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
      reservationStoreSpy.selected.set(mockReservation);
      paymentStoreSpy.data.set({ remainingAmount: 0, payments: mockPayments });
      reservationStoreSpy.data.set({ kind: 'list', value: [] });
      fixture.detectChanges();

      expect(component.payments.length).toBe(2);
    });
  });
});
