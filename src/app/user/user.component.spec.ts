import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BehaviorSubject, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthUserService, IAuthUser, initialAuthUser } from '../services/auth-user.service';
import { GeocodeService, MapStatus } from '../services/geocode.service';
import { UserState } from '../store/reducers/user.reducers';
import { UserComponent } from './user.component';
import { Role } from '../interfaces/token';
import { getUser } from '../store/actions/user.actions';
import { GoogleMapComponent } from '../shared/google-map/google-map.component';
import { GoogleMapStubComponent } from '../shared/google-map/google-map-stub.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { provideAppDateAdapter } from '../util/adapter/app-date.provider';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;

  let selectedUser$: BehaviorSubject<any>;
  let navigationParams$: BehaviorSubject<any>;
  let subErrors$: BehaviorSubject<any>;
  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  let storeSpy: jasmine.SpyObj<Store<UserState>>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;
  let geocodeServiceSpy: jasmine.SpyObj<GeocodeService>;

  beforeEach(async () => {
    selectedUser$ = new BehaviorSubject(undefined);
    navigationParams$ = new BehaviorSubject(undefined);
    subErrors$ = new BehaviorSubject(undefined);

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', ['getUser', 'logout'], {
      authUser: authUserSignal.asReadonly(),
    });
    geocodeServiceSpy = jasmine.createSpyObj('GeocodeService', ['getCoordinates'], {
      createMap: () => of(MapStatus.ready),
    });

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return selectedUser$.asObservable();
        case 2:
          return navigationParams$.asObservable();
        case 3:
          return subErrors$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [UserComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: GeocodeService, useValue: geocodeServiceSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAppDateAdapter(),
      ],
    })
      .overrideComponent(UserComponent, {
        remove: { imports: [GoogleMapComponent] },
        add: { imports: [GoogleMapStubComponent] },
      })
      .compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should patch form when selectedUser emits a user', () => {
    const mockUser = {
      displayName: 'User',
      phone: '+31625250787',
      dob: '2020-01-01',
      locale: 'nl',
      darkColor: '#000000',
      lightColor: '#ffffff',
      address: { name: 'Amsterdam' },
    };

    selectedUser$.next(mockUser);
    fixture.detectChanges();

    expect(component.getForm.displayName.value).toBe(mockUser.displayName);
    expect(component.getForm.addressForm.controls.address.value).toBe(mockUser.address.name);
    expect(component.getForm.lang.value).toEqual(mockUser.locale);
  });

  it('update() should dispatch updateMyUser with correct payload', () => {
    storeSpy.dispatch.calls.reset();
    const mockUser = {
      id: 'userId',
      displayName: 'User',
      phone: '123',
      dob: '2020-01-01',
      locale: 'en',
      email: 'test@email.com',
    };

    fixture.componentRef.setInput('id', mockUser.id);
    selectedUser$.next(mockUser);
    fixture.detectChanges();

    // fill form
    const roleControl = component.getForm.role;
    roleControl.setValue(Role.customer);
    roleControl.markAsDirty();
    const displayNameControl = component.getForm.displayName;
    displayNameControl.setValue('New user');
    displayNameControl.markAsDirty();
    const phoneControl = component.getForm.phone;
    phoneControl.setValue('+31234567890');
    phoneControl.markAsDirty();
    const langValueControl = component.getForm.lang;
    langValueControl.setValue('es');
    langValueControl.markAsDirty();
    fixture.detectChanges();

    component.submit();

    expect(component.form.valid).toBeTrue();
    const dispatched = storeSpy.dispatch.calls.mostRecent().args[0];
    expect(dispatched).toEqual({
      user: jasmine.objectContaining({
        displayName: 'New user',
        phone: '+31 23 456 7890',
        locale: 'es',
      }),
      type: '[User] Save',
    });
  });

  it('should set form errors when backend returns subErrors', () => {
    subErrors$.next([
      { field: 'displayName', message: 'Invalid name' },
      { field: 'phone', message: 'Bad phone' },
    ]);

    fixture.detectChanges();

    expect(component.getForm.displayName.errors).toEqual({ incorrect: true });
    expect(component.getForm.phone.errors).toEqual({ incorrect: true });

    expect(component.errors().displayName).toBe('Invalid name');
    expect(component.errors().phone).toBe('Bad phone');
  });

  it('should dispatch getUser when userId emits a value', () => {
    storeSpy.dispatch.calls.reset();
    fixture.componentRef.setInput('id', '123');
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getUser({ id: '123' }));
  });

  it('should not dispatch when form invalid on submit', () => {
    storeSpy.dispatch.calls.reset();

    // ensure form invalid
    (component.getForm.email).setValue('invalid-email');
    fixture.detectChanges();

    component.submit();

    expect(storeSpy.dispatch).not.toHaveBeenCalled();
  });

  it('should dispatch createUser when in add mode and form valid', () => {
    storeSpy.dispatch.calls.reset();

    const roleControl = component.getForm.role;
    roleControl.setValue(Role.customer);
    roleControl.markAsDirty();
    const nameControl = component.getForm.displayName;
    nameControl.setValue('New name');
    nameControl.markAsDirty();
    const emailControl = component.getForm.email;
    emailControl.setValue('email@test.com');
    emailControl.markAsDirty();
    const phoneControl = component.getForm.phone;
    phoneControl.setValue('+31 23 456 7890');
    phoneControl.markAsDirty();
    const langControl = component.getForm.lang;
    langControl.setValue('es');
    langControl.markAsDirty();

    component.submit();

    expect(component.form.valid).toBeTrue();
    const dispatched = storeSpy.dispatch.calls.mostRecent().args[0];
    expect(dispatched).toEqual({
      user: jasmine.objectContaining({
        displayName: 'New name',
        email: 'email@test.com',
        phone: '+31 23 456 7890',
        locale: 'es',
      }),
      role: Role.customer,
      type: '[User] Save',
    });
  });
});
