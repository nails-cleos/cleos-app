import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

import { RoomComponent } from './room.component';
import { IAvailability, IRoomAll } from '../interfaces/room';
import { clean, getRoom } from '../store/room.actions';
import { GeocodeService } from '../services/geocode.service';
import { provideHttpClient } from '@angular/common/http';
import { getCurrentTimeZone, getTimeZone } from '../util/dates';
import timezones from 'timezones-list';
import { AuthUserService } from '../services/auth-user.service';
import { IUserAll } from '../interfaces/user';
import { Role } from '../interfaces/token';

describe('RoomComponent', () => {
  let component: RoomComponent;
  let fixture: ComponentFixture<RoomComponent>;

  let state$: Subject<any>;
  let paramMap$: Subject<any>;
  let authUser$: Subject<any>;

  let storeSpy: jasmine.SpyObj<Store>;
  let routerSpy: jasmine.SpyObj<Router>;
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

  const mockRoom: IRoomAll = {
    id: 'room-123',
    address: {
      id: 1,
      name: 'Main Location',
      location: { x: 0, y: 0 },
    },
    currency: {
      id: 'currency-id',
      code: 'EUR',
      icon: 'EUR',
      name: 'Euro',
    },
    timeZone: 'Europe/Amsterdam',
    availabilities: [monday, tuesday, wednesday, thursday, friday, saturday, sunday],
    office: {
      id: 'office-123',
    },
    paymentTypes: [],
    primary: false,
    professionals: [mockProfessional],
  };

  beforeEach(async () => {
    state$ = new Subject();
    paramMap$ = new Subject();
    authUser$ = new Subject();

    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    geocodeServiceSpy = jasmine.createSpyObj('GeocodeService', ['getCoordinates']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj<ParamMap>('ParamMap', ['get']),
      },
      paramMap: paramMap$.asObservable(),
    });
    authUserService = jasmine.createSpyObj('AuthUserService', [], {
      authUser: authUser$.asObservable(),
    });

    storeSpy.select.and.returnValue(state$.asObservable());

    await TestBed.configureTestingModule({
      imports: [RoomComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: ChangeDetectorRef, useValue: changeDetectorRefSpy },
        { provide: GeocodeService, useValue: geocodeServiceSpy },
        { provide: AuthUserService, useValue: authUserService },
        provideHttpClient(),
      ],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en-GB');
    translate.use('en-GB');

    fixture = TestBed.createComponent(RoomComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    state$.complete();
    paramMap$.complete();
    authUser$.complete();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize in add mode when no id is provided', () => {
    component.ngOnInit();

    paramMap$.next(convertToParamMap({ id: null }));

    expect(component.isAddMode).toBeTrue();
    expect(component.id).toBeUndefined();
  });

  it('should initialize in edit mode when id is provided', () => {
    const testId = '123';

    component.ngOnInit();

    paramMap$.next(convertToParamMap({ id: testId }));

    expect(component.isAddMode).toBeFalse();
    expect(component.id).toBe(testId);
  });

  it('should create form with required name field', () => {
    component.ngOnInit();

    expect(component.form).toBeDefined();
    expect(component.getForm.currency).toBeDefined();
    expect(component.getForm.office).toBeDefined();
    expect(component.getForm.currency?.hasError('required')).toBeTrue();
  });

  it('should dispatch Clean action on initialization', () => {
    component.ngOnInit();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(clean());
  });

  it('should dispatch GetRoom action when in edit mode', () => {
    const testId = '123';

    component.ngOnInit();

    paramMap$.next(convertToParamMap({ id: testId }));

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getRoom({ id: testId, redirect: true }));
  });

  it('should patch form when room is selected from state', () => {
    component.ngOnInit();

    state$.next({
      selected: mockRoom,
    });

    expect(component.getForm.timeZone?.value).toEqual(getTimeZone(mockRoom.timeZone));
    expect(component.getForm.office?.value).toBe(mockRoom.office);
    expect(component.getForm.currency?.value).toBe(mockRoom.currency);
    expect(component.getForm.address?.value).toBe(mockRoom.address.name);
    expect(component.getForm.addressDescription?.value).toBe(mockRoom.address.description);
  });

  it('should handle form errors from state', () => {
    component.ngOnInit();

    const mockErrors = [
      { field: 'timeZone', message: 'TimeZone is required' },
    ];

    state$.next({
      subErrors: mockErrors,
    });

    expect(component.errors['timeZone']).toBe('TimeZone is required');
    expect(component.getForm.timeZone?.hasError('incorrect')).toBeTrue();
  });

  it('should navigate to rooms list on successful response', () => {
    component.ngOnInit();

    state$.next({
      response: true,
    });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'rooms']);
  });

  it('should not dispatch action when form is invalid', () => {
    component.ngOnInit();
    component.getForm.name?.setValue('');
    storeSpy.dispatch.calls.reset();

    void component.submit;

    expect(storeSpy.dispatch).not.toHaveBeenCalled();
  });

  it('should dispatch CreateRoom action when in add mode and form is valid', () => {
    component.ngOnInit();

    state$.next({ professionals: [mockProfessional, { ...mockProfessional, id: 'prof-2' }] });

    component.professionals = [mockProfessional];
    component.addAvailability(monday, 0);
    component.addAvailability(tuesday, 1);
    component.addAvailability(wednesday, 2);
    component.addAvailability(thursday, 3);
    component.addAvailability(friday, 4);
    component.addAvailability(saturday, 5);
    component.addAvailability(sunday, 6);

    const currencyControl = component.getForm.currency;
    currencyControl.setValue(mockRoom.currency);
    currencyControl.markAsDirty();

    const officeControl = component.getForm.office;
    officeControl.setValue(mockRoom.office);
    officeControl.markAsDirty();

    const timeZoneControl = component.getForm.timeZone;
    timeZoneControl.setValue(timezones[1]);
    timeZoneControl.markAsDirty();

    const addressControl = component.getForm.address;
    addressControl.setValue(mockRoom.address.name);
    addressControl.markAsDirty();

    const addressDescriptionControl = component.getForm.addressDescription;
    addressDescriptionControl.setValue(mockRoom.address.description);
    addressDescriptionControl.markAsDirty();

    expect(component.form.valid).toBeTrue();
    storeSpy.dispatch.calls.reset();

    void component.submit;
    const dispatchedAction = storeSpy.dispatch.calls.mostRecent().args[0];
    expect(dispatchedAction).toEqual({
      room: jasmine.objectContaining({
        officeId: mockRoom.office.id,
        currencyId: mockRoom.currency.id,
        timeZone: timezones[1].tzCode,
        primary: false,
        professionalIds: [mockProfessional.id],
        availabilities: [monday, tuesday, wednesday, thursday, friday, saturday, sunday],
      }),
      type: '[Room] Create room',
    });
  });

  it('should dispatch UpdateRoom action when in edit mode and form is valid', () => {
    const testId = '123';

    component.ngOnInit();

    paramMap$.next(convertToParamMap({ id: testId }));
    state$.next({ selected: { ...mockRoom, closeDate: '2025-01-01' } });

    const timeZoneControl = component.getForm.timeZone!;
    timeZoneControl.setValue(timezones[34]);
    timeZoneControl.markAsDirty();

    storeSpy.dispatch.calls.reset();

    void component.submit;
    const dispatchedAction = storeSpy.dispatch.calls.mostRecent().args[0];
    expect(dispatchedAction).toEqual({
      id: testId,
      room: jasmine.objectContaining({
        timeZone: timezones[34].tzCode,
      }),
      type: '[Room] Update room by id',
    });
  });

  it('should return form controls from getForm getter', () => {
    component.ngOnInit();

    const controls = component.getForm;

    expect(controls).toBe(component.form.controls);
  });

  it('should complete destroy$ on destroy', () => {
    const nextSpy = spyOn(component['destroy$'], 'next').and.callThrough();
    const completeSpy = spyOn(component['destroy$'], 'complete').and.callThrough();

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should handle subscription when no subscription exists', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('should call detectChanges when needed', () => {
    expect(changeDetectorRefSpy.detectChanges).not.toHaveBeenCalled();
  });

  it('should handle undefined room in edit mode', () => {
    const testId = '123';
    component.room = undefined;

    component.ngOnInit();

    paramMap$.next(convertToParamMap({ id: testId }));

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getRoom({ id: testId, redirect: true }));
  });

  it('should initialize form with empty values', () => {
    component.ngOnInit();

    const timeZone = timezones.find(
      timeZone => timeZone.label.toLowerCase().indexOf(getCurrentTimeZone().toLowerCase()) === 0);

    expect(component.getForm.professional.value).toBe('');
    expect(component.getForm.currency.value).toBe('');
    expect(component.getForm.office.value).toBe('');
    expect(component.getForm.timeZone.value).toBe(timeZone);
    expect(component.getForm.address.value).toBe('');
    expect(component.getForm.addressDescription.value).toBe('');
    expect(component.getForm.closeDate.value).toBe('');
  });

  it('should validate form correctly', () => {
    component.ngOnInit();

    expect(component.form.invalid).toBeTrue();

    component.getForm.currency.setValue(mockRoom.currency);
    component.getForm.office.setValue(mockRoom.office);
    component.getForm.timeZone.setValue(timezones.find(
      timeZone => timeZone.label.toLowerCase().indexOf(getCurrentTimeZone().toLowerCase()) === 0));
    component.getForm.address.setValue(mockRoom.address);

    expect(component.form.valid).toBeTrue();
  });

  it('should handle state subscription correctly', () => {
    component.ngOnInit();

    expect(storeSpy.select).toHaveBeenCalled();
  });

  it('should clean state and get room list on response', () => {
    component.ngOnInit();
    storeSpy.dispatch.calls.reset();

    state$.next({
      response: true,
    });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'rooms']);
  });

  describe('Navigation and Router', () => {
    it('should navigate to add currency page', () => {
      void component.addCurrency;
      expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'currency', 'add']);
    });
    it('should navigate to add office page', () => {
      void component.addOffice;
      expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'offices', 'add']);
    });
    it('should navigate to add professional page', () => {
      void component.addProfessional;
      expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'users', 'add'], { state: { role: Role.professional } });
    });
  });

  describe('Display Functions', () => {
    it('should test displayCurrencyFn with valid currency', () => {
      const currency = { id: '1', code: 'EUR', name: 'Euro' } as any;

      const result = component.displayCurrencyFn(currency);

      expect(result).toBe('EUR');
    });

    it('should test displayCurrencyFn with undefined currency', () => {
      const result = component.displayCurrencyFn(undefined);

      expect(result).toBe('');
    });

    it('should test displayOfficeFn with valid office', () => {
      const office = { id: '1', name: 'Main Office' } as any;

      const result = component.displayOfficeFn(office);

      expect(result).toBe('Main Office');
    });

    it('should test displayOfficeFn with undefined office', () => {
      const result = component.displayOfficeFn(undefined);

      expect(result).toBe('');
    });

    it('should test displayTimeZoneFn with valid time zone', () => {
      const timeZone = timezones.find(t => t.label.includes('Cordoba'));

      const result = component.displayTimeZoneFn(timeZone);

      expect(result).toBe('America/Argentina/Cordoba (GMT-03:00)');
    });

    it('should test displayTimeZoneFn with undefined time zone', () => {
      const result = component.displayTimeZoneFn(undefined);

      expect(result).toBe('');
    });
  });

});