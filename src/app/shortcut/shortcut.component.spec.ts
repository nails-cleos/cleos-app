import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortcutComponent } from './shortcut.component';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { AuthUserService } from '../services/auth-user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NavigationService } from '../services/navigation.service';

describe('ShortcutComponent', () => {
  let component: ShortcutComponent;
  let fixture: ComponentFixture<ShortcutComponent>;
  let navigateServiceSpy: jasmine.SpyObj<NavigationService>;
  let authUserSubject: Subject<any>;

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.returnValue('calendar'),
      },
    },
  };

  const mockRouter = {
    navigate: jasmine.createSpy('navigate'),
  };

  beforeEach(async () => {
    authUserSubject = new Subject();

    navigateServiceSpy = jasmine.createSpyObj('NavigationService', ['reload']);
    const authUserSpyObj = jasmine.createSpyObj('AuthUserService', [], {
      authUser: authUserSubject.asObservable(),
    });

    await TestBed.configureTestingModule({
      imports: [ShortcutComponent],
      providers: [
        { provide: AuthUserService, useValue: authUserSpyObj },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        {
          provide: TranslateService,
          useValue: { currentLang: 'en-GB' },
        },
        { provide: Router, useValue: mockRouter },
        { provide: NavigationService, useValue: navigateServiceSpy },
      ],
    }).compileComponents();
  });

  afterEach(async () => {
    authUserSubject.complete();
    component.ngOnDestroy();
  });

  it('should create', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('calendar');

    fixture = TestBed.createComponent(ShortcutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    mockRouter.navigate.calls.reset();

    expect(component).toBeTruthy();
  });

  it('should navigate to /en-GB/events if user is room admin', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('calendar');

    fixture = TestBed.createComponent(ShortcutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    mockRouter.navigate.calls.reset();

    authUserSubject.next({
      isRoomAdmin: true,
      isAdmin: false,
      isManager: false,
      isProfessional: false,
      isCustomer: false,
    });

    expect(mockRouter.navigate).toHaveBeenCalledWith(['en-GB', 'events']);
    expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/reservation/calendar if user is admin', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('calendar');

    fixture = TestBed.createComponent(ShortcutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    mockRouter.navigate.calls.reset();

    authUserSubject.next({
      isRoomAdmin: false,
      isAdmin: true,
      isManager: false,
      isProfessional: false,
      isCustomer: false,
    });

    expect(mockRouter.navigate).toHaveBeenCalledWith(['en-GB', 'reservation', 'calendar']);
    expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/reservation/calendar if user is manager', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('calendar');

    fixture = TestBed.createComponent(ShortcutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    mockRouter.navigate.calls.reset();

    authUserSubject.next({
      isRoomAdmin: false,
      isAdmin: false,
      isManager: true,
      isProfessional: false,
      isCustomer: false,
    });

    expect(mockRouter.navigate).toHaveBeenCalledWith(['en-GB', 'reservation', 'calendar']);
    expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/reservation/calendar if user is professional', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('calendar');

    fixture = TestBed.createComponent(ShortcutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    mockRouter.navigate.calls.reset();

    authUserSubject.next({
      isRoomAdmin: false,
      isAdmin: false,
      isManager: false,
      isProfessional: true,
      isCustomer: false,
    });

    expect(mockRouter.navigate).toHaveBeenCalledWith(['en-GB', 'reservation', 'calendar']);
    expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/me/reservations if user is customer', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('calendar');

    fixture = TestBed.createComponent(ShortcutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    mockRouter.navigate.calls.reset();

    authUserSubject.next({
      isRoomAdmin: false,
      isAdmin: false,
      isManager: false,
      isProfessional: false,
      isCustomer: true,
    });

    expect(mockRouter.navigate).toHaveBeenCalledWith(['en-GB', 'me', 'reservations']);
    expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/events if user is room admin', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('dashboard');

    fixture = TestBed.createComponent(ShortcutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    mockRouter.navigate.calls.reset();

    authUserSubject.next({
      isRoomAdmin: true,
      isAdmin: false,
      isManager: false,
      isProfessional: false,
      isCustomer: false,
    });

    expect(mockRouter.navigate).toHaveBeenCalledWith(['en-GB', 'events']);
    expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/dashboard if user is admin', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('dashboard');

    fixture = TestBed.createComponent(ShortcutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    mockRouter.navigate.calls.reset();

    authUserSubject.next({
      isRoomAdmin: false,
      isAdmin: true,
      isManager: false,
      isProfessional: false,
      isCustomer: false,
    });

    expect(mockRouter.navigate).toHaveBeenCalledWith(['en-GB', 'dashboard']);
    expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/dashboard if user is manager', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('dashboard');

    fixture = TestBed.createComponent(ShortcutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    mockRouter.navigate.calls.reset();

    authUserSubject.next({
      isRoomAdmin: false,
      isAdmin: false,
      isManager: true,
      isProfessional: false,
      isCustomer: false,
    });

    expect(mockRouter.navigate).toHaveBeenCalledWith(['en-GB', 'dashboard']);
    expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/dashboard if user is professional', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('dashboard');

    fixture = TestBed.createComponent(ShortcutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    mockRouter.navigate.calls.reset();

    authUserSubject.next({
      isRoomAdmin: false,
      isAdmin: false,
      isManager: false,
      isProfessional: true,
      isCustomer: false,
    });

    expect(mockRouter.navigate).toHaveBeenCalledWith(['en-GB', 'dashboard']);
    expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/me/overview if user is customer', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('dashboard');

    fixture = TestBed.createComponent(ShortcutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    mockRouter.navigate.calls.reset();

    authUserSubject.next({
      isRoomAdmin: false,
      isAdmin: false,
      isManager: false,
      isProfessional: false,
      isCustomer: true,
    });

    expect(mockRouter.navigate).toHaveBeenCalledWith(['en-GB', 'me', 'overview']);
    expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/reservation if user is not customer', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('reservation');

    fixture = TestBed.createComponent(ShortcutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    mockRouter.navigate.calls.reset();

    authUserSubject.next({
      isRoomAdmin: false,
      isAdmin: false,
      isManager: false,
      isProfessional: false,
      isCustomer: false,
    });

    expect(mockRouter.navigate).toHaveBeenCalledWith(['en-GB', 'reservation']);
    expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /en-GB/me/reservation if user is customer', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('reservation');

    fixture = TestBed.createComponent(ShortcutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    mockRouter.navigate.calls.reset();

    authUserSubject.next({
      isRoomAdmin: false,
      isAdmin: false,
      isManager: false,
      isProfessional: false,
      isCustomer: true,
    });

    expect(mockRouter.navigate).toHaveBeenCalledWith(['en-GB', 'me', 'reservation']);
    expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
  });
});
