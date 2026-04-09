/* eslint-disable camelcase */
import { BehaviorSubject, Subject } from 'rxjs';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MeReservationComponent } from './me-reservation.component';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { AuthUserService, IAuthUser, initialAuthUser } from '../../../services/auth-user.service';
import { ReservationState } from '../../../store/reducers/reservation.reducers';
import { signal } from '@angular/core';
import { FirebaseService } from '../../../services/firebase.service';
import { createReservation } from '../../../store/reservation.actions';
import { PaymentPercentage, PaymentType } from '../../../interfaces/payment';
import { Role } from '../../../interfaces/token';
import { Price } from '../../../interfaces/treatment';

describe('MeReservationComponent', () => {
  let component: MeReservationComponent;
  let fixture: ComponentFixture<MeReservationComponent>;

  let navigationParams$: BehaviorSubject<any>;
  let reservationId$: BehaviorSubject<any>;
  let additionalList$: BehaviorSubject<any>;
  let treatmentDiscount$: BehaviorSubject<any>;
  let rooms$: BehaviorSubject<any>;
  let selectedReservation$: BehaviorSubject<any>;
  let customerReservation$: BehaviorSubject<any>;
  let availableList$: BehaviorSubject<any>;
  let subErrors$: BehaviorSubject<any>;
  let params$: Subject<any>;

  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  let storeSpy: jasmine.SpyObj<Store<ReservationState>>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;
  let firebaseServiceSpy: jasmine.SpyObj<FirebaseService>;

  beforeEach(async () => {
    navigationParams$ = new BehaviorSubject(undefined);
    reservationId$ = new BehaviorSubject(undefined);
    additionalList$ = new BehaviorSubject(undefined);
    treatmentDiscount$ = new BehaviorSubject(undefined);
    rooms$ = new BehaviorSubject(undefined);
    selectedReservation$ = new BehaviorSubject(undefined);
    customerReservation$ = new BehaviorSubject(undefined);
    availableList$ = new BehaviorSubject(undefined);
    subErrors$ = new BehaviorSubject(undefined);
    params$ = new Subject<any>();

    storeSpy = jasmine.createSpyObj<Store<ReservationState>>('Store', ['pipe', 'dispatch']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj('ParamMap', ['get']),
      },
      params: params$.asObservable(),
    });
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', [], {
      authUser: authUserSignal.asReadonly(),
    });
    firebaseServiceSpy = jasmine.createSpyObj('FirebaseService', ['logEvent']);

    const storeStreams = [
      navigationParams$,
      reservationId$,
      additionalList$,
      treatmentDiscount$,
      rooms$,
      selectedReservation$,
      customerReservation$,
      availableList$,
      subErrors$,
    ];
    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(
      () => storeStreams[pipeCallIndex++]?.asObservable() ?? new BehaviorSubject(undefined).asObservable());

    await TestBed.configureTestingModule({
      imports: [MeReservationComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: FirebaseService, useValue: firebaseServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MeReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    navigationParams$.complete();
    reservationId$.complete();
    additionalList$.complete();
    treatmentDiscount$.complete();
    rooms$.complete();
    selectedReservation$.complete();
    customerReservation$.complete();
    availableList$.complete();
    subErrors$.complete();
    params$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should log and load the reservation when reservationId is available', () => {
    reservationId$.next('reservation-1');
    fixture.detectChanges();

    expect(firebaseServiceSpy.logEvent).toHaveBeenCalledWith('screen_view', jasmine.objectContaining({
      firebase_screen: 'Edit customer reservation reservation-1',
    }));
    expect(storeSpy.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({
      type: '[Reservation] Find edit',
      id: 'reservation-1',
    }));
  });

  it('should map sub errors through the shared reservation error service', () => {
    component.getOfficeForm.office.setValue({ id: 'office-1', name: 'Office' } as any);
    component.getOfficeForm.room.setValue({ id: 'room-1', address: { name: 'Room' } } as any);
    component.getOfficeForm.professional.setValue({ id: 'professional-1', displayName: 'Professional' } as any);
    subErrors$.next([{ field: 'startDate', message: 'Start date is invalid' }] as any);
    fixture.detectChanges();

    expect(component.errors().startDate).toBe('Start date is invalid');
    expect(component.getTreatmentForm.startDate.hasError('incorrect')).toBeTrue();
  });

  it('should apply shared sub errors to office, payment and accept controls', () => {
    component['applySubErrors']([
      { field: 'room', message: 'Room invalid' },
      { field: 'type', message: 'Payment type invalid' },
      { field: 'phone', message: 'Phone invalid' },
      { field: 'event', message: 'Event invalid' },
    ] as any);

    expect(component.errors().room).toBe('Room invalid');
    expect(component.errors().type).toBe('Payment type invalid');
    expect(component.errors().phone).toBe('Phone invalid');
    expect(component.errors().event).toBe('Event invalid');
    expect(component.getOfficeForm.room.hasError('incorrect')).toBeTrue();
    expect(component.getTypeForm.type.hasError('incorrect')).toBeTrue();
    expect(component.getAcceptForm.phone.hasError('incorrect')).toBeTrue();
    expect(component.getEventForm.event.hasError('incorrect')).toBeTrue();
  });

  it('should move the stepper to the treatment step for startDate sub errors', () => {
    const stepper = { selectedIndex: 0 };
    Object.defineProperty(component, 'stepper', {
      get: () => () => stepper,
      configurable: true,
    });

    component['applySubErrors']([{ field: 'startDate', message: 'Start date invalid' }] as any);

    expect(stepper.selectedIndex).toBe(1);
  });

  it('should keep the first step selected for generic shared sub errors', () => {
    const stepper = { selectedIndex: 2 };
    Object.defineProperty(component, 'stepper', {
      get: () => () => stepper,
      configurable: true,
    });

    component['applySubErrors']([{ field: 'room', message: 'Room invalid' }] as any);

    expect(stepper.selectedIndex).toBe(0);
    expect(component.getOfficeForm.room.hasError('incorrect')).toBeTrue();
  });

  it('should ignore sub errors for unsupported fields', () => {
    const stepper = { selectedIndex: 1 };
    Object.defineProperty(component, 'stepper', {
      get: () => () => stepper,
      configurable: true,
    });

    component['applySubErrors']([{ field: 'unsupported', message: 'Ignore me' }] as any);

    expect(stepper.selectedIndex).toBe(0);
    expect(component.errors()).toEqual({});
    expect(component.getOfficeForm.room.hasError('incorrect')).toBeFalse();
  });

  it('should use the selected payment type when creating a reservation payment', () => {
    authUserSignal.update(prev => ({ ...prev, customerId: 'customer-1' }));
    component.date = new Date('2026-03-26T10:00:00');

    component.getOfficeForm.room.setValue({
      id: 'room-1',
      professionals: [{ id: 'professional-1' }],
      paymentTypes: [PaymentType.cash, PaymentType.transfer, PaymentType.mollie],
    } as any);
    fixture.detectChanges();

    component.getOfficeForm.professional.setValue({ id: 'professional-1' } as any);
    component.getTreatmentForm.treatment.setValue({ id: 'treatment-1' } as any);
    component.getTypeForm.type.setValue({
      type: PaymentType.mollie,
    } as any);
    component.getTypeForm.percentage.setValue(PaymentPercentage.total);
    component.getAcceptForm.phone.setValue('123456789');
    component.additionalSelected.set([]);

    component.create();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(createReservation({
      reservation: jasmine.objectContaining({
        customerId: 'customer-1',
        roomId: 'room-1',
        professionalId: 'professional-1',
        treatmentId: 'treatment-1',
        payment: jasmine.objectContaining({
          type: PaymentType.mollie,
          percentage: PaymentPercentage.total,
        }),
      }) as any,
      role: Role.customer,
    }));
  });

  it('should default the payment percentage to total when none is selected', () => {
    authUserSignal.update(prev => ({ ...prev, customerId: 'customer-1' }));
    component.date = new Date('2026-03-26T10:00:00');
    component.getOfficeForm.room.setValue({
      id: 'room-1',
      professionals: [{ id: 'professional-1' }],
      paymentTypes: [PaymentType.cash, PaymentType.mollie],
    } as any);
    fixture.detectChanges();

    component.getOfficeForm.professional.setValue({ id: 'professional-1' } as any);
    component.getTreatmentForm.treatment.setValue({ id: 'treatment-1' } as any);
    component.getTypeForm.type.setValue({ type: PaymentType.mollie } as any);
    component.getAcceptForm.phone.setValue('123456789');

    component.create();

    const action = storeSpy.dispatch.calls.mostRecent().args[0] as any;
    expect(action.reservation.payment).toEqual({
      type: PaymentType.mollie,
      percentage: PaymentPercentage.total,
    });
  });

  it('should not create reservation payment when account credit is selected', () => {
    authUserSignal.update(prev => ({ ...prev, customerId: 'customer-1' }));
    component.date = new Date('2026-03-26T10:00:00');
    component.getOfficeForm.room.setValue({
      id: 'room-1',
      professionals: [{ id: 'professional-1' }],
      paymentTypes: [PaymentType.cash, PaymentType.mollie],
    } as any);
    fixture.detectChanges();
    component.getOfficeForm.professional.setValue({ id: 'professional-1' } as any);
    component.getTreatmentForm.treatment.setValue({ id: 'treatment-1' } as any);
    component.getTypeForm.type.setValue({ type: PaymentType.account } as any);
    component.getAcceptForm.phone.setValue('123456789');

    component.create();

    const action = storeSpy.dispatch.calls.mostRecent().args[0] as any;
    expect(action.type).toBe(createReservation.type);
    expect(action.role).toBe(Role.customer);
    expect(action.reservation.payment).toBeUndefined();
  });

  it('should calculate paymentToPay using account balance when there is no old price', () => {
    component.price = new Price(0, 0, 0, 0, 70, 0, 70, 0, 0, 0, 100, 0);
    component.balance = 17.5;

    expect(component.accountBalanceUsed).toBe(17.5);
    expect(component.paymentToPay).toBe(52.5);
  });

  it('should return zero paymentToPay when current price is fully covered without old price', () => {
    component.price = new Price(0, 0, 0, 0, 70, 60, 70, 0, 0, 0, 100, 0);
    component.balance = 20;

    expect(component.paymentToPay).toBe(0);
  });

  it('should calculate paymentToPay with penalty and changes for edited reservations', () => {
    component.price = new Price(0, 0, 0, 0, 100, 0, 100, 0, 0, 0, 100, 0);
    component.oldPrice = new Price(0, 0, 0, 0, 85, 85, 85, 0, 0, 0, 100, 0);
    component.oldPrice.setPenalty(42.5);
    spyOnProperty(component, 'hasReservationChanges', 'get').and.returnValue(true);
    component.showPenalty = true;

    expect(component.paymentToPay).toBe(57.5);
  });

  it('should calculate paymentToPay for edited reservations without changes using penalty only', () => {
    component.price = new Price(0, 0, 0, 0, 100, 0, 100, 0, 0, 0, 100, 0);
    component.oldPrice = new Price(0, 0, 0, 0, 85, 10, 85, 0, 0, 0, 100, 17.5);
    component.oldPrice.setPenalty(42.5);
    spyOnProperty(component, 'hasReservationChanges', 'get').and.returnValue(false);
    component.showPenalty = true;

    expect(component.paymentToPay).toBe(15);
  });

  it('should calculate paymentToPay for edited reservations without penalty from new total', () => {
    component.price = new Price(0, 0, 0, 0, 70, 0, 70, 0, 0, 0, 100, 0);
    component.oldPrice = new Price(0, 0, 0, 0, 85, 10, 85, 0, 0, 0, 100, 17.5);
    component.showPenalty = false;

    expect(component.paymentToPay).toBe(42.5);
  });

  it('should calculate paymentCredit using only applied account balance', () => {
    component.price = new Price(0, 0, 0, 0, 5, 0, 5, 0, 0, 0, 100, 0);
    component.oldPrice = new Price(0, 0, 0, 0, 5, 5, 5, 0, 0, 0, 100, 0);
    component.oldPrice.setPenalty(2.5);
    component.balance = 20;
    spyOnProperty(component, 'hasReservationChanges', 'get').and.returnValue(true);
    component.showPenalty = true;

    expect(component.accountBalanceUsed).toBe(2.5);
    expect(component.paymentCredit).toBe(0);
  });

  it('should return zero paymentCredit for edited reservations without changes', () => {
    component.price = new Price(0, 0, 0, 0, 5, 0, 5, 0, 0, 0, 100, 0);
    component.oldPrice = new Price(0, 0, 0, 0, 5, 5, 5, 0, 0, 0, 100, 0);
    spyOnProperty(component, 'hasReservationChanges', 'get').and.returnValue(false);

    expect(component.paymentCredit).toBe(0);
  });

  it('should calculate paymentCredit for non-edit flow using applied balance', () => {
    component.price = new Price(0, 0, 0, 0, 5, 10, 5, 0, 0, 0, 100, 0);
    component.balance = 2.5;

    expect(component.paymentCredit).toBe(5);
  });

  it('should return zero paymentCredit for non-edit flow when covered amount does not exceed total', () => {
    component.price = new Price(0, 0, 0, 0, 20, 10, 20, 0, 0, 0, 100, 0);
    component.balance = 5;

    expect(component.paymentCredit).toBe(0);
  });

  it('should use fallback component balance when price balance is not hydrated yet', () => {
    component.price = new Price(0, 0, 0, 0, 70, 0, 70, 0, 0, 0, 100, 0);
    component.balance = 17.5;

    expect(component.accountBalanceUsed).toBe(17.5);
  });

  it('should apply customer balance to both current and old price', () => {
    component.price = new Price(0, 0, 0, 0, 70, 0, 70, 0, 0, 0, 100, 0);
    component.oldPrice = new Price(0, 0, 0, 0, 50, 0, 50, 0, 0, 0, 100, 0);

    component['applyCustomerBalance'](25);

    expect(component.balance).toBe(25);
    expect(component.price.balance).toBe(25);
    expect(component.oldPrice?.balance).toBe(25);
  });

  it('should derive online payment types and options from the selected room', () => {
    component.getOfficeForm.room.setValue({
      id: 'room-1',
      paymentTypes: [PaymentType.cash, PaymentType.transfer, PaymentType.mollie, PaymentType.paypal],
    } as any);

    component['setTypes']();

    expect(component.paymentTypes()).toEqual([PaymentType.mollie, PaymentType.paypal]);
    expect(component.options()?.map(option => option.type)).toEqual([PaymentType.mollie, PaymentType.paypal]);
    expect(component.options()?.every(option => option.name !== undefined)).toBeTrue();
  });

  it('should clear payment options when no room is selected', () => {
    component.getOfficeForm.room.setValue(undefined);

    component['setTypes']();

    expect(component.paymentTypes()).toBeUndefined();
    expect(component.options()).toEqual([]);
  });

  it('should reset treatment-specific state when cleaning treatment', () => {
    component.price = new Price(0, 0, 0, 0, 70, 0, 70, 0, 0, 0, 100, 0);
    component.getTreatmentForm.treatment.setValue({ id: 'treatment-1' } as any);
    component.treatmentList.set([{ id: 'treatment-1' } as any]);
    component.getEventForm.event.setValue(new Date());

    component['cleanTreatment']();

    expect(component.price.total).toBe(0);
    expect(component.getTreatmentForm.treatment.value).toBeUndefined();
    expect(component.treatmentList()).toBeUndefined();
    expect(component.getEventForm.event.value).toBeUndefined();
  });

  it('should return zero accountBalanceUsed when there is no balance available', () => {
    component.price = new Price(0, 0, 0, 0, 70, 0, 70, 0, 0, 0, 100, 0);
    component.balance = 0;

    expect(component.accountBalanceUsed).toBe(0);
  });

  it('should calculate accountBalanceUsed for edited reservations with changes and penalty', () => {
    component.price = new Price(0, 0, 0, 0, 100, 0, 100, 0, 0, 0, 100, 0);
    component.oldPrice = new Price(0, 0, 0, 0, 85, 5, 85, 0, 0, 0, 100, 20);
    component.oldPrice.setPenalty(42.5);
    component.balance = 20;
    component.showPenalty = true;
    spyOnProperty(component, 'hasReservationChanges', 'get').and.returnValue(true);

    expect(component.accountBalanceUsed).toBe(20);
  });

  it('should calculate accountBalanceUsed for edited reservations without changes using penalty only', () => {
    component.price = new Price(0, 0, 0, 0, 100, 0, 100, 0, 0, 0, 100, 0);
    component.oldPrice = new Price(0, 0, 0, 0, 85, 5, 85, 0, 0, 0, 100, 50);
    component.oldPrice.setPenalty(42.5);
    component.balance = 50;
    component.showPenalty = true;
    spyOnProperty(component, 'hasReservationChanges', 'get').and.returnValue(false);

    expect(component.accountBalanceUsed).toBe(37.5);
  });

  it('should return false for hasReservationChanges when not editing or reservation is missing', () => {
    component.isEditing = false;
    (component as any).reservation = undefined;

    expect(component.hasReservationChanges).toBeFalse();
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
    component.getOfficeForm.professional.setValue({ id: 'professional-1' } as any);
    component.getTreatmentForm.treatment.setValue({ id: 'treatment-1' } as any);
    component.getEventForm.event.setValue(undefined);
    component.additionalSelected.set([{ id: 'additional-1' } as any]);

    expect(component.hasReservationChanges).toBeTrue();
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
    component.getOfficeForm.professional.setValue({ id: 'professional-2' } as any);
    component.getTreatmentForm.treatment.setValue({ id: 'treatment-1' } as any);
    component.additionalSelected.set([]);

    expect(component.hasReservationChanges).toBeTrue();
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
    component.getOfficeForm.professional.setValue({ id: 'professional-1' } as any);
    component.getTreatmentForm.treatment.setValue({ id: 'treatment-2' } as any);
    component.additionalSelected.set([]);

    expect(component.hasReservationChanges).toBeTrue();
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
    component.getOfficeForm.professional.setValue({ id: 'professional-1' } as any);
    component.getTreatmentForm.treatment.setValue({ id: 'treatment-1' } as any);
    component.getEventForm.event.setValue(new Date('2026-03-31T09:00:00Z'));
    component.additionalSelected.set([]);

    expect(component.hasReservationChanges).toBeTrue();
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
    component.getOfficeForm.professional.setValue({ id: 'professional-1' } as any);
    component.getTreatmentForm.treatment.setValue({ id: 'treatment-1' } as any);
    component.getEventForm.event.setValue(undefined);
    component.additionalSelected.set([]);

    expect(component.hasReservationChanges).toBeTrue();
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
    component.getOfficeForm.professional.setValue({ id: 'professional-1' } as any);
    component.getTreatmentForm.treatment.setValue({ id: 'treatment-1' } as any);
    component.getEventForm.event.setValue(undefined);
    component.additionalSelected.set([{ id: 'additional-1' } as any]);

    expect(component.hasReservationChanges).toBeFalse();
  });

  it('should apply customer balance to both current and old price', () => {
    component.price = new Price(0, 0, 0, 0, 70, 0, 70, 0, 0, 0, 100, 0);
    component.oldPrice = new Price(0, 0, 0, 0, 40, 10, 40, 0, 0, 0, 100, 0);

    component['applyCustomerBalance'](17.5);

    expect(component.balance).toBe(17.5);
    expect(component.price.balance).toBe(17.5);
    expect(component.oldPrice?.balance).toBe(17.5);
  });

  it('should apply customer balance even when old price is missing', () => {
    component.price = new Price(0, 0, 0, 0, 70, 0, 70, 0, 0, 0, 100, 0);
    component.oldPrice = undefined;

    component['applyCustomerBalance'](12);

    expect(component.balance).toBe(12);
    expect(component.price.balance).toBe(12);
  });
});
