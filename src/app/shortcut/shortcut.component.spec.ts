import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortcutComponent } from './shortcut.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { AuthUserService, IAuthUser, initialAuthUser } from '../services/auth-user.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { NavigationService } from '../services/navigation.service';
import { signal } from '@angular/core';

describe('ShortcutComponent', () => {
  let component: ShortcutComponent;
  let fixture: ComponentFixture<ShortcutComponent>;

  let paramMap$: Subject<ParamMap>;

  let navigateServiceSpy: jasmine.SpyObj<NavigationService>;
  let navigateSpy: jasmine.Spy;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;
  let paramMapSpy: jasmine.SpyObj<ParamMap>;
  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  beforeEach(async () => {
    paramMap$ = new Subject();

    paramMapSpy = jasmine.createSpyObj('ParamMap', ['get']);
    navigateServiceSpy = jasmine.createSpyObj('NavigationService', ['reload']);
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', [], {
      authUser: authUserSignal.asReadonly(),
    });
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      paramMap: paramMap$.asObservable(),
    });

    await TestBed.configureTestingModule({
      imports: [ShortcutComponent, TranslateModule.forRoot()],
      providers: [
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: NavigationService, useValue: navigateServiceSpy },
      ],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en-GB');
    translate.use('en-GB');

    fixture = TestBed.createComponent(ShortcutComponent);
    component = fixture.componentInstance;

    const router = TestBed.inject(Router);
    navigateSpy = spyOn(router, 'navigate');

    fixture.detectChanges();
  });

  afterEach(async () => {
  });

  it('should create', () => {
    paramMapSpy.get.and.returnValue('calendar');

    expect(component).toBeTruthy();
  });

  it('should navigate to /en-GB/events if user is room admin and shortcut calendar', () => {
    paramMapSpy.get.and.returnValue('calendar');
    paramMap$.next(paramMapSpy);

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
    paramMapSpy.get.and.returnValue('calendar');
    paramMap$.next(paramMapSpy);

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
    paramMapSpy.get.and.returnValue('calendar');
    paramMap$.next(paramMapSpy);

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
    paramMapSpy.get.and.returnValue('calendar');
    paramMap$.next(paramMapSpy);

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
    paramMapSpy.get.and.returnValue('calendar');
    paramMap$.next(paramMapSpy);

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
    paramMapSpy.get.and.returnValue('dashboard');
    paramMap$.next(paramMapSpy);

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
    paramMapSpy.get.and.returnValue('dashboard');
    paramMap$.next(paramMapSpy);

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
    paramMapSpy.get.and.returnValue('dashboard');
    paramMap$.next(paramMapSpy);

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
    paramMapSpy.get.and.returnValue('dashboard');
    paramMap$.next(paramMapSpy);

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
    paramMapSpy.get.and.returnValue('dashboard');
    paramMap$.next(paramMapSpy);

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
    paramMapSpy.get.and.returnValue('reservation');
    paramMap$.next(paramMapSpy);

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
    paramMapSpy.get.and.returnValue('reservation');
    paramMap$.next(paramMapSpy);

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
