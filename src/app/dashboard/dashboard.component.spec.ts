import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { AuthUserService } from '../services/auth-user.service';
import { Professional } from './day-view-scheduler.component';
import { IProfessionalEvent } from '../interfaces/dashboard';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let component: DashboardComponent;

  let storeMock: any;
  let routerMock: any;
  let dialogMock: any;
  let authUserServiceMock: any;
  let stateSubject: Subject<any>;
  let authUserSubject: Subject<any>;

  beforeEach(async () => {
    stateSubject = new Subject();
    authUserSubject = new Subject();

    storeMock = {
      select: jasmine.createSpy().and.returnValue(stateSubject.asObservable()),
      dispatch: jasmine.createSpy(),
    };
    routerMock = { navigate: jasmine.createSpy() };
    dialogMock = { open: jasmine.createSpy() };
    authUserServiceMock = { authUser: authUserSubject.asObservable() };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeMock },
        { provide: Router, useValue: routerMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: AuthUserService, useValue: authUserServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en-GB');
    translate.use('en-GB');

    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should dispatch Clean and GetMyEvent on init', () => {
    expect(storeMock.dispatch).toHaveBeenCalledWith(jasmine.anything()); // Clean
    expect(storeMock.dispatch).toHaveBeenCalledWith(jasmine.anything()); // GetMyEvent
  });

  it('should update professional reservations on professionalChanged', () => {
    const prof: Professional = new Professional('p1', 'Prof 1', 'img1.png', { primary: '#000', secondary: '#fff' });
    prof.reservations = 1;
    prof.time = 60;

    const newProf: Professional = new Professional('p2', 'Prof 2', 'img2.png', { primary: '#111', secondary: '#eee' });

    component.professionals = [prof, newProf];

    const event = {
      id: 'e1',
      start: new Date(2025, 8, 23, 10, 0),
      end: new Date(2025, 8, 23, 11, 0),
      meta: { professional: prof },
    };

    (component as any).professionalChanged({ event, newProfessional: newProf });

    expect(prof.reservations).toBe(0);
    expect(newProf.reservations).toBe(1);
    expect(event.meta.professional).toBe(newProf);
  });

  it('should decorate event title if state is started', () => {
    const event: any = {
      id: '1',
      title: '<b>Test</b>',
      start: new Date(),
      end: new Date(new Date().getTime() + 60000),
      meta: { state: 'STARTED', started: new Date() },
    };
    const result = (component as any).createTitle(event);
    expect(result.title).toContain('timing');
  });

  it('should return base64 image if image is present', () => {
    const prof: IProfessionalEvent = {
      calendarSummary: {
        reservations: [],
        unavailable: [],
        birthdays: [],
        notes: [],
        transactions: [],
      },
      id: '1',
      image: 'abc123',
      name: 'prof',
    };
    const url = (DashboardComponent as any).getProfessionalImage(prof);
    expect(url).toBe('data:image/jpg;base64,abc123');
  });

  it('should return http image if imageUrl is present', () => {
    const prof: IProfessionalEvent = {
      calendarSummary: {
        reservations: [],
        unavailable: [],
        birthdays: [],
        notes: [],
        transactions: [],
      },
      id: '1',
      imageUrl: 'http://abc123.png',
      name: 'prof',
    };
    const url = (DashboardComponent as any).getProfessionalImage(prof);
    expect(url).toBe('http://abc123.png');
  });

  it('should return default image if imageUrl is not present', () => {
    const prof: IProfessionalEvent = {
      calendarSummary: {
        reservations: [],
        unavailable: [],
        birthdays: [],
        notes: [],
        transactions: [],
      },
      id: '1',
      name: 'prof',
    };
    const url = (DashboardComponent as any).getProfessionalImage(prof);
    expect(url).toBe('assets/icons/icon-512x512.png');
  });
});
