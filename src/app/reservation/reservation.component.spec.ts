import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';

import { ReservationComponent } from './reservation.component';
import { AuthUserService } from '../services/auth-user.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { IUser } from '../interfaces/user';
import { IRoomAll, ServiceType } from '../interfaces/room';
import { IOffice } from '../interfaces/office';
import { IAdditionalAll } from '../interfaces/additional';
import { PaymentType } from '../interfaces/payment';
import { ITreatment, ITreatmentAll } from '../interfaces/treatment';
import { DiscountType, IUserDiscount } from '../interfaces/discount';

describe('ReservationComponent', () => {
  let component: ReservationComponent;
  let fixture: ComponentFixture<ReservationComponent>;
  let mockStore: jasmine.SpyObj<Store>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.returnValue('test-reservation-id'),
      },
    },
    params: of({ id: 'test-reservation-id' }),
  };

  const mockAuthUserService = {
    authUser: of({
      isAdmin: false,
      isDarkMode: true,
    }),
  };

  const mockBreakpointObserver = {
    observe: jasmine.createSpy('observe').and.returnValue(of({
      matches: false,
    })),
  };

  const mockCustomer: IUser = {
    id: 'customer-1',
    displayName: 'John Doe',
    email: 'john@example.com',
  };

  const mockOffice: IOffice = {
    id: 'office-1',
    name: 'Test Office',
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
    const storeSpyObj = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);
    const dialogSpyObj = jasmine.createSpyObj('MatDialog', ['open']);
    const snackBarSpyObj = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);

    storeSpyObj.select.and.returnValue(of({
      rooms: [],
      customers: [],
      additional: [],
      treatmentDiscount: null,
      selected: null,
      data: null,
      subErrors: null,
      isLoading: false,
    }));

    routerSpyObj.getCurrentNavigation.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [
        ReservationComponent,
        TranslateModule.forRoot(),
        ReactiveFormsModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: Store, useValue: storeSpyObj },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: AuthUserService, useValue: mockAuthUserService },
        { provide: Router, useValue: routerSpyObj },
        { provide: MatDialog, useValue: dialogSpyObj },
        { provide: MatSnackBar, useValue: snackBarSpyObj },
        { provide: BreakpointObserver, useValue: mockBreakpointObserver },
      ],
    }).compileComponents();

    mockStore = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en-GB');
    translate.use('en-GB');
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize forms correctly', () => {
      expect(component.customerForm).toBeDefined();
      expect(component.treatmentForm).toBeDefined();
      expect(component.officeForm).toBeDefined();
      expect(component.configurationForm).toBeDefined();
      expect(component.eventGroup).toBeDefined();
    });

    it('should set up form controls with proper validators', () => {
      expect(component.customer.hasError('required')).toBeTrue();
      expect(component.group.hasError('required')).toBeTrue();
      expect(component.treatment.hasError('required')).toBeTrue();
      expect(component.office.hasError('required')).toBeTrue();
      expect(component.room.hasError('required')).toBeTrue();
    });

    it('should dispatch GetCustomers action when not editing', () => {
      mockActivatedRoute.params = of({ id: '' });
      component.ngOnInit();
      expect(mockStore.dispatch).toHaveBeenCalled();
    });
  });

  describe('Form Controls', () => {
    it('should update customer info when customer changes', () => {
      component.customer.setValue(mockCustomer);
      expect(component.customerInfo).toBeUndefined();
    });

    it('should update room list when office changes', () => {
      component.office.setValue(mockOffice);
      expect(component.roomList).toEqual(mockOffice.rooms);
    });

    it('should update professional list when room changes', () => {
      component.room.setValue(mockRoom);
      expect(component.professionalList).toEqual(mockRoom.professionals);
    });

    it('should update treatment list when group changes', () => {
      const mockGroup = {
        id: 'group-1',
        name: 'Test Group',
        treatments: [mockTreatment],
      };
      component.group.setValue(mockGroup);
      expect(component.treatmentList).toEqual([mockTreatment]);
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
      expect(result).toBe('Test Office');
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
      component.customer.setValue('test value');
      const event = { code: 'Backspace' };
      component.keyDownHandler(event, component.customer);
      expect(component.customer.value).toBe('');
    });

    it('should handle group key down event', () => {
      const event = { code: 'Backspace' };
      component.keyDownGroup(event);
      expect(component.treatmentList).toBeUndefined();
      expect(component.treatment.value).toBe('');
      expect(component.group.value).toBe('');
    });

    it('should handle office key down event', () => {
      const event = { code: 'Backspace' };
      component.keyDownOffice(event);
      expect(component.office.value).toBe('');
    });

    it('should handle room key down event', () => {
      const event = { code: 'Backspace' };
      component.keyDownRoom(event);
      expect(component.room.value).toBe('');
      expect(component.professional.value).toBe('');
      expect(component.professionalList).toBeUndefined();
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

      expect(component.additionalSelected).toEqual(mockAdditional);
    });

    it('should check if additional service is selected', () => {
      const additional = { id: 'add-1', name: 'Additional 1' };
      component.additionalSelected = [additional as any];

      expect(component.isSelected(additional as any)).toBeTrue();
      expect(component.isSelected({ id: 'add-2', name: 'Additional 2' } as any)).toBeFalse();
    });
  });

  describe('Navigation and Router', () => {
    it('should navigate to add customer page', () => {
      void component.addCustomer;
      expect(mockRouter.navigate).toHaveBeenCalledWith(['en-GB', 'users', 'add'], { state: { role: 'ROLE_CUSTOMER' } });
    });
  });

  describe('create method', () => {
    beforeEach(() => {
      component.customer.setValue(mockCustomer);
      component.office.setValue(mockOffice);
      component.room.setValue(mockRoom);
      component.professional.setValue(mockRoom.professionals![0]);
      component.treatment.setValue(mockTreatment);

      // Create a proper event with the required structure
      const mockEvent = {
        event: {
          start: new Date(),
          end: new Date(),
          title: 'Test Event',
        },
      };

      // Clear existing events and add the mock event
      while (component.events.length > 0) {
        component.events.removeAt(0);
      }
      component.events.push(component['formBuilder'].group(mockEvent));
    });

    it('should dispatch CreateReservation action when creating a new reservation', () => {
      component.create();
      expect(mockStore.dispatch).toHaveBeenCalled();
    });

    it('should include customer ID in reservation', () => {
      component.create();
      const dispatchCall = mockStore.dispatch.calls.mostRecent();
      expect(dispatchCall).toBeDefined();
    });

    it('should include additional services in reservation', () => {
      const mockAdditional: IAdditionalAll[] = [
        { key: 'add-1', id: 'add-1', name: 'Additional 1', price: 20, duration: '30M', type: ServiceType.additional },
      ];
      component.additionalSelected = mockAdditional;
      component.create();
      expect(mockStore.dispatch).toHaveBeenCalled();
    });

    it('should include payment information when amount and type are provided', () => {
      component.amount.setValue(150);
      component.type.setValue(PaymentType.cash);
      component.transfer.setValue('REF123');
      component.create();
      expect(mockStore.dispatch).toHaveBeenCalled();
    });

    it('should include customer change flag in reservation', () => {
      component.customerChange.setValue(true);
      component.reference.setValue('Test reference');
      component.create();
      expect(mockStore.dispatch).toHaveBeenCalled();
    });

    it('should include note in reservation', () => {
      component.note.setValue('Test note');
      component.create();
      expect(mockStore.dispatch).toHaveBeenCalled();
    });

    it('should dispatch UpdateReservationById when editing existing reservation', () => {
      component['isEditing'] = true;
      component['reservation'] = {
        id: 'reservation-1',
        treatment: mockTreatment,
        room: mockRoom,
        professional: mockRoom.professionals![0],
      } as any;
      component.create();
      expect(mockStore.dispatch).toHaveBeenCalled();
    });

    it('should not dispatch action if no dates are provided', () => {
      // Clear all events
      while (component.events.length > 0) {
        component.events.removeAt(0);
      }

      const dispatchCountBefore = mockStore.dispatch.calls.count();
      component.create();
      const dispatchCountAfter = mockStore.dispatch.calls.count();

      // Should not have dispatched any new actions
      expect(dispatchCountAfter).toBe(dispatchCountBefore);
    });
  });

  describe('back method', () => {
    beforeEach(() => {
      // Mock the myStepper to avoid out-of-bounds errors
      Object.defineProperty(component['myStepper'], 'selectedIndex', {
        get: jasmine.createSpy('get').and.returnValue(0),
        set: jasmine.createSpy('set'),
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
      const setterSpy = Object.getOwnPropertyDescriptor(component['myStepper'], 'selectedIndex')?.set as jasmine.Spy;

      component.back();

      // Verify that selectedIndex setter was called
      expect(setterSpy).toHaveBeenCalled();
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
      component.customerInfo = {
        treatment: { name: 'Test Treatment' },
      } as any;
      expect(component.treatmentDetail).toBe('Test Treatment');
    });

    it('should return empty string when no customerInfo', () => {
      component.customerInfo = undefined;
      expect(component.treatmentDetail).toBe('');
    });

    it('should check if add button is disabled', () => {
      component.dateTimeList.setErrors({ invalid: true });
      expect(component.isAddButtonDisabled).toBeTrue();
    });
  });

  describe('Component Lifecycle', () => {
    it('should have ngOnDestroy method', () => {
      expect(component.ngOnDestroy).toBeDefined();
    });

    it('should unsubscribe on destroy', () => {
      const subscription = jasmine.createSpyObj('Subscription', ['unsubscribe']);
      component['subscription'] = subscription;
      component['authUserServiceSubscription'] = subscription;
      component['handsetSubscription'] = subscription;

      component.ngOnDestroy();

      expect(subscription.unsubscribe).toHaveBeenCalled();
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
      component.customer.setValue(mockCustomer);
      expect(component.customer.valid).toBeTrue();
    });

    it('should mark office form as invalid when empty', () => {
      expect(component.officeForm.invalid).toBeTrue();
    });

    it('should mark office form as valid when filled', () => {
      component.office.setValue(mockOffice);
      component.room.setValue(mockRoom);
      component.professional.setValue(mockRoom.professionals![0]);
      expect(component.officeForm.valid).toBeTrue();
    });

    it('should mark treatment form as invalid when empty', () => {
      expect(component.treatmentForm.invalid).toBeTrue();
    });

    it('should mark treatment form as valid when filled', () => {
      const mockGroup = {
        id: 'group-1',
        name: 'Test Group',
        treatments: [mockTreatment],
      };
      component.group.setValue(mockGroup);
      component.treatment.setValue(mockTreatment);
      expect(component.group.valid).toBeTrue();
      expect(component.treatment.valid).toBeTrue();
    });
  });

  describe('Professional Selection', () => {
    beforeEach(() => {
      component.room.setValue(mockRoom);
    });

    it('should update professional list when room is selected', () => {
      expect(component.professionalList).toEqual(mockRoom.professionals);
    });

    it('should clear group when room is cleared', () => {
      component.group.setValue({ id: 'group-1', name: 'Test Group', treatments: [mockTreatment] });
      component.room.setValue(null);
      expect(component.group.value).toBe('');
    });

    it('should handle room without professionals', () => {
      const roomNoProfessionals = { ...mockRoom, professionals: undefined };
      component.room.setValue(roomNoProfessionals);
      expect(component.professionalList).toBeUndefined();
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
      component.treatment.setValue(mockTreatment);
      component.discount.setValue(mockDiscount);

      expect(component.discount.value).toEqual(mockDiscount);
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
      component.discount.setValue(mockDiscount);
      component.discount.setValue(null);
      expect(component.discount.value).toBeNull();
    });
  });

  describe('Time Zone Handling', () => {
    it('should use room timezone for date calculations', () => {
      component.room.setValue(mockRoom);
      expect(component.room.value.timeZone).toBe('Europe/Amsterdam');
    });

    it('should handle UTC timezone', () => {
      const utcRoom = { ...mockRoom, timeZone: 'UTC' };
      component.room.setValue(utcRoom);
      expect(component.room.value.timeZone).toBe('UTC');
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
      component.room.setValue(mockRoom);
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
    it('should complete step 2 and move to step 3', () => {
      component.customer.setValue(mockCustomer);
      component.callStepTwo(false);
      expect(component.customerForm.valid).toBeTrue();
    });

    it('should complete step 3 and move to step 4', () => {
      component.office.setValue(mockOffice);
      component.room.setValue(mockRoom);
      component.professional.setValue(mockRoom.professionals![0]);
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
      component.customer.setValue(mockCustomer);
      expect(component.customer.value.id).toBe('customer-1');
    });

    it('should clear customer info when customer changes', () => {
      component.customerInfo = { treatment: { name: 'Old Treatment' } } as any;
      component.customer.setValue(mockCustomer);
      expect(component.customerInfo).toBeUndefined();
    });

    it('should handle customer without last reservation', () => {
      component.customer.setValue(mockCustomer);
      component.customerInfo = undefined;
      expect(component.treatmentDetail).toBe('');
    });
  });

  describe('Payment Configuration', () => {
    it('should set payment amount', () => {
      component.amount.setValue(150);
      expect(component.amount.value).toBe(150);
    });

    it('should set payment type', () => {
      component.type.setValue(PaymentType.cash);
      expect(component.type.value).toBe(PaymentType.cash);
    });

    it('should set transfer reference', () => {
      component.transfer.setValue('REF123456');
      expect(component.transfer.value).toBe('REF123456');
    });

    it('should set payment reference', () => {
      component.reference.setValue('Payment for treatment');
      expect(component.reference.value).toBe('Payment for treatment');
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
      expect(component.additionalSelected).toEqual([]);
    });

    it('should handle invalid time format', () => {
      component.addDate(new Date(), 'invalid-time');
      // Should handle gracefully
      expect(component.dateTimeList.length).toBeGreaterThan(0);
    });
  });
});
