import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReservationCloneDialogComponent } from './reservation-clone-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UntypedFormBuilder } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { getCurrentTimeZone, getNowTimeZone } from '../../util/dates';
import { addMonths } from 'date-fns';
import { MAX_RESERVATION_MONTH } from '../../interfaces/reservation';
import { IRoomAll } from '../../interfaces/room';
import { PaymentType } from '../../interfaces/payment';

describe('ReservationCloneDialogComponent', () => {
  let component: ReservationCloneDialogComponent;
  let fixture: ComponentFixture<ReservationCloneDialogComponent>;

  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<any>>;

  const room: IRoomAll = {
    id: 'room-id',
    availabilities: [{ day: 'MONDAY', start: '09:00', end: '17:00' }],
    address: {
      id: 1,
      name: 'Main Location',
      location: { x: 0, y: 0 },
    },
    currency: { code: 'EUR', name: 'Euro', id: 'eur', icon: '€' },
    office: {},
    timeZone: getCurrentTimeZone(),
    paymentTypes: [PaymentType.transfer],
    primary: true,
  };

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [ReservationCloneDialogComponent, TranslateModule.forRoot()],
      providers: [
        UntypedFormBuilder,
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { room } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservationCloneDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with date and start controls', () => {
    expect(component.form.contains('date')).toBeTrue();
    expect(component.form.contains('start')).toBeTrue();
  });

  it('should set maxCalendarDate based on getNowTimeZone and MAX_RESERVATION_MONTH', () => {
    const expectedDate = addMonths(getNowTimeZone(), MAX_RESERVATION_MONTH);
    expect(Math.abs(component.maxCalendarDate.getTime() - expectedDate.getTime())).toBeLessThan(1000);
  });

  it('should close dialog when onNoClick is called', () => {
    component.onNoClick();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should close dialog with form values when doAction is called', () => {
    component.date.setValue('2025-10-14');
    component.time.setValue('10:00');
    component.doAction();
    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      date: '2025-10-14',
      time: '10:00',
    });
  });

  it('should have minDate and maxDate set after initialization', () => {
    expect(component.minDate).toBeTruthy();
    expect(component.maxDate).toBeTruthy();
    expect(component.time.value).toBe(component.minDate);
  });

  it('myFilter should filter the valid date', () => {
    const today = new Date();
    const daysUntilMonday = (1 + 7 - today.getDay()) % 7 || 7;

    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    nextMonday.setHours(12, 0, 0, 0);
    const result = component.myFilter(nextMonday);

    expect(result).toBeTrue();
  });

  it('myFilter should not filter an invalid date', () => {
    const today = new Date();
    const daysUntilTuesday = (2 + 7 - today.getDay()) % 7 || 7;

    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilTuesday);
    nextMonday.setHours(12, 0, 0, 0);
    const result = component.myFilter(nextMonday);

    expect(result).toBeFalse();
  });
});
