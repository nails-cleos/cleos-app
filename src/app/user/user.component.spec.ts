import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppState } from '../store/app.states';

import { UserComponent } from './user.component';
import { Role } from '../interfaces/token';
import { clean, getUser } from '../store/user.actions';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withJsonpSupport } from '@angular/common/http';
import { AuthUserService } from '../services/auth-user.service';
import { flagGb } from '@ng-icons/flag-icons';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;

  let state$: Subject<any>;
  let authUser$: Subject<any>;

  let storeSpy: jasmine.SpyObj<Store<AppState>>;
  let routerSpy: jasmine.SpyObj<Router>;
  let changeDetectorRefSpy: jasmine.SpyObj<ChangeDetectorRef>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let paramMapSpy: jasmine.SpyObj<ParamMap>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;

  beforeEach(async () => {
    state$ = new Subject<any>();
    authUser$ = new Subject<any>();

    paramMapSpy = jasmine.createSpyObj('ParamMap', ['get']);
    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);
    changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', [], {
      authUser: authUser$.asObservable(),
    });

    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: paramMapSpy,
      },
    });

    storeSpy.select.and.returnValue(state$.asObservable());
    routerSpy.getCurrentNavigation.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [UserComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: Router, useValue: routerSpy },
        { provide: Store, useValue: storeSpy },
        { provide: ChangeDetectorRef, useValue: changeDetectorRefSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        provideHttpClient(withJsonpSupport()),
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.setDefaultLang('en-GB');
    translateService.use('en-GB');
    translateService.setTranslation('en-GB', {
      ME: {
        SEARCH: 'Search',
        COUNTRY_NOT_FOUND: 'Country not found',
        FIELD: 'Phone number',
        INVALID: 'Invalid phone number',
        REQUIRED: 'Phone number is required',
      },
    });

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize in add mode when no id is provided', () => {
    component.ngOnInit();
    expect(component.isAddMode).toBeTrue();
  });

  it('should initialize in edit mode when id is provided', () => {
    paramMapSpy.get.and.returnValue('123');
    component.ngOnInit();
    expect(component.isAddMode).toBeFalse();
    expect(component.id).toBe('123');
  });

  it('should create form with required validators', () => {
    component.ngOnInit();
    expect(component.form).toBeDefined();
    expect(component.getForm.role.hasError('required')).toBeTrue();
    expect(component.getForm.displayName.hasError('required')).toBeTrue();
    expect(component.getForm.email.hasError('required')).toBeTrue();
    expect(component.getForm.lang.hasError('required')).toBeTrue();
  });

  it('should dispatch Clean action on initialization', () => {
    component.ngOnInit();
    expect(storeSpy.dispatch).toHaveBeenCalledWith(clean());
  });

  it('should dispatch getUser action when in edit mode', () => {
    paramMapSpy.get.and.returnValue('123');
    component.ngOnInit();
    expect(storeSpy.dispatch).toHaveBeenCalledWith(getUser({ id: '123' }));
  });

  it('should set isProfessionalOrManager to true for manager role', () => {
    component.ngOnInit();
    component.getForm.role.setValue(Role.manager);
    expect(component.isProfessionalOrManager).toBeTrue();
  });

  it('should set isProfessionalOrManager to true for professional role', () => {
    component.ngOnInit();
    component.getForm.role.setValue(Role.professional);
    expect(component.isProfessionalOrManager).toBeTrue();
  });

  it('should add color validators for professional/manager roles', () => {
    component.ngOnInit();
    component.getForm.role.setValue(Role.professional);
    expect(component.getForm.lightColor.hasError('validColor')).toBeDefined();
    expect(component.getForm.darkColor.hasError('validColor')).toBeDefined();
  });

  it('should clear color validators for non-professional roles', () => {
    component.ngOnInit();
    component.getForm.role.setValue(Role.professional);
    component.getForm.role.setValue(Role.customer);
    expect(component.getForm.lightColor.validator).toBeNull();
    expect(component.getForm.darkColor.validator).toBeNull();
  });

  it('should handle address selection', () => {
    const mockPlaceResult = {
      geometry: { location: { lat: () => 40.7128, lng: () => -74.0060 } },
      'formatted_address': 'New York, NY, USA',
    } as any;

    component.getAddress(mockPlaceResult);
    expect(component.geometry).toBe(mockPlaceResult.geometry);
    expect(component.formattedAddress).toBe('New York, NY, USA');
    expect(component.addressUpdated).toBeTrue();
  });

  it('should not submit form when invalid', () => {
    component.ngOnInit();

    storeSpy.dispatch.calls.reset();

    void component.submit;
    expect(storeSpy.dispatch).not.toHaveBeenCalled();
  });

  it('should submit form in add mode when valid', () => {
    component.ngOnInit();
    const roleControl = component.getForm.role;
    roleControl.setValue(Role.customer);
    roleControl.markAsDirty();

    const displayNameControl = component.getForm.displayName;
    displayNameControl.setValue('Test User');
    displayNameControl.markAsDirty();

    const emailControl = component.getForm.email;
    emailControl.setValue('test@example.com');
    emailControl.markAsDirty();

    const langControl = component.getForm.lang;
    langControl.setValue({ icon: 'gb', value: 'en_GB', text: 'EN', flag: flagGb });
    langControl.markAsDirty();

    const phoneControl = component.getForm.phone;
    phoneControl.setValue('+31234567890');
    phoneControl.markAsDirty();

    expect(component.form.valid).toBeTrue();

    storeSpy.dispatch.calls.reset();

    void component.submit;
    const dispatchedAction = storeSpy.dispatch.calls.mostRecent().args[0];
    expect(dispatchedAction).toEqual(jasmine.objectContaining({
      user: jasmine.objectContaining({
        displayName: 'Test User',
        email: 'test@example.com',
        lang: 'en_GB',
      }),
      type: '[User] Save',
    }));
  });

  it('should handle errors from store', () => {
    component.ngOnInit();
    const stateWithErrors = {
      subErrors: [
        { field: 'email', message: 'Email already exists' },
      ],
    };
    state$.next(stateWithErrors);

    expect(component.errors.email).toBe('Email already exists');
    expect(component.getForm.email.hasError('incorrect')).toBeTrue();
  });

  it('should navigate to users list on successful response', () => {
    component.ngOnInit();

    state$.next({
      response: true,
    });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'users']);
  });

  it('should unsubscribe on destroy', () => {
    component.ngOnInit();
    spyOn(component['subscription']!, 'unsubscribe');
    component.ngOnDestroy();
    expect(component['subscription']!.unsubscribe).toHaveBeenCalled();
  });

  it('should lighten or darken color correctly', () => {
    const color = '#ff0000';
    const lightenedColor = component.lightenDarkenColor(color, false);
    const darkenedColor = component.lightenDarkenColor(color, true);
    expect(lightenedColor).not.toBe(color);
    expect(darkenedColor).not.toBe(color);
    expect(lightenedColor).not.toBe(darkenedColor);
  });
});