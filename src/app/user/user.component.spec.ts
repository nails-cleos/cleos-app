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
import { ICommon } from '../interfaces/common';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;

  let navigationParams$: BehaviorSubject<any>;
  let subErrors$: BehaviorSubject<any>;
  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  let storeSpy: jasmine.SpyObj<Store<UserState>>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;
  let geocodeServiceSpy: jasmine.SpyObj<GeocodeService>;
  const config: ICommon = {
    title: 'USER.TITLE',
    button: { icon: 'save', label: 'COMMON.BUTTON.SAVE' },
  };

  beforeEach(async () => {
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
          return navigationParams$.asObservable();
        case 2:
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
    fixture.componentRef.setInput('config', config);
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

    fixture.componentRef.setInput('user', mockUser as any);
    fixture.detectChanges();

    expect(component.getForm.displayName.value).toBe(mockUser.displayName);
    expect(component.getForm.addressForm.controls.address.value).toBe(mockUser.address.name);
    expect(component.getForm.lang.value).toEqual(mockUser.locale);
  });

  it('update() should emit updated user payload', () => {
    const emitSpy = jasmine.createSpy('emit');
    component.submitData.subscribe(emitSpy);
    const mockUser = {
      id: 'userId',
      displayName: 'User',
      phone: '123',
      dob: '2020-01-01',
      locale: 'en',
      email: 'test@email.com',
    };

    fixture.componentRef.setInput('user', mockUser as any);
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
    expect(emitSpy).toHaveBeenCalledWith({
      user: jasmine.objectContaining({
        displayName: 'New user',
        phone: '+31 23 456 7890',
        locale: 'es',
      }),
      role: Role.customer,
    });
  });

  it('should set form errors when backend returns subErrors', () => {
    subErrors$.next([
      { field: 'displayName', message: 'Invalid name' },
      { field: 'phone', message: 'Bad phone' },
    ]);

    fixture.detectChanges();

    expect(component.getForm.displayName.errors).toEqual(jasmine.objectContaining({ incorrect: true }));
    expect(component.getForm.phone.errors).toEqual(jasmine.objectContaining({ incorrect: true }));

    expect(component.errors()).toEqual(jasmine.objectContaining({
      displayName: 'Invalid name',
      phone: 'Bad phone',
    }));
  });

  it('should accept user input without dispatching store actions', () => {
    storeSpy.dispatch.calls.reset();
    fixture.componentRef.setInput('user', { id: '123', displayName: 'User 123' } as any);
    fixture.detectChanges();

    expect(storeSpy.dispatch).not.toHaveBeenCalledWith(getUser({ id: '123' }));
  });

  it('should not dispatch when form invalid on submit', () => {
    storeSpy.dispatch.calls.reset();

    // ensure form invalid
    (component.getForm.email).setValue('invalid-email');
    fixture.detectChanges();

    component.submit();

    expect(storeSpy.dispatch).not.toHaveBeenCalled();
  });

  it('should emit createUser payload when in add mode and form valid', () => {
    const emitSpy = jasmine.createSpy('emit');
    component.submitData.subscribe(emitSpy);

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
    expect(emitSpy).toHaveBeenCalledWith({
      user: jasmine.objectContaining({
        displayName: 'New name',
        email: 'email@test.com',
        phone: '+31 23 456 7890',
        locale: 'es',
      }),
      role: Role.customer,
    });
  });
});
