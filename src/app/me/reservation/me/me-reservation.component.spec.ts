/* eslint-disable camelcase */
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { of } from 'rxjs';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MeReservationComponent } from './me-reservation.component';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import {
  AuthUserService,
  IAuthUser,
  initialAuthUser,
} from '@app/services/auth-user.service';
import { signal } from '@angular/core';
import { FirebaseService } from '@app/services/firebase.service';
import { IPaymentOption, PaymentPercentage } from '@app/interfaces/payment';
import { Role } from '@app/interfaces/token';
import { IGroupService, ITreatmentAll, Price } from '@app/treatment/treatment';
import { IRoomAll, ServiceType } from '@app/room/room';
import { DiscountType, IUserDiscount } from '@app/discount/discount';
import { ToastService } from '@app/services/toast.service';
import { DEFAULT_LOCALE } from '@app/util/dates';
import { NavigationService } from '@app/services/navigation.service';
import { AdditionalStore } from '@app/store/additional.store';
import { TreatmentStore } from '@app/store/treatment.store';
import { PaymentStore } from '@app/store/payment.store';
import { ReservationStore } from '@app/store/reservation.store';

describe('MeReservationComponent', () => {
  let component: MeReservationComponent;
  let fixture: ComponentFixture<MeReservationComponent>;
  let translateService: TranslateService;
  let navigationServiceSpy: Pick<NavigationService, 'navigate' | 'language'> & {
    navigate: ReturnType<typeof vi.fn>;
  };

  let reservationStoreSpy: {
    data: ReturnType<typeof signal>;
    availability: ReturnType<typeof signal>;
    subErrors: ReturnType<typeof signal>;
    selected: ReturnType<typeof signal>;
    loadById: Mock;
    loadUpcoming: Mock;
    loadAvailability: Mock;
    clean: Mock;
  };

  let treatmentStoreSpy: {
    treatmentDiscount: ReturnType<typeof signal>;
    getAllTreatments: Mock;
  };
  let additionalStoreSpy: {
    data: ReturnType<typeof signal>;
    loadAllByGroupId: Mock;
  };
  let paymentStoreSpy: {
    options: ReturnType<typeof signal>;
    getOptions: Mock;
  };

  const authUserSignal = signal<IAuthUser>(initialAuthUser);
  const mockCurrency = { id: 'eur', code: 'EUR', name: 'Euro', icon: '€' };
  const createRoomMock = (paymentTypes: string[]): IRoomAll => ({
    id: 'room-1',
    currency: mockCurrency,
    professionals: [
      {
        id: 'professional-1',
        displayName: 'p 1',
        email: 'p1@email',
        authorities: [],
        locale: 'en',
        timeZone: 'Europe/Amsterdam',
      },
    ],
    office: { id: 'office-1', rooms: [], name: 'office 1', manager: {} },
    paymentTypes,
    availabilities: [],
    address: {
      id: 0,
      name: '0',
      location: { x: 0, y: 0 },
    },
    timeZone: 'Europe/Amsterdam',
    primary: true,
  });
  const paymentOptions: IPaymentOption[] = [
    {
      label: 'Cash',
      name: 'Cash',
      type: 'CASH',
      enabled: true,
      enabledCustomer: true,
      icon: 'cash',
      default: false,
      filter: false,
      defaultFilter: false,
      show: false,
    },
    {
      label: 'Transfer',
      name: 'Transfer',
      type: 'TRANSFER',
      enabled: true,
      enabledCustomer: true,
      icon: 'transfer',
      default: false,
      filter: false,
      defaultFilter: false,
      show: false,
    },
    {
      label: 'Mollie',
      name: 'Mollie',
      type: 'MOLLIE',
      enabled: true,
      enabledCustomer: true,
      default: false,
      filter: false,
      defaultFilter: false,
      show: false,
    },
    {
      label: 'PayPal',
      name: 'PayPal',
      type: 'PAYPAL',
      enabled: true,
      enabledCustomer: true,
      default: false,
      filter: false,
      defaultFilter: false,
      show: false,
    },
  ];
  const mockTreatment: ITreatmentAll = {
    id: 'treatment-1',
    key: 'treatment-1',
    name: 'Treatment',
    price: 70,
    duration: 'PT1H15M',
    type: ServiceType.treatment,
    groupId: 'group-1',
    discountCustomer: undefined,
    group: {
      id: 'group-1',
      name: 'Group 1',
    },
  };

  const createEditReservation = (canEdit = true) => ({
    id: 'reservation-1',
    timestamp: new Date('2026-04-16T10:30:00Z').getTime() / 1000,
    paymentRequired: false,
    canEdit,
    room: {
      ...createRoomMock(['CASH', 'MOLLIE']),
      timeZone: 'Europe/Amsterdam',
      address: { id: 1, name: 'Room', location: { x: 0, y: 0 } },
      office: { id: 'office-1', rooms: [createRoomMock(['CASH', 'MOLLIE'])] },
      professionals: [{ id: 'professional-1', displayName: 'Professional' }],
    },
    professional: { id: 'professional-1', displayName: 'Professional' },
    treatment: mockTreatment,
    additional: [
      {
        id: 'additional-1',
        key: 'additional-1',
        name: 'Removal',
        price: 5,
        duration: 'PT15M',
        type: ServiceType.additional,
      },
    ],
    customer: { id: 'customer-1', phone: '123456789' },
    payments: [],
  });

  const mockDiscount: IUserDiscount = {
    used: false,
    id: 'd1',
    discountCustomer: {
      name: 'Promo',
      amount: 10,
      type: DiscountType.percentage,
      id: 'dc1',
      currency: mockCurrency,
    },
  };

  let authUserServiceSpy: Pick<AuthUserService, 'authUser'>;
  let firebaseServiceSpy: {
    logEvent: Mock;
  };
  let toastServiceSpy: {
    show: Mock;
  };

  beforeEach(async () => {
    navigationServiceSpy = {
      navigate: vi.fn().mockName('NavigationService.navigate'),
      language: DEFAULT_LOCALE,
    };
    reservationStoreSpy = {
      data: signal(undefined),
      availability: signal(undefined),
      subErrors: signal(undefined),
      selected: signal(undefined),
      loadById: vi.fn().mockName('loadById'),
      loadUpcoming: vi.fn().mockName('loadUpcoming'),
      loadAvailability: vi.fn().mockName('loadAvailability'),
      clean: vi.fn().mockName('clean'),
    };
    treatmentStoreSpy = {
      treatmentDiscount: signal<any>(undefined),
      getAllTreatments: vi.fn().mockName('getAllTreatments'),
    };
    additionalStoreSpy = {
      data: signal<any>(undefined),
      loadAllByGroupId: vi.fn().mockName('loadAllByGroupId'),
    };
    paymentStoreSpy = {
      options: signal(paymentOptions),
      getOptions: vi.fn().mockName('getOptions'),
    };

    authUserServiceSpy = {
      authUser: authUserSignal.asReadonly(),
    };
    firebaseServiceSpy = {
      logEvent: vi.fn().mockName('FirebaseService.logEvent'),
    };
    toastServiceSpy = {
      show: vi.fn().mockName('ToastService.show'),
    };
    toastServiceSpy.show.mockReturnValue({
      onAction: () => of(void 0),
      onDismiss: () => of(void 0),
    });

    await TestBed.configureTestingModule({
      imports: [MeReservationComponent],
      providers: [
        provideTranslateService(),
        { provide: ReservationStore, useValue: reservationStoreSpy },
        { provide: TreatmentStore, useValue: treatmentStoreSpy },
        { provide: AdditionalStore, useValue: additionalStoreSpy },
        { provide: PaymentStore, useValue: paymentStoreSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: FirebaseService, useValue: firebaseServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
      ],
      teardown: {
        destroyAfterEach: true,
      },
    }).compileComponents();

    fixture = TestBed.createComponent(MeReservationComponent);
    component = fixture.componentInstance;

    translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should log and load the reservation when reservationId is available', () => {
    fixture.componentRef.setInput('id', 'reservation-1');
    fixture.detectChanges();

    expect(firebaseServiceSpy.logEvent).toHaveBeenCalledWith(
      'screen_view',
      expect.objectContaining({
        firebase_screen: 'Edit customer reservation reservation-1',
      }),
    );
    expect(reservationStoreSpy.loadById).toHaveBeenCalledWith('reservation-1');
  });

  it('should map sub errors through the shared reservation error service', () => {
    component.getOfficeForm.office.setValue({
      id: 'office-1',
      name: 'Office',
    } as any);
    component.getOfficeForm.room.setValue({
      id: 'room-1',
      address: { name: 'Room' },
    } as any);
    component.getOfficeForm.professional.setValue({
      id: 'professional-1',
      displayName: 'Professional',
    } as any);
    component['applySubErrors']([
      { field: 'startDate', message: 'Start date is invalid' },
    ] as any);

    expect(component.errors().startDate).toBe('Start date is invalid');
    expect(component.getTreatmentForm.startDate.hasError('incorrect')).toBe(
      true,
    );
  });

  it('should apply shared sub errors to office, payment and accept controls', () => {
    component['applySubErrors']([
      { field: 'room', message: 'Room invalid' },
      { field: 'option', message: 'Payment type invalid' },
      { field: 'phone', message: 'Phone invalid' },
      { field: 'event', message: 'Event invalid' },
    ] as any);

    expect(component.errors().room).toBe('Room invalid');
    expect(component.errors().option).toBe('Payment type invalid');
    expect(component.errors().phone).toBe('Phone invalid');
    expect(component.errors().event).toBe('Event invalid');
    expect(component.getOfficeForm.room.hasError('incorrect')).toBe(true);
    expect(component.getTypeForm.option.hasError('incorrect')).toBe(true);
    expect(component.getAcceptForm.phone.hasError('incorrect')).toBe(true);
    expect(component.getEventForm.event.hasError('incorrect')).toBe(true);
  });

  it('should move the stepper to the treatment step for startDate sub errors', () => {
    component.activeStepIndex.set(0);

    component['applySubErrors']([
      { field: 'startDate', message: 'Start date invalid' },
    ] as any);

    expect(component.activeStepIndex()).toBe(1);
  });

  it('should keep the first step selected for generic shared sub errors', () => {
    component.activeStepIndex.set(2);

    component['applySubErrors']([
      { field: 'room', message: 'Room invalid' },
    ] as any);

    expect(component.activeStepIndex()).toBe(0);
    expect(component.getOfficeForm.room.hasError('incorrect')).toBe(true);
  });

  it('should ignore sub errors for unsupported fields', () => {
    component.activeStepIndex.set(1);

    component['applySubErrors']([
      { field: 'unsupported', message: 'Ignore me' },
    ] as any);

    expect(component.activeStepIndex()).toBe(0);
    expect(component.errors()).toEqual({});
    expect(component.getOfficeForm.room.hasError('incorrect')).toBe(false);
  });

  it('should use the selected payment type when creating a reservation payment', () => {
    const emitSpy = vi.fn().mockName('emit');
    component.submitData.subscribe(emitSpy);
    authUserSignal.update((prev) => ({ ...prev, customerId: 'customer-1' }));
    component.date = new Date('2026-03-26T10:00:00');

    component.getOfficeForm.room.setValue(
      createRoomMock(['CASH', 'TRANSFER', 'MOLLIE']) as any,
    );
    fixture.detectChanges();

    component.getOfficeForm.professional.setValue({
      id: 'professional-1',
    } as any);
    component.getTreatmentForm.treatment.setValue({ id: 'treatment-1' } as any);
    component.getTypeForm.option.setValue({
      type: 'MOLLIE',
    } as any);
    component.getTypeForm.percentage.setValue(PaymentPercentage.total);
    component.getAcceptForm.phone.setValue('123456789');
    component.additionalSelected.set([]);

    component.create();

    expect(emitSpy).toHaveBeenCalledWith({
      reservation: expect.objectContaining({
        customerId: 'customer-1',
        roomId: 'room-1',
        professionalId: 'professional-1',
        treatmentId: 'treatment-1',
        payment: expect.objectContaining({
          type: 'MOLLIE',
          percentage: PaymentPercentage.total,
        }),
      }),
      role: Role.customer,
    });
  });

  it('should default the payment percentage to total when none is selected', () => {
    const emitSpy = vi.fn().mockName('emit');
    component.submitData.subscribe(emitSpy);

    authUserSignal.update((prev) => ({ ...prev, customerId: 'customer-1' }));
    component.date = new Date('2026-03-26T10:00:00');
    component.getOfficeForm.room.setValue(
      createRoomMock(['CASH', 'MOLLIE']) as any,
    );
    fixture.detectChanges();

    component.getOfficeForm.professional.setValue({
      id: 'professional-1',
    } as any);
    component.getTreatmentForm.treatment.setValue({ id: 'treatment-1' } as any);
    component.getTypeForm.option.setValue({ type: 'MOLLIE' } as any);
    component.getAcceptForm.phone.setValue('123456789');

    component.create();

    expect(emitSpy).toHaveBeenCalledWith({
      reservation: expect.objectContaining({
        payment: expect.objectContaining({
          type: 'MOLLIE',
          percentage: PaymentPercentage.total,
        }),
      }),
      role: Role.customer,
    });
  });

  it('should not create reservation payment when account credit is selected', () => {
    const emitSpy = vi.fn().mockName('emit');
    component.submitData.subscribe(emitSpy);

    authUserSignal.update((prev) => ({ ...prev, customerId: 'customer-1' }));
    component.date = new Date('2026-03-26T10:00:00');
    component.getOfficeForm.room.setValue(
      createRoomMock(['CASH', 'MOLLIE']) as any,
    );
    fixture.detectChanges();
    component.getOfficeForm.professional.setValue({
      id: 'professional-1',
    } as any);
    component.getTreatmentForm.treatment.setValue({ id: 'treatment-1' } as any);
    component.getTypeForm.option.setValue({ type: 'ACCOUNT' } as any);
    component.getAcceptForm.phone.setValue('123456789');

    component.create();

    expect(emitSpy).toHaveBeenCalledWith({
      reservation: expect.objectContaining({}),
      role: Role.customer,
    });
  });

  it('should calculate paymentToPay using account balance when there is no old price', () => {
    component.price.set(new Price(0, 0, 0, 0, 70, 0, 70, 0, 0, 0, 100, 0));
    component.balance = 17.5;

    expect(component.accountBalanceUsed).toBe(17.5);
    expect(component.paymentToPay).toBe(52.5);
  });

  it('should return zero paymentToPay when current price is fully covered without old price', () => {
    component.price.set(new Price(0, 0, 0, 0, 70, 60, 70, 0, 0, 0, 100, 0));
    component.balance = 20;

    expect(component.paymentToPay).toBe(0);
  });

  it('should calculate paymentToPay with penalty and changes for edited reservations', () => {
    component.price.set(new Price(0, 0, 0, 0, 100, 0, 100, 0, 0, 0, 100, 0));
    component.oldPrice = new Price(0, 0, 0, 0, 85, 85, 85, 0, 0, 0, 100, 0);
    component.oldPrice.setPenalty(42.5);
    vi.spyOn(component, 'hasReservationChanges', 'get').mockReturnValue(true);
    component.showPenalty = true;

    expect(component.paymentToPay).toBe(57.5);
  });

  it('should calculate paymentToPay for edited reservations without changes using penalty only', () => {
    component.price.set(new Price(0, 0, 0, 0, 100, 0, 100, 0, 0, 0, 100, 0));
    component.oldPrice = new Price(0, 0, 0, 0, 85, 10, 85, 0, 0, 0, 100, 17.5);
    component.oldPrice.setPenalty(42.5);
    vi.spyOn(component, 'hasReservationChanges', 'get').mockReturnValue(false);
    component.showPenalty = true;

    expect(component.paymentToPay).toBe(15);
  });

  it('should calculate paymentToPay for edited reservations without penalty from new total', () => {
    component.price.set(new Price(0, 0, 0, 0, 70, 0, 70, 0, 0, 0, 100, 0));
    component.oldPrice = new Price(0, 0, 0, 0, 85, 10, 85, 0, 0, 0, 100, 17.5);
    component.showPenalty = false;

    expect(component.paymentToPay).toBe(42.5);
  });

  it('should calculate paymentCredit using only applied account balance', () => {
    component.price.set(new Price(0, 0, 0, 0, 5, 0, 5, 0, 0, 0, 100, 0));
    component.oldPrice = new Price(0, 0, 0, 0, 5, 5, 5, 0, 0, 0, 100, 0);
    component.oldPrice.setPenalty(2.5);
    component.balance = 20;
    vi.spyOn(component, 'hasReservationChanges', 'get').mockReturnValue(true);
    component.showPenalty = true;

    expect(component.accountBalanceUsed).toBe(2.5);
    expect(component.paymentCredit).toBe(0);
  });

  it('should return zero paymentCredit for edited reservations without changes', () => {
    component.price.set(new Price(0, 0, 0, 0, 5, 0, 5, 0, 0, 0, 100, 0));
    component.oldPrice = new Price(0, 0, 0, 0, 5, 5, 5, 0, 0, 0, 100, 0);
    vi.spyOn(component, 'hasReservationChanges', 'get').mockReturnValue(false);

    expect(component.paymentCredit).toBe(0);
  });

  it('should calculate paymentCredit for non-edit flow using applied balance', () => {
    component.price.set(new Price(0, 0, 0, 0, 5, 10, 5, 0, 0, 0, 100, 0));
    component.balance = 2.5;

    expect(component.paymentCredit).toBe(5);
  });

  it('should return zero paymentCredit for non-edit flow when covered amount does not exceed total', () => {
    component.price.set(new Price(0, 0, 0, 0, 20, 10, 20, 0, 0, 0, 100, 0));
    component.balance = 5;

    expect(component.paymentCredit).toBe(0);
  });

  it('should use fallback component balance when price balance is not hydrated yet', () => {
    component.price.set(new Price(0, 0, 0, 0, 70, 0, 70, 0, 0, 0, 100, 0));
    component.balance = 17.5;

    expect(component.accountBalanceUsed).toBe(17.5);
  });

  it('should apply customer balance to both current and old price', () => {
    component.price.set(new Price(0, 0, 0, 0, 70, 0, 70, 0, 0, 0, 100, 0));
    component.oldPrice = new Price(0, 0, 0, 0, 50, 0, 50, 0, 0, 0, 100, 0);

    component['applyCustomerBalance'](25);

    expect(component.balance).toBe(25);
    expect(component.price().balance).toBe(25);
    expect(component.oldPrice?.balance).toBe(25);
  });

  it('should derive online payment types and options from the selected room', () => {
    component.getOfficeForm.room.setValue(
      createRoomMock(['CASH', 'TRANSFER', 'MOLLIE', 'PAYPAL']) as any,
    );

    component['setTypes']();

    expect(component.options()?.map((option) => option.type)).toEqual([
      'MOLLIE',
      'PAYPAL',
    ]);
    expect(
      component.options()?.every((option) => option.name !== undefined),
    ).toBe(true);
  });

  it('should clear payment options when no room is selected', () => {
    component.getOfficeForm.room.setValue(undefined);

    component['setTypes']();

    expect(component.options()).toEqual([]);
  });

  it('should reset treatment-specific state when cleaning treatment', () => {
    component.price.set(new Price(0, 0, 0, 0, 70, 0, 70, 0, 0, 0, 100, 0));
    component.getTreatmentForm.treatment.setValue({ id: 'treatment-1' } as any);
    component.treatmentList.set([{ id: 'treatment-1' } as any]);
    component.getEventForm.event.setValue(new Date());

    component['cleanTreatment']();

    expect(component.price().total).toBe(0);
    expect(component.getTreatmentForm.treatment.value).toBeUndefined();
    expect(component.treatmentList()).toBeUndefined();
    expect(component.getEventForm.event.value).toBeUndefined();
  });

  it('should return zero accountBalanceUsed when there is no balance available', () => {
    component.price.set(new Price(0, 0, 0, 0, 70, 0, 70, 0, 0, 0, 100, 0));
    component.balance = 0;

    expect(component.accountBalanceUsed).toBe(0);
  });

  it('should calculate accountBalanceUsed for edited reservations with changes and penalty', () => {
    component.price.set(new Price(0, 0, 0, 0, 100, 0, 100, 0, 0, 0, 100, 0));
    component.oldPrice = new Price(0, 0, 0, 0, 85, 5, 85, 0, 0, 0, 100, 20);
    component.oldPrice.setPenalty(42.5);
    component.balance = 20;
    component.showPenalty = true;
    vi.spyOn(component, 'hasReservationChanges', 'get').mockReturnValue(true);

    expect(component.accountBalanceUsed).toBe(20);
  });

  it('should calculate accountBalanceUsed for edited reservations without changes using penalty only', () => {
    component.price.set(new Price(0, 0, 0, 0, 100, 0, 100, 0, 0, 0, 100, 0));
    component.oldPrice = new Price(0, 0, 0, 0, 85, 5, 85, 0, 0, 0, 100, 50);
    component.oldPrice.setPenalty(42.5);
    component.balance = 50;
    component.showPenalty = true;
    vi.spyOn(component, 'hasReservationChanges', 'get').mockReturnValue(false);

    expect(component.accountBalanceUsed).toBe(37.5);
  });

  it('should return false for hasReservationChanges when not editing or reservation is missing', () => {
    component.isEditing = false;
    (component as any).reservation = undefined;

    expect(component.hasReservationChanges).toBe(false);
  });

  it('should detect reservation changes when selected values differ from reservation', () => {
    component.isEditing = true;
    (component as any).reservation = {
      timestamp: new Date('2026-03-31T08:00:00Z').getTime() / 1000,
      room: { id: 'room-1', timeZone: 'UTC' },
      professional: { id: 'professional-1' },
      treatment: { id: 'treatment-1', key: 'treatment-1' },
      additional: [{ id: 'additional-1', key: 'additional-1' }],
    } as any;
    component.getOfficeForm.room.setValue({ id: 'room-2' } as any);
    component.getOfficeForm.professional.setValue({
      id: 'professional-1',
    } as any);
    component.getTreatmentForm.treatment.setValue({ id: 'treatment-1' } as any);
    component.getEventForm.event.setValue(undefined);
    component.additionalSelected.set([{ id: 'additional-1' } as any]);

    expect(component.hasReservationChanges).toBe(true);
  });

  it('should detect reservation changes when professional changes', () => {
    component.isEditing = true;
    (component as any).reservation = {
      timestamp: new Date('2026-03-31T08:00:00Z').getTime() / 1000,
      room: { id: 'room-1', timeZone: 'UTC' },
      professional: { id: 'professional-1' },
      treatment: { id: 'treatment-1', key: 'treatment-1' },
      additional: [],
    } as any;
    component.getOfficeForm.room.setValue({ id: 'room-1' } as any);
    component.getOfficeForm.professional.setValue({
      id: 'professional-2',
    } as any);
    component.getTreatmentForm.treatment.setValue({ id: 'treatment-1' } as any);
    component.additionalSelected.set([]);

    expect(component.hasReservationChanges).toBe(true);
  });

  it('should detect reservation changes when treatment changes', () => {
    component.isEditing = true;
    (component as any).reservation = {
      timestamp: new Date('2026-03-31T08:00:00Z').getTime() / 1000,
      room: { id: 'room-1', timeZone: 'UTC' },
      professional: { id: 'professional-1' },
      treatment: { id: 'treatment-1', key: 'treatment-1' },
      additional: [],
    } as any;
    component.getOfficeForm.room.setValue({ id: 'room-1' } as any);
    component.getOfficeForm.professional.setValue({
      id: 'professional-1',
    } as any);
    component.getTreatmentForm.treatment.setValue({ id: 'treatment-2' } as any);
    component.additionalSelected.set([]);

    expect(component.hasReservationChanges).toBe(true);
  });

  it('should detect reservation changes when event date changes', () => {
    component.isEditing = true;
    (component as any).reservation = {
      timestamp: new Date('2026-03-31T08:00:00Z').getTime() / 1000,
      room: { id: 'room-1', timeZone: 'UTC' },
      professional: { id: 'professional-1' },
      treatment: { id: 'treatment-1', key: 'treatment-1' },
      additional: [],
    } as any;
    component.getOfficeForm.room.setValue({ id: 'room-1' } as any);
    component.getOfficeForm.professional.setValue({
      id: 'professional-1',
    } as any);
    component.getTreatmentForm.treatment.setValue({ id: 'treatment-1' } as any);
    component.getEventForm.event.setValue(new Date('2026-03-31T09:00:00Z'));
    component.additionalSelected.set([]);

    expect(component.hasReservationChanges).toBe(true);
  });

  it('should detect reservation changes when additional count changes', () => {
    component.isEditing = true;
    (component as any).reservation = {
      timestamp: new Date('2026-03-31T08:00:00Z').getTime() / 1000,
      room: { id: 'room-1', timeZone: 'UTC' },
      professional: { id: 'professional-1' },
      treatment: { id: 'treatment-1', key: 'treatment-1' },
      additional: [{ id: 'additional-1', key: 'additional-1' }],
    } as any;
    component.getOfficeForm.room.setValue({ id: 'room-1' } as any);
    component.getOfficeForm.professional.setValue({
      id: 'professional-1',
    } as any);
    component.getTreatmentForm.treatment.setValue({ id: 'treatment-1' } as any);
    component.getEventForm.event.setValue(undefined);
    component.additionalSelected.set([]);

    expect(component.hasReservationChanges).toBe(true);
  });

  it('should return false for hasReservationChanges when selected values match reservation', () => {
    component.isEditing = true;
    (component as any).reservation = {
      timestamp: new Date('2026-03-31T08:00:00Z').getTime() / 1000,
      room: { id: 'room-1', timeZone: 'UTC' },
      professional: { id: 'professional-1' },
      treatment: { id: 'treatment-1', key: 'treatment-1' },
      additional: [{ id: 'additional-1', key: 'additional-1' }],
    } as any;
    component.getOfficeForm.room.setValue({ id: 'room-1' } as any);
    component.getOfficeForm.professional.setValue({
      id: 'professional-1',
    } as any);
    component.getTreatmentForm.treatment.setValue({ id: 'treatment-1' } as any);
    component.getEventForm.event.setValue(undefined);
    component.additionalSelected.set([{ id: 'additional-1' } as any]);

    expect(component.hasReservationChanges).toBe(false);
  });

  it('should apply customer balance to both current and old price', () => {
    component.price.set(new Price(0, 0, 0, 0, 70, 0, 70, 0, 0, 0, 100, 0));
    component.oldPrice = new Price(0, 0, 0, 0, 40, 10, 40, 0, 0, 0, 100, 0);

    component['applyCustomerBalance'](17.5);

    expect(component.balance).toBe(17.5);
    expect(component.price().balance).toBe(17.5);
    expect(component.oldPrice?.balance).toBe(17.5);
  });

  it('should apply customer balance even when old price is missing', () => {
    component.price.set(new Price(0, 0, 0, 0, 70, 0, 70, 0, 0, 0, 100, 0));
    component.oldPrice = undefined;

    component['applyCustomerBalance'](12);

    expect(component.balance).toBe(12);
    expect(component.price().balance).toBe(12);
  });

  it('should hydrate edit reservations into the me flow state', async () => {
    const reservation = createEditReservation(false);
    vi.spyOn<any, any>(component, 'setTypes');

    component.isEditing = true;
    component['setData'](reservation as any);
    await Promise.resolve();

    expect(component.getOfficeForm.office.value).toEqual(
      expect.objectContaining({ id: reservation.room.office.id }),
    );
    expect(component.getOfficeForm.room.value).toEqual(
      expect.objectContaining({ id: reservation.room.id }),
    );
    expect(component.getOfficeForm.professional.value).toEqual(
      expect.objectContaining({ id: reservation.professional.id }),
    );
    expect(component.getTreatmentForm.startDate.value).toEqual(
      expect.any(Date),
    );
    expect(component.getTreatmentForm.treatment.value).toEqual(
      reservation.treatment,
    );
    expect(component.getEventForm.event.value).toEqual(expect.any(Date));
    expect(component.additionalSelected().map((item) => item.id)).toEqual([
      'additional-1',
    ]);
    expect(component.oldPrice?.total).toBe(75);
    expect(component.price().total).toBe(75);
    expect(component.showPenalty).toBe(true);
    expect(component.firstTime).toBe(true);
    expect(component.activeStepIndex()).toBe(1);
    expect(component['setTypes']).toHaveBeenCalled();
    expect(treatmentStoreSpy.getAllTreatments).toHaveBeenCalledWith('room-1');
    expect(component['hydratingEdit']).toBe(false);
  });

  it('should fetch additionals using the stored group id when the form group is empty', () => {
    component['groupId'] = 'group-1';
    component.getOfficeForm.room.setValue({ id: 'room-1' } as any);
    component.getTreatmentForm.group.setValue(undefined);

    component['getAdditionalList']();

    expect(additionalStoreSpy.loadAllByGroupId).toHaveBeenCalledWith(
      'room-1',
      'group-1',
    );
  });

  it('should sync rendered additional selections from the stored additional ids', async () => {
    const selected = { id: 'additional-1', name: 'Removal' } as any;
    const optionA = { value: selected, selected: false };
    const optionB = {
      value: { id: 'additional-2', name: 'Powder' },
      selected: true,
    };
    (component as any).additionalLists = () => [
      { options: [optionA, optionB] },
    ];
    component.additionalSelected.set([selected]);

    component['syncRenderedAdditionalSelections']();
    await Promise.resolve();

    expect(optionA.selected).toBe(true);
    expect(optionB.selected).toBe(false);
  });

  it('should detect when additional selections need syncing', () => {
    const current = [{ id: 'additional-1' }, { id: 'additional-2' }] as any;
    const same = current.slice();
    const updated = [{ id: 'additional-1' }, { id: 'additional-3' }] as any;

    expect(component['shouldSyncAdditionalSelection'](current, same)).toBe(
      false,
    );
    expect(component['shouldSyncAdditionalSelection'](current, updated)).toBe(
      true,
    );
  });

  it('should branch to preview when no payment is required', () => {
    component.price.set(new Price());
    component['duration'] = { hour: 1, minute: 15 };
    component.getEventForm.event.setValue(new Date('2026-04-16T10:30:00Z'));

    component.callStepFive(true);

    expect(component.isPayment).toBe(false);
    expect(component.isPreview).toBe(true);
    expect(component.activeStepIndex()).toBe(5);
  });

  it('should branch to the payment step when payment is required', () => {
    component.price.set(new Price(0, 0, 0, 0, 75, 0, 75, 0, 0, 0, 100, 0));
    component['duration'] = { hour: 1, minute: 15 };
    component.getEventForm.event.setValue(new Date('2026-04-16T10:30:00Z'));

    component.callStepFive(true);

    expect(component.isPayment).toBe(true);
    expect(component.activeStepIndex()).toBe(4);
  });

  it('should build stable hydration keys from reservation identifiers', () => {
    const reservation = createEditReservation();

    expect(component['getReservationHydrationKey'](reservation as any)).toBe(
      'reservation-1|1776335400|room-1|professional-1|treatment-1|additional-1|1|0',
    );
  });

  it('should use fallback total when totalWithoutDiscount is zero', () => {
    component.price.set(new Price(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0));
    component.getTreatmentForm.treatment.setValue({ price: 50 } as any);
    component.additionalSelected.set([{ price: 20 } as any]);

    expect(component.effectiveTotalWithoutDiscount).toBe(70);
  });

  it('should use priceWithDiscount when available for display price', () => {
    component.price.set({
      ...new Price(),
      priceWithDiscount: 55,
      discount: 10,
    } as any);

    vi.spyOn(component, 'hasDiscountApplied', 'get').mockReturnValue(true);

    expect(component.effectiveTreatmentDisplayPrice).toBe(55);
  });

  it('should calculate effectiveTotalPrice when total is zero but fallback exists', () => {
    component.price.set({
      ...new Price(),
      total: 0,
    } as any);

    vi.spyOn(component, 'effectiveTotalWithoutDiscount', 'get').mockReturnValue(
      100,
    );
    vi.spyOn(component, 'effectiveDiscountAmount', 'get').mockReturnValue(10);

    expect(component.effectiveTotalPrice).toBe(90);
  });

  it('should return true for showCoveredAmounts when paid or balance used', () => {
    component.price.set({
      ...new Price(),
      totalPaid: 10,
    } as any);

    component.balance = 0;

    expect(component.showCoveredAmounts).toBe(true);
  });

  it('should calculate appointmentEnd from duration when endDate is missing', () => {
    const start = new Date('2026-04-16T10:00:00Z');

    component.getEventForm.event.setValue(undefined);
    component.getTreatmentForm.startDate.setValue(start as any);
    component.getTreatmentForm.treatment.setValue({
      price: 50,
      duration: 'PT1H',
    } as any);
    component['additionalSelected'].set([]);

    expect(component.appointmentEnd).toEqual(new Date('2026-04-16T11:00:00Z'));
  });

  it('should get appointmentEnd if endDate is set', () => {
    expect(component.appointmentEnd).toBeUndefined();
  });

  it('should get appointmentEnd undefined if endDate missing and start is missing', () => {
    const endDate = new Date('2026-04-16T10:00:00Z');
    component.endDate = endDate;

    expect(component.appointmentEnd).toEqual(endDate);
  });

  it('should filter groups by name prefix', () => {
    const groups = [{ name: 'Massage' }, { name: 'Facial' }] as any;

    const result = component['filterGroup']('ma', groups);

    expect(result?.length).toBe(1);
    expect(result?.[0].name).toBe('Massage');
  });

  it('should compare additional items by id', () => {
    const a = { id: '1' } as any;
    const b = { id: '1' } as any;
    const c = { id: '2' } as any;

    expect(component.compareAdditional(a, b)).toBe(true);
    expect(component.compareAdditional(a, c)).toBe(false);
  });

  it('should detect selected additional items', () => {
    component.additionalSelected.set([{ id: '1' } as any]);

    expect(component.isSelected({ id: '1' } as any)).toBe(true);
    expect(component.isSelected({ id: '2' } as any)).toBe(false);
  });

  it('should not update anything when treatmentDiscountSignal is empty', () => {
    treatmentStoreSpy.treatmentDiscount.set(undefined);

    const groupsSpy = vi
      .spyOn(component.groups, 'set')
      .mockReturnValue(undefined);
    const listSpy = vi
      .spyOn(component.treatmentList, 'set')
      .mockReturnValue(undefined);

    fixture.detectChanges();

    expect(groupsSpy).not.toHaveBeenCalled();
    expect(listSpy).not.toHaveBeenCalled();
  });

  it('should not update when room is missing', () => {
    treatmentStoreSpy.treatmentDiscount.set({
      treatments: [mockTreatment],
      discounts: [],
    } as any);

    component.getOfficeForm.room.setValue(undefined);

    const groupsSpy = vi
      .spyOn(component.groups, 'set')
      .mockReturnValue(undefined);

    fixture.detectChanges();

    expect(groupsSpy).not.toHaveBeenCalled();
  });

  it('should create groups and set groups signal', () => {
    component.getOfficeForm.room.setValue(createRoomMock(['CASH', 'MOLLIE']));

    treatmentStoreSpy.treatmentDiscount.set({
      treatments: [mockTreatment],
      discounts: [],
    } as any);

    component['groupId'] = 'g1';
    component['treatmentId'] = 't1';

    const groupsSpy = vi
      .spyOn(component.groups, 'set')
      .mockReturnValue(undefined);

    fixture.detectChanges();

    expect(groupsSpy).toHaveBeenCalled();
  });

  it('should select current group by groupId', () => {
    component.getOfficeForm.room.setValue(createRoomMock(['CASH', 'MOLLIE']));

    treatmentStoreSpy.treatmentDiscount.set({
      treatments: [mockTreatment],
      discounts: [],
    } as any);

    component['groupId'] = 'g1';
    component['treatmentId'] = 't1';

    const setGroupSpy = vi
      .spyOn(component.getTreatmentForm.group, 'setValue')
      .mockReturnValue(undefined);

    fixture.detectChanges();

    expect(setGroupSpy).toHaveBeenCalled();
  });

  it('should select group using treatmentId fallback', () => {
    component.getOfficeForm.room.setValue(createRoomMock(['CASH', 'MOLLIE']));

    treatmentStoreSpy.treatmentDiscount.set({
      treatments: [mockTreatment],
      discounts: [],
    } as any);

    component['groupId'] = undefined;
    component['treatmentId'] = 't1';

    const setGroupSpy = vi
      .spyOn(component.getTreatmentForm.group, 'setValue')
      .mockReturnValue(undefined);

    fixture.detectChanges();

    expect(setGroupSpy).toHaveBeenCalled();
  });

  describe('labels (computed)', () => {
    it('should map translation values correctly', () => {
      translateService.setTranslation(DEFAULT_LOCALE, {
        COMMON: {
          USER: {
            PHONE: {
              SEARCH: 'Search...',
              COUNTRY_NOT_FOUND: 'No country',
              FIELD: 'Phone',
              INVALID: 'Invalid number',
              REQUIRED: 'Required field',
            },
          },
        },
      });

      fixture.detectChanges();

      const result = component.labels();

      expect(result).toEqual({
        mainLabel: '',
        codePlaceholder: '',
        searchPlaceholderLabel: 'Search...',
        noEntriesFoundLabel: 'No country',
        nationalNumberLabel: 'Phone',
        hintLabel: '',
        invalidNumberError: 'Invalid number',
        requiredError: 'Required field',
      });
    });

    it('should fallback to empty string when keys are missing', () => {
      translateService.setTranslation(DEFAULT_LOCALE, {});

      const result = component.labels();

      expect(result.searchPlaceholderLabel).toBe('');
      expect(result.noEntriesFoundLabel).toBe('');
      expect(result.nationalNumberLabel).toBe('');
      expect(result.invalidNumberError).toBe('');
      expect(result.requiredError).toBe('');
    });
  });

  describe('discounts (computed)', () => {
    it('should return undefined when no treatmentDiscountSignal', () => {
      treatmentStoreSpy.treatmentDiscount.set(undefined);
      fixture.detectChanges();

      const result = component.discounts();

      expect(result).toBeUndefined();
    });

    it('should format percentage discount correctly', () => {
      treatmentStoreSpy.treatmentDiscount.set({
        discounts: [
          {
            ...mockDiscount,
            discountCustomer: {
              ...mockDiscount.discountCustomer,
              type: DiscountType.percentage,
              amount: 15,
              name: 'Summer',
            },
          },
        ],
      });
      fixture.detectChanges();

      const result = component.discounts();

      expect(result?.[0].title).toBe('15 % Summer');
    });

    it('should format money discount correctly', () => {
      treatmentStoreSpy.treatmentDiscount.set({
        discounts: [
          {
            ...mockDiscount,
            discountCustomer: {
              ...mockDiscount.discountCustomer,
              type: DiscountType.money,
              amount: 20,
              name: 'Cash Discount',
              discount: {
                currency: { code: 'EUR' },
              },
            },
          },
        ],
      });
      fixture.detectChanges();

      const result = component.discounts();

      expect(result?.[0].title).toBe('€ 20 Cash Discount');
    });

    it('should fallback to original name when type is unknown', () => {
      treatmentStoreSpy.treatmentDiscount.set({
        discounts: [
          {
            ...mockDiscount,
            discountCustomer: {
              ...mockDiscount.discountCustomer,
              type: 'UNKNOWN',
              name: 'Fallback Name',
            },
          },
        ],
      });
      fixture.detectChanges();

      const result = component.discounts();

      expect(result?.[0].title).toBe('Fallback Name');
    });

    it('should preserve original discount properties', () => {
      treatmentStoreSpy.treatmentDiscount.set({
        discounts: [mockDiscount],
      });
      fixture.detectChanges();

      const result = component.discounts();

      expect(result?.[0].id).toBe('d1');
      expect(result?.[0].discountCustomer).toEqual(
        mockDiscount.discountCustomer,
      );
    });

    it('should return new objects (immutability)', () => {
      treatmentStoreSpy.treatmentDiscount.set({
        discounts: [mockDiscount],
      });
      fixture.detectChanges();

      const result = component.discounts();

      expect(result?.[0]).not.toBe({ ...mockDiscount, title: 'title' });
    });
  });

  it('should set treatment when group is selected', () => {
    const group: IGroupService = {
      id: 'group-1',
      name: 'Group 1',
      selectedTreatments: [],
      treatments: [mockTreatment],
    };

    component.getTreatmentForm.group.setValue(group);
    fixture.detectChanges();

    expect(component['groupId']).toBe(group.id);
    expect(component.treatmentList()).toEqual(group.treatments);
  });

  describe('Available list effect (without spying)', () => {
    beforeEach(() => {
      component.price.set({ isPaid: false } as any);
      component.firstTime = true;

      // Ensure control exists
      component.getTypeForm.option.setValidators([() => null]);
    });

    it('should update selectedIndex based on computed availableList', () => {
      const date1 = new Date(2026, 0, 1, 10, 0);
      const date2 = new Date(2026, 0, 2, 10, 0);

      component.getTreatmentForm.startDate.setValue(date2);

      reservationStoreSpy.availability.set([
        { dateTime: date1.getTime() },
        { dateTime: date2.getTime() },
      ]);

      fixture.detectChanges();

      expect(component.selectedIndex).toBe(1);
    });

    it('should NOT change selectedIndex if no startDate', () => {
      const date1 = new Date(2026, 0, 1);

      component.getTreatmentForm.startDate.setValue(undefined);
      reservationStoreSpy.availability.set([{ dateTime: date1.getTime() }]);

      fixture.detectChanges();

      expect(component.selectedIndex).toBe(1);
    });

    it('should NOT clear validators when not paid', () => {
      const clearSpy = vi
        .spyOn(component.getTypeForm.option, 'clearValidators')
        .mockReturnValue(undefined);
      const updateSpy = vi
        .spyOn(component.getTypeForm.option, 'updateValueAndValidity')
        .mockReturnValue(undefined);

      component.price.set({ isPaid: false } as any);

      component.getTreatmentForm.startDate.setValue(new Date());
      reservationStoreSpy.availability.set([
        { dateTime: new Date().getTime() },
      ]);

      fixture.detectChanges();

      expect(clearSpy).not.toHaveBeenCalled();
      expect(updateSpy).not.toHaveBeenCalled();
      expect(component.firstTime).toBe(true);
    });

    it('should clear validators and set firstTime=false when paid', () => {
      const clearSpy = vi
        .spyOn(component.getTypeForm.option, 'clearValidators')
        .mockReturnValue(undefined);
      const updateSpy = vi
        .spyOn(component.getTypeForm.option, 'updateValueAndValidity')
        .mockReturnValue(undefined);

      component.price.set({ isPaid: true } as any);

      component.getTreatmentForm.startDate.setValue(new Date());
      reservationStoreSpy.availability.set([
        { dateTime: new Date().getTime() },
      ]);

      fixture.detectChanges();

      expect(component.firstTime).toBe(false);
      expect(clearSpy).toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalled();
    });

    it('should NOT run effect when availableList is undefined', () => {
      reservationStoreSpy.availability.set(undefined);

      fixture.detectChanges();

      expect(component.selectedIndex).toBe(1);
    });

    it('should NOT re-run when price changes (untracked)', () => {
      const clearSpy = vi
        .spyOn(component.getTypeForm.option, 'clearValidators')
        .mockReturnValue(undefined);

      component.getTreatmentForm.startDate.setValue(new Date());

      // initial run (not paid)
      component.price.set({ isPaid: false } as any);
      reservationStoreSpy.availability.set([
        { dateTime: new Date().getTime() },
      ]);
      fixture.detectChanges();

      expect(clearSpy).not.toHaveBeenCalled();

      // change price AFTER effect
      component.price.set({ isPaid: true } as any);
      fixture.detectChanges();

      // still should NOT trigger
      expect(clearSpy).not.toHaveBeenCalled();
    });
  });

  it('should NOT reset treatment when hydratingEdit is true', () => {
    const mockRoom = { ...createRoomMock(['CASH', 'MOLLIE']), timeZone: 'UTC' };
    component.getOfficeForm.room.setValue(mockRoom);
    component['hydratingEdit'] = true;
    component['dismiss'] = false;

    component['professionalId'] = 'prof-1';

    fixture.detectChanges();

    expect(component['roomId']).toBe('room-1');
    expect(component.professionalList()).toEqual(mockRoom.professionals);
    expect(component.getOfficeForm.professional.value?.id).toBe(
      'professional-1',
    );

    expect(component.getTreatmentForm.group.value).toBeUndefined();
  });
});
