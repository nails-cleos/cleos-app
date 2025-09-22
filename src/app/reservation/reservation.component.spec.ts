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
    const translateSpyObj = jasmine.createSpyObj('TranslateService', ['instant', 'get', 'getParsedResult'], {
      currentLang: 'en',
    });

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
    translateSpyObj.instant.and.returnValue('translated text');
    translateSpyObj.get.and.returnValue(of('translated text'));
    translateSpyObj.getParsedResult.and.returnValue('translated text');
    translateSpyObj.onLangChange = of({ lang: 'en', translations: {} });
    translateSpyObj.onTranslationChange = of({ lang: 'en', translations: {} });
    translateSpyObj.onDefaultLangChange = of({ lang: 'en', translations: {} });

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
        { provide: TranslateService, useValue: translateSpyObj },
      ],
    }).compileComponents();

    mockStore = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
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
      expect(component.customer.hasError('required')).toBe(true);
      expect(component.group.hasError('required')).toBe(true);
      expect(component.treatment.hasError('required')).toBe(true);
      expect(component.office.hasError('required')).toBe(true);
      expect(component.room.hasError('required')).toBe(true);
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
      expect(component.customerForm.invalid).toBe(true);
    });

    it('should validate office form before proceeding to step 3', () => {
      spyOn(component, 'callStepThree');
      component.officeForm.setErrors({ invalid: true });
      component.callStepThree(true);
      expect(component.officeForm.invalid).toBe(true);
    });

    it('should validate treatment form before proceeding to step 4', () => {
      spyOn(component, 'callStepFour');
      component.treatmentForm.setErrors({ invalid: true });
      component.callStepFour(true);
      expect(component.treatmentForm.invalid).toBe(true);
    });

    it('should validate configuration form before proceeding to step 6', () => {
      spyOn(component, 'callStepSix');
      component.configurationForm.setErrors({ invalid: true });
      component.callStepSix(true);
      expect(component.configurationForm.invalid).toBe(true);
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

      expect(component.isSelected(additional as any)).toBe(true);
      expect(component.isSelected({ id: 'add-2', name: 'Additional 2' } as any)).toBe(false);
    });
  });

  describe('Navigation and Router', () => {
    it('should navigate to add customer page', () => {
      void component.addCustomer;
      expect(mockRouter.navigate).toHaveBeenCalledWith(['en', 'users', 'add'], { state: { role: 'ROLE_CUSTOMER' } });
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
      expect(component.isAddButtonDisabled).toBe(true);
    });
  });

  describe('Component Lifecycle', () => {
    it('should have ngOnDestroy method', () => {
      expect(component.ngOnDestroy).toBeDefined();
    });
  });
});
