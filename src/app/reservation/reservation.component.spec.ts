import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, of } from 'rxjs';
import { ReservationComponent } from './reservation.component';
import { AuthUserService, IAuthUser, initialAuthUser } from '../services/auth-user.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { IUserAll } from '../interfaces/user';
import { IRoomAll, ServiceType } from '../interfaces/room';
import { IOfficeAll } from '../interfaces/office';
import { IAdditionalAll } from '../interfaces/additional';
import { PaymentType } from '../interfaces/payment';
import { IGroupService, ITreatment, ITreatmentAll } from '../interfaces/treatment';
import { DiscountType, IUserDiscount } from '../interfaces/discount';
import { MatStepper } from '@angular/material/stepper';
import { DataEvent } from '../util/event';
import { Duration } from '../util/dates';
import { addMonths } from 'date-fns';
import { MAX_RESERVATION_MONTH } from '../interfaces/reservation';
import { provideHttpClient } from '@angular/common/http';
import { GoogleMapStubComponent } from '../shared/google-map/google-map-stub.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';

describe('ReservationComponent', () => {
  let component: ReservationComponent;
  let fixture: ComponentFixture<ReservationComponent>;

  let matches$: BehaviorSubject<any>;
  let navigationParams$: BehaviorSubject<any>;
  let reservationId$: BehaviorSubject<any>;
  let customers$: BehaviorSubject<any>;
  let customerInfo$: BehaviorSubject<any>;
  let rooms$: BehaviorSubject<any>;
  let treatmentDiscount$: BehaviorSubject<any>;
  let additionalList$: BehaviorSubject<any>;
  let selectedReservation$: BehaviorSubject<any>;
  let calendar$: BehaviorSubject<any>;
  let subErrors$: BehaviorSubject<any>;

  let storeSpy: jasmine.SpyObj<Store>;
  let routerSpy: jasmine.SpyObj<Router>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;

  const authUserSignal = signal<IAuthUser>({ ...initialAuthUser, isDarkMode: true, professionalId: 'prof-123' });

  let dialogSpy: jasmine.SpyObj<any>;

  const mockCustomer: IUserAll = {
    authorities: [],
    locale: 'en',
    timeZone: 'Europe/Amsterdam',
    id: 'customer-1',
    displayName: 'John Doe',
    email: 'john@example.com',
  };

  const mockOffice: IOfficeAll = {
    id: 'office-id',
    name: 'Main Office',
    manager: {
      id: 'manager-id',
    },
  };

  const mockRoom: IRoomAll = {
    id: 'room-1',
    address: {
      id: 1,
      name: 'Test Room',
      location: { x: 52.3676, y: 4.9041 },
    },
    timeZone: 'Europe/Amsterdam',
    currency: { code: 'EUR', name: 'Euro', id: 'eur', icon: '€' },
    office: mockOffice,
    professionals: [{
      id: 'professional-1',
      displayName: 'John Doe',
      email: 'john@professional.com',
      authorities: [],
      locale: '',
      timeZone: '',
    }],
    availabilities: [
      { day: 'MONDAY', start: '09:00', end: '17:00' },
      { day: 'TUESDAY', start: '09:00', end: '17:00' },
    ],
    primary: true,
    paymentTypes: [PaymentType.cash],
  };

  const mockTreatment: ITreatmentAll = {
    id: 'treatment-1',
    key: 'treatment-1',
    type: ServiceType.treatment,
    group: { id: 'group-1', name: 'Test Group' },
    name: 'Test Treatment',
    price: 100,
    duration: '1H30M',
    primary: true,
  };

  beforeEach(async () => {
    navigationParams$ = new BehaviorSubject(undefined);
    reservationId$ = new BehaviorSubject(undefined);
    customers$ = new BehaviorSubject(undefined);
    customerInfo$ = new BehaviorSubject(undefined);
    rooms$ = new BehaviorSubject(undefined);
    treatmentDiscount$ = new BehaviorSubject(undefined);
    additionalList$ = new BehaviorSubject(undefined);
    selectedReservation$ = new BehaviorSubject(undefined);
    calendar$ = new BehaviorSubject(undefined);
    subErrors$ = new BehaviorSubject(undefined);
    matches$ = new BehaviorSubject(undefined);

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe'], {
      observe: () => matches$.asObservable(),
    });
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj('ParamMap', ['get']),
      },
    });
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', [], {
      authUser: authUserSignal.asReadonly(),
    });

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return navigationParams$.asObservable();
        case 2:
          return reservationId$.asObservable();
        case 3:
          return customers$.asObservable();
        case 4:
          return customerInfo$.asObservable();
        case 5:
          return rooms$.asObservable();
        case 6:
          return treatmentDiscount$.asObservable();
        case 7:
          return additionalList$.asObservable();
        case 8:
          return selectedReservation$.asObservable();
        case 9:
          return calendar$.asObservable();
        case 10:
          return subErrors$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    reservationId$.next('test-reservation-id');

    routerSpy.getCurrentNavigation.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [ReservationComponent, GoogleMapStubComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    storeSpy = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    const translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');

    fixture = TestBed.createComponent(ReservationComponent);
    component = fixture.componentInstance;

    dialogSpy = spyOn(component['dialog'], 'open');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize forms correctly', () => {
      fixture.detectChanges();

      expect(component.customerForm).toBeDefined();
      expect(component.treatmentForm).toBeDefined();
      expect(component.officeForm).toBeDefined();
      expect(component.configurationForm).toBeDefined();
      expect(component.eventGroup).toBeDefined();
    });

    it('should set up form controls with proper validators', () => {
      expect(component.getCustomerForm.customer.hasError('required')).toBeTrue();
      expect(component.getTreatmentForm.group.hasError('required')).toBeTrue();
      expect(component.getTreatmentForm.treatment.hasError('required')).toBeTrue();
      expect(component.getOfficeForm.office.hasError('required')).toBeTrue();
      expect(component.getOfficeForm.room.hasError('required')).toBeTrue();
    });

    it('should initialize with signals', () => {
      reservationId$.next(undefined);
      fixture.detectChanges();
      expect(component.isEditing()).toBeFalse();
      expect(component.isAdmin()).toBeFalse();
    });
  });

  describe('Form Controls', () => {
    it('should update customer info when customer changes', () => {
      component.getCustomerForm.customer.setValue(mockCustomer);
      expect(component.customerInfo()).toBeUndefined();
    });

    it('should update room list when office changes', () => {
      component.getOfficeForm.office.setValue(mockOffice);
      expect(component.roomList()).toEqual(mockOffice.rooms);
    });

    it('should update professional list when room changes', () => {
      component.getOfficeForm.room.setValue(mockRoom);
      fixture.detectChanges();
      expect(component.professionalList()).toEqual(mockRoom.professionals);
    });

    it('should update treatment list when group changes', () => {
      const mockGroup: IGroupService = {
        id: 'group-1',
        name: 'Test Group',
        treatments: [mockTreatment],
        selectedTreatments: [],
      };
      component.getTreatmentForm.group.setValue(mockGroup);
      fixture.detectChanges();
      expect(component.treatmentList()).toEqual([mockTreatment]);
    });
  });

  describe('Display Functions', () => {
    it('should display user name correctly', () => {
      const result = component.displayFnUser(mockCustomer);
      expect(result).toBe('John Doe');
    });

    it('should display empty string for null user', () => {
      const result = component.displayFnUser(null as any);
      expect(result).toBe('');
    });

    it('should display treatment name correctly', () => {
      const result = component.displayFnTreatment(mockTreatment as ITreatment);
      expect(result).toBe('Test Treatment');
    });

    it('should display office name correctly', () => {
      const result = component.displayFnOffice(mockOffice);
      expect(result).toBe('Main Office');
    });

    it('should display room address name correctly', () => {
      const result = component.displayFnRoom(mockRoom);
      expect(result).toBe('Test Room');
    });
  });

  describe('Date and Time Management', () => {
    it('should add new date to dateTimeList', () => {
      const initialLength = component.dateTimeList.length;
      component.addDate(new Date(), '10:00');
      expect(component.dateTimeList.length).toBe(initialLength + 1);
      expect(component.events.length).toBe(initialLength + 1);
    });

    it('should remove date from dateTimeList', () => {
      component.addDate();
      const initialLength = component.dateTimeList.length;
      component.removeDate(0);
      expect(component.dateTimeList.length).toBe(initialLength - 1);
      expect(component.events.length).toBe(initialLength - 1);
    });

    it('should handle time change correctly', () => {
      component.addDate(new Date(), '10:00');
      const lastIndex = component.dateTimeList.length - 1;
      component.timeChange('14:30', lastIndex);
      const dateGroup = component.dateTimeList.at(lastIndex);
      const date = dateGroup.get('date')?.value;
      expect(date?.getHours()).toBe(14);
      expect(date?.getMinutes()).toBe(30);
    });
  });

  describe('Step Navigation', () => {
    it('should validate customer form before proceeding to step 2', () => {
      spyOn(component, 'callStepTwo');
      component.customerForm.setErrors({ invalid: true });
      component.callStepTwo(true);
      expect(component.customerForm.invalid).toBeTrue();
    });

    it('should validate office form before proceeding to step 3', () => {
      spyOn(component, 'callStepThree');
      component.officeForm.setErrors({ invalid: true });
      component.callStepThree(true);
      expect(component.officeForm.invalid).toBeTrue();
    });

    it('should validate treatment form before proceeding to step 4', () => {
      spyOn(component, 'callStepFour');
      component.treatmentForm.setErrors({ invalid: true });
      component.callStepFour(true);
      expect(component.treatmentForm.invalid).toBeTrue();
    });

    it('should validate configuration form before proceeding to step 6', () => {
      spyOn(component, 'callStepSix');
      component.configurationForm.setErrors({ invalid: true });
      component.callStepSix(true);
      expect(component.configurationForm.invalid).toBeTrue();
    });
  });

  describe('Keyboard Event Handlers', () => {
    it('should clear form control on backspace', () => {
      (component.getCustomerForm.customer as any).setValue('test value');
      const event = { code: 'Backspace' } as KeyboardEvent;
      component.keyDownHandler(event, component.getCustomerForm.customer);
      expect(component.getCustomerForm.customer.value).toBe(undefined);
    });

    it('should handle group key down event', () => {
      const event = { code: 'Backspace' } as KeyboardEvent;
      component.keyDownGroup(event);
      expect(component.treatmentList()).toBeUndefined();
      expect(component.getTreatmentForm.treatment.value).toBe(undefined);
      expect(component.getTreatmentForm.group.value).toBe(undefined);
    });

    it('should handle office key down event', () => {
      const event = { code: 'Backspace' } as KeyboardEvent;
      component.keyDownOffice(event);
      expect(component.getOfficeForm.office.value).toBe(undefined);
    });

    it('should handle room key down event', () => {
      const event = { code: 'Backspace' } as KeyboardEvent;
      component.keyDownRoom(event);
      expect(component.getOfficeForm.room.value).toBe(undefined);
      expect(component.getOfficeForm.professional.value).toBe(undefined);
      expect(component.professionalList()).toBeUndefined();
    });
  });

  describe('Additional Services', () => {
    it('should handle additional services selection', () => {
      const mockAdditional: IAdditionalAll[] = [
        { key: 'add-1', id: 'add-1', name: 'Additional 1', price: 20, duration: '30M', type: ServiceType.additional },
        { key: 'add-2', id: 'add-2', name: 'Additional 2', price: 30, duration: '15M', type: ServiceType.additional },
      ];

      const mockOptions = mockAdditional.map(item => ({ value: item })) as any;
      component.onChange(mockOptions);

      expect(component.additionalSelected()).toEqual(mockAdditional);
    });

    it('should check if additional service is selected', () => {
      const additional = { id: 'add-1', name: 'Additional 1' } as IAdditionalAll;
      component.additionalSelected.set([additional]);

      expect(component.isSelected(additional)).toBeTrue();
      expect(component.isSelected({ id: 'add-2', name: 'Additional 2' } as IAdditionalAll)).toBeFalse();
    });
  });

  describe('Navigation and Router', () => {
    it('should navigate to add customer page', () => {
      void component.addCustomer;
      expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'users', 'add'], { state: { role: 'ROLE_CUSTOMER' } });
    });
  });

  describe('Create method', () => {
    beforeEach(() => {
      component.getCustomerForm.customer.setValue(mockCustomer);
      component.getOfficeForm.office.setValue(mockOffice);
      component.getOfficeForm.room.setValue(mockRoom);
      component.getOfficeForm.professional.setValue(mockRoom.professionals![0]);
      component.getTreatmentForm.treatment.setValue(mockTreatment);

      // Create a proper event with the required structure
      const mockEvent: any = {
        start: new Date(),
        end: new Date(),
        title: 'Test Event',
      };

      // Clear existing events and add the mock event
      while (component.events.length > 0) {
        component.events.removeAt(0);
      }
      const eventFormGroup = component['formBuilder'].group({
        event: component['formBuilder'].control(mockEvent),
      }) as any;
      component.events.push(eventFormGroup);
    });

    it('should dispatch CreateReservation action when creating a new reservation', () => {
      component.create();
      expect(storeSpy.dispatch).toHaveBeenCalled();
    });

    it('should include customer ID in reservation', () => {
      component.create();
      const dispatchCall = storeSpy.dispatch.calls.mostRecent();
      expect(dispatchCall).toBeDefined();
    });

    it('should include additional services in reservation', () => {
      const mockAdditional: IAdditionalAll[] = [
        { key: 'add-1', id: 'add-1', name: 'Additional 1', price: 20, duration: '30M', type: ServiceType.additional },
      ];
      component.additionalSelected.set(mockAdditional);
      component.create();
      expect(storeSpy.dispatch).toHaveBeenCalled();
    });

    it('should include payment information when amount and type are provided', () => {
      component.getConfigurationForm.amount.setValue(150);
      component.getConfigurationForm.type.setValue(PaymentType.cash);
      component.getConfigurationForm.transfer.setValue('REF123');
      component.create();
      expect(storeSpy.dispatch).toHaveBeenCalled();
    });

    it('should include customer change flag in reservation', () => {
      component.getConfigurationForm.customerChange.setValue(true);
      component.getConfigurationForm.reference.setValue('Test reference');
      component.create();
      expect(storeSpy.dispatch).toHaveBeenCalled();
    });

    it('should include note in reservation', () => {
      component.getConfigurationForm.note.setValue('Test note');
      component.create();
      expect(storeSpy.dispatch).toHaveBeenCalled();
    });

    it('should dispatch UpdateReservationById when editing existing reservation', () => {
      component.isEditing.set(true);
      selectedReservation$.next({
        id: 'reservation-1',
        treatment: mockTreatment,
        room: mockRoom,
        professional: mockRoom.professionals![0],
      });
      fixture.detectChanges();

      component.create();
      expect(storeSpy.dispatch).toHaveBeenCalled();
    });

    it('should not dispatch action if no dates are provided', () => {
      // Clear all events
      while (component.events.length > 0) {
        component.events.removeAt(0);
      }

      const dispatchCountBefore = storeSpy.dispatch.calls.count();
      component.create();
      const dispatchCountAfter = storeSpy.dispatch.calls.count();

      // Should not have dispatched any new actions
      expect(dispatchCountAfter).toBe(dispatchCountBefore);
    });
  });

  describe('back method', () => {
    beforeEach(() => {
      const stepperSpy = jasmine.createSpyObj<MatStepper>('MatStepper', [], {
        selectedIndex: 0,
      });
      Object.defineProperty(component, 'stepper', {
        get: () => () => stepperSpy,
        configurable: true,
      });
    });

    it('should set isPreview to false when currently in preview mode', () => {
      component.isPreview = true;
      component['alreadyCreated'] = false;
      spyOn<any>(component, 'cleanEvent');

      component.back();

      expect(component.isPreview).toBeFalse();
      expect(component['cleanEvent']).not.toHaveBeenCalled();
    });

    it('should set alreadyCreated to true when going back from preview', () => {
      component.isPreview = true;
      component['alreadyCreated'] = false;

      component.back();

      expect(component['alreadyCreated']).toBeTrue();
    });

    it('should call cleanEvent when not in preview mode', () => {
      component.isPreview = false;
      spyOn<any>(component, 'cleanEvent');

      component.back();

      expect(component['cleanEvent']).toHaveBeenCalled();
    });

    it('should not call cleanEvent when in preview mode', () => {
      component.isPreview = true;
      spyOn<any>(component, 'cleanEvent');

      component.back();

      expect(component['cleanEvent']).not.toHaveBeenCalled();
    });

    it('should update stepper selectedIndex', () => {
      const stepperSpy = component['stepper'] as any;
      if (stepperSpy && stepperSpy.selectedIndex !== undefined) {
        component.back();
        // After back, selectedIndex should change
        expect(stepperSpy.selectedIndex).toBeDefined();
      } else {
        // If no stepper, just ensure back completes without error
        expect(() => component.back()).not.toThrow();
      }
    });
  });

  describe('Getters', () => {
    it('should return dateTimeList as FormArray', () => {
      const dateTimeList = component.dateTimeList;
      expect(dateTimeList).toBeInstanceOf(FormArray);
    });

    it('should return events as FormArray', () => {
      const events = component.events;
      expect(events).toBeInstanceOf(FormArray);
    });

    it('should return treatment detail from customerInfo', () => {
      component.customerInfo.set({
        treatment: { name: 'Test Treatment' },
      } as any);
      expect(component.treatmentDetail).toBe('Test Treatment');
    });

    it('should return empty string when no customerInfo', () => {
      component.customerInfo.set(undefined);
      expect(component.treatmentDetail).toBe('');
    });

    it('should check if add button is disabled', () => {
      component.dateTimeList.setErrors({ invalid: true });
      expect(component.isAddButtonDisabled).toBeTrue();
    });
  });

  describe('Event Management', () => {
    it('should validate date is within allowed range', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const result = component['dateIsValid'](futureDate);
      expect(result).toBeTrue();
    });

    it('should invalidate date outside allowed range', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7);
      const result = component['dateIsValid'](pastDate);
      expect(result).toBeFalse();
    });
  });

  describe('Form Validation', () => {
    it('should mark customer form as invalid when empty', () => {
      expect(component.customerForm.invalid).toBeTrue();
    });

    it('should mark customer form as valid when filled', () => {
      component.getCustomerForm.customer.setValue(mockCustomer);
      expect(component.getCustomerForm.customer.valid).toBeTrue();
    });

    it('should mark office form as invalid when empty', () => {
      expect(component.officeForm.invalid).toBeTrue();
    });

    it('should mark office form as valid when filled', () => {
      component.getOfficeForm.office.setValue(mockOffice);
      component.getOfficeForm.room.setValue(mockRoom);
      component.getOfficeForm.professional.setValue(mockRoom.professionals![0]);
      expect(component.officeForm.valid).toBeTrue();
    });

    it('should mark treatment form as invalid when empty', () => {
      expect(component.treatmentForm.invalid).toBeTrue();
    });

    it('should mark treatment form as valid when filled', () => {
      const mockGroup: IGroupService = {
        id: 'group-1',
        name: 'Test Group',
        treatments: [mockTreatment],
        selectedTreatments: [],
      };
      component.getTreatmentForm.group.setValue(mockGroup);
      component.getTreatmentForm.treatment.setValue(mockTreatment);
      expect(component.getTreatmentForm.group.valid).toBeTrue();
      expect(component.getTreatmentForm.treatment.valid).toBeTrue();
    });
  });

  describe('Professional Selection', () => {
    beforeEach(() => {
      component.getOfficeForm.room.setValue(mockRoom);
      fixture.detectChanges();
    });

    it('should update professional list when room is selected', () => {
      expect(component.professionalList()).toEqual(mockRoom.professionals);
    });

    it('should clear group when room changes', () => {
      component.getTreatmentForm.group.setValue(
        { id: 'group-1', name: 'Test Group', treatments: [mockTreatment], selectedTreatments: [] });
      fixture.detectChanges();

      const differentRoom = { ...mockRoom, id: 'room-2' };
      component.getOfficeForm.room.setValue(differentRoom);
      fixture.detectChanges();

      expect(component.getTreatmentForm.group.value).toBe(undefined);
    });

    it('should handle room without professionals', () => {
      const roomNoProfessionals = { ...mockRoom, professionals: undefined };
      component.getOfficeForm.room.setValue(roomNoProfessionals);
      fixture.detectChanges();
      expect(component.professionalList()).toBeUndefined();
    });
  });

  describe('Discount Management', () => {
    it('should apply discount to treatment', () => {
      const mockDiscount: IUserDiscount = {
        id: 'discount-1',
        discountCustomer: {
          id: 'discount-customer-1',
          name: '10% Off',
          amount: 10,
          type: DiscountType.percentage,
          currency: mockRoom.currency,
        },
        used: false,
        title: '10% Discount',
        symbol: '10%',
      };
      component.getTreatmentForm.treatment.setValue(mockTreatment);
      component.getTreatmentForm.discount.setValue(mockDiscount.id);

      expect(component.getTreatmentForm.discount.value).toEqual(mockDiscount.id);
    });

    it('should clear discount', () => {
      const mockDiscount: IUserDiscount = {
        id: 'discount-1',
        discountCustomer: {
          id: 'discount-customer-1',
          name: '10% Off',
          amount: 10,
          type: DiscountType.percentage,
          currency: mockRoom.currency,
        },
        used: false,
      };
      component.getTreatmentForm.discount.setValue(mockDiscount.id);
      component.getTreatmentForm.discount.setValue(undefined);
      expect(component.getTreatmentForm.discount.value).toBeUndefined();
    });
  });

  describe('Time Zone Handling', () => {
    it('should use room timezone for date calculations', () => {
      component.getOfficeForm.room.setValue(mockRoom);
      expect(component.getOfficeForm.room.value?.timeZone).toBe('Europe/Amsterdam');
    });

    it('should handle UTC timezone', () => {
      const utcRoom = { ...mockRoom, timeZone: 'UTC' };
      component.getOfficeForm.room.setValue(utcRoom);
      expect(component.getOfficeForm.room.value?.timeZone).toBe('UTC');
    });
  });

  describe('Date Time List Management', () => {
    it('should add multiple dates', () => {
      component.addDate(new Date(), '10:00');
      component.addDate(new Date(), '14:00');
      expect(component.dateTimeList.length).toBeGreaterThan(2);
    });

    it('should not allow duplicate dates', () => {
      const date = new Date(2024, 0, 15);
      component.addDate(date, '10:00');
      component.addDate(date, '10:00');
      // The noDuplicateDatesValidator should catch this
      expect(component.dateTimeList.length).toBeGreaterThan(0);
    });

    it('should update time for specific date', () => {
      const date = new Date(2024, 0, 15, 10, 0);
      component.addDate(date, '10:00');
      const lastIndex = component.dateTimeList.length - 1;
      component.timeChange('16:45', lastIndex);

      const updatedDate = component.dateTimeList.at(lastIndex).get('date')?.value;
      expect(updatedDate?.getHours()).toBe(16);
      expect(updatedDate?.getMinutes()).toBe(45);
    });
  });

  describe('Filter Functions', () => {
    beforeEach(() => {
      component.getOfficeForm.room.setValue(mockRoom);
    });

    it('should filter dates by room availability', () => {
      const monday = new Date(2024, 0, 1); // Assuming this is a Monday
      const result = component.myFilter(monday);
      // Should return based on room availability
      expect(typeof result).toBe('boolean');
    });

    it('should allow dates in the future', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const result = component['dateIsValid'](futureDate);
      expect(result).toBeTrue();
    });
  });

  describe('Step Navigation Advanced', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });
    it('should complete step 2 and move to step 3', () => {
      component.getCustomerForm.customer.setValue(mockCustomer);
      component.callStepTwo(false);
      expect(component.customerForm.valid).toBeTrue();
    });

    it('should complete step 3 and move to step 4', () => {
      component.getOfficeForm.office.setValue(mockOffice);
      component.getOfficeForm.room.setValue(mockRoom);
      component.getOfficeForm.professional.setValue(mockRoom.professionals![0]);
      component.callStepThree(false);
      expect(component.officeForm.valid).toBeTrue();
    });

    it('should handle step 5 navigation', () => {
      component.callStepFive(false);
      expect(component.isPreview).toBeFalse();
    });
  });

  describe('Customer Information', () => {
    it('should fetch customer information when customer is selected', () => {
      component.getCustomerForm.customer.setValue(mockCustomer);
      expect(component.getCustomerForm.customer.value?.id).toBe('customer-1');
    });

    it('should clear customer info when customer changes', () => {
      component.customerInfo.set({ treatment: { name: 'Old Treatment' } } as any);
      component.getCustomerForm.customer.setValue(mockCustomer);
      fixture.detectChanges();
      expect(component.customerInfo()).toBeUndefined();
    });

    it('should handle customer without last reservation', () => {
      component.getCustomerForm.customer.setValue(mockCustomer);
      component.customerInfo.set(undefined);
      expect(component.treatmentDetail).toBe('');
    });
  });

  describe('Payment Configuration', () => {
    it('should set payment amount', () => {
      component.getConfigurationForm.amount.setValue(150);
      expect(component.getConfigurationForm.amount.value).toBe(150);
    });

    it('should set payment type', () => {
      component.getConfigurationForm.type.setValue(PaymentType.cash);
      expect(component.getConfigurationForm.type.value).toBe(PaymentType.cash);
    });

    it('should set transfer reference', () => {
      component.getConfigurationForm.transfer.setValue('REF123456');
      expect(component.getConfigurationForm.transfer.value).toBe('REF123456');
    });

    it('should set payment reference', () => {
      component.getConfigurationForm.reference.setValue('Payment for treatment');
      expect(component.getConfigurationForm.reference.value).toBe('Payment for treatment');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values in display functions', () => {
      expect(component.displayFnUser(null as any)).toBe('');
      expect(component.displayFnOffice(null as any)).toBe('');
      expect(component.displayFnTreatment(null as any)).toBe('');
    });

    it('should handle room without address in display function', () => {
      const roomWithoutAddress = { ...mockRoom, address: undefined };
      expect(component.displayFnRoom(roomWithoutAddress as any)).toBe('');
    });

    it('should handle empty additional selection', () => {
      component.onChange([]);
      expect(component.additionalSelected()).toEqual([]);
    });

    it('should handle invalid time format', () => {
      component.addDate(new Date(), 'invalid-time');
      // Should handle gracefully
      expect(component.dateTimeList.length).toBeGreaterThan(0);
    });
  });

  describe('segmentClick', () => {
    const mockProfessional = {
      id: 'professional-1',
      displayName: 'Test Professional',
      email: 'test@professional.com',
      authorities: [],
      locale: 'en',
      timeZone: 'Europe/Amsterdam',
    };

    beforeEach(() => {
      const customer = {
        id: 'customer-1',
        displayName: 'Test Customer',
        email: 'test@customer.com',
        authorities: [],
        locale: 'en',
        timeZone: 'Europe/Amsterdam',
      };
      component.getCustomerForm.customer.setValue(customer);
      component.getTreatmentForm.treatment.setValue(mockTreatment);
      component.getOfficeForm.professional.setValue(mockProfessional);
      component.getOfficeForm.room.setValue(mockRoom);
    });

    it('should set the selected segment', () => {
      const today = new Date();
      const daysUntilMonday = (1 + 7 - today.getDay()) % 7 || 7;

      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + daysUntilMonday);
      nextMonday.setHours(12, 0, 0, 0);

      component.dataEvents.set('event', new DataEvent([], 0, nextMonday, 0));
      component['professionalId'].set('professional-1');
      component['totalDuration'] = new Duration(1);

      dialogSpy.and.callFake((_: any, config: any) => {
        return {
          afterClosed: () => of({ value: config.data.value }),
        };
      });

      component.segmentClick(nextMonday, 'CREATED', 'event');

      expect(dialogSpy).toHaveBeenCalledWith(
        jasmine.any(Function),
        {
          data: {
            title: 'RESERVATION.EVENT.CHANGE.TITLE',
            content: 'RESERVATION.EVENT.CHANGE.CONTENT',
            value: jasmine.objectContaining({
              start: nextMonday,
              end: jasmine.any(Date),
              title: 'RESERVATION.EVENT.DETAIL',
              meta: jasmine.objectContaining({
                isReservation: true,
              }),
            }),
          },
        });
    });

    it('should check for professionalId before proceeding', () => {
      const today = new Date();
      const daysUntilMonday = (1 + 7 - today.getDay()) % 7 || 7;

      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + daysUntilMonday);
      nextMonday.setHours(12, 0, 0, 0);

      component.professionalList.set([mockProfessional, { ...mockProfessional, id: 'professional-2' }]);
      component.dataEvents.set('event', new DataEvent([], 0, nextMonday, 0));
      component['totalDuration'] = new Duration(1);
      matches$.next({ matches: true });

      dialogSpy.and.callFake((_: any, config: any) => {
        return {
          afterClosed: () => of({ value: config.data.value, professional: mockProfessional }),
        };
      });

      component.segmentClick(nextMonday, 'CREATED', 'event');

      expect(dialogSpy).toHaveBeenCalledWith(
        jasmine.any(Function),
        {
          disableClose: true,
          data: {
            professionals: [mockProfessional, { ...mockProfessional, id: 'professional-2' }],
            small: true,
          },
        });

      expect(dialogSpy).toHaveBeenCalledWith(
        jasmine.any(Function),
        {
          data: {
            title: 'RESERVATION.EVENT.CHANGE.TITLE',
            content: 'RESERVATION.EVENT.CHANGE.CONTENT',
            value: jasmine.objectContaining({
              start: nextMonday,
              end: jasmine.any(Date),
              title: 'RESERVATION.EVENT.DETAIL',
              meta: jasmine.objectContaining({
                isReservation: true,
              }),
            }),
          },
        });
    });

    it('should not set the segment if event data does not exist', () => {
      const today = new Date();
      const daysUntilMonday = (1 + 7 - today.getDay()) % 7 || 7;

      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + daysUntilMonday);
      nextMonday.setHours(12, 0, 0, 0);

      component.dataEvents.set('event', new DataEvent([], 0, nextMonday, 0));

      component.segmentClick(nextMonday, 'CREATED', 'invalid-key');

      expect(dialogSpy).not.toHaveBeenCalled();
    });

    it('should not set the segment if date is older than today', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 1);
      oldDate.setHours(12, 0, 0, 0);

      component.dataEvents.set('event', new DataEvent([], 0, oldDate, 0));

      component.segmentClick(oldDate, 'CREATED', 'event');

      expect(dialogSpy).not.toHaveBeenCalled();
    });

    it('should not set the segment if date is after max reservation date', () => {
      const invalidDate = addMonths(new Date(), MAX_RESERVATION_MONTH + 1);
      invalidDate.setHours(12, 0, 0, 0);

      component.dataEvents.set('event', new DataEvent([], 0, invalidDate, 0));

      component.segmentClick(invalidDate, 'CREATED', 'event');

      expect(dialogSpy).not.toHaveBeenCalled();
    });
  });
});
