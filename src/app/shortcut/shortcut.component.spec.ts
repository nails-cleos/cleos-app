import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortcutComponent } from './shortcut.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthUserService, IAuthUser, initialAuthUser } from '../services/auth-user.service';
import { NavigationService } from '../services/navigation.service';
import { signal } from '@angular/core';
import { DEFAULT_LOCALE } from '../util/dates';

describe('ShortcutComponent', () => {
  let component: ShortcutComponent;
  let fixture: ComponentFixture<ShortcutComponent>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;

  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;
  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  beforeEach(async () => {
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['reload', 'navigate'],
      { language: DEFAULT_LOCALE },
    );
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', [], {
      authUser: authUserSignal.asReadonly(),
    });

    await TestBed.configureTestingModule({
      imports: [ShortcutComponent, TranslateModule.forRoot()],
      providers: [
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);

    fixture = TestBed.createComponent(ShortcutComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  const setShortcut = (key: 'calendar' | 'dashboard' | 'reservation') => {
    fixture.componentRef.setInput('key', key);
    fixture.detectChanges();
    navigationServiceSpy.navigate.calls.reset();
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to /events if user is room admin and shortcut calendar', () => {
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

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['dashboard', 'events']);
    expect(navigationServiceSpy.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /reservation/calendar if user is admin', () => {
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

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['reservation', 'calendar']);
    expect(navigationServiceSpy.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /reservation/calendar if user is manager', () => {
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

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['reservation', 'calendar']);
    expect(navigationServiceSpy.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /reservation/calendar if user is professional', () => {
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

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['reservation', 'calendar']);
    expect(navigationServiceSpy.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /me/reservations if user is customer', () => {
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

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['me', 'reservations']);
    expect(navigationServiceSpy.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /events if user is room admin', () => {
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

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['dashboard', 'events']);
    expect(navigationServiceSpy.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /dashboard if user is admin', () => {
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

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['dashboard']);
    expect(navigationServiceSpy.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /dashboard if user is manager', () => {
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

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['dashboard']);
    expect(navigationServiceSpy.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /dashboard if user is professional', () => {
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

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['dashboard']);
    expect(navigationServiceSpy.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /me/overview if user is customer', () => {
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

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['me', 'overview']);
    expect(navigationServiceSpy.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /reservation if user is not customer', () => {
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

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['reservation']);
    expect(navigationServiceSpy.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /me/reservation if user is customer', () => {
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

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['me', 'reservation']);
    expect(navigationServiceSpy.navigate).toHaveBeenCalledTimes(1);
  });
});
