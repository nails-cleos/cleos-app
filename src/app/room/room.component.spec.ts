import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ChangeDetectorRef, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import { RoomComponent } from './room.component';
import { IAvailability, IRoomAll } from '../interfaces/room';
import { GeocodeService } from '../services/geocode.service';
import { provideHttpClient } from '@angular/common/http';
import { AuthUserService, IAuthUser, initialAuthUser } from '../services/auth-user.service';
import { IUserAll } from '../interfaces/user';
import { Role } from '../interfaces/token';
import { getRoom } from '../store/room.actions';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { GoogleMapStubComponent } from '../shared/google-map/google-map-stub.component';

describe('RoomComponent', () => {
  let component: RoomComponent;
  let fixture: ComponentFixture<RoomComponent>;

  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  let roomId$: BehaviorSubject<any>;
  let selectedRoom$: BehaviorSubject<any>;
  let professionals$: BehaviorSubject<any>;
  let currencies$: BehaviorSubject<any>;
  let offices$: BehaviorSubject<any>;
  let subErrors$: BehaviorSubject<any>;

  let storeSpy: jasmine.SpyObj<Store>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let changeDetectorRefSpy: jasmine.SpyObj<ChangeDetectorRef>;
  let geocodeServiceSpy: jasmine.SpyObj<GeocodeService>;
  let authUserService: jasmine.SpyObj<AuthUserService>;

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
    office: {
      id: 'office-123',
      name: 'office name',
      manager: { id: 'manager-123' },
    },
    paymentTypes: [],
    primary: false,
    professionals: [mockProfessional],
  };

  beforeEach(async () => {
    roomId$ = new BehaviorSubject(undefined);
    selectedRoom$ = new BehaviorSubject(undefined);
    professionals$ = new BehaviorSubject(undefined);
    currencies$ = new BehaviorSubject(undefined);
    offices$ = new BehaviorSubject(undefined);
    subErrors$ = new BehaviorSubject(undefined);
    authUserSignal.update(prev => ({
      ...prev,
      isDarkMode: false,
      isAdmin: false,
      professionalId: 'prof-123',
    }));

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    geocodeServiceSpy = jasmine.createSpyObj('GeocodeService', ['getCoordinates']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj<ParamMap>('ParamMap', ['get']),
      },
    });
    authUserService = jasmine.createSpyObj('AuthUserService', [], {
      authUser: authUserSignal.asReadonly(),
    });

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return roomId$.asObservable();
        case 2:
          return selectedRoom$.asObservable();
        case 3:
          return professionals$.asObservable();
        case 4:
          return currencies$.asObservable();
        case 5:
          return offices$.asObservable();
        case 6:
          return subErrors$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [RoomComponent, GoogleMapStubComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: ChangeDetectorRef, useValue: changeDetectorRefSpy },
        { provide: GeocodeService, useValue: geocodeServiceSpy },
        { provide: AuthUserService, useValue: authUserService },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en-GB');
    translate.use('en-GB');

    fixture = TestBed.createComponent(RoomComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should dispatch getRoom when roomId emits a value', () => {
    storeSpy.dispatch.calls.reset();

    roomId$.next('123');
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getRoom({ id: '123', redirect: true }));
  });

  it('should patch form when selectedRoom emits', () => {
    selectedRoom$.next(mockRoom);
    professionals$.next([
      mockProfessional,
      { id: 'p2', displayName: 'Professional 2' },
    ]);
    fixture.detectChanges();

    const roomSignalValue: any = component.roomSignal();
    expect(roomSignalValue.id).toBe(mockRoom.id);
    expect(component.selectedProfessionalsSignal().length).toBe(1);
    expect(component.professionalsWritableSignal()?.some?.((p: IUserAll) => p.id === 'p2')).toBeTrue();
  });

  it('should handle form errors from subErrorsSignal', () => {
    const errors = [
      { field: 'currency', message: 'Currency required' },
      { field: 'office', message: 'Office required' },
    ];

    subErrors$.next(errors);
    fixture.detectChanges();

    const errs = component.errors();
    expect(errs['currency']).toBe('Currency required');
    expect(component.getForm.currency.hasError('required')).toBeTrue();
    expect(errs['office']).toBe('Office required');
    expect(component.getForm.office.hasError('required')).toBeTrue();
  });

  it('should not dispatch when form invalid on submit', () => {
    storeSpy.dispatch.calls.reset();

    // ensure form invalid
    (component.getForm.professional).setValue(undefined);
    (component.getForm.office).setValue(undefined);
    (component.getForm.currency).setValue(undefined);
    (component.getForm.timeZone).setValue(undefined);
    (component.getGoogleMapForm.address).setValue('');
    fixture.detectChanges();

    component.submit();

    expect(storeSpy.dispatch).not.toHaveBeenCalled();
  });

  it('should dispatch createRoom when in add mode and form valid', () => {
    storeSpy.dispatch.calls.reset();

    // Add professional to selectedProfessionalsSignal
    component.selectedProfessionalsSignal.set([mockProfessional]);

    const currencyControl = component.getForm.currency;
    currencyControl.setValue(mockCurrency);
    currencyControl.markAsDirty();
    const officeControl = component.getForm.office;
    officeControl.setValue(mockRoom.office);
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
    const dispatched = storeSpy.dispatch.calls.mostRecent().args[0];
    expect(dispatched).toEqual(jasmine.objectContaining({
      room: jasmine.objectContaining({
        officeId: 'office-123',
        currencyId: 'currency-id',
        timeZone: 'Europe/Amsterdam',
      }),
      type: '[Room] Create room',
    }));
  });

  it('should dispatch updateRoom when in edit mode and form valid', () => {
    storeSpy.dispatch.calls.reset();

    roomId$.next('abc-123');
    fixture.detectChanges();
    selectedRoom$.next({
      id: 'abc-123',
      address: { id: 1, name: 'Old Address', location: { x: 0, y: 0 } },
      currency: mockCurrency,
      office: mockRoom.office,
      professionals: [mockProfessional],
      timeZone: 'UTC',
      availabilities: [monday],
      paymentTypes: [],
      primary: false,
    });

    component.selectedProfessionalsSignal.set([{ ...mockProfessional, id: 'user-456' }]);
    fixture.detectChanges();

    const currencyControl = component.getForm.currency;
    currencyControl.setValue({ id: '1', name: 'USD', code: 'USD', icon: 'USD' });
    currencyControl.markAsDirty();
    const officeControl = component.getForm.office;
    officeControl.setValue(mockRoom.office);
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

    storeSpy.dispatch.calls.reset();
    component.submit();

    expect(component.form.valid).toBeTrue();
    const dispatched = storeSpy.dispatch.calls.mostRecent().args[0];

    expect(dispatched).toEqual(jasmine.objectContaining({
      id: 'abc-123',
      room: jasmine.objectContaining({
        currencyId: '1',
        timeZone: 'Europe/London',
      }),
      type: '[Room] Update room by id',
    }));
  });

  it('filteredProfessionalSignal should return professionals when input empty and filter when value set', () => {
    const professionals = [
      { id: '1', displayName: 'Test name 1' },
      { id: '2', displayName: 'Another name' },
      { id: '3', displayName: 'Test name 2' },
    ] as IUserAll[];
    professionals$.next(professionals);
    fixture.detectChanges();

    component.getForm.professional.setValue(undefined);
    fixture.detectChanges();

    // Professionals are sorted alphabetically, so "Another name" comes first
    const sortedProfessionals = [
      { id: '2', displayName: 'Another name' },
      { id: '1', displayName: 'Test name 1' },
      { id: '3', displayName: 'Test name 2' },
    ] as IUserAll[];
    expect(component.filteredProfessionalSignal()).toEqual(sortedProfessionals);

    (component.getForm.professional as any).setValue('test');
    fixture.detectChanges();
    expect(component.filteredProfessionalSignal()).toEqual([
      { id: '1', displayName: 'Test name 1' } as IUserAll,
      { id: '3', displayName: 'Test name 2' } as IUserAll,
    ]);
  });

  it('remove should remove group and put it back to professionalsWritableSignal', () => {
    // set initial groups
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
    // group input control should be reset (undefined)
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
    expect(component.professionalsWritableSignal()?.some?.((g: any) => g.id === 'p1')).toBeUndefined();
    expect(component.getForm.professional.value).toBeUndefined();
  });
});
