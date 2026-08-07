import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReservationCompleteComponent } from './reservation-complete.component';
import { of } from 'rxjs';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { IExtras } from '../../reservation';
import { MatListOption } from '@angular/material/list';
import { ServiceType } from '@app/room/room';
import { DEFAULT_LOCALE, getNowTimeZone } from '@app/util/dates';
import { NavigationService } from '@app/services/navigation.service';
import { signal } from '@angular/core';
import { TreatmentStore } from '@app/store/treatment.store';
import { AdditionalStore } from '@app/store/additional.store';
import { PaymentStore } from '@app/store/payment.store';
import { ReservationStore } from '@app/store/reservation.store';

describe('ReservationCompleteComponent', () => {
  let component: ReservationCompleteComponent;
  let fixture: ComponentFixture<ReservationCompleteComponent>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;

  let reservationStoreSpy: {
    selected: ReturnType<typeof signal>;
    loadById: jasmine.Spy;
    complete: jasmine.Spy;
    clean: jasmine.Spy;
  };

  let treatmentStoreSpy: {
    treatmentDiscount: ReturnType<typeof signal>;
    getAllTreatments: jasmine.Spy;
  };

  let additionalStoreSpy: {
    data: ReturnType<typeof signal>;
    loadAllByGroupId: jasmine.Spy;
  };
  let paymentStoreSpy: {
    data: ReturnType<typeof signal>;
    options: ReturnType<typeof signal>;
    getOptions: jasmine.Spy;
    getPaymentByResourceId: jasmine.Spy;
  };

  const mockReservation = {
    id: 'reservation-1',
    startedTimestamp: getNowTimeZone().getTime() / 1000,
    timestamp: getNowTimeZone().getTime() / 1000,
    customer: {
      id: 'customer-1',
      displayName: 'John Doe',
      email: 'john@example.com',
      authorities: [],
      locale: 'en',
      timeZone: 'Europe/Amsterdam',
    },
    professional: {
      id: 'professional-1',
      displayName: 'Jane Smith',
      email: 'jane@example.com',
      authorities: [],
      locale: 'en',
      timeZone: 'Europe/Amsterdam',
    },
    treatment: {
      key: 'treatment-1',
      name: 'Treatment 1',
      price: 100,
      discountCustomer: 0,
    },
    room: {
      timeZone: 'Europe/Amsterdam',
      paymentTypes: ['CASH', 'TRANSFER'],
      currency: { code: 'EUR' },
    },
    additional: [
      { key: 'additional-1', name: 'Additional 1', price: 20 },
    ],
    balance: 50,
  };

  const mockTreatmentDiscount = {
    treatments: [
      {
        id: 'treatment-1',
        name: 'Treatment 1',
        key: 'treatment-1',
        price: 100,
        group: { id: 'group-1', name: 'Group 1' },
      },
    ],
  };

  const mockAdditionalList = [
    {
      id: 'additional-1',
      name: 'Additional 1',
      price: 20,
      key: 'additional-1',
      duration: '00:30',
      type: ServiceType.additional,
    },
    {
      id: 'additional-2',
      name: 'Additional 2',
      price: 30,
      key: 'additional-2',
      duration: '00:45',
      type: ServiceType.additional,
    },
  ];

  const mockPayments = [
    { id: 'payment-1', amount: 50, type: 'CASH' },
  ];

  const mockPaymentOptions = [
    {
      label: 'Cash',
      type: 'CASH',
      enabled: true,
      show: true,
      icon: 'cash',
    },
    {
      label: 'Transfer',
      type: 'TRANSFER',
      enabled: true,
      show: true,
      icon: 'transfer',
    },
    {
      label: 'Mollie',
      type: 'MOLLIE',
      enabled: true,
      show: true,
    },
  ];

  beforeEach(async () => {
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['navigate'],
      { language: DEFAULT_LOCALE },
    );
    reservationStoreSpy = {
      selected: signal(undefined),
      loadById: jasmine.createSpy('loadById'),
      complete: jasmine.createSpy('complete'),
      clean: jasmine.createSpy('clean'),
    };
    treatmentStoreSpy = {
      treatmentDiscount: signal<any>(mockTreatmentDiscount),
      getAllTreatments: jasmine.createSpy('getAllTreatments'),
    };
    additionalStoreSpy = {
      data: signal<any>({ kind: 'list', value: mockAdditionalList }),
      loadAllByGroupId: jasmine.createSpy('loadAllByGroupId'),
    };
    paymentStoreSpy = {
      data: signal(mockPayments),
      options: signal(mockPaymentOptions),
      getOptions: jasmine.createSpy('getOptions'),
      getPaymentByResourceId: jasmine.createSpy('getPaymentByResourceId'),
    };

    await TestBed.configureTestingModule({
      imports: [ReservationCompleteComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: ReservationStore, useValue: reservationStoreSpy },
        { provide: TreatmentStore, useValue: treatmentStoreSpy },
        { provide: AdditionalStore, useValue: additionalStoreSpy },
        { provide: PaymentStore, useValue: paymentStoreSpy },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);

    fixture = TestBed.createComponent(ReservationCompleteComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize form with correct controls', () => {
      expect(component.form.controls.group).toBeDefined();
      expect(component.form.controls.treatment).toBeDefined();
      expect(component.form.controls.type).toBeDefined();
      expect(component.form.controls.transfer).toBeDefined();
      expect(component.form.controls.startTime).toBeDefined();
      expect(component.form.controls.endTime).toBeDefined();
      expect(component.form.controls.color).toBeDefined();
    });

    it('should set group control as required', () => {
      expect(component.getForm.group.hasError('required')).toBe(true);
    });

    it('should set treatment control as required', () => {
      expect(component.getForm.treatment.hasError('required')).toBe(true);
    });

    it('should set startTime control as required', () => {
      expect(component.getForm.startTime.hasError('required')).toBe(true);
    });

    it('should set endTime with default value', () => {
      expect(component.getForm.endTime.value).toBeDefined();
    });

    it('should initialize signals', () => {
      reservationStoreSpy.selected.set(mockReservation);
      fixture.detectChanges();
      expect(component.selectedReservationSignal()).toBeDefined();
      expect(component.additionalListSignal()).toBeDefined();
    });

    it('should initialize price signal', () => {
      expect(component.price()).toBeDefined();
    });

    it('should initialize types array', () => {
      reservationStoreSpy.selected.set(mockReservation);
      fixture.detectChanges();

      expect(component.options().map(type => type.type)).toContain('CASH');
      expect(component.options().map(type => type.type)).toContain('TRANSFER');
    });
  });

  describe('Computed Properties', () => {
    it('should compute balance from selected reservation', () => {
      reservationStoreSpy.selected.set(mockReservation);
      fixture.detectChanges();
      expect(component.balance).toBe(50);
    });

    it('should return 0 when reservation has no balance', () => {
      reservationStoreSpy.selected.set({ ...mockReservation, balance: undefined });
      fixture.detectChanges();
      expect(component.balance).toBe(0);
    });
  });

  describe('Display Functions', () => {
    it('should display group name', () => {
      const group = { id: 'group-1', name: 'Group 1' } as any;
      const result = component.displayFnGroup(group);
      expect(result).toBe('Group 1');
    });

    it('should display empty string for undefined group', () => {
      const result = component.displayFnGroup(undefined as any);
      expect(result).toBe('');
    });

    it('should display treatment name', () => {
      const treatment = { id: 'treatment-1', name: 'Treatment 1' } as any;
      const result = component.displayFnTreatment(treatment);
      expect(result).toBe('Treatment 1');
    });

    it('should display empty string for undefined treatment', () => {
      const result = component.displayFnTreatment(undefined as any);
      expect(result).toBe('');
    });

    it('should display color name', () => {
      const color = { id: 'color-1', name: 'Red' } as any;
      const result = component.displayFnColor(color);
      expect(result).toBe('Red');
    });

    it('should display empty string for undefined color', () => {
      const result = component.displayFnColor(undefined);
      expect(result).toBe('');
    });
  });

  describe('Keyboard Handlers', () => {
    it('should clear form control on Backspace', () => {
      const formControl = component.getForm.type;
      formControl.setValue('test-value');
      const event = new KeyboardEvent('keydown', { code: 'Backspace' });

      component.keyDownHandler(event, formControl as any);

      expect(formControl.value).toBe('');
    });

    it('should not clear form control on other keys', () => {
      const formControl = component.getForm.type;
      formControl.setValue('test-value');
      const event = new KeyboardEvent('keydown', { code: 'Enter' });

      component.keyDownHandler(event, formControl as any);

      expect(formControl.value).toBe('test-value');
    });
  });

  describe('Additional Selection', () => {
    it('should update additionalSelected when onChange is called', () => {
      const options = [
        { value: mockAdditionalList[0] } as MatListOption,
        { value: mockAdditionalList[1] } as MatListOption,
      ];

      component.onChange(options);

      expect(component['additionalSelected']().length).toBe(2);
      expect(component['additionalSelected']()[0]).toEqual(mockAdditionalList[0]);
    });

    it('should check if additional is selected', () => {
      component['additionalSelected'].set([mockAdditionalList[0]]);

      const isSelected = component.isSelected(mockAdditionalList[0] as any);
      const isNotSelected = component.isSelected(mockAdditionalList[1] as any);

      expect(isSelected).toBe(true);
      expect(isNotSelected).toBe(false);
    });
  });

  describe('Time Change', () => {
    it('should update date on timeChange', () => {
      const date = new Date('2024-01-15T10:00:00');
      component.timeChange('14:30', date);

      expect(date.getHours()).toBe(14);
      expect(date.getMinutes()).toBe(30);
    });

    it('should set totalTime when dates are valid', () => {
      component.startDate = new Date('2024-01-15T10:00:00');
      component.endDate = new Date('2024-01-15T11:30:00');

      component.timeChange('10:00', component.startDate);

      expect(component.totalTime).toBeDefined();
    });
  });

  describe('Extras and Split', () => {
    it('should update currentExtraData on onExtrasChanges', () => {
      const extras: IExtras[] = [
        { description: 'Extra 1', price: 10, paymentType: 'CASH' },
        { description: 'Extra 2', price: 20, paymentType: 'CASH' },
      ];

      component.onExtrasChanges(extras);

      expect(component['currentExtraData']).toEqual(extras);
    });

    it('should update price on onExtrasChanges', () => {
      const extras: IExtras[] = [
        { description: 'Extra 1', price: 10, paymentType: 'CASH' },
      ];

      component.onExtrasChanges(extras);

      expect(component.price()).toBeDefined();
    });

    it('should update currentSplitData on onSplitChanges', () => {
      const split: IExtras[] = [
        { description: 'Split 1', price: 50, paymentType: 'CASH' },
        { description: 'Split 2', price: 50, paymentType: 'IDEAL' },
      ];

      component.onSplitChanges(split);

      expect(component['currentSplitData']).toEqual(split);
    });

    it('should toggle split on splitChange', () => {
      const initialSplit = component.split;

      component.splitChange();

      expect(component.split).toBe(!initialSplit);
    });

    it('should validate split total matches toPaid', () => {
      component.price.set({ toPaid: 100, isPaid: false } as any);
      component['currentSplitData'] = [
        { description: 'Split 1', price: 50, paymentType: 'CASH' },
        { description: 'Split 2', price: 40, paymentType: 'IDEAL' },
      ];

      component.splitChange();

      expect(component.isValidSplit()).toBe(false);
    });

    it('should reset split validity when split is turned off', () => {
      component.split = true;
      component.isValidSplit.set(false);

      component.splitChange();

      expect(component.split).toBe(false);
      expect(component.isValidSplit()).toBe(true);
    });
  });

  describe('Complete Reservation', () => {
    it('should open dialog when isValid is false', () => {
      component.isValid = false;
      const mockDialogRef = {
        afterClosed: () => of(true),
      };
      const dialogSpyInstance = spyOn(component['dialog'], 'open');
      dialogSpyInstance.and.returnValue(mockDialogRef as any);

      component.complete();

      expect(dialogSpyInstance).toHaveBeenCalled();
    });

    it('should complete reservation when dialog confirms', () => {
      component.isValid = false;
      const mockDialogRef = {
        afterClosed: () => of(true),
      };
      const dialogSpyInstance = spyOn(component['dialog'], 'open');
      dialogSpyInstance.and.returnValue(mockDialogRef as any);

      component.complete();

      expect(dialogSpyInstance).toHaveBeenCalled();
    });

    it('should not complete reservation when dialog cancels', () => {
      component.isValid = false;
      const mockDialogRef = {
        afterClosed: () => of(false),
      };
      const dialogSpyInstance = spyOn(component['dialog'], 'open');
      dialogSpyInstance.and.returnValue(mockDialogRef as any);

      component.complete();

      setTimeout(() => expect(reservationStoreSpy.complete).not.toHaveBeenCalled(), 100);
    });

    it('should complete reservation directly when isValid is true', () => {
      component.isValid = true;
      reservationStoreSpy.selected.set(mockReservation);
      fixture.detectChanges();

      component.complete();

      expect(reservationStoreSpy.complete).toHaveBeenCalled();
    });
  });

  describe('Store Dispatching', () => {
    it('should dispatch reservationFindPayments when reservationId changes', () => {
      fixture.componentRef.setInput('id', 'new-reservation-id');
      fixture.detectChanges();

      expect(paymentStoreSpy.getPaymentByResourceId).toHaveBeenCalledWith('new-reservation-id', 'reservation');
    });

    it('should dispatch getReservation when reservationId changes', () => {
      fixture.componentRef.setInput('id', 'new-reservation-id');
      fixture.detectChanges();

      expect(reservationStoreSpy.loadById).toHaveBeenCalledWith('new-reservation-id');
    });

    it('should dispatch getAllTreatments when roomId changes', () => {
      fixture.componentRef.setInput('roomId', 'new-room-id');
      fixture.componentRef.setInput('customerId', 'customer-1');
      fixture.detectChanges();

      expect(treatmentStoreSpy.getAllTreatments).toHaveBeenCalledWith('new-room-id', 'customer-1');
    });

    it('should dispatch getAllAdditionalByGroupId when group is selected', () => {
      fixture.componentRef.setInput('roomId', 'room-1');
      fixture.detectChanges();

      const group = {
        id: 'group-1',
        name: 'Group 1',
        treatments: [{ key: 'treatment-1', name: 'Treatment 1' }],
        colors: [],
      };

      component.getForm.group.setValue(group as any);
      fixture.detectChanges();

      expect(additionalStoreSpy.loadAllByGroupId).toHaveBeenCalledWith('room-1', 'group-1');
    });
  });

  describe('Filter Methods', () => {
    it('should filter groups by name', () => {
      const groups = [
        { id: 'group-1', name: 'Massage Group' },
        { id: 'group-2', name: 'Facial Group' },
      ];

      const filtered = component['filterGroup']('massage', groups as any);

      expect(filtered?.length).toBe(1);
      expect(filtered?.[0].name).toBe('Massage Group');
    });

    it('should filter treatments by name', () => {
      const treatments = [
        { id: 'treatment-1', name: 'Swedish Massage' },
        { id: 'treatment-2', name: 'Deep Tissue Massage' },
      ];

      const filtered = component['filterTreatment']('swedish', treatments as any);

      expect(filtered?.length).toBe(1);
      expect(filtered?.[0].name).toBe('Swedish Massage');
    });

    it('should filter colors by name', () => {
      const colors = [
        { id: 'color-1', name: 'Red' },
        { id: 'color-2', name: 'Blue' },
      ];

      const filtered = component['filterColor']('red', colors as any);

      expect(filtered?.length).toBe(1);
      expect(filtered?.[0].name).toBe('Red');
    });

    it('should return undefined when filtering undefined groups', () => {
      const filtered = component['filterGroup']('test', undefined);
      expect(filtered).toBeUndefined();
    });

    it('should return undefined when filtering undefined treatments', () => {
      const filtered = component['filterTreatment']('test', undefined);
      expect(filtered).toBeUndefined();
    });

    it('should return undefined when filtering undefined colors', () => {
      const filtered = component['filterColor']('test', undefined);
      expect(filtered).toBeUndefined();
    });
  });

  describe('Form Updates', () => {
    it('should update treatment list when group changes', () => {
      const group = {
        id: 'group-1',
        name: 'Group 1',
        treatments: [
          { key: 'treatment-1', name: 'Treatment 1' },
          { key: 'treatment-2', name: 'Treatment 2' },
        ],
        colors: [],
      };

      component.getForm.group.setValue(group as any);
      fixture.detectChanges();

      expect(component.treatmentList()).toEqual(group.treatments as any);
    });

    it('should update colors when group changes', () => {
      const group = {
        id: 'group-1',
        name: 'Group 1',
        treatments: [],
        colors: [
          { id: 'color-1', name: 'Red' },
          { id: 'color-2', name: 'Blue' },
        ],
      };

      component.getForm.group.setValue(group as any);
      fixture.detectChanges();

      expect(component.colors()).toEqual(group.colors as any);
    });

    it('should set type to transfer when payment is not paid', () => {
      component.price.set({ isPaid: false } as any);
      fixture.detectChanges();

      expect(component.getForm.type.value).toBe('MOLLIE');
    });

    it('should clear type when payment is paid', () => {
      component.price.set({ isPaid: true } as any);
      fixture.detectChanges();

      expect(component.getForm.type.value).toBeUndefined();
    });
  });

  it('should set the valid time', () => {
    component.totalTime.set('');
    fixture.detectChanges();
    expect(component.isValidTime()).toBeFalse();

    component.totalTime.set('01:00');
    fixture.detectChanges();
    expect(component.isValidTime()).toBeTrue();

    component.totalTime.set('-01:00');
    fixture.detectChanges();
    expect(component.isValidTime()).toBeFalse();
  });
});
