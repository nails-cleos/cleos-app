import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import { RoomComponent } from './room.component';
import { IAvailability, IRoomAll } from './room';
import { GeocodeService } from '../services/geocode.service';
import { provideHttpClient } from '@angular/common/http';
import { AuthUserService, IAuthUser, initialAuthUser } from '../services/auth-user.service';
import { IUserAll } from '../user/user';
import { Role } from '../interfaces/token';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { GoogleMapComponent } from '../shared/google-map/google-map.component';
import { GoogleMapStubComponent } from '../shared/google-map/google-map-stub.component';
import { PaymentService } from '../services/payment.service';
import { IPaymentOption } from '../interfaces/payment';
import { provideAppDateAdapter } from '../util/adapter/app-date.provider';
import { ICommon } from '../interfaces/common';
import { RoomStore } from '../store/room.store';

describe('RoomComponent', () => {
  let component: RoomComponent;
  let fixture: ComponentFixture<RoomComponent>;

  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  let paymentOptions$: BehaviorSubject<any>;

  let storeSpy: jasmine.SpyObj<Store>;
  let roomStoreSpy: {
    professionals: ReturnType<typeof signal<any>>;
    subErrors: ReturnType<typeof signal<any>>;
    loadInfo: jasmine.Spy;
  };
  let geocodeServiceSpy: jasmine.SpyObj<GeocodeService>;
  let authUserService: jasmine.SpyObj<AuthUserService>;
  let paymentServiceSpy: jasmine.SpyObj<PaymentService>;

  const config: ICommon = {
    title: 'ROOM.TITLE',
    button: { icon: 'add', label: 'COMMON.BUTTON.CREATE' },
  };

  const monday: IAvailability = { day: 'MONDAY', start: '09:00', end: '18:00' };
  const tuesday: IAvailability = { day: 'TUESDAY' };
  const wednesday: IAvailability = { day: 'WEDNESDAY', start: '10:00', end: '19:00' };
  const thursday: IAvailability = { day: 'THURSDAY', start: '09:00', end: '18:00' };
  const friday: IAvailability = { day: 'FRIDAY' };
  const saturday: IAvailability = { day: 'SATURDAY', start: '10:00', end: '16:00' };
  const sunday: IAvailability = { day: 'SUNDAY' };

  const mockProfessional: IUserAll = {
    id: 'user-123',
    displayName: 'John Doe',
    email: 'john@example.com',
    locale: 'en-US',
    timeZone: 'UTC',
    authorities: [
      { authority: Role.professional },
    ],
    theme: 'light-theme',
    showCash: true,
    referralMax: 10,
  };

  const mockCurrency = {
    id: 'currency-id',
    code: 'EUR',
    icon: 'EUR',
    name: 'Euro',
  };

  const mockOffice = {
    id: 'office-123',
    name: 'office name',
    manager: { id: 'manager-123' },
  };

  const mockRoom: IRoomAll = {
    id: 'room-123',
    address: {
      id: 1,
      name: 'Main Location',
      location: { x: 0, y: 0 },
    },
    currency: mockCurrency,
    timeZone: 'Europe/Amsterdam',
    availabilities: [monday, tuesday, wednesday, thursday, friday, saturday, sunday],
    office: mockOffice,
    paymentTypes: [],
    primary: false,
    professionals: [mockProfessional],
  };

  const paymentOptions: IPaymentOption[] = [
    {
      label: 'Cash',
      type: 'CASH',
      enabled: true,
      enabledCustomer: false,
      default: true,
      filter: true,
      defaultFilter: false,
      show: true,
      icon: 'cash',
    },
    {
      label: 'Transfer',
      type: 'TRANSFER',
      enabled: true,
      enabledCustomer: false,
      default: false,
      filter: true,
      defaultFilter: true,
      show: true,
      icon: 'transfer',
    },
    {
      label: 'Account',
      type: 'ACCOUNT',
      enabled: true,
      enabledCustomer: true,
      default: false,
      filter: false,
      defaultFilter: false,
      show: false,
    },
  ];

  beforeEach(async () => {
    paymentOptions$ = new BehaviorSubject(paymentOptions);
    authUserSignal.update(prev => ({
      ...prev,
      isDarkMode: false,
      isAdmin: false,
      professionalId: 'prof-123',
    }));

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    roomStoreSpy = {
      professionals: signal(undefined),
      subErrors: signal(undefined),
      loadInfo: jasmine.createSpy('loadInfo'),
    };
    geocodeServiceSpy = jasmine.createSpyObj('GeocodeService', ['getCoordinates']);
    paymentServiceSpy = jasmine.createSpyObj('PaymentService', ['getPaymentOptions']);
    paymentServiceSpy.getPaymentOptions.and.returnValue(new BehaviorSubject(paymentOptions).asObservable());
    authUserService = jasmine.createSpyObj('AuthUserService', [], {
      authUser: authUserSignal.asReadonly(),
    });

    storeSpy.pipe.and.returnValue(paymentOptions$.asObservable());

    await TestBed.configureTestingModule({
      imports: [RoomComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: RoomStore, useValue: roomStoreSpy },
        { provide: GeocodeService, useValue: geocodeServiceSpy },
        { provide: PaymentService, useValue: paymentServiceSpy },
        { provide: AuthUserService, useValue: authUserService },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAppDateAdapter(),
      ],
    })
      .overrideComponent(RoomComponent, {
        remove: { imports: [GoogleMapComponent] },
        add: { imports: [GoogleMapStubComponent] },
      })
      .compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');

    fixture = TestBed.createComponent(RoomComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('config', config);
    fixture.componentRef.setInput('currencies', [mockCurrency]);
    fixture.componentRef.setInput('offices', [mockOffice]);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should patch form when room input emits', () => {
    roomStoreSpy.professionals.set([
      mockProfessional,
      { id: 'p2', displayName: 'Professional 2' },
    ]);
    fixture.componentRef.setInput('room', mockRoom);
    fixture.detectChanges();

    expect(component.room()?.id).toBe(mockRoom.id);
    expect(component.selectedProfessionalsSignal().length).toBe(1);
    expect(component.professionalsWritableSignal()?.some?.((p: IUserAll) => p.id === 'p2')).toBeTrue();
    expect(component.getForm.currency.value?.id).toBe(mockCurrency.id);
  });

  it('should handle form errors from subErrorsSignal', () => {
    const errors = [
      { field: 'currency', message: 'Currency required' },
      { field: 'office', message: 'Office required' },
    ];

    roomStoreSpy.subErrors.set(errors);
    fixture.detectChanges();

    const errs = component.errors();
    expect(errs['currency']).toBe('Currency required');
    expect(errs['office']).toBe('Office required');
    expect(component.getForm.currency.invalid).toBeTrue();
    expect(component.getForm.office.invalid).toBeTrue();
  });

  it('should not emit when form invalid on submit', () => {
    const emitSpy = jasmine.createSpy('emit');
    component.submitData.subscribe(emitSpy);

    component.getForm.professional.setValue(undefined);
    component.getForm.office.setValue(undefined);
    component.getForm.currency.setValue(undefined);
    component.getForm.timeZone.setValue(undefined);
    component.getGoogleMapForm.address.setValue('');
    fixture.detectChanges();

    component.submit();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should emit room data when in create mode and form valid', () => {
    const emitSpy = jasmine.createSpy('emit');
    component.submitData.subscribe(emitSpy);

    component.selectedProfessionalsSignal.set([mockProfessional]);

    const currencyControl = component.getForm.currency;
    currencyControl.setValue(mockCurrency);
    currencyControl.markAsDirty();
    const officeControl = component.getForm.office;
    officeControl.setValue(mockOffice);
    officeControl.markAsDirty();
    const timeZoneControl = component.getForm.timeZone;
    timeZoneControl.setValue({ tzCode: 'Europe/Amsterdam', label: 'Europe/Amsterdam' } as any);
    timeZoneControl.markAsDirty();
    const addressControl = component.getGoogleMapForm.address;
    addressControl.setValue('Test Address');
    addressControl.markAsDirty();

    component.ignore('MONDAY', 1);
    component.ignore('TUESDAY', 2);
    component.addAvailability(wednesday, 3);
    component.ignore('THURSDAY', 4);
    component.ignore('FRIDAY', 4);
    component.ignore('SATURDAY', 4);
    component.ignore('SUNDAY', 4);

    fixture.detectChanges();
    component.submit();

    expect(component.form.valid).toBeTrue();
    expect(emitSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      officeId: 'office-123',
      currencyId: 'currency-id',
      timeZone: 'Europe/Amsterdam',
      paymentTypes: ['CASH'],
    }));
  });

  it('should emit room data when in edit mode and form valid', () => {
    const emitSpy = jasmine.createSpy('emit');
    component.submitData.subscribe(emitSpy);

    roomStoreSpy.professionals.set([mockProfessional, { ...mockProfessional, id: 'user-456', displayName: 'Jane Doe' }]);
    fixture.componentRef.setInput('room', {
      ...mockRoom,
      id: 'abc-123',
      address: { id: 1, name: 'Old Address', location: { x: 0, y: 0 } },
      timeZone: 'UTC',
      availabilities: [monday],
      paymentTypes: [],
    });
    fixture.detectChanges();

    component.selectedProfessionalsSignal.set([{ ...mockProfessional, id: 'user-456', displayName: 'Jane Doe' }]);

    const currencyControl = component.getForm.currency;
    currencyControl.setValue({ id: '1', name: 'USD', code: 'USD', icon: 'USD' });
    currencyControl.markAsDirty();
    const officeControl = component.getForm.office;
    officeControl.setValue(mockOffice);
    officeControl.markAsDirty();
    const timeZoneControl = component.getForm.timeZone;
    timeZoneControl.setValue({ tzCode: 'Europe/London', label: 'Europe/London' } as any);
    timeZoneControl.markAsDirty();
    const addressControl = component.getGoogleMapForm.address;
    addressControl.setValue('New Address');
    addressControl.markAsDirty();

    component.ignore('MONDAY', 1);
    component.ignore('TUESDAY', 2);
    component.addAvailability(wednesday, 3);
    component.ignore('THURSDAY', 4);
    component.ignore('FRIDAY', 4);
    component.ignore('SATURDAY', 4);
    component.ignore('SUNDAY', 4);

    fixture.detectChanges();
    component.submit();

    expect(component.form.valid).toBeTrue();
    expect(emitSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      currencyId: '1',
      timeZone: 'Europe/London',
      professionalIds: ['user-456'],
    }));
  });

  it('filteredProfessionalSignal should return professionals when input empty and filter when value set', () => {
    const professionals = [
      { id: '1', displayName: 'Test name 1' },
      { id: '2', displayName: 'Another name' },
      { id: '3', displayName: 'Test name 2' },
    ] as IUserAll[];
    roomStoreSpy.professionals.set(professionals);
    fixture.detectChanges();

    component.getForm.professional.setValue(undefined);
    fixture.detectChanges();

    const sortedProfessionals = [
      { id: '2', displayName: 'Another name' },
      { id: '1', displayName: 'Test name 1' },
      { id: '3', displayName: 'Test name 2' },
    ] as IUserAll[];
    expect(component.filteredProfessionalSignal()).toEqual(sortedProfessionals);

    component.getForm.professional.setValue('test' as any);
    fixture.detectChanges();
    expect(component.filteredProfessionalSignal()).toEqual([
      { id: '1', displayName: 'Test name 1' } as IUserAll,
      { id: '3', displayName: 'Test name 2' } as IUserAll,
    ]);
  });

  it('remove should remove professional and put it back to professionalsWritableSignal', () => {
    roomStoreSpy.professionals.set([
      { id: 'g1', displayName: 'G1' } as any,
      { id: 'g2', displayName: 'G2' } as any,
      { id: 'g3', displayName: 'G3' } as any,
    ]);
    component.selectedProfessionalsSignal.set([
      { id: 'g1', displayName: 'G1' } as any,
      { id: 'g2', displayName: 'G2' } as any,
    ]);
    component.professionalsWritableSignal.set([
      { id: 'g3', displayName: 'G3' } as any,
    ]);
    fixture.detectChanges();

    component.remove(component.selectedProfessionalsSignal()[1]);
    fixture.detectChanges();

    expect(component.selectedProfessionalsSignal().length).toBe(1);
    expect(component.professionalsWritableSignal()?.some?.((g: any) => g.id === 'g2')).toBeTrue();
    expect(component.getForm.professional.value).toBeUndefined();
  });

  it('selected should add selected professional, remove it from professionalsWritableSignal and clear input', () => {
    const p1 = { id: 'p1', displayName: 'P1' } as any;
    component.selectedProfessionalsSignal.set([]);
    component.professionalsWritableSignal.set([p1, { id: 'p2', displayName: 'P2' } as any]);

    fixture.detectChanges();

    const event: any = { option: { value: p1 } };

    component.selected(event);
    fixture.detectChanges();

    expect(component.selectedProfessionalsSignal().some((g: any) => g.id === 'p1')).toBeTrue();
    expect((component.professionalsWritableSignal() ?? []).some((g: any) => g.id === 'p1')).toBeFalse();
    expect(component.getForm.professional.value).toBeUndefined();
  });
});
