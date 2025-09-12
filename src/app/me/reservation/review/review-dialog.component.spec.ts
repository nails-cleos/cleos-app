import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewDialogComponent } from './review-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { Analytics } from '@angular/fire/analytics';
import { IReservationAll } from '../../../interfaces/reservation';
import { getCurrentTimeZone } from '../../../util/dates';
import { IUserAll } from '../../../interfaces/user';
import { IAddress, IRoomAll } from '../../../interfaces/room';
import { ICurrencyAll } from '../../../interfaces/currency';
import { ITreatmentAll } from '../../../interfaces/treatment';

describe('ReviewDialogComponent', () => {
  let component: ReviewDialogComponent;
  let fixture: ComponentFixture<ReviewDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ReviewDialogComponent>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    const mockAnalytics = {
      app: {
        options: {},
      },
    } as Analytics;

    const customer = {
      id: 'customer-id',
      displayName: 'John Doe',
      email: 'user@test.com',
      authorities: [{ authority: 'ROLE_CUSTOMER' }],
      locale: 'en',
      timeZone: 'UTC',
    } as IUserAll;

    const address = {
      id: 1,
      name: 'Main Location',
    } as IAddress;
    const currency = {
      id: 'currency-id',
      code: 'EUR',
      icon: 'EUR',
      name: 'Euro',
    } as ICurrencyAll;

    const room = {
      id: 'room-id',
      availabilities: [{ day: 'MONDAY', start: '09:00', end: '17:00' }],
      address: address,
      currency: currency,
      office: {},
      timeZone: getCurrentTimeZone(),
      paymentTypes: ['CASH'],
      primary: true,
    } as IRoomAll;

    const treatment = {
      duration: 'PT1H',
      price: 20,
    } as ITreatmentAll;

    const reservation = {
      id: 'reservation-id',
      customer: customer,
      timestamp: Date.now(),
      room: room,
      treatment: treatment,
      start: new Date(),
    } as IReservationAll;

    await TestBed.configureTestingModule({
      imports: [ReviewDialogComponent, TranslateModule.forRoot()],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: reservation },
        { provide: Analytics, useValue: mockAnalytics },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
