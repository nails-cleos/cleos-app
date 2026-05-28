import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileComponent } from './profile.component';
import { BehaviorSubject, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { AuthUserService, IAuthUser, initialAuthUser } from '../../services/auth-user.service';
import { GeocodeService, MapStatus } from '../../services/geocode.service';
import { UserState } from '../../store/reducers/user.reducers';
import { GoogleMapComponent } from '../../shared/google-map/google-map.component';
import { GoogleMapStubComponent } from '../../shared/google-map/google-map-stub.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { provideAppDateAdapter } from '../../util/adapter/app-date.provider';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  let selectedUser$: BehaviorSubject<any>;
  let subErrors$: BehaviorSubject<any>;
  let response$: BehaviorSubject<any>;
  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  let storeSpy: jasmine.SpyObj<Store<UserState>>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;
  let geocodeServiceSpy: jasmine.SpyObj<GeocodeService>;

  beforeEach(async () => {
    selectedUser$ = new BehaviorSubject(undefined);
    subErrors$ = new BehaviorSubject(undefined);
    response$ = new BehaviorSubject(undefined);

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
          return subErrors$.asObservable();
        case 3:
          return response$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: GeocodeService, useValue: geocodeServiceSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAppDateAdapter(),
      ],
    })
      .overrideComponent(ProfileComponent, {
        remove: { imports: [GoogleMapComponent] },
        add: { imports: [GoogleMapStubComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
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

  it('imageSignal should update when user changes', () => {
    const mockUser = { image: 'AAA', imageUrl: 'image' };

    selectedUser$.next(mockUser);
    fixture.detectChanges();

    const image = component.imageSignal();
    fixture.detectChanges();

    expect(image).toEqual('data:image/jpeg;base64,AAA');
  });

  it('toggleShowCash should invert the showCashSignal value', () => {
    expect(component.showCashSignal()).toBeFalse();

    component.toggleShowCash();
    expect(component.showCashSignal()).toBeTrue();

    component.toggleShowCash();
    expect(component.showCashSignal()).toBeFalse();
  });

  it('update() should dispatch updateMyUser with correct payload', () => {
    storeSpy.dispatch.calls.reset();
    const mockUser = {
      displayName: 'User',
      phone: '123',
      dob: '2020-01-01',
      locale: 'en',
    };

    selectedUser$.next(mockUser);
    fixture.detectChanges();

    // fill form
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

    component.update();

    expect(component.form.valid).toBeTrue();
    const dispatched = storeSpy.dispatch.calls.mostRecent().args[0];
    expect(dispatched).toEqual({
      user: jasmine.objectContaining({
        displayName: 'New user',
        phone: '+31 23 456 7890',
        locale: 'es',
      }),
      redirectUrl: '/es/auth/profile',
      type: '[User] Update me',
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
});
