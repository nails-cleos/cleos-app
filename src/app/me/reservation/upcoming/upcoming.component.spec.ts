import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpcomingComponent } from './upcoming.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { IUpcomingAll } from '../../../interfaces/reservation';
import { Price } from '../../../interfaces/treatment';
import { ServiceType } from '../../../interfaces/room';
import { Role } from '../../../interfaces/token';
import { ICurrencyAll } from '../../../interfaces/currency';

describe('UpcomingComponent', () => {
  let component: UpcomingComponent;
  let fixture: ComponentFixture<UpcomingComponent>;
  let routerSpyObj: jasmine.SpyObj<Router>;
  let dialogSpy: jasmine.Spy<any>;

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
      office: {
        id: 'office-id',
        name: 'Main Office',
        manager: {
          id: 'manager-id',
        },
      },
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
    routerSpyObj = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);

    await TestBed.configureTestingModule({
      imports: [UpcomingComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Router, useValue: routerSpyObj },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');

    fixture = TestBed.createComponent(UpcomingComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('small', false);

    dialogSpy = spyOn(component['dialog'], 'open');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate rowSpan, price, start and end in ngOnChanges', () => {
    fixture.componentRef.setInput('upcoming', upcoming);
    expect(component.upcomingComputed()?.rowSpan).toBeGreaterThan(0);
    expect(component.upcomingComputed()?.start).toBeDefined();
    expect(component.upcomingComputed()?.end).toBeDefined();
    expect(component.upcomingComputed()?.price).toBeDefined();
  });

  it('should return true for showTimeZone if time zones differ', () => {
    fixture.componentRef.setInput('upcoming', upcoming);
    expect(component.showTimeZone()).toBeTrue();
  });

  it('should navigate when edit and canEdit is true', () => {
    fixture.componentRef.setInput('upcoming', upcoming);

    component.edit();
    expect(routerSpyObj.navigate).toHaveBeenCalledWith(['en-GB', 'me', 'reservation', '1']);
  });

  it('should handle openDialog call when upcoming is defined', () => {
    const reservationDate = new Date();
    fixture.componentRef.setInput('upcoming', upcoming);
    expect(() => component.openDialog(reservationDate)).not.toThrowError();
  });

  it('should open dialog when openDialog is called', () => {
    const reservationDate = new Date();
    fixture.componentRef.setInput('upcoming', upcoming);
    component.openDialog(reservationDate);
    expect(dialogSpy).toHaveBeenCalledWith(
      jasmine.any(Function),
      {
        data: {
          title: 'COMMON.TIME_ZONE.TITLE',
          content: 'COMMON.TIME_ZONE.ROOM_INFO',
          hideNoButton: true,
          hideOkButton: true,
        },
      });
  });
});
