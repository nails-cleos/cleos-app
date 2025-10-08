import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpcomingComponent } from './upcoming.component';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { IUpcomingAll } from '../../../interfaces/reservation';
import { Price } from '../../../interfaces/treatment';
import { ServiceType } from '../../../interfaces/room';
import { Role } from '../../../interfaces/token';
import { ICurrencyAll } from '../../../interfaces/currency';
import { of } from 'rxjs';

describe('UpcomingComponent', () => {
  let component: UpcomingComponent;
  let fixture: ComponentFixture<UpcomingComponent>;
  let translateSpyObj: jasmine.SpyObj<TranslateService>;
  let dialogSpyObj: jasmine.SpyObj<MatDialog>;
  let routerSpyObj: jasmine.SpyObj<Router>;

  const currency: ICurrencyAll = {
    id: '1',
    name: 'Test Currency',
    code: 'EUR',
    icon: 'euro',
  };

  const upcoming: IUpcomingAll = {
    id: '1',
    price: new Price(50),
    rowSpan: 1,
    timestamp: Date.now(),
    end: new Date(),
    start: new Date(),
    state: 'created',
    room: {
      timeZone: 'UTC',
      currency: currency,
      id: 'r1',
      availabilities: [],
      address: {
        id: 0,
        name: 'Address 1',
        location: {
          x: 1.1,
          y: 2.2,
        },
      },
      office: {},
      paymentTypes: [],
      primary: false,
    },
    canEdit: true,
    payments: [],
    additional: [
      {
        duration: 'PT1H',
        key: 'key 1',
        id: '1',
        name: 'Additional 1',
        price: 10,
        type: ServiceType.additional,
      }, {
        duration: 'PT30M',
        key: 'key 2',
        id: '2',
        name: 'Additional 2',
        price: 20,
        type: ServiceType.additional,
      }],
    customer: {
      id: 'c1',
      displayName: 'Customer 1',
      email: 'customer@test.com',
      authorities: [{ authority: Role.customer }],
      locale: 'en-GB',
      timeZone: 'UTC',
    },
    professional: {
      id: 'p1',
      displayName: 'Professional 1',
      email: 'professional@test.com',
      authorities: [{ authority: Role.professional }],
      locale: 'en-GB',
      timeZone: 'UTC',
    },
    treatment: {
      id: 't1',
      name: 'Treatment 1',
      duration: 'PT1H',
      price: 50,
      type: ServiceType.treatment,
      key: 'key1',
      group: { id: 'g1', name: 'Group 1' },
    },
  };

  beforeEach(async () => {
    translateSpyObj = jasmine.createSpyObj('TranslateService', ['instant', 'get'], {
      currentLang: 'en-GB',
    });

    // Mock the get method to return an observable for any key
    translateSpyObj.get.and.callFake((key: string) => of(`mocked translation for ${key}`));
    translateSpyObj.instant.and.callFake((key: string) => `mocked instant translation for ${key}`);

    dialogSpyObj = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);

    // Create proper subject spies
    const afterOpenedSpy = jasmine.createSpyObj('Subject', ['next', 'asObservable']);
    afterOpenedSpy.asObservable.and.returnValue({ subscribe: jasmine.createSpy() });

    const afterAllClosedSpy = jasmine.createSpyObj('Subject', ['next', 'asObservable']);
    afterAllClosedSpy.asObservable.and.returnValue({ subscribe: jasmine.createSpy() });

    Object.defineProperty(dialogSpyObj, 'openDialogs', { value: [] });
    Object.defineProperty(dialogSpyObj, 'afterOpened', { value: afterOpenedSpy });
    Object.defineProperty(dialogSpyObj, 'afterAllClosed', { value: afterAllClosedSpy });

    dialogSpyObj.open.and.returnValue({
      afterClosed: jasmine.createSpy().and.returnValue(of(null)),
      close: jasmine.createSpy(),
      componentInstance: {},
    } as any);

    routerSpyObj = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);

    await TestBed.configureTestingModule({
      imports: [UpcomingComponent],
      providers: [
        { provide: TranslateService, useValue: translateSpyObj },
        { provide: MatDialog, useValue: dialogSpyObj },
        { provide: Router, useValue: routerSpyObj },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UpcomingComponent);
    component = fixture.componentInstance;
    component.small = false;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate rowSpan, price, start and end in ngOnChanges', () => {
    component.upcoming = upcoming;
    component.ngOnChanges({});
    expect(component.upcoming?.rowSpan).toBeGreaterThan(0);
    expect(component.upcoming?.start).toBeDefined();
    expect(component.upcoming?.end).toBeDefined();
    expect(component.upcoming?.price).toBeDefined();
  });

  it('should return true for showTimeZone if time zones differ', () => {
    component.upcoming = upcoming;
    expect(component.showTimeZone()).toBeTrue();
  });

  it('should navigate when edit and canEdit is true', () => {
    component.upcoming = upcoming;

    component.edit();
    expect(routerSpyObj.navigate).toHaveBeenCalledWith(['en-GB', 'me', 'reservation', '1']);
  });

  it('should handle openDialog call when upcoming is defined', () => {
    const reservationDate = new Date();
    component.upcoming = upcoming;
    expect(() => component.openDialog(reservationDate)).not.toThrowError();
  });
});
