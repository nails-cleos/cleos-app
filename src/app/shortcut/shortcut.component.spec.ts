import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortcutComponent } from './shortcut.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { AuthUserService } from '../services/auth-user.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { NavigationService } from '../services/navigation.service';

describe('ShortcutComponent', () => {
  let component: ShortcutComponent;
  let fixture: ComponentFixture<ShortcutComponent>;

  let authUser$: Subject<any>;
  let paramMap$: Subject<ParamMap>;

  let navigateServiceSpy: jasmine.SpyObj<NavigationService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;
  let paramMapSpy: jasmine.SpyObj<ParamMap>;

  beforeEach(async () => {
    authUser$ = new Subject();
    paramMap$ = new Subject();

    paramMapSpy = jasmine.createSpyObj('ParamMap', ['get']);
    navigateServiceSpy = jasmine.createSpyObj('NavigationService', ['reload']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', [], {
      authUser: authUser$.asObservable(),
    });
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      paramMap: paramMap$.asObservable(),
    });

    await TestBed.configureTestingModule({
      imports: [ShortcutComponent, TranslateModule.forRoot()],
      providers: [
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NavigationService, useValue: navigateServiceSpy },
      ],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en-GB');
    translate.use('en-GB');

    fixture = TestBed.createComponent(ShortcutComponent);
    component = fixture.componentInstance;
  });

  afterEach(async () => {
    authUser$.complete();
    component.ngOnDestroy();
  });

  it('should create', () => {
    fixture.detectChanges();
    paramMapSpy.get.and.returnValue('calendar');

    expect(component).toBeTruthy();
  });

  it('should navigate to /en-GB/events if user is room admin and shortcut calendar', () => {
    paramMapSpy.get.and.returnValue('calendar');
    paramMap$.next(paramMapSpy);

    fixture.detectChanges();

    authUser$.next({
      isRoomAdmin: true,
      isAdmin: false,
      isManager: false,
      isProfessional: false,
      isCustomer: false,
    });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'events']);
    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/reservation/calendar if user is admin', () => {
    paramMapSpy.get.and.returnValue('calendar');
    paramMap$.next(paramMapSpy);

    fixture.detectChanges();

    authUser$.next({
      isRoomAdmin: false,
      isAdmin: true,
      isManager: false,
      isProfessional: false,
      isCustomer: false,
    });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'reservation', 'calendar']);
    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/reservation/calendar if user is manager', () => {
    paramMapSpy.get.and.returnValue('calendar');
    paramMap$.next(paramMapSpy);

    fixture.detectChanges();

    authUser$.next({
      isRoomAdmin: false,
      isAdmin: false,
      isManager: true,
      isProfessional: false,
      isCustomer: false,
    });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'reservation', 'calendar']);
    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/reservation/calendar if user is professional', () => {
    paramMapSpy.get.and.returnValue('calendar');
    paramMap$.next(paramMapSpy);

    fixture.detectChanges();

    authUser$.next({
      isRoomAdmin: false,
      isAdmin: false,
      isManager: false,
      isProfessional: true,
      isCustomer: false,
    });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'reservation', 'calendar']);
    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/me/reservations if user is customer', () => {
    paramMapSpy.get.and.returnValue('calendar');
    paramMap$.next(paramMapSpy);

    fixture.detectChanges();

    authUser$.next({
      isRoomAdmin: false,
      isAdmin: false,
      isManager: false,
      isProfessional: false,
      isCustomer: true,
    });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'me', 'reservations']);
    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/events if user is room admin', () => {
    paramMapSpy.get.and.returnValue('dashboard');
    paramMap$.next(paramMapSpy);

    fixture.detectChanges();

    authUser$.next({
      isRoomAdmin: true,
      isAdmin: false,
      isManager: false,
      isProfessional: false,
      isCustomer: false,
    });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'events']);
    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/dashboard if user is admin', () => {
    paramMapSpy.get.and.returnValue('dashboard');
    paramMap$.next(paramMapSpy);

    fixture.detectChanges();

    authUser$.next({
      isRoomAdmin: false,
      isAdmin: true,
      isManager: false,
      isProfessional: false,
      isCustomer: false,
    });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'dashboard']);
    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/dashboard if user is manager', () => {
    paramMapSpy.get.and.returnValue('dashboard');
    paramMap$.next(paramMapSpy);

    fixture.detectChanges();
    paramMap$.next(paramMapSpy);

    fixture.detectChanges();

    authUser$.next({
      isRoomAdmin: false,
      isAdmin: false,
      isManager: true,
      isProfessional: false,
      isCustomer: false,
    });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'dashboard']);
    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/dashboard if user is professional', () => {
    paramMapSpy.get.and.returnValue('dashboard');
    paramMap$.next(paramMapSpy);

    fixture.detectChanges();

    authUser$.next({
      isRoomAdmin: false,
      isAdmin: false,
      isManager: false,
      isProfessional: true,
      isCustomer: false,
    });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'dashboard']);
    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/me/overview if user is customer', () => {
    paramMapSpy.get.and.returnValue('dashboard');
    paramMap$.next(paramMapSpy);

    fixture.detectChanges();

    authUser$.next({
      isRoomAdmin: false,
      isAdmin: false,
      isManager: false,
      isProfessional: false,
      isCustomer: true,
    });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'me', 'overview']);
    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/reservation if user is not customer', () => {
    paramMapSpy.get.and.returnValue('reservation');
    paramMap$.next(paramMapSpy);

    fixture.detectChanges();

    authUser$.next({
      isRoomAdmin: false,
      isAdmin: false,
      isManager: false,
      isProfessional: false,
      isCustomer: false,
    });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'reservation']);
    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/me/reservation if user is customer', () => {
    paramMapSpy.get.and.returnValue('reservation');
    paramMap$.next(paramMapSpy);

    fixture.detectChanges();

    authUser$.next({
      isRoomAdmin: false,
      isAdmin: false,
      isManager: false,
      isProfessional: false,
      isCustomer: true,
    });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'me', 'reservation']);
    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
  });
});
