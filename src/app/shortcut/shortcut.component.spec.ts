import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortcutComponent } from './shortcut.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthUserService, IAuthUser, initialAuthUser } from '../services/auth-user.service';
import { Router } from '@angular/router';
import { NavigationService } from '../services/navigation.service';
import { signal } from '@angular/core';

describe('ShortcutComponent', () => {
  let component: ShortcutComponent;
  let fixture: ComponentFixture<ShortcutComponent>;

  let navigateServiceSpy: jasmine.SpyObj<NavigationService>;
  let navigateSpy: jasmine.Spy;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;
  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  beforeEach(async () => {
    navigateServiceSpy = jasmine.createSpyObj('NavigationService', ['reload']);
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', [], {
      authUser: authUserSignal.asReadonly(),
    });

    await TestBed.configureTestingModule({
      imports: [ShortcutComponent, TranslateModule.forRoot()],
      providers: [
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: NavigationService, useValue: navigateServiceSpy },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');

    fixture = TestBed.createComponent(ShortcutComponent);
    component = fixture.componentInstance;

    const router = TestBed.inject(Router);
    navigateSpy = spyOn(router, 'navigate');

    fixture.detectChanges();
  });

  const setShortcut = (key: 'calendar' | 'dashboard' | 'reservation') => {
    fixture.componentRef.setInput('key', key);
    fixture.detectChanges();
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to /en-GB/events if user is room admin and shortcut calendar', () => {
    setShortcut('calendar');

    authUserSignal.update(prev => ({
      ...prev,
      isRoomAdmin: true,
      isAdmin: false,
      isManager: false,
      isProfessional: false,
      isCustomer: false,
    }));

    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['en-GB', 'dashboard', 'events']);
    expect(navigateSpy).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/reservation/calendar if user is admin', () => {
    setShortcut('calendar');

    authUserSignal.update(prev => ({
      ...prev,
      isRoomAdmin: false,
      isAdmin: true,
      isManager: false,
      isProfessional: false,
      isCustomer: false,
    }));

    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['en-GB', 'reservation', 'calendar']);
    expect(navigateSpy).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/reservation/calendar if user is manager', () => {
    setShortcut('calendar');

    authUserSignal.update(prev => ({
      ...prev,
      isRoomAdmin: false,
      isAdmin: false,
      isManager: true,
      isProfessional: false,
      isCustomer: false,
    }));

    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['en-GB', 'reservation', 'calendar']);
    expect(navigateSpy).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/reservation/calendar if user is professional', () => {
    setShortcut('calendar');

    authUserSignal.update(prev => ({
      ...prev,
      isRoomAdmin: false,
      isAdmin: false,
      isManager: false,
      isProfessional: true,
      isCustomer: false,
    }));

    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['en-GB', 'reservation', 'calendar']);
    expect(navigateSpy).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/me/reservations if user is customer', () => {
    setShortcut('calendar');

    authUserSignal.update(prev => ({
      ...prev,
      isRoomAdmin: false,
      isAdmin: false,
      isManager: false,
      isProfessional: false,
      isCustomer: true,
    }));

    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['en-GB', 'me', 'reservations']);
    expect(navigateSpy).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/events if user is room admin', () => {
    setShortcut('dashboard');

    authUserSignal.update(prev => ({
      ...prev,
      isRoomAdmin: true,
      isAdmin: false,
      isManager: false,
      isProfessional: false,
      isCustomer: false,
    }));

    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['en-GB', 'dashboard', 'events']);
    expect(navigateSpy).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/dashboard if user is admin', () => {
    setShortcut('dashboard');

    authUserSignal.update(prev => ({
      ...prev,
      isRoomAdmin: false,
      isAdmin: true,
      isManager: false,
      isProfessional: false,
      isCustomer: false,
    }));

    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['en-GB', 'dashboard']);
    expect(navigateSpy).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/dashboard if user is manager', () => {
    setShortcut('dashboard');

    authUserSignal.update(prev => ({
      ...prev,
      isRoomAdmin: false,
      isAdmin: false,
      isManager: true,
      isProfessional: false,
      isCustomer: false,
    }));

    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['en-GB', 'dashboard']);
    expect(navigateSpy).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/dashboard if user is professional', () => {
    setShortcut('dashboard');

    authUserSignal.update(prev => ({
      ...prev,
      isRoomAdmin: false,
      isAdmin: false,
      isManager: false,
      isProfessional: true,
      isCustomer: false,
    }));

    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['en-GB', 'dashboard']);
    expect(navigateSpy).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/me/overview if user is customer', () => {
    setShortcut('dashboard');

    authUserSignal.update(prev => ({
      ...prev,
      isRoomAdmin: false,
      isAdmin: false,
      isManager: false,
      isProfessional: false,
      isCustomer: true,
    }));

    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['en-GB', 'me', 'overview']);
    expect(navigateSpy).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/reservation if user is not customer', () => {
    setShortcut('reservation');

    authUserSignal.update(prev => ({
      ...prev,
      isRoomAdmin: false,
      isAdmin: false,
      isManager: false,
      isProfessional: false,
      isCustomer: false,
    }));

    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['en-GB', 'reservation']);
    expect(navigateSpy).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/me/reservation if user is customer', () => {
    setShortcut('reservation');

    authUserSignal.update(prev => ({
      ...prev,
      isRoomAdmin: false,
      isAdmin: false,
      isManager: false,
      isProfessional: false,
      isCustomer: true,
    }));

    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['en-GB', 'me', 'reservation']);
    expect(navigateSpy).toHaveBeenCalledTimes(1);
  });
});
