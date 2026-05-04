import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReviewDialogComponent } from './review-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IReservationAll } from '../../../interfaces/reservation';
import { IAddress, IRoomAll, ServiceType } from '../../../interfaces/room';
import { IUserAll } from '../../../interfaces/user';
import { ICurrencyAll } from '../../../interfaces/currency';
import { ITreatmentAll } from '../../../interfaces/treatment';
import { getCurrentTimeZone } from '../../../util/dates';

describe('ReviewDialogComponent', () => {
  let component: ReviewDialogComponent;
  let fixture: ComponentFixture<ReviewDialogComponent>;

  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ReviewDialogComponent>>;

  let translateService: TranslateService;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    const customer: IUserAll = {
      id: 'customer-id',
      displayName: 'John Doe',
      email: 'user@test.com',
      authorities: [{ authority: 'ROLE_CUSTOMER' }],
      locale: 'en',
      timeZone: 'UTC',
    };

    const address: IAddress = {
      id: 1,
      name: 'Main Location',
      location: { x: 0, y: 0 },
    };

    const currency: ICurrencyAll = {
      id: 'currency-id',
      code: 'EUR',
      icon: 'euro',
      name: 'Euro',
    };

    const room: IRoomAll = {
      id: 'room-id',
      availabilities: [{ day: 'MONDAY', start: '09:00', end: '17:00' }],
      address,
      currency,
      office: {
        id: 'office-id',
        name: 'Main Office',
        manager: {
          id: 'manager-id',
        },
      },
      timeZone: getCurrentTimeZone(),
      paymentTypes: ['TRANSFER'],
      primary: true,
    };

    const treatment: ITreatmentAll = {
      group: { id: 'group-id', name: 'Group' },
      id: '',
      key: '',
      name: '',
      type: ServiceType.treatment,
      duration: 'PT1H',
      price: 20,
    };

    const reservation: IReservationAll = {
      id: 'reservation-id',
      customer,
      timestamp: Date.now(),
      room,
      treatment,
      start: new Date(),
    } as IReservationAll;

    await TestBed.configureTestingModule({
      imports: [ReviewDialogComponent, TranslateModule.forRoot()],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: reservation },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewDialogComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize reservation and price correctly', () => {
    expect(component.reservation).toBeDefined();
    expect(component.price).toBeDefined();
    expect(component.end).toBeInstanceOf(Date);
    expect(component.dateFormat).toBe(translateService.getCurrentLang());
  });

  it('should close dialog on onNoClick', () => {
    component.onNoClick();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should close dialog with rating and detail on doAction', () => {
    component.rating = 4;
    component.detail.setValue('Excellent service');
    component.doAction();
    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      rating: 4,
      detail: 'Excellent service',
    });
  });

  it('should update hover when hovering over a star', () => {
    component.onRatingHover(2);
    expect(component.hover).toBe(2);
  });

  it('should update rating when selecting a star', () => {
    component.onRatingChanged(5);
    expect(component.rating).toBe(5);
  });

  it('should initialize detail form control as empty', () => {
    expect(component.detail.value).toBe('');
  });
});
