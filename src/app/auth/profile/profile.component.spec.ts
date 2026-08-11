import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideHttpClient, withXhr } from '@angular/common/http';
import {
  AuthUserService,
  IAuthUser,
  initialAuthUser,
} from '@app/services/auth-user.service';
import { GeocodeService, MapStatus } from '@app/services/geocode.service';
import { GoogleMapComponent } from '@app/shared/google-map/google-map.component';
import { GoogleMapStubComponent } from '@app/util/stub/google-map-stub.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal, WritableSignal } from '@angular/core';
import { provideAppDateAdapter } from '@app/util/adapter/app-date.provider';
import { UserStore } from '@app/store/user.store';
import { NavigationService } from '@app/services/navigation.service';
import { DEFAULT_LOCALE } from '@app/util/dates';
import { provideTranslateService } from '@ngx-translate/core';
import { ProfileComponent } from './profile.component';
describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let navigationServiceSpy: Pick<
    NavigationService,
    'back' | 'navigate' | 'reload' | 'language'
  > & {
    back: ReturnType<typeof vi.fn>;
    navigate: ReturnType<typeof vi.fn>;
    reload: ReturnType<typeof vi.fn>;
  };

  let selectedUserSignal: WritableSignal<any>;
  let subErrorsSignal: WritableSignal<any>;
  let responseSignal: WritableSignal<any>;
  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  let userStoreSpy: {
    clean: Mock;
    loadMyUser: Mock;
    updateMyUser: Mock;
    updateMyPhoto: Mock;
  };
  let authUserServiceSpy: Pick<AuthUserService, 'authUser'>;
  let geocodeServiceSpy: {
    getCoordinates: Mock;
    createMap: any;
  };

  beforeEach(async () => {
    navigationServiceSpy = {
      back: vi.fn().mockName('NavigationService.back'),
      reload: vi.fn().mockName('NavigationService.reload'),
      navigate: vi.fn().mockName('NavigationService.navigate'),
      language: DEFAULT_LOCALE,
    };
    selectedUserSignal = signal(undefined);
    subErrorsSignal = signal(undefined);
    responseSignal = signal(undefined);

    userStoreSpy = {
      clean: vi.fn().mockName('UserStore.clean'),
      loadMyUser: vi.fn().mockName('UserStore.loadMyUser'),
      updateMyUser: vi.fn().mockName('UserStore.updateMyUser'),
      updateMyPhoto: vi.fn().mockName('UserStore.updateMyPhoto'),
    };
    Object.assign(userStoreSpy, {
      selected: selectedUserSignal.asReadonly(),
      subErrors: subErrorsSignal.asReadonly(),
      response: responseSignal.asReadonly(),
    });
    authUserServiceSpy = {
      authUser: authUserSignal.asReadonly(),
    };
    geocodeServiceSpy = {
      getCoordinates: vi.fn().mockName('GeocodeService.getCoordinates'),
      createMap: () => of(MapStatus.ready),
    };

    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: UserStore, useValue: userStoreSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: GeocodeService, useValue: geocodeServiceSpy },
        provideHttpClient(withXhr()),
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

    selectedUserSignal.set(mockUser);
    fixture.detectChanges();

    expect(component.getForm.displayName.value).toBe(mockUser.displayName);
    expect(component.getForm.addressForm.controls.address.value).toBe(
      mockUser.address.name,
    );
    expect(component.getForm.lang.value).toEqual(mockUser.locale);
  });

  it('imageSignal should update when user changes', () => {
    const mockUser = { image: 'AAA', imageUrl: 'image' };

    selectedUserSignal.set(mockUser);
    fixture.detectChanges();

    const image = component.imageSignal();
    fixture.detectChanges();

    expect(image).toEqual('data:image/jpeg;base64,AAA');
  });

  it('toggleShowCash should invert the showCashSignal value', () => {
    expect(component.showCashSignal()).toBe(false);

    component.toggleShowCash();
    expect(component.showCashSignal()).toBe(true);

    component.toggleShowCash();
    expect(component.showCashSignal()).toBe(false);
  });

  it('update() should dispatch updateMyUser with correct payload', () => {
    userStoreSpy.updateMyUser.mockClear();
    const mockUser = {
      displayName: 'User',
      phone: '123',
      dob: '2020-01-01',
      locale: 'en',
    };

    selectedUserSignal.set(mockUser);
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

    expect(component.form.valid).toBe(true);
    expect(userStoreSpy.updateMyUser).toHaveBeenCalledWith(
      expect.objectContaining({
        displayName: 'New user',
        phone: '+31234567890',
        locale: 'es',
      }),
      '/es/auth/profile',
    );
  });

  it('should set form errors when backend returns subErrors', () => {
    subErrorsSignal.set([
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
